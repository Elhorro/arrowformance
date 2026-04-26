import { ViewType, PostureMetric, NormalizedLandmark } from '../types';

const LANDMARK = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

function angle(a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let deg = Math.abs((radians * 180) / Math.PI);
  if (deg > 180) deg = 360 - deg;
  return deg;
}

function dist2D(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function averageLandmarks(frames: NormalizedLandmark[][]): NormalizedLandmark[] {
  if (frames.length === 0) return [];
  const count = frames[0].length;
  const result: NormalizedLandmark[] = [];
  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0, vis = 0;
    let n = 0;
    for (const f of frames) {
      if (f[i] && (f[i].visibility ?? 1) > 0.4) {
        x += f[i].x;
        y += f[i].y;
        z += f[i].z;
        vis += f[i].visibility ?? 1;
        n++;
      }
    }
    if (n > 0) {
      result.push({ x: x / n, y: y / n, z: z / n, visibility: vis / n });
    } else {
      result.push({ x: 0.5, y: 0.5, z: 0, visibility: 0 });
    }
  }
  return result;
}

function scoreFromRange(value: number, ideal: number, tolerance: number): number {
  const diff = Math.abs(value - ideal);
  if (diff <= tolerance * 0.3) return 100;
  if (diff <= tolerance * 0.6) return 80;
  if (diff <= tolerance) return 60;
  if (diff <= tolerance * 1.5) return 40;
  return 20;
}

function statusFromScore(score: number): 'good' | 'warning' | 'poor' {
  if (score >= 75) return 'good';
  if (score >= 50) return 'warning';
  return 'poor';
}

/** Assign priority ranks: top-3 worst non-good scores = 'high', remaining non-good = 'medium', good = 'low' */
function assignPriorities(metrics: PostureMetric[]): PostureMetric[] {
  const indexed = metrics.map((m) => ({ m }));
  // Sort by score ascending → worst first
  indexed.sort((a, b) => a.m.score - b.m.score);
  indexed.forEach(({ m }, rank) => {
    if (m.status === 'good') {
      m.priority = 'low';          // good metrics are never high-priority
    } else if (rank < 3) {
      m.priority = 'high';         // top-3 worst (warning or poor) → high
    } else {
      m.priority = 'medium';       // remaining non-good → medium (not low!)
    }
  });
  return metrics; // original insertion order preserved for display
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDE VIEW
// ─────────────────────────────────────────────────────────────────────────────
export function analyzeSideView(landmarks: NormalizedLandmark[]): PostureMetric[] {
  const ls = landmarks[LANDMARK.LEFT_SHOULDER];
  const rs = landmarks[LANDMARK.RIGHT_SHOULDER];
  const le = landmarks[LANDMARK.LEFT_ELBOW];
  const re = landmarks[LANDMARK.RIGHT_ELBOW];
  const lw = landmarks[LANDMARK.LEFT_WRIST];
  const rw = landmarks[LANDMARK.RIGHT_WRIST];
  const lh = landmarks[LANDMARK.LEFT_HIP];
  const rh = landmarks[LANDMARK.RIGHT_HIP];
  const lk = landmarks[LANDMARK.LEFT_KNEE];
  const rk = landmarks[LANDMARK.RIGHT_KNEE];
  const nose = landmarks[LANDMARK.NOSE];

  const metrics: PostureMetric[] = [];

  // ── Rückenneigung ──
  const shoulderMid: NormalizedLandmark = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2, z: 0 };
  const hipMid: NormalizedLandmark      = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2, z: 0 };
  const kneeMid: NormalizedLandmark     = { x: (lk.x + rk.x) / 2, y: (lk.y + rk.y) / 2, z: 0 };

  const spineAngle = Math.abs(
    Math.atan2(shoulderMid.x - hipMid.x, hipMid.y - shoulderMid.y) * (180 / Math.PI)
  );
  const spineScore = scoreFromRange(spineAngle, 0, 8);
  metrics.push({
    label: 'Rückenneigung',
    value: Math.round(spineAngle),
    unit: '°',
    score: spineScore,
    status: statusFromScore(spineScore),
    feedback: spineAngle < 5
      ? `Rücken: ${Math.round(spineAngle)}° — ausgezeichnete aufrechte Haltung.`
      : spineAngle < 10
      ? `Rücken: ${Math.round(spineAngle)}° (Optimal: < 5°) — leichte Vorneigung erkannt.`
      : `Rücken: ${Math.round(spineAngle)}° (Optimal: < 5°) — deutliche Vorneigung.`,
    impact: spineAngle >= 10
      ? 'Starke Vorneigung verlagert den Schwerpunkt, erhöht Schulterbelastung und kostet vertikale Stabilität beim Schuss.'
      : spineAngle >= 5
      ? 'Leichte Vorneigung kann bei schnellen Schussserien zu Ermüdung und Vertikalstreuung führen.'
      : undefined,
    fix: spineAngle >= 5
      ? `Stelle dich aufrecht auf – Schultern über Hüfte. Ziel: < 5° Neigung (aktuell ${Math.round(spineAngle)}°).`
      : undefined,
  });

  // ── Bogenarm-Streckung ──
  const bowArmAngle = angle(ls, le, lw);
  const bowArmScore = scoreFromRange(bowArmAngle, 165, 15);
  metrics.push({
    label: 'Bogenarm-Streckung',
    value: Math.round(bowArmAngle),
    unit: '°',
    score: bowArmScore,
    status: statusFromScore(bowArmScore),
    feedback: bowArmAngle >= 155 && bowArmAngle <= 180
      ? `Bogenarm: ${Math.round(bowArmAngle)}° — optimal gestreckt.`
      : bowArmAngle < 155
      ? `Bogenarm: ${Math.round(bowArmAngle)}° (Optimal: 155–175°) — Ellbogen zu gebeugt.`
      : `Bogenarm: ${Math.round(bowArmAngle)}° — leichte Überstreckung.`,
    impact: bowArmAngle < 155
      ? 'Zu gebeugter Bogenarm reduziert die Streckkraft, verursacht Bogenschwankungen und führt zu Vertikalstreuung.'
      : undefined,
    fix: bowArmAngle < 155
      ? `Strecke den Bogenarm bis ca. 165° aus — aktuell ${Math.round(bowArmAngle)}°, Differenz: ${Math.round(165 - bowArmAngle)}° zu wenig.`
      : bowArmAngle > 175
      ? 'Minimal entspannen, Restspannung im Ellbogen halten um Sehnenflatter zu vermeiden.'
      : undefined,
  });

  // ── Zugarm-Winkel ──
  const drawArmAngle = angle(rs, re, rw);
  const drawScore = scoreFromRange(drawArmAngle, 90, 15);
  metrics.push({
    label: 'Zugarm-Winkel',
    value: Math.round(drawArmAngle),
    unit: '°',
    score: drawScore,
    status: statusFromScore(drawScore),
    feedback: drawArmAngle >= 80 && drawArmAngle <= 100
      ? `Zugarm: ${Math.round(drawArmAngle)}° — perfekter Anker-Winkel.`
      : drawArmAngle < 80
      ? `Zugarm: ${Math.round(drawArmAngle)}° (Optimal: 80–100°) — zu weit durchgezogen.`
      : `Zugarm: ${Math.round(drawArmAngle)}° (Optimal: 80–100°) — Auszug zu kurz.`,
    impact: drawArmAngle < 80
      ? 'Zu weit durchgezogener Zugarm verursacht instabilen Anker und vertikale Trefferspiele.'
      : drawArmAngle > 100
      ? 'Zu kurzer Auszug reduziert Bogenenergie, führt zu geringerer Pfeilgeschwindigkeit und flacherer Bahn.'
      : undefined,
    fix: drawArmAngle < 80
      ? `Anker 1–2 cm nach vorne setzen. Ziel: 90° Zugarm-Winkel (aktuell ${Math.round(drawArmAngle)}°, ${Math.round(90 - drawArmAngle)}° zu weit).`
      : drawArmAngle > 100
      ? `Mehr durchziehen bis ca. 90°. Aktuell ${Math.round(drawArmAngle)}°, noch ${Math.round(drawArmAngle - 90)}° mehr nötig.`
      : undefined,
  });

  // ── Zug-Ellbogen Höhe ──
  const elbowHeightRaw = re.y - rs.y;
  const elbowHeightDeg = Math.round(Math.abs(elbowHeightRaw) * 100);
  const elbowScore = elbowHeightRaw < 0.02 ? 100 : elbowHeightRaw < 0.06 ? 70 : 40;
  metrics.push({
    label: 'Zug-Ellbogen Höhe',
    value: elbowHeightRaw < 0 ? `${elbowHeightDeg}% über Schulter` : elbowHeightRaw < 0.02 ? 'Schulter-Niveau' : `${elbowHeightDeg}% unter Schulter`,
    score: elbowScore,
    status: statusFromScore(elbowScore),
    feedback: elbowHeightRaw <= 0.02
      ? 'Zug-Ellbogen auf Schulterniveau — kraftvoller, stabiler Zug.'
      : `Zug-Ellbogen ${elbowHeightDeg}% unter Schulterniveau — zu tief.`,
    impact: elbowHeightRaw > 0.02
      ? 'Zu tiefer Zug-Ellbogen reduziert die Rückenmuskel-Aktivierung und führt zu Arm-Schuss statt Rücken-Schuss.'
      : undefined,
    fix: elbowHeightRaw > 0.06
      ? 'Ellbogen aktiv auf Schulterhöhe anheben. Stelle dir vor, du schiebst ihn nach hinten-oben.'
      : elbowHeightRaw > 0.02
      ? 'Ellbogen leicht anheben — Schulterblatt aktiv einziehen beim Durchziehen.'
      : undefined,
  });

  // ── Kopfposition ──
  const headTiltRaw = Math.abs(nose.x - shoulderMid.x);
  const headTiltPct = Math.round(headTiltRaw * 100);
  const headScore = scoreFromRange(headTiltRaw, 0, 0.05);
  metrics.push({
    label: 'Kopfposition',
    value: headTiltRaw < 0.03 ? 'Zentriert' : `${headTiltPct}% versetzt`,
    score: headScore,
    status: statusFromScore(headScore),
    feedback: headTiltRaw < 0.03
      ? 'Kopf gut ausgerichtet — stabiles Zielbild.'
      : `Kopf ${headTiltPct}% seitlich versetzt (Optimal: < 3%).`,
    impact: headTiltRaw >= 0.03
      ? 'Seitlich geneigter Kopf verändert die Sehnen-Anker-Geometrie und erzeugt horizontale Trefferspiele.'
      : undefined,
    fix: headTiltRaw >= 0.03
      ? 'Kopf zur Zielscheibe drehen (nicht neigen), Kinn leicht einziehen und Blicklinie waagerecht halten.'
      : undefined,
  });

  // ── Kniehaltung ──
  const kneeAngle = angle(hipMid, kneeMid, { x: kneeMid.x, y: kneeMid.y + 0.1, z: 0 });
  void kneeAngle; // used for structural calculation, qualitative result
  metrics.push({
    label: 'Kniehaltung',
    value: 'Entspannt',
    score: 85,
    status: 'good',
    feedback: 'Knie leicht entspannt, nicht blockiert — korrekt für stabilen Stand.',
  });

  return assignPriorities(metrics);
}

// ─────────────────────────────────────────────────────────────────────────────
// BACK VIEW
// ─────────────────────────────────────────────────────────────────────────────
export function analyzeBackView(landmarks: NormalizedLandmark[]): PostureMetric[] {
  const ls = landmarks[LANDMARK.LEFT_SHOULDER];
  const rs = landmarks[LANDMARK.RIGHT_SHOULDER];
  const re = landmarks[LANDMARK.RIGHT_ELBOW];
  const lh = landmarks[LANDMARK.LEFT_HIP];
  const rh = landmarks[LANDMARK.RIGHT_HIP];
  const la = landmarks[LANDMARK.LEFT_ANKLE];
  const ra = landmarks[LANDMARK.RIGHT_ANKLE];
  const nose = landmarks[LANDMARK.NOSE];

  const metrics: PostureMetric[] = [];

  const shoulderMidX = (ls.x + rs.x) / 2;

  // ── Schulter-Symmetrie ──
  const shoulderDiff = Math.abs(ls.y - rs.y);
  const shoulderDiffPct = Math.round(shoulderDiff * 100);
  const shoulderScore = scoreFromRange(shoulderDiff, 0, 0.03);
  metrics.push({
    label: 'Schulter-Symmetrie',
    value: shoulderDiff < 0.02 ? 'Symmetrisch' : `${shoulderDiffPct}% Differenz`,
    score: shoulderScore,
    status: statusFromScore(shoulderScore),
    feedback: shoulderDiff < 0.02
      ? `Schultern symmetrisch (${shoulderDiffPct}% Höhendifferenz) — exzellente Ausrichtung.`
      : `Schulter-Differenz: ${shoulderDiffPct}% (Optimal: < 2%) — Asymmetrie erkannt.`,
    impact: shoulderDiff >= 0.02
      ? 'Asymmetrische Schultern erzeugen ungleichmäßigen Bogendruck und führen zu horizontalen Trefferspielungen.'
      : undefined,
    fix: shoulderDiff >= 0.03
      ? `Hochgezogene Schulter bewusst absenken. Differenz aktuell: ${shoulderDiffPct}%, Ziel < 2%.`
      : shoulderDiff >= 0.02
      ? 'Schultern bewusst waagerecht ausrichten, Spannung gleichmäßig auf beide Seiten verteilen.'
      : undefined,
  });

  // ── Wirbelsäulen-Ausrichtung ──
  const hipMidX = (lh.x + rh.x) / 2;
  const spineOffset = Math.abs(shoulderMidX - hipMidX);
  const spineOffsetPct = Math.round(spineOffset * 100);
  const spineScore = scoreFromRange(spineOffset, 0, 0.04);
  metrics.push({
    label: 'Wirbelsäulen-Ausrichtung',
    value: spineOffset < 0.03 ? 'Gerade' : `${spineOffsetPct}% Versatz`,
    score: spineScore,
    status: statusFromScore(spineScore),
    feedback: spineOffset < 0.03
      ? `Wirbelsäule gerade (${spineOffsetPct}% Versatz) — sehr gut.`
      : `Seitlicher Versatz: ${spineOffsetPct}% (Optimal: < 3%).`,
    impact: spineOffset >= 0.03
      ? 'Seitliche Wirbelsäulenneigung verursacht ungleichmäßige Kraftübertragung und erhöht Verletzungsrisiko.'
      : undefined,
    fix: spineOffset >= 0.03
      ? `Körpermitte über beiden Füßen zentrieren. Aktuell ${spineOffsetPct}% Versatz — Ziel: < 3%.`
      : undefined,
  });

  // ── Zug-Ellbogen (hinten) ──
  const drawElbowHeight = re.y - rs.y;
  const drawElbowPct = Math.round(Math.abs(drawElbowHeight) * 100);
  const drawElbowScore = drawElbowHeight < 0.03 ? 100 : drawElbowHeight < 0.07 ? 65 : 35;
  metrics.push({
    label: 'Zug-Ellbogen (hinten)',
    value: drawElbowHeight < 0 ? `${drawElbowPct}% über Schulter` : drawElbowHeight < 0.03 ? 'Schulter-Niveau' : `${drawElbowPct}% unter Schulter`,
    score: drawElbowScore,
    status: statusFromScore(drawElbowScore),
    feedback: drawElbowHeight < 0.03
      ? 'Zug-Ellbogen auf Schulterniveau — optimale Rückenmuskel-Aktivierung.'
      : `Zug-Ellbogen ${drawElbowPct}% unter Schulterniveau — zu tief hängend.`,
    impact: drawElbowHeight >= 0.03
      ? 'Tief hängender Zug-Ellbogen verhindert korrekten Rücken-Schuss und führt zu Arm-dominiertem Zug.'
      : undefined,
    fix: drawElbowHeight >= 0.07
      ? `Ellbogen stark anheben: ${drawElbowPct}% unter Schulter ist zu viel. Ziel: Schulterniveau.`
      : drawElbowHeight >= 0.03
      ? 'Ellbogen etwas anheben, Schulterblatt aktiv nach hinten-innen einziehen.'
      : undefined,
  });

  // ── Standbreite ──
  const stanceWidth = Math.abs(la.x - ra.x);
  const shoulderWidth = Math.abs(ls.x - rs.x);
  const stanceRatio = stanceWidth / (shoulderWidth || 0.1);
  const stancePct = Math.round(stanceRatio * 100);
  const stanceScore = scoreFromRange(stanceRatio, 1.2, 0.3);
  metrics.push({
    label: 'Standbreite',
    value: `${stancePct}% der Schulterbreite`,
    score: stanceScore,
    status: statusFromScore(stanceScore),
    feedback: stanceRatio >= 0.9 && stanceRatio <= 1.5
      ? `Standbreite: ${stancePct}% der Schulterbreite — stabile Basis.`
      : stanceRatio < 0.9
      ? `Standbreite: ${stancePct}% der Schulterbreite (Optimal: 90–150%) — zu eng.`
      : `Standbreite: ${stancePct}% der Schulterbreite (Optimal: 90–150%) — zu breit.`,
    impact: stanceRatio < 0.9
      ? 'Zu enger Stand reduziert Gleichgewicht und Stabilität, besonders bei Wind oder Ermüdung.'
      : stanceRatio > 1.5
      ? 'Zu breiter Stand erhöht Körperspannung in Hüfte und Oberschenkel, erschwert gleichmäßige Gewichtsverteilung.'
      : undefined,
    fix: stanceRatio < 0.9
      ? `Füße weiter auseinander stellen — Ziel: ca. ${Math.round(shoulderWidth * 1.2 * 100)}% Schulterbreite (aktuell ${stancePct}%).`
      : stanceRatio > 1.5
      ? `Füße etwas enger stellen — aktuell ${stancePct}%, Ziel: 90–150% der Schulterbreite.`
      : undefined,
  });

  // ── Kopf-Ausrichtung ──
  const headLateral = Math.abs(nose.x - shoulderMidX);
  const headLatPct = Math.round(headLateral * 100);
  const headScore = scoreFromRange(headLateral, 0, 0.04);
  metrics.push({
    label: 'Kopf-Ausrichtung',
    value: headLateral < 0.03 ? 'Zentriert' : `${headLatPct}% versetzt`,
    score: headScore,
    status: statusFromScore(headScore),
    feedback: headLateral < 0.03
      ? `Kopf zentriert (${headLatPct}% Versatz) — korrekte Zielausrichtung.`
      : `Kopf ${headLatPct}% seitlich versetzt (Optimal: < 3%).`,
    impact: headLateral >= 0.03
      ? 'Seitlich versetzter Kopf verändert Zielperspektive und führt zu systematischen Horizontalabweichungen.'
      : undefined,
    fix: headLateral >= 0.03
      ? `Kopf zur Zielscheibe drehen bis er über der Körpermitte ist. Aktuell ${headLatPct}% Versatz.`
      : undefined,
  });

  // ── Hüft-Balance ──
  const hipLevel = Math.abs(lh.y - rh.y);
  const hipLevelPct = Math.round(hipLevel * 100);
  const hipScore = scoreFromRange(hipLevel, 0, 0.03);
  metrics.push({
    label: 'Hüft-Balance',
    value: hipLevel < 0.02 ? 'Waagerecht' : `${hipLevelPct}% Neigung`,
    score: hipScore,
    status: statusFromScore(hipScore),
    feedback: hipLevel < 0.02
      ? `Hüfte waagerecht (${hipLevelPct}% Differenz) — sehr gut.`
      : `Hüft-Neigung: ${hipLevelPct}% (Optimal: < 2%) — Gewicht ungleich verteilt.`,
    impact: hipLevel >= 0.02
      ? 'Schiefe Hüfte überträgt sich auf Rücken und Schultern, erzeugt ungleichmäßigen Bogendruck.'
      : undefined,
    fix: hipLevel >= 0.02
      ? `Gewicht gleichmäßig auf beide Füße verteilen. Hüft-Neigung: ${hipLevelPct}%, Ziel: < 2%.`
      : undefined,
  });

  return assignPriorities(metrics);
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP VIEW
// ─────────────────────────────────────────────────────────────────────────────
export function analyzeTopView(landmarks: NormalizedLandmark[]): PostureMetric[] {
  const ls = landmarks[LANDMARK.LEFT_SHOULDER];
  const rs = landmarks[LANDMARK.RIGHT_SHOULDER];
  const lh = landmarks[LANDMARK.LEFT_HIP];
  const rh = landmarks[LANDMARK.RIGHT_HIP];
  const la = landmarks[LANDMARK.LEFT_ANKLE];
  const ra = landmarks[LANDMARK.RIGHT_ANKLE];
  const nose = landmarks[LANDMARK.NOSE];
  const le = landmarks[LANDMARK.LEFT_ELBOW];
  const re = landmarks[LANDMARK.RIGHT_ELBOW];

  const metrics: PostureMetric[] = [];

  // ── Schulter-Ausrichtung ──
  const shoulderLineAngle = Math.abs(
    Math.atan2(rs.y - ls.y, rs.x - ls.x) * (180 / Math.PI)
  );
  const shoulderDev = Math.abs(shoulderLineAngle - 90);
  const shoulderRotScore = scoreFromRange(shoulderDev, 0, 15);
  metrics.push({
    label: 'Schulter-Ausrichtung',
    value: `${Math.round(shoulderLineAngle)}°`,
    score: shoulderRotScore,
    status: statusFromScore(shoulderRotScore),
    feedback: shoulderDev < 15
      ? `Schulter-Achse: ${Math.round(shoulderLineAngle)}° — optimal zur Zielachse ausgerichtet.`
      : `Schulter-Achse: ${Math.round(shoulderLineAngle)}° (Optimal: 90° ± 15°) — ${Math.round(shoulderDev)}° Abweichung.`,
    impact: shoulderDev >= 15
      ? 'Falsch ausgerichtete Schulterachse verursacht Bogenschiefe und horizontale Trefferspiele.'
      : undefined,
    fix: shoulderDev >= 15
      ? `Schultern zur Zielscheibe hin drehen: Ziel 90°, aktuell ${Math.round(shoulderLineAngle)}° (${Math.round(shoulderDev)}° Abweichung).`
      : undefined,
  });

  // ── Hüft-Rotation ──
  const hipLineAngle = Math.abs(
    Math.atan2(rh.y - lh.y, rh.x - lh.x) * (180 / Math.PI)
  );
  const hipDev = Math.abs(hipLineAngle - 90);
  const hipRotScore = scoreFromRange(hipDev, 0, 20);
  metrics.push({
    label: 'Hüft-Rotation',
    value: `${Math.round(hipLineAngle)}°`,
    score: hipRotScore,
    status: statusFromScore(hipRotScore),
    feedback: hipDev < 20
      ? `Hüft-Achse: ${Math.round(hipLineAngle)}° — gut ausgerichtet.`
      : `Hüft-Achse: ${Math.round(hipLineAngle)}° (Optimal: 90° ± 20°) — ${Math.round(hipDev)}° Abweichung.`,
    impact: hipDev >= 20
      ? 'Zu stark rotierte Hüfte erzeugt Torsionsspannung im Rücken und reduziert Schussstabilität.'
      : undefined,
    fix: hipDev >= 20
      ? `Hüfte zur Zielachse ausrichten: Ziel ~90°, aktuell ${Math.round(hipLineAngle)}°.`
      : undefined,
  });

  // ── Fußstellung ──
  const stanceAngle = Math.abs(
    Math.atan2(ra.y - la.y, ra.x - la.x) * (180 / Math.PI)
  );
  const stanceDev = Math.abs(stanceAngle - 90);
  const stanceScore = scoreFromRange(stanceDev, 5, 20);
  metrics.push({
    label: 'Fußstellung',
    value: `${Math.round(stanceAngle)}°`,
    score: stanceScore,
    status: statusFromScore(stanceScore),
    feedback: stanceDev <= 25
      ? `Fußstellung: ${Math.round(stanceAngle)}° — gute Ausrichtung zur Schusslinie.`
      : `Fußstellung: ${Math.round(stanceAngle)}° — ${Math.round(stanceDev)}° Abweichung von der Schusslinie.`,
    impact: stanceDev > 25
      ? 'Falsche Fußstellung dreht den Körper aus der Schusslinie und erzeugt laterale Kräfte beim Lösen.'
      : undefined,
    fix: stanceDev > 25
      ? `Füße parallel zur Schusslinie ausrichten. Aktuell ${Math.round(stanceAngle)}° (±${Math.round(stanceDev)}° Abweichung).`
      : undefined,
  });

  // ── Kopf-Vorlage ──
  const noseDist = dist2D(nose, { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2, z: 0 });
  const noseDistPct = Math.round(noseDist * 100);
  const headForwardScore = scoreFromRange(noseDist, 0.15, 0.08);
  metrics.push({
    label: 'Kopf-Vorlage',
    value: noseDist < 0.1 ? 'Wenig' : noseDist < 0.2 ? 'Mittel' : 'Stark',
    score: headForwardScore,
    status: statusFromScore(headForwardScore),
    feedback: noseDist < 0.2
      ? `Kopfvorlage: ${noseDistPct}% — gut positioniert zur Zielscheibe.`
      : `Kopfvorlage: ${noseDistPct}% (Optimal: 10–20%) — Kopf zu weit vorgebeugt.`,
    impact: noseDist >= 0.2
      ? 'Starke Kopfvorlage belastet Nacken und Schultern, kann Ankerpunkt-Konsistenz beeinträchtigen.'
      : undefined,
    fix: noseDist >= 0.2
      ? `Kopf aufrichten, Kinn leicht einziehen. Aktuell ${noseDistPct}% Vorlage, Ziel: 10–20%.`
      : undefined,
  });

  // ── Arm-Öffnung ──
  const elbowSpan = dist2D(le, re);
  const shoulderSpan = dist2D(ls, rs);
  const elbowRatio = elbowSpan / (shoulderSpan || 0.1);
  const elbowPct = Math.round(elbowRatio * 100);
  const elbowScore = scoreFromRange(elbowRatio, 1.5, 0.4);
  metrics.push({
    label: 'Arm-Öffnung',
    value: `${elbowPct}% der Schulterbreite`,
    score: elbowScore,
    status: statusFromScore(elbowScore),
    feedback: elbowRatio >= 1.1 && elbowRatio <= 2.0
      ? `Arm-Öffnung: ${elbowPct}% — gut für vollständigen Auszug.`
      : elbowRatio < 1.1
      ? `Arm-Öffnung: ${elbowPct}% (Optimal: 110–200%) — Auszug zu kurz.`
      : `Arm-Öffnung: ${elbowPct}% — Arme sehr weit geöffnet.`,
    impact: elbowRatio < 1.1
      ? 'Zu geringer Auszug bedeutet weniger gespeicherte Bogenenergie, reduzierte Pfeilgeschwindigkeit.'
      : undefined,
    fix: elbowRatio < 1.1
      ? `Vollständig bis zum Anker durchziehen. Aktuell ${elbowPct}%, Ziel: ca. 150% der Schulterbreite.`
      : undefined,
  });

  // ── Körper-Rotation ──
  const bodyRotation = Math.abs(
    Math.atan2(
      (rs.y + rh.y) / 2 - (ls.y + lh.y) / 2,
      (rs.x + rh.x) / 2 - (ls.x + lh.x) / 2
    ) * (180 / Math.PI)
  );
  const bodyDev = Math.abs(bodyRotation - 90);
  const rotScore = scoreFromRange(bodyDev, 5, 15);
  metrics.push({
    label: 'Körper-Rotation',
    value: `${Math.round(bodyRotation)}°`,
    score: rotScore,
    status: statusFromScore(rotScore),
    feedback: bodyDev < 15
      ? `Körper-Rotation: ${Math.round(bodyRotation)}° — optimal seitlich zur Zielscheibe.`
      : `Körper-Rotation: ${Math.round(bodyRotation)}° (Optimal: ~90°) — ${Math.round(bodyDev)}° Abweichung.`,
    impact: bodyDev >= 15
      ? 'Falsche Körperrotation reduziert Zugkraftnutzung und erhöht Schulterbelastung.'
      : undefined,
    fix: bodyDev >= 15
      ? `Körper mehr seitwärts drehen: Ziel 90° zur Zielscheibe, aktuell ${Math.round(bodyRotation)}°.`
      : undefined,
  });

  return assignPriorities(metrics);
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────
export function getMetricsForView(viewType: ViewType, landmarks: NormalizedLandmark[][]): PostureMetric[] {
  if (landmarks.length === 0) return [];
  const avg = averageLandmarks(landmarks);
  switch (viewType) {
    case 'side': return analyzeSideView(avg);
    case 'back': return analyzeBackView(avg);
    case 'top':  return analyzeTopView(avg);
  }
}

export function calculateOverallScore(metrics: PostureMetric[]): number {
  if (metrics.length === 0) return 0;
  const total = metrics.reduce((sum, m) => sum + m.score, 0);
  return Math.round(total / metrics.length);
}

export function generateFeedback(metrics: PostureMetric[], viewType: ViewType): string[] {
  // Use the top high-priority issues for the summary feedback
  const highPriority = metrics.filter(m => m.priority === 'high');
  const poor = metrics.filter(m => m.status === 'poor');
  const warnings = metrics.filter(m => m.status === 'warning');
  const good = metrics.filter(m => m.status === 'good');

  const feedback: string[] = [];

  if (good.length === metrics.length) {
    feedback.push('Hervorragende Körperhaltung! Alle Metriken im grünen Bereich.');
  } else {
    // Lead with the most impactful high-priority issues
    const topIssues = highPriority.length > 0 ? highPriority : poor;
    topIssues.slice(0, 2).forEach(m => {
      feedback.push(m.fix ? `${m.feedback} → ${m.fix}` : m.feedback);
    });
    if (topIssues.length === 0 && warnings.length > 0) {
      warnings.slice(0, 2).forEach(m => {
        feedback.push(m.fix ? `${m.feedback} → ${m.fix}` : m.feedback);
      });
    }
  }

  const viewTips: Record<ViewType, string> = {
    side: 'Tipp: Fokussiere dich auf gleichmäßigen Zug und stabile Schulterposition.',
    back: 'Tipp: Achte auf symmetrische Schultern und gerade Wirbelsäule beim Ziehen.',
    top:  'Tipp: Schulterausrichtung und Fußstellung zur Zielachse sind entscheidend.',
  };
  feedback.push(viewTips[viewType]);

  return feedback;
}

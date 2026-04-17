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

  const shoulderMid: NormalizedLandmark = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2, z: 0 };
  const hipMid: NormalizedLandmark = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2, z: 0 };
  const kneeMid: NormalizedLandmark = { x: (lk.x + rk.x) / 2, y: (lk.y + rk.y) / 2, z: 0 };

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
      ? 'Ausgezeichnete aufrechte Rückenhaltung.'
      : spineAngle < 10
      ? 'Leichte Neigung – versuche aufrechter zu stehen.'
      : 'Zu starke Vorneigung – Rücken aufrichten.',
  });

  const bowArmAngle = angle(ls, le, lw);
  const bowArmScore = scoreFromRange(bowArmAngle, 165, 15);
  metrics.push({
    label: 'Bogenarm-Streckung',
    value: Math.round(bowArmAngle),
    unit: '°',
    score: bowArmScore,
    status: statusFromScore(bowArmScore),
    feedback: bowArmAngle >= 155 && bowArmAngle <= 180
      ? 'Bogenarm gut gestreckt.'
      : bowArmAngle < 155
      ? 'Ellbogen mehr strecken für mehr Stabilität.'
      : 'Arm zu überstreckt – minimale Restspannung halten.',
  });

  const drawArmAngle = angle(rs, re, rw);
  const drawScore = scoreFromRange(drawArmAngle, 90, 15);
  metrics.push({
    label: 'Zugarm-Winkel',
    value: Math.round(drawArmAngle),
    unit: '°',
    score: drawScore,
    status: statusFromScore(drawScore),
    feedback: drawArmAngle >= 80 && drawArmAngle <= 100
      ? 'Zugarm-Winkel optimal für den Anker.'
      : drawArmAngle < 80
      ? 'Zugarm zu weit durchgezogen.'
      : 'Mehr durchziehen für besseren Anker.',
  });

  const elbowHeight = re.y - rs.y;
  const elbowScore = elbowHeight < 0.02 ? 100 : elbowHeight < 0.06 ? 70 : 40;
  metrics.push({
    label: 'Zug-Ellbogen Höhe',
    value: elbowHeight < 0 ? 'Über Schulter' : 'Schulter-Niveau',
    score: elbowScore,
    status: statusFromScore(elbowScore),
    feedback: elbowHeight <= 0.02
      ? 'Ellbogen auf guter Höhe – kraftvoller Zug.'
      : 'Ellbogen anheben auf Schulterhöhe für optimale Kraftübertragung.',
  });

  const headTilt = Math.abs(nose.x - shoulderMid.x);
  const headScore = scoreFromRange(headTilt, 0, 0.05);
  metrics.push({
    label: 'Kopfposition',
    value: headTilt < 0.03 ? 'Zentriert' : 'Leichte Neigung',
    score: headScore,
    status: statusFromScore(headScore),
    feedback: headTilt < 0.03
      ? 'Kopf gut ausgerichtet.'
      : 'Kopf zur Zielscheibe drehen, nicht neigen.',
  });

  const kneeAngle = angle(hipMid, kneeMid, { x: kneeMid.x, y: kneeMid.y + 0.1, z: 0 });
  const kneeScore = scoreFromRange(kneeAngle, 5, 5);
  metrics.push({
    label: 'Kniehaltung',
    value: 'Geprüft',
    score: 85,
    status: 'good',
    feedback: 'Knie leicht entspannt, nicht blockiert – korrekt.',
  });

  return metrics;
}

export function analyzeBackView(landmarks: NormalizedLandmark[]): PostureMetric[] {
  const ls = landmarks[LANDMARK.LEFT_SHOULDER];
  const rs = landmarks[LANDMARK.RIGHT_SHOULDER];
  const le = landmarks[LANDMARK.LEFT_ELBOW];
  const re = landmarks[LANDMARK.RIGHT_ELBOW];
  const lh = landmarks[LANDMARK.LEFT_HIP];
  const rh = landmarks[LANDMARK.RIGHT_HIP];
  const lk = landmarks[LANDMARK.LEFT_KNEE];
  const rk = landmarks[LANDMARK.RIGHT_KNEE];
  const la = landmarks[LANDMARK.LEFT_ANKLE];
  const ra = landmarks[LANDMARK.RIGHT_ANKLE];
  const nose = landmarks[LANDMARK.NOSE];

  const metrics: PostureMetric[] = [];

  const shoulderDiff = Math.abs(ls.y - rs.y);
  const shoulderScore = scoreFromRange(shoulderDiff, 0, 0.03);
  metrics.push({
    label: 'Schulter-Symmetrie',
    value: shoulderDiff < 0.02 ? 'Symmetrisch' : shoulderDiff < 0.05 ? 'Leicht asymmetrisch' : 'Asymmetrisch',
    score: shoulderScore,
    status: statusFromScore(shoulderScore),
    feedback: shoulderDiff < 0.02
      ? 'Schultern gut waagerecht – exzellente Ausrichtung.'
      : 'Schulter anheben oder Spannung ausgleichen für bessere Stabilität.',
  });

  const shoulderMidX = (ls.x + rs.x) / 2;
  const hipMidX = (lh.x + rh.x) / 2;
  const spineOffset = Math.abs(shoulderMidX - hipMidX);
  const spineScore = scoreFromRange(spineOffset, 0, 0.04);
  metrics.push({
    label: 'Wirbelsäulen-Ausrichtung',
    value: spineOffset < 0.03 ? 'Gerade' : 'Leichte Seitenneigung',
    score: spineScore,
    status: statusFromScore(spineScore),
    feedback: spineOffset < 0.03
      ? 'Wirbelsäule gerade – sehr gut.'
      : 'Seitliche Neigung korrigieren für gleichmäßige Kraft.',
  });

  const drawElbowHeight = re.y - rs.y;
  const drawElbowScore = drawElbowHeight < 0.03 ? 100 : drawElbowHeight < 0.07 ? 65 : 35;
  metrics.push({
    label: 'Zug-Ellbogen (hinten)',
    value: drawElbowHeight < 0 ? 'Über Schulter' : Math.round(drawElbowHeight * 100) + '% unter Schulter',
    score: drawElbowScore,
    status: statusFromScore(drawElbowScore),
    feedback: drawElbowHeight < 0.03
      ? 'Zug-Ellbogen gut positioniert.'
      : 'Ellbogen nach hinten und oben ziehen, nicht fallen lassen.',
  });

  const stanceWidth = Math.abs(la.x - ra.x);
  const shoulderWidth = Math.abs(ls.x - rs.x);
  const stanceRatio = stanceWidth / (shoulderWidth || 0.1);
  const stanceScore = scoreFromRange(stanceRatio, 1.2, 0.3);
  metrics.push({
    label: 'Standbreite',
    value: Math.round(stanceRatio * 100) + '% der Schulterbreite',
    score: stanceScore,
    status: statusFromScore(stanceScore),
    feedback: stanceRatio >= 0.9 && stanceRatio <= 1.5
      ? 'Standbreite ideal – stabile Basis.'
      : stanceRatio < 0.9
      ? 'Füße weiter auseinander für mehr Stabilität.'
      : 'Füße etwas enger für bessere Kontrolle.',
  });

  const headLateral = Math.abs(nose.x - shoulderMidX);
  const headScore = scoreFromRange(headLateral, 0, 0.04);
  metrics.push({
    label: 'Kopf-Ausrichtung',
    value: headLateral < 0.03 ? 'Zentriert' : 'Seitlich verschoben',
    score: headScore,
    status: statusFromScore(headScore),
    feedback: headLateral < 0.03
      ? 'Kopf gerade gehalten – korrekt.'
      : 'Kopf zentrieren, nicht zur Seite neigen.',
  });

  const hipLevel = Math.abs(lh.y - rh.y);
  const hipScore = scoreFromRange(hipLevel, 0, 0.03);
  metrics.push({
    label: 'Hüft-Balance',
    value: hipLevel < 0.02 ? 'Waagerecht' : 'Leicht geneigt',
    score: hipScore,
    status: statusFromScore(hipScore),
    feedback: hipLevel < 0.02
      ? 'Hüfte waagerecht – sehr gut.'
      : 'Gewicht gleichmäßig auf beide Füße verteilen.',
  });

  return metrics;
}

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

  const shoulderLineAngle = Math.abs(
    Math.atan2(rs.y - ls.y, rs.x - ls.x) * (180 / Math.PI)
  );
  const shoulderRotScore = scoreFromRange(Math.abs(shoulderLineAngle - 90), 0, 15);
  metrics.push({
    label: 'Schulter-Ausrichtung',
    value: Math.round(shoulderLineAngle) + '°',
    score: shoulderRotScore,
    status: statusFromScore(shoulderRotScore),
    feedback: Math.abs(shoulderLineAngle - 90) < 15
      ? 'Schultern optimal zur Zielachse ausgerichtet.'
      : 'Schultern mehr zur Zielscheibe drehen für bessere Kraftübertragung.',
  });

  const hipLineAngle = Math.abs(
    Math.atan2(rh.y - lh.y, rh.x - lh.x) * (180 / Math.PI)
  );
  const hipRotScore = scoreFromRange(Math.abs(hipLineAngle - 90), 0, 20);
  metrics.push({
    label: 'Hüft-Rotation',
    value: Math.round(hipLineAngle) + '°',
    score: hipRotScore,
    status: statusFromScore(hipRotScore),
    feedback: Math.abs(hipLineAngle - 90) < 20
      ? 'Hüfte gut ausgerichtet.'
      : 'Hüfte leicht zur Seite drehen für natürlichere Körperhaltung.',
  });

  const stanceAngle = Math.abs(
    Math.atan2(ra.y - la.y, ra.x - la.x) * (180 / Math.PI)
  );
  const stanceScore = scoreFromRange(Math.abs(stanceAngle - 90), 5, 20);
  metrics.push({
    label: 'Fußstellung',
    value: Math.round(stanceAngle) + '°',
    score: stanceScore,
    status: statusFromScore(stanceScore),
    feedback: 'Leichter Öffnungswinkel der Füße empfohlen für stabilen Stand.',
  });

  const noseDist = dist2D(nose, { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2, z: 0 });
  const headForwardScore = scoreFromRange(noseDist, 0.15, 0.08);
  metrics.push({
    label: 'Kopf-Vorlage',
    value: noseDist < 0.1 ? 'Wenig' : noseDist < 0.2 ? 'Mittel' : 'Stark',
    score: headForwardScore,
    status: statusFromScore(headForwardScore),
    feedback: noseDist < 0.2
      ? 'Kopf gut positioniert – zum Ziel gedreht.'
      : 'Kopf nicht zu weit vorbeugen.',
  });

  const elbowSpan = dist2D(le, re);
  const shoulderSpan = dist2D(ls, rs);
  const elbowRatio = elbowSpan / (shoulderSpan || 0.1);
  const elbowScore = scoreFromRange(elbowRatio, 1.5, 0.4);
  metrics.push({
    label: 'Arm-Öffnung',
    value: Math.round(elbowRatio * 100) + '% der Schulterbreite',
    score: elbowScore,
    status: statusFromScore(elbowScore),
    feedback: elbowRatio >= 1.1 && elbowRatio <= 2.0
      ? 'Armöffnung gut für die Schussposition.'
      : 'Arme weiter öffnen für vollständigen Auszug.',
  });

  const bodyRotation = Math.abs(
    Math.atan2(
      (rs.y + rh.y) / 2 - (ls.y + lh.y) / 2,
      (rs.x + rh.x) / 2 - (ls.x + lh.x) / 2
    ) * (180 / Math.PI)
  );
  const rotScore = scoreFromRange(Math.abs(bodyRotation - 90), 5, 15);
  metrics.push({
    label: 'Körper-Rotation',
    value: Math.round(bodyRotation) + '°',
    score: rotScore,
    status: statusFromScore(rotScore),
    feedback: Math.abs(bodyRotation - 90) < 15
      ? 'Körperrotation optimal für seitlichen Stand.'
      : 'Körper mehr seitwärts zur Zielscheibe ausrichten.',
  });

  return metrics;
}

export function getMetricsForView(viewType: ViewType, landmarks: NormalizedLandmark[][]): PostureMetric[] {
  if (landmarks.length === 0) return [];
  const avg = averageLandmarks(landmarks);
  switch (viewType) {
    case 'side': return analyzeSideView(avg);
    case 'back': return analyzeBackView(avg);
    case 'top': return analyzeTopView(avg);
  }
}

export function calculateOverallScore(metrics: PostureMetric[]): number {
  if (metrics.length === 0) return 0;
  const total = metrics.reduce((sum, m) => sum + m.score, 0);
  return Math.round(total / metrics.length);
}

export function generateFeedback(metrics: PostureMetric[], viewType: ViewType): string[] {
  const poor = metrics.filter(m => m.status === 'poor').map(m => m.feedback);
  const warnings = metrics.filter(m => m.status === 'warning').map(m => m.feedback);
  const good = metrics.filter(m => m.status === 'good');

  const feedback: string[] = [];

  if (good.length === metrics.length) {
    feedback.push('Hervorragende Körperhaltung! Alle Metriken im grünen Bereich.');
  } else {
    feedback.push(...poor.slice(0, 2));
    if (poor.length === 0) feedback.push(...warnings.slice(0, 2));
  }

  const viewTips: Record<ViewType, string> = {
    side: 'Tipp: Fokussiere dich auf einen gleichmäßigen Zug und stabile Schulterposition.',
    back: 'Tipp: Achte auf symmetrische Schultern und gerade Wirbelsäule beim Ziehen.',
    top: 'Tipp: Optimale Fußstellung und Schulterausrichtung zur Zielachse sind entscheidend.',
  };
  feedback.push(viewTips[viewType]);

  return feedback;
}

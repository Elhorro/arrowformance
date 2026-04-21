// src/pages/Help.tsx
export default function Help() {
  return (
    <div className="min-h-screen bg-stone-950 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Hilfe & Support</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-amber-500 mb-4">So nutzt du ArrowFormance</h2>
            <ol className="space-y-3 text-stone-300 list-decimal list-inside">
              <li>Wähle eine Perspektive: Seite, Rücken oder Vogelperspektive</li>
              <li>Lade ein 10-15 Sekunden langes Video hoch (max. 100MB)</li>
              <li>Warte ~5-10 Sekunden während die KI deine Haltung analysiert</li>
              <li>Erhalte deinen Score (0-100) und detailliertes Feedback</li>
              <li>Verbessere deine Technik basierend auf den Empfehlungen</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-amber-500 mb-4">Tipps für beste Ergebnisse</h2>
            <ul className="space-y-2 text-stone-300">
              <li>✅ Gute Beleuchtung - keine Schatten auf dem Körper</li>
              <li>✅ Statische Kamera - auf Stativ oder stabil positioniert</li>
              <li>✅ Ganzer Körper sichtbar - von Kopf bis Fuß im Bild</li>
              <li>✅ Klare Sicht - keine Objekte zwischen Kamera und Schütze</li>
              <li>✅ Ruhiger Hintergrund - einfarbig oder wenig Ablenkung</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-amber-500 mb-4">Technische Anforderungen</h2>
            <ul className="space-y-2 text-stone-300">
              <li>📱 Moderner Browser (Chrome, Firefox, Edge, Safari)</li>
              <li>💻 Mindestens 4GB RAM</li>
              <li>🎥 Video-Format: MP4, MOV, WEBM</li>
              <li>📏 Empfohlene Auflösung: 720p oder höher</li>
              <li>⚡ Internetverbindung nur für initiales Laden nötig</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-amber-500 mb-4">Probleme?</h2>
            <p className="text-stone-300 mb-4">
              Falls die Analyse nicht funktioniert:
            </p>
            <ul className="space-y-2 text-stone-300">
              <li>🔄 Seite neu laden (F5)</li>
              <li>🧹 Browser-Cache leeren</li>
              <li>📹 Anderes Video probieren</li>
              <li>💻 Anderen Browser testen</li>
              <li>📧 Noch Probleme? <a href="/feedback" className="text-amber-500 hover:underline">Feedback senden</a></li>
            </ul>
          </section>
        </div>

        <div className="mt-12 text-center">
          <a href="/" className="text-amber-500 hover:text-amber-400">← Zurück zur Analyse</a>
        </div>
      </div>
    </div>
  );
}

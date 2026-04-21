// src/pages/FAQ.tsx
export default function FAQ() {
  return (
    <div className="min-h-screen bg-stone-950 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Häufig gestellte Fragen</h1>

        <div className="space-y-6">
          <div className="bg-stone-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-amber-500 mb-2">Wie funktioniert die Analyse?</h2>
            <p className="text-stone-300">
              Lade ein 10-15 Sekunden langes Video deines Bogenschusses hoch. Unsere KI analysiert deine Haltung
              mit MediaPipe Pose Detection und gibt dir detailliertes Feedback zu 6 verschiedenen Metriken.
            </p>
          </div>

          <div className="bg-stone-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-amber-500 mb-2">Werden meine Videos gespeichert?</h2>
            <p className="text-stone-300">
              Nein! Alle Videos werden nur lokal in deinem Browser analysiert und niemals hochgeladen oder gespeichert.
              Nur die Analyse-Ergebnisse (Score, Metriken) werden in der Datenbank gespeichert.
            </p>
          </div>

          <div className="bg-stone-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-amber-500 mb-2">Welche Perspektiven werden unterstützt?</h2>
            <p className="text-stone-300">
              Drei Perspektiven: Seitenansicht (Arm, Rücken & Anker), Rückansicht (Symmetrie & Ausrichtung)
              und Vogelperspektive (Stance & Rotation). Jede hat spezifische Metriken.
            </p>
          </div>

          <div className="bg-stone-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-amber-500 mb-2">Ist ArrowFormance kostenlos?</h2>
            <p className="text-stone-300">
              Ja! ArrowFormance ist komplett kostenlos nutzbar. Wir finanzieren uns durch diskrete Werbebanner.
            </p>
          </div>

          <div className="bg-stone-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-amber-500 mb-2">Kann ich meinen Fortschritt verfolgen?</h2>
            <p className="text-stone-300">
              Ja! Klick auf "Verlauf" im Header um alle deine bisherigen Analysen zu sehen, inklusive Score-Chart
              über Zeit und deine beste Analyse.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a href="/" className="text-amber-500 hover:text-amber-400">← Zurück zur Analyse</a>
        </div>
      </div>
    </div>
  );
}

// src/pages/Datenschutz.tsx
export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-stone-950 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>

        <div className="space-y-6 text-stone-300">
          <section>
            <h2 className="text-xl font-semibold text-amber-500 mb-3">Grundsätzliches</h2>
            <p>
              Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Diese Datenschutzerklärung klärt Sie über die
              Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten innerhalb unseres Onlineangebotes auf.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-amber-500 mb-3">Welche Daten werden gespeichert?</h2>

            <h3 className="font-semibold mt-4 mb-2">Session-ID (lokal)</h3>
            <p className="mb-4">
              In Ihrem Browser (localStorage) wird eine eindeutige Session-ID gespeichert. Diese dient ausschließlich
              dazu, Ihre Analysen über Sitzungen hinweg zuordnen zu können. Die Session-ID enthält keine personenbezogenen
              Daten und kann jederzeit gelöscht werden.
            </p>

            <h3 className="font-semibold mt-4 mb-2">Analyse-Ergebnisse</h3>
            <p className="mb-4">
              Folgende Daten werden in unserer Datenbank (Supabase) gespeichert:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Session-ID (anonymisierte UUID)</li>
              <li>Analyse-Score (0-100)</li>
              <li>Metriken (Winkel, Positionen)</li>
              <li>Zeitstempel der Analyse</li>
              <li>Gewählte Perspektive (side/back/top)</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">Banner-Tracking</h3>
            <p className="mb-4">
              Wir erfassen anonymisierte Daten über Werbe-Banner:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Welcher Banner angezeigt wurde</li>
              <li>Session-ID</li>
              <li>Zeitstempel</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">Was wird NICHT gespeichert</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>❌ Keine Videos (werden nur lokal analysiert)</li>
              <li>❌ Keine IP-Adressen</li>
              <li>❌ Keine Geräte-IDs oder Browser-Fingerprints</li>
              <li>❌ Keine Geolocation-Daten</li>
              <li>❌ Keine Cookies (nur localStorage)</li>
              <li>❌ Keine persönlichen Daten (Name, E-Mail, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-amber-500 mb-3">Rechtsgrundlage (DSGVO)</h2>
            <p>
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) zur
              Bereitstellung und Verbesserung unserer Dienstleistung.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-amber-500 mb-3">Drittanbieter</h2>

            <h3 className="font-semibold mt-4 mb-2">Supabase (Datenbank)</h3>
            <p className="mb-4">
              Wir nutzen Supabase für die Speicherung von Analyse-Ergebnissen. Supabase ist DSGVO-konform und hostet
              Daten in Europa. Weitere Infos: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">supabase.com/privacy</a>
            </p>

            <h3 className="font-semibold mt-4 mb-2">MediaPipe (Google)</h3>
            <p>
              Für die Pose-Erkennung nutzen wir MediaPipe. Die Analyse erfolgt <strong>ausschließlich lokal in Ihrem Browser</strong>.
              Es werden keine Daten an Google übertragen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-amber-500 mb-3">Ihre Rechte</h2>
            <p className="mb-4">Sie haben jederzeit das Recht auf:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-amber-500 mb-3">Daten löschen</h2>
            <p>
              Um alle Ihre Daten zu löschen:
            </p>
            <ol className="list-decimal list-inside space-y-2 mt-3 ml-4">
              <li>Browser-Daten löschen (localStorage) via Browser-Einstellungen</li>
              <li>Für Löschung der Datenbank-Einträge: E-Mail an kontakt@arrowformance.com</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-amber-500 mb-3">Änderungen</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtssituationen oder
              Änderungen unserer Dienste anzupassen. Stand: April 2026
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <a href="/" className="text-amber-500 hover:text-amber-400">← Zurück zur Analyse</a>
        </div>
      </div>
    </div>
  );
}

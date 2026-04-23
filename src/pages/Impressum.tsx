// src/pages/Impressum.tsx
export default function Impressum() {
  return (
    <div className="min-h-screen bg-stone-950 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Impressum</h1>

        <div className="space-y-6 text-stone-300">
          <section>
            <h2 className="text-xl font-semibold text-amber-500 mb-3">
              Angaben gemäß § 25 MedienG und § 5 ECG
            </h2>
            <p className="leading-relaxed">
              <strong className="text-white">Verein ZSAMMSITZN</strong><br />
              ZVR-Nummer: 1667379939<br />
              Gnaserstraße 6/4<br />
              8330 Feldbach<br />
              Österreich
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-amber-500 mb-3">Vereinsvorstand</h2>
            <p className="leading-relaxed">
              Obmann: Leopold Kumpusch<br />
              Obfrau: Simone Hochgerner
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-amber-500 mb-3">Kontakt</h2>
            <p className="leading-relaxed">
              E-Mail:{' '}
              <a href="mailto:gmiatlich@zsammsitzn.eu" className="text-amber-400 hover:underline">
                gmiatlich@zsammsitzn.eu
              </a><br />
              Telefon: 0677 / 61 43 56 00<br />
              Website:{' '}
              <a href="https://arrowformance.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                arrowformance.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-amber-500 mb-3">Haftungsausschluss</h2>

            <h3 className="font-semibold mt-4 mb-2">Haftung für Inhalte</h3>
            <p className="mb-4">
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit
              und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß
              § 18 ECG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
            </p>

            <h3 className="font-semibold mt-4 mb-2">Haftung für Links</h3>
            <p className="mb-4">
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben.
              Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
              Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>

            <h3 className="font-semibold mt-4 mb-2">Urheberrecht</h3>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem österreichischen
              Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen
              des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-amber-500 mb-3">Open Source</h2>
            <p>
              ArrowFormance ist ein Open-Source-Projekt. Der Quellcode ist verfügbar auf:{' '}
              <a
                href="https://github.com/Elhorro/arrowformance"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline"
              >
                GitHub
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-amber-500 mb-3">Technologie</h2>
            <p>
              Diese Anwendung nutzt MediaPipe von Google für die Pose-Erkennung. Alle Video-Analysen erfolgen
              lokal im Browser. Es werden keine Videos hochgeladen oder gespeichert.
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

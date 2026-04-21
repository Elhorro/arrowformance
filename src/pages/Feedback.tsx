// src/pages/Feedback.tsx
import { useState } from 'react';

export default function Feedback() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement feedback submission to Supabase
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-950 text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-emerald-400 mb-4">Vielen Dank! 🎉</h1>
            <p className="text-stone-300">
              Dein Feedback wurde erfolgreich gesendet. Wir lesen jede Nachricht und arbeiten kontinuierlich
              daran, ArrowFormance zu verbessern.
            </p>
          </div>
          <a href="/" className="text-amber-500 hover:text-amber-400">← Zurück zur Analyse</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Feedback & Vorschläge</h1>
        <p className="text-stone-400 mb-8">
          Deine Meinung ist uns wichtig! Sag uns, was dir gefällt oder was wir verbessern können.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-2">
              Art des Feedbacks
            </label>
            <select
              id="type"
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            >
              <option value="">Bitte wählen...</option>
              <option value="bug">🐛 Bug melden</option>
              <option value="feature">💡 Feature-Wunsch</option>
              <option value="improvement">🔧 Verbesserungsvorschlag</option>
              <option value="praise">❤️ Lob</option>
              <option value="other">📝 Sonstiges</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Deine Nachricht
            </label>
            <textarea
              id="message"
              rows={8}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Beschreibe dein Feedback so detailliert wie möglich..."
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              E-Mail (optional)
            </label>
            <input
              type="email"
              id="email"
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Falls du eine Rückmeldung wünschst..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Feedback senden
            </button>
            <a
              href="/"
              className="flex-1 bg-stone-800 hover:bg-stone-700 text-white font-semibold py-3 rounded-lg transition-colors text-center"
            >
              Abbrechen
            </a>
          </div>
        </form>

        <p className="text-stone-500 text-sm mt-6">
          💡 <strong>Tipp:</strong> Je detaillierter dein Feedback, desto besser können wir darauf eingehen!
        </p>
      </div>
    </div>
  );
}

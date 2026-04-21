// src/pages/Feedback.tsx
import { useForm, ValidationError } from '@formspree/react';

export default function Feedback() {
  const [state, handleSubmit] = useForm('mdaywaqq');

  if (state.succeeded) {
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
              name="type"
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
            <ValidationError field="type" errors={state.errors} className="text-red-400 text-sm mt-1" />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Deine Nachricht
            </label>
            <textarea
              id="message"
              name="message"
              rows={8}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Beschreibe dein Feedback so detailliert wie möglich..."
              required
            />
            <ValidationError field="message" errors={state.errors} className="text-red-400 text-sm mt-1" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              E-Mail (optional)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Falls du eine Rückmeldung wünschst..."
            />
            <ValidationError field="email" errors={state.errors} className="text-red-400 text-sm mt-1" />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={state.submitting}
              className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {state.submitting ? 'Wird gesendet...' : 'Feedback senden'}
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

import { ViewType } from '../types';
import BannerRotator from './BannerRotator';

interface ViewSelectorProps {
  onSelect: (view: ViewType) => void;
  sessionId: string;
}

const views = [
  {
    id: 'side' as ViewType,
    label: 'Seitenansicht',
    subtitle: 'Arm, Rücken & Anker',
    description: 'Analysiert Bogenarm-Streckung, Zugarm-Winkel, Rückenneigung und Ankerposition aus der Seitenperspektive.',
    metrics: ['Bogenarm-Streckung', 'Zugarm-Winkel', 'Rückenneigung', 'Ellbogen-Höhe', 'Kopfposition'],
    gradient: 'from-amber-500 to-orange-600',
    bg: 'from-amber-950/40 to-orange-950/30',
    border: 'border-amber-500/30 hover:border-amber-400/60',
    icon: (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <circle cx="40" cy="14" r="7" fill="currentColor" opacity="0.9" />
        <line x1="40" y1="21" x2="40" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="32" x2="20" y2="45" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="32" x2="62" y2="28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="62" cy="28" r="3" fill="currentColor" opacity="0.7" />
        <line x1="40" y1="50" x2="32" y2="68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="50" x2="48" y2="68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="62" y1="28" x2="72" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 2" />
      </svg>
    ),
  },
  {
    id: 'back' as ViewType,
    label: 'Rückansicht',
    subtitle: 'Symmetrie & Ausrichtung',
    description: 'Überprüft Schulterlinie, Wirbelsäulenausrichtung, Zugellbogen-Position und Hüftbalance von hinten.',
    metrics: ['Schulter-Symmetrie', 'Wirbelsäulen-Ausrichtung', 'Zug-Ellbogen', 'Hüft-Balance', 'Standbreite'],
    gradient: 'from-sky-500 to-blue-600',
    bg: 'from-sky-950/40 to-blue-950/30',
    border: 'border-sky-500/30 hover:border-sky-400/60',
    icon: (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <circle cx="40" cy="14" r="7" fill="currentColor" opacity="0.9" />
        <line x1="40" y1="21" x2="40" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="32" x2="18" y2="28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="32" x2="62" y2="28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="18" cy="28" r="3" fill="currentColor" opacity="0.7" />
        <circle cx="62" cy="28" r="3" fill="currentColor" opacity="0.7" />
        <line x1="40" y1="50" x2="32" y2="68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="50" x2="48" y2="68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="20" y1="34" x2="14" y2="44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'top' as ViewType,
    label: 'Vogelperspektive',
    subtitle: 'Stance & Rotation',
    description: 'Bewertet Schulter-Zielachse, Körperrotation, Fußstellung und Arm-Öffnung aus der Draufsicht.',
    metrics: ['Schulter-Ausrichtung', 'Körper-Rotation', 'Fußstellung', 'Arm-Öffnung', 'Kopf-Vorlage'],
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'from-emerald-950/40 to-teal-950/30',
    border: 'border-emerald-500/30 hover:border-emerald-400/60',
    icon: (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <circle cx="40" cy="40" r="8" fill="currentColor" opacity="0.9" />
        <line x1="40" y1="40" x2="20" y2="30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="40" x2="60" y2="30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="12" cy="26" r="3" fill="currentColor" opacity="0.6" />
        <line x1="12" y1="26" x2="20" y2="30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="68" cy="26" r="3" fill="currentColor" opacity="0.6" />
        <line x1="60" y1="30" x2="68" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="33" y1="55" x2="28" y2="64" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="47" y1="55" x2="52" y2="64" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="40" y1="40" x2="40" y2="55" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="30" r="4" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
];

export default function ViewSelector({ onSelect, sessionId }: ViewSelectorProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
          Wähle deine Aufnahmeperspektive
        </h1>
        <p className="text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Lade ein 10–15 Sekunden langes Video hoch. Die KI prüft Körperhaltung
          und Gelenkwinkel — als erster Haltungs-Check, kein Ersatz für einen Trainer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onSelect(view.id)}
            className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${view.bg} ${view.border} p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer`}
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${view.gradient} transition-opacity duration-300`} />

            <div className={`w-20 h-20 mb-5 text-current bg-gradient-to-br ${view.gradient} rounded-xl p-4 text-stone-900`}>
              {view.icon}
            </div>

            <div className="mb-2">
              <span className={`text-xs font-semibold uppercase tracking-widest bg-gradient-to-r ${view.gradient} bg-clip-text text-transparent`}>
                {view.subtitle}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-3">{view.label}</h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-5">{view.description}</p>

            <div className="space-y-1.5">
              {view.metrics.map((m) => (
                <div key={m} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${view.gradient} flex-shrink-0`} />
                  <span className="text-stone-400 text-xs">{m}</span>
                </div>
              ))}
            </div>

            <div className={`mt-6 flex items-center gap-2 text-sm font-medium bg-gradient-to-r ${view.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
              <span>Analyse starten</span>
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="url(#arrow)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="arrow" x1="0" y1="0" x2="16" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f59e0b" />
                    <stop offset="1" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {[
          { label: 'Analysierte Frames', value: '20' },
          { label: 'Metriken pro Ansicht', value: '6' },
          { label: 'Verarbeitung', value: 'Lokal' },
        ].map((stat) => (
          <div key={stat.label} className="text-center bg-stone-800/50 rounded-xl py-4 px-3 border border-stone-700/50">
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-xs text-stone-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto">
        <BannerRotator sessionId={sessionId} />
      </div>
    </div>
  );
}

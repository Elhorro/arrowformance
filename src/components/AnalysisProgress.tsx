import { Loader2, ScanLine } from 'lucide-react';

interface AnalysisProgressProps {
  progress: number;
  status: string;
}

export default function AnalysisProgress({ progress, status }: AnalysisProgressProps) {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-stone-700 flex items-center justify-center">
          <ScanLine className="w-10 h-10 text-amber-400" />
        </div>
        <svg
          className="absolute inset-0 -rotate-90"
          width="96"
          height="96"
          viewBox="0 0 96 96"
        >
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
            className="transition-all duration-500"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">Analyse läuft</h2>
      <p className="text-stone-400 mb-6 text-sm">{status || 'Bitte warten...'}</p>

      <div className="w-full bg-stone-800 rounded-full h-2 mb-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center gap-2 text-stone-500 text-sm">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>{progress}% abgeschlossen</span>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-3 w-full">
        {['Frames extrahieren', 'Pose erkennen', 'Metriken berechnen'].map((step, i) => {
          const stepProgress = [10, 80, 95][i];
          const done = progress >= stepProgress;
          const active = progress >= ([0, 10, 80][i]) && !done;
          return (
            <div
              key={step}
              className={`rounded-xl py-3 px-2 text-xs text-center border transition-all duration-300 ${
                done
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : active
                  ? 'bg-stone-800 border-stone-600 text-stone-300'
                  : 'bg-stone-800/30 border-stone-700/30 text-stone-600'
              }`}
            >
              {step}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { History, Target } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onShowHistory: () => void;
}

export default function Header({ onReset, onShowHistory }: HeaderProps) {
  return (
    <header className="bg-stone-900 border-b border-stone-700">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
            <Target className="w-5 h-5 text-stone-900" />
          </div>
          <div className="text-left">
            <span className="text-white font-semibold text-lg leading-none block">ArrowFormance</span>
            <span className="text-stone-400 text-xs">KI-Haltungsanalyse für Bogenschützen</span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onShowHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white text-sm transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Verlauf</span>
          </button>
          <span className="text-xs text-stone-500 bg-stone-800 px-2 py-1 rounded border border-stone-600">
            Powered by MediaPipe
          </span>
        </div>
      </div>
    </header>
  );
}

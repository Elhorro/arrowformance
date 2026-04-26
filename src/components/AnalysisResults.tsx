import { AnalysisResult, ViewType } from '../types';
import MetricCard from './MetricCard';
import BannerRotator from './BannerRotator';
import AnalysisVideoOverlay from './AnalysisVideoOverlay';
import { RotateCcw, CheckCircle, AlertTriangle, XCircle, MessageSquare, Layers, Zap, Cpu, History } from 'lucide-react';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
  onNewAnalysis: () => void;
  onShowHistory: () => void;
  sessionId: string;
}

const VIEW_LABELS: Record<ViewType, string> = {
  side: 'Seitenansicht',
  back: 'Rückansicht',
  top: 'Vogelperspektive',
};

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 75 ? 'Ausgezeichnet' : score >= 60 ? 'Gut' : score >= 45 ? 'Verbesserbar' : 'Korrektur nötig';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#27272a" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-stone-500">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-semibold mt-2" style={{ color }}>{label}</p>
    </div>
  );
}

export default function AnalysisResults({ result, onReset, onNewAnalysis, onShowHistory, sessionId }: AnalysisResultsProps) {
  const goodCount = result.metrics.filter(m => m.status === 'good').length;
  const warnCount = result.metrics.filter(m => m.status === 'warning').length;
  const poorCount = result.metrics.filter(m => m.status === 'poor').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-stone-800 border border-stone-700 rounded-full px-3 py-1 mb-2">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">{VIEW_LABELS[result.viewType]}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Analyse-Ergebnisse</h1>
          <p className="text-stone-400 text-sm mt-1">{result.frameCount} Frames analysiert</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onShowHistory}
            className="flex items-center gap-2 px-3 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-sm rounded-xl transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            Verlauf
          </button>
          <button
            onClick={onNewAnalysis}
            className="flex items-center gap-2 px-3 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-sm rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Neues Video
          </button>
          <button
            onClick={onReset}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 text-sm font-semibold rounded-xl transition-colors"
          >
            Neue Ansicht
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 bg-stone-800/50 border border-stone-700/50 rounded-2xl p-6 flex flex-col items-center justify-center">
          <ScoreRing score={result.overallScore} />
          <div className="mt-6 w-full space-y-2">
            {[
              { icon: CheckCircle, color: 'text-emerald-400', label: 'Gut', count: goodCount },
              { icon: AlertTriangle, color: 'text-amber-400', label: 'Verbesserbar', count: warnCount },
              { icon: XCircle, color: 'text-red-400', label: 'Korrektur', count: poorCount },
            ].map(({ icon: Icon, color, label, count }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span className="text-stone-400">{label}</span>
                </div>
                <span className={`font-semibold ${color}`}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-stone-800/50 border border-stone-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">KI-Feedback</h3>
          </div>
          <ul className="space-y-3">
            {result.feedback.map((fb, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-stone-400 leading-relaxed">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                {fb}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pose Overlay */}
      {result.poseFrames.length > 0 && (
        <AnalysisVideoOverlay
          poseFrames={result.poseFrames}
          metrics={result.metrics}
          viewType={result.viewType}
        />
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Detaillierte Metriken</h2>
        <p className="text-xs text-stone-500 mb-4">
          Sortiert nach Priorität — 🔴 markierte Metriken haben den größten Einfluss auf deine Schussleistung.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...result.metrics]
            .sort((a, b) => {
              const pOrder = { high: 0, medium: 1, low: 2 };
              return (pOrder[a.priority ?? 'low']) - (pOrder[b.priority ?? 'low']);
            })
            .map((metric, i) => (
              <MetricCard key={metric.label} metric={metric} index={i} />
            ))}
        </div>
      </div>

      <BannerRotator sessionId={sessionId} viewType={result.viewType} />

      <div className="mt-6 bg-stone-800/30 border border-stone-700/30 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          {result.performanceStats.delegate === 'GPU' ? (
            <Zap className="w-4 h-4 text-emerald-400" />
          ) : (
            <Cpu className="w-4 h-4 text-stone-400" />
          )}
          <span className="text-xs font-semibold text-stone-300">Performance</span>
          <span
            className={`ml-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              result.performanceStats.delegate === 'GPU'
                ? 'bg-emerald-900/60 text-emerald-300'
                : 'bg-stone-700 text-stone-400'
            }`}
          >
            {result.performanceStats.delegate}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Gesamtzeit', value: `${(result.performanceStats.totalAnalysisMs / 1000).toFixed(1)} s` },
            { label: 'Ø pro Frame', value: `${result.performanceStats.avgFrameMs} ms` },
            { label: 'Schnellster Frame', value: `${result.performanceStats.minFrameMs} ms` },
            { label: 'Langsamster Frame', value: `${result.performanceStats.maxFrameMs} ms` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-stone-900/50 rounded-xl px-3 py-2">
              <p className="text-xs text-stone-500">{label}</p>
              <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">
          Diese Analyse basiert auf KI-Pose-Erkennung (MediaPipe) und ist als Trainingsunterstützung gedacht.
          Für professionelles Coaching konsultiere einen qualifizierten Bogenschießen-Trainer.
          Analysiert wurden {result.frameCount} Frames aus dem hochgeladenen Video.
        </p>
      </div>
    </div>
  );
}

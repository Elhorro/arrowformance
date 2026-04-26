import { PostureMetric } from '../types';
import { CheckCircle, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';

interface MetricCardProps {
  metric: PostureMetric;
  index: number;
}

const STATUS_CONFIG = {
  good: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    bar: 'from-emerald-500 to-emerald-400',
    label: 'Gut',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    bar: 'from-amber-500 to-amber-400',
    label: 'Verbesserbar',
  },
  poor: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
    bar: 'from-red-500 to-red-400',
    label: 'Korrigieren',
  },
};

export default function MetricCard({ metric, index }: MetricCardProps) {
  const cfg = STATUS_CONFIG[metric.status];
  const Icon = cfg.icon;
  const isHighPriority = metric.priority === 'high';

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 hover:scale-[1.01] ${cfg.bg} ${
        isHighPriority ? 'border-red-500/50 ring-1 ring-red-500/20' : cfg.border
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-xs text-stone-500">{metric.label}</p>
            {isHighPriority && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-500/20 border border-red-500/40 rounded-full text-[10px] font-bold text-red-400 leading-none flex-shrink-0">
                🔴 Priorität
              </span>
            )}
          </div>
          <p className="text-lg font-bold text-white truncate">
            {metric.value}{metric.unit ?? ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <Icon className={`w-4 h-4 ${cfg.color}`} />
          <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-stone-500">Score</span>
          <span className={`font-semibold ${cfg.color}`}>{metric.score}/100</span>
        </div>
        <div className="h-1.5 bg-stone-700 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${cfg.bar} rounded-full transition-all duration-700`}
            style={{ width: `${metric.score}%` }}
          />
        </div>
      </div>

      {/* Feedback */}
      <p className="text-xs text-stone-400 leading-relaxed mb-2">{metric.feedback}</p>

      {/* Impact & Fix — only shown for warning/poor */}
      {(metric.impact || metric.fix) && (
        <div className="mt-2 pt-2 border-t border-stone-700/50 space-y-1.5">
          {metric.impact && (
            <p className="text-[11px] text-stone-500 leading-relaxed">
              <span className="font-semibold text-stone-400">Auswirkung: </span>
              {metric.impact}
            </p>
          )}
          {metric.fix && (
            <div className="flex items-start gap-1.5">
              <Lightbulb className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-400/80 leading-relaxed font-medium">
                {metric.fix}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

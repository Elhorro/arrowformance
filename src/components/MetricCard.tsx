import { PostureMetric } from '../types';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

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

  return (
    <div
      className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border} transition-all duration-200 hover:scale-[1.01]`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-stone-500 mb-0.5">{metric.label}</p>
          <p className="text-lg font-bold text-white">
            {metric.value}{metric.unit ?? ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon className={`w-4 h-4 ${cfg.color}`} />
          <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>

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

      <p className="text-xs text-stone-400 leading-relaxed">{metric.feedback}</p>
    </div>
  );
}

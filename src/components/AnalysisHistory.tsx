import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, History, Target, TrendingUp } from 'lucide-react';
import { fetchSessionHistory, HistoryEntry } from '../lib/supabase';

interface AnalysisHistoryProps {
  sessionId: string;
  onBack: () => void;
}

const VIEW_LABELS: Record<string, string> = {
  side: 'Seite',
  back: 'Rücken',
  top: 'Vogel',
};

const VIEW_COLORS: Record<string, string> = {
  side: '#f59e0b',
  back: '#38bdf8',
  top: '#34d399',
};

// ─── SVG Score-Chart ──────────────────────────────────────────────────────────

function ScoreChart({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length < 2) return null;

  const sorted = [...entries].reverse(); // älteste zuerst
  const W = 560;
  const H = 140;
  const pX = 36;
  const pY = 24;
  const cW = W - pX * 2;
  const cH = H - pY * 2;

  const pts = sorted.map((e, i) => ({
    x: pX + (i / (sorted.length - 1)) * cW,
    y: pY + (1 - e.score / 100) * cH,
    score: e.score,
    vt: e.view_type,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${(pY + cH).toFixed(1)} L${pts[0].x.toFixed(1)},${(pY + cH).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 260 }}>
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontale Grid-Linien */}
      {[25, 50, 75, 100].map(val => {
        const y = pY + (1 - val / 100) * cH;
        return (
          <g key={val}>
            <line x1={pX} y1={y} x2={W - pX} y2={y} stroke="#292524" strokeWidth="1" />
            <text x={pX - 5} y={y + 4} fontSize="9" fill="#57534e" textAnchor="end">{val}</text>
          </g>
        );
      })}

      {/* Area */}
      <path d={areaPath} fill="url(#chartFill)" />

      {/* Linie */}
      <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Punkte + Score-Label */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill={VIEW_COLORS[p.vt] ?? '#f59e0b'} />
          <circle cx={p.x} cy={p.y} r="3" fill="#0c0a09" />
          <text x={p.x} y={p.y - 9} fontSize="9" fill="#e7e5e4" textAnchor="middle">{p.score}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function AnalysisHistory({ sessionId, onBack }: AnalysisHistoryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionHistory(sessionId)
      .then(setEntries)
      .catch(e => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const avgScore = entries.length > 0
    ? Math.round(entries.reduce((a, b) => a + b.score, 0) / entries.length)
    : 0;
  const bestScore = entries.length > 0 ? Math.max(...entries.map(e => e.score)) : 0;

  const scoreColor = (s: number) =>
    s >= 75 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-stone-400 hover:text-white text-sm mb-7 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Zurück
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
          <History className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Mein Verlauf</h1>
          <p className="text-stone-400 text-sm">
            {loading ? 'Lade...' : `${entries.length} Analyse${entries.length !== 1 ? 'n' : ''} in dieser Session`}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-stone-500 text-sm">Lade Verlauf…</div>
      )}

      {/* Error */}
      {fetchError && (
        <div className="text-center py-20 text-red-400 text-sm">{fetchError}</div>
      )}

      {/* Empty */}
      {!loading && !fetchError && entries.length === 0 && (
        <div className="text-center py-20">
          <Target className="w-12 h-12 text-stone-700 mx-auto mb-4" />
          <p className="text-stone-400 font-medium">Noch keine Analysen</p>
          <p className="text-stone-500 text-sm mt-1">Lade ein Video hoch, um loszulegen.</p>
        </div>
      )}

      {!loading && !fetchError && entries.length > 0 && (
        <>
          {/* Stats-Kacheln */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Analysen', value: entries.length, Icon: History },
              { label: 'Ø Score', value: avgScore, Icon: TrendingUp },
              { label: 'Bester Score', value: bestScore, Icon: Target },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="bg-stone-800/50 border border-stone-700/50 rounded-2xl p-4 text-center">
                <Icon className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-stone-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          {entries.length >= 2 && (
            <div className="bg-stone-800/50 border border-stone-700/50 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Score-Verlauf</h3>
              </div>
              <ScoreChart entries={entries} />
              {/* Legende */}
              <div className="flex gap-5 mt-3 justify-center flex-wrap">
                {Object.entries(VIEW_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: VIEW_COLORS[key] }} />
                    <span className="text-xs text-stone-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eintrags-Liste */}
          <div className="space-y-3">
            {entries.map((entry, i) => {
              const date = new Date(entry.created_at);
              const delegate = (entry.performance_stats?.delegate as string) ?? null;

              return (
                <div
                  key={entry.id}
                  className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 flex items-center gap-4"
                >
                  {/* View-Badge */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-stone-900 font-bold text-xs flex-shrink-0"
                    style={{ background: VIEW_COLORS[entry.view_type] ?? '#f59e0b' }}
                  >
                    {VIEW_LABELS[entry.view_type] ?? entry.view_type}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">
                      Analyse #{entries.length - i}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Calendar className="w-3 h-3 text-stone-500 flex-shrink-0" />
                      <span className="text-xs text-stone-500">
                        {date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        {' · '}
                        {date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-stone-700">·</span>
                      <span className="text-xs text-stone-500">{entry.frame_count} Frames</span>
                      {delegate && (
                        <>
                          <span className="text-stone-700">·</span>
                          <span className={`text-xs font-semibold ${delegate === 'GPU' ? 'text-emerald-400' : 'text-stone-500'}`}>
                            {delegate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-2xl font-bold ${scoreColor(entry.score)}`}>{entry.score}</p>
                    <p className="text-xs text-stone-500">/ 100</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

import { useRef, useEffect, useState, useCallback } from 'react';
import { PoseFrame, PostureMetric, ViewType } from '../types';
import { ChevronLeft, ChevronRight, Play, Pause, Scan } from 'lucide-react';

interface Props {
  poseFrames: PoseFrame[];
  metrics: PostureMetric[];
  viewType: ViewType;
}

// MediaPipe standard skeleton connections (landmark index pairs)
const POSE_CONNECTIONS: [number, number][] = [
  // Face
  [0, 1], [1, 3], [0, 2], [2, 4],
  // Torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // Left arm
  [11, 13], [13, 15],
  // Right arm
  [12, 14], [14, 16],
  // Left leg
  [23, 25], [25, 27],
  // Right leg
  [24, 26], [26, 28],
];

// Which landmarks each metric label "owns" — for color coding
const METRIC_LANDMARKS: Record<string, number[]> = {
  'Bogenarm-Streckung':       [11, 13, 15],
  'Zugarm-Winkel':            [12, 14, 16],
  'Zug-Ellbogen Höhe':        [14, 12],
  'Zug-Ellbogen (hinten)':    [14, 12],
  'Rückenneigung':            [11, 12, 23, 24],
  'Wirbelsäulen-Ausrichtung': [11, 12, 23, 24],
  'Schulter-Symmetrie':       [11, 12],
  'Schulter-Ausrichtung':     [11, 12],
  'Standbreite':              [27, 28],
  'Fußstellung':              [27, 28],
  'Hüft-Balance':             [23, 24],
  'Hüft-Rotation':            [23, 24],
  'Kopfposition':             [0],
  'Kopf-Ausrichtung':         [0],
  'Kopf-Vorlage':             [0],
  'Arm-Öffnung':              [13, 14, 15, 16],
  'Körper-Rotation':          [11, 12, 23, 24],
  'Kniehaltung':              [25, 26, 27, 28],
};

const VIEW_LABELS: Record<ViewType, string> = {
  side: 'Seitenansicht',
  back: 'Rückansicht',
  top: 'Vogelperspektive',
};

function buildLandmarkColorMap(metrics: PostureMetric[]): Map<number, 'poor' | 'warning' | 'good'> {
  const map = new Map<number, 'poor' | 'warning' | 'good'>();

  // Process from least to most severe so poor always wins
  const ordered = [...metrics].sort((a, b) => {
    const o = { good: 0, warning: 1, poor: 2 };
    return o[a.status] - o[b.status];
  });

  for (const metric of ordered) {
    const lmIndices = METRIC_LANDMARKS[metric.label] ?? [];
    for (const idx of lmIndices) {
      map.set(idx, metric.status);
    }
  }

  return map;
}

function drawFrame(
  canvas: HTMLCanvasElement,
  frame: PoseFrame,
  colorMap: Map<number, 'poor' | 'warning' | 'good'>
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // Background
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1c1917');
  bg.addColorStop(1, '#0c0a09');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += W / 8) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += H / 8) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  const lms = frame.landmarks;
  if (!lms || lms.length === 0) return;

  const toCanvas = (lm: { x: number; y: number }) => ({
    x: lm.x * W,
    y: lm.y * H,
  });

  const statusColor = (status: 'poor' | 'warning' | 'good' | undefined) => {
    if (status === 'poor')    return '#ef4444';
    if (status === 'warning') return '#f59e0b';
    return '#10b981';
  };

  // Draw skeleton connections
  for (const [a, b] of POSE_CONNECTIONS) {
    const lmA = lms[a];
    const lmB = lms[b];
    if (!lmA || !lmB) continue;
    if ((lmA.visibility ?? 1) < 0.3 || (lmB.visibility ?? 1) < 0.3) continue;

    const pA = toCanvas(lmA);
    const pB = toCanvas(lmB);

    const statusA = colorMap.get(a);
    const statusB = colorMap.get(b);
    // Connection color: use worse of the two endpoints
    const worstStatus: 'poor' | 'warning' | 'good' =
      (statusA === 'poor' || statusB === 'poor') ? 'poor' :
      (statusA === 'warning' || statusB === 'warning') ? 'warning' : 'good';

    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.strokeStyle = statusColor(worstStatus) + '66'; // 40% opacity
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw landmark dots
  for (let i = 0; i < lms.length; i++) {
    const lm = lms[i];
    if (!lm || (lm.visibility ?? 1) < 0.3) continue;
    const p = toCanvas(lm);
    const status = colorMap.get(i);
    const color = statusColor(status);

    // Outer glow
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = color + '22';
    ctx.fill();

    // Inner dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // White center
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fill();
  }
}

export default function AnalysisVideoOverlay({ poseFrames, metrics, viewType }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const colorMap = buildLandmarkColorMap(metrics);

  const renderFrame = useCallback((idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !poseFrames[idx]) return;
    drawFrame(canvas, poseFrames[idx], colorMap);
  }, [poseFrames, colorMap]);

  // Re-draw on frame change
  useEffect(() => {
    renderFrame(frameIndex);
  }, [frameIndex, renderFrame]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) clearTimeout(animRef.current);
      return;
    }
    const tick = () => {
      setFrameIndex(prev => {
        const next = (prev + 1) % poseFrames.length;
        return next;
      });
      animRef.current = setTimeout(tick, 200);
    };
    animRef.current = setTimeout(tick, 200);
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, [isPlaying, poseFrames.length]);

  const prev = () => setFrameIndex(i => (i - 1 + poseFrames.length) % poseFrames.length);
  const next = () => setFrameIndex(i => (i + 1) % poseFrames.length);

  const poorCount    = metrics.filter(m => m.status === 'poor').length;
  const warningCount = metrics.filter(m => m.status === 'warning').length;
  const goodCount    = metrics.filter(m => m.status === 'good').length;

  return (
    <div className="mb-8 bg-stone-800/50 border border-stone-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-stone-700/50">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Pose-Analyse — {VIEW_LABELS[viewType]}</span>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-stone-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            {goodCount} Gut
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            {warningCount} Warn
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            {poorCount} Kritisch
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-stone-950">
        <canvas
          ref={canvasRef}
          width={480}
          height={360}
          className="w-full"
          style={{ maxHeight: 320, objectFit: 'contain' }}
        />
        {/* Timestamp badge */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-stone-300 font-mono">
          {poseFrames[frameIndex]?.timestamp.toFixed(2)}s
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-stone-700/50">
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="p-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(p => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-300 text-xs font-medium transition-colors"
          >
            {isPlaying
              ? <><Pause className="w-3.5 h-3.5" /> Pause</>
              : <><Play  className="w-3.5 h-3.5" /> Abspielen</>
            }
          </button>
          <button
            onClick={next}
            className="p-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Frame scrubber */}
        <div className="flex items-center gap-2 flex-1 ml-4">
          <input
            type="range"
            min={0}
            max={poseFrames.length - 1}
            value={frameIndex}
            onChange={e => { setIsPlaying(false); setFrameIndex(Number(e.target.value)); }}
            className="flex-1 h-1.5 accent-amber-500 cursor-pointer"
          />
          <span className="text-xs text-stone-500 font-mono w-12 text-right">
            {frameIndex + 1}/{poseFrames.length}
          </span>
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { ViewType, AnalysisResult, NormalizedLandmark } from '../types';
import { detectPoseOnCanvas, getActiveDelegate } from '../lib/mediapipeLoader';
import { getMetricsForView, calculateOverallScore, generateFeedback } from '../lib/archerAnalysis';
import { saveAnalysisSession } from '../lib/supabase';

export function usePoseAnalysis() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (file: File, viewType: ViewType, sessionId: string) => {
    setError(null);
    setResult(null);
    setProgress(0);

    const videoEl = document.createElement('video');
    videoEl.muted = true;
    videoEl.playsInline = true;

    const objectUrl = URL.createObjectURL(file);
    videoEl.src = objectUrl;

    try {
      await new Promise<void>((resolve, reject) => {
        videoEl.onloadedmetadata = () => resolve();
        videoEl.onerror = () => reject(new Error('Video konnte nicht geladen werden'));
        videoEl.load();
      });

      setStatus('MediaPipe wird geladen...');
      setProgress(10);

      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth || 640;
      canvas.height = videoEl.videoHeight || 480;
      const ctx = canvas.getContext('2d')!;

      const duration = videoEl.duration;
      const maxFrames = 20;
      const interval = duration / maxFrames;

      const allLandmarks: NormalizedLandmark[][] = [];
      const poseFrames: { timestamp: number; landmarks: NormalizedLandmark[] }[] = [];

      setStatus('Frames werden analysiert...');

      const analysisStart = performance.now();
      const frameDurations: number[] = [];

      for (let i = 0; i < maxFrames; i++) {
        const time = i * interval;
        videoEl.currentTime = time;

        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            videoEl.removeEventListener('seeked', onSeeked);
            resolve();
          };
          videoEl.addEventListener('seeked', onSeeked);
        });

        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const { landmarks: lms, durationMs } = await detectPoseOnCanvas(canvas);
        frameDurations.push(durationMs);

        if (lms) {
          allLandmarks.push(lms);
          poseFrames.push({ timestamp: time, landmarks: lms });
        }

        setProgress(10 + Math.round((i / maxFrames) * 70));
      }

      const totalAnalysisMs = performance.now() - analysisStart;

      // FIX: avgFrameMs VOR saveAnalysisSession berechnen (war vorher danach → ReferenceError)
      const avgFrameMs = frameDurations.length > 0
        ? frameDurations.reduce((a, b) => a + b, 0) / frameDurations.length
        : 0;
      const minFrameMs = frameDurations.length > 0 ? Math.min(...frameDurations) : 0;
      const maxFrameMs = frameDurations.length > 0 ? Math.max(...frameDurations) : 0;

      setStatus('Haltung wird bewertet...');
      setProgress(85);

      if (allLandmarks.length === 0) {
        throw new Error('Keine Person im Video erkannt. Bitte prüfe, ob du im Bild sichtbar bist.');
      }

      const metrics = getMetricsForView(viewType, allLandmarks);
      const overallScore = calculateOverallScore(metrics);
      const feedback = generateFeedback(metrics, viewType);

      setStatus('Ergebnisse werden gespeichert...');
      setProgress(90);

      const metricsObj: Record<string, unknown> = {};
      metrics.forEach(m => {
        metricsObj[m.label] = { value: m.value, score: m.score, status: m.status };
      });

      const performanceData = {
        delegate: getActiveDelegate(),
        total_analysis_ms: Math.round(totalAnalysisMs),
        avg_frame_ms: Math.round(avgFrameMs),
        min_frame_ms: Math.round(minFrameMs),
        max_frame_ms: Math.round(maxFrameMs),
      };

      try {
        await saveAnalysisSession({
          session_id: sessionId,
          view_type: viewType,
          metrics: metricsObj,
          score: overallScore,
          feedback,
          frame_count: allLandmarks.length,
          performance_stats: performanceData,
        });
        console.info('[Supabase] Analyse erfolgreich gespeichert');
      } catch (e) {
        console.error('[Supabase] Speichern fehlgeschlagen:', e);
      }

      const analysisResult: AnalysisResult = {
        viewType,
        overallScore,
        metrics,
        feedback,
        frameCount: allLandmarks.length,
        poseFrames,
        performanceStats: {
          delegate: getActiveDelegate(),
          totalAnalysisMs: Math.round(totalAnalysisMs),
          avgFrameMs: Math.round(avgFrameMs),
          minFrameMs: Math.round(minFrameMs),
          maxFrameMs: Math.round(maxFrameMs),
        },
      };

      setResult(analysisResult);
      setProgress(100);
      setStatus('Analyse abgeschlossen');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(0);
    setStatus('');
  }, []);

  return { analyze, progress, status, result, error, reset };
}

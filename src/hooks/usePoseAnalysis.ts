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
    videoEl.preload = 'metadata'; // Android: Metadaten explizit vorladen

    const objectUrl = URL.createObjectURL(file);
    videoEl.src = objectUrl;

    try {
      // Warten bis duration tatsächlich valide ist — nicht nur auf onloadedmetadata.
      // Android feuert onloadedmetadata bevor duration gesetzt ist; ondurationchange
      // und oncanplay sind zuverlässigere Signale. Timeout nach 10s als Fallback.
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video konnte nicht geladen werden (Timeout). Bitte ein kürzeres Video probieren.'));
        }, 10_000);

        const tryResolve = () => {
          // Infinity = MediaRecorder-WebM ohne Duration-Header → auch akzeptieren,
          // tatsächliche Länge wird danach per Seek ermittelt.
          // NaN = noch nicht geladen → weiter warten.
          if (videoEl.duration > 0) { // true für finite UND Infinity
            clearTimeout(timeout);
            resolve();
          }
        };

        videoEl.onloadedmetadata = tryResolve;
        videoEl.ondurationchange   = tryResolve;
        videoEl.oncanplay          = tryResolve;
        videoEl.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Video konnte nicht geladen werden. Bitte Format prüfen (MP4, MOV, WebM).'));
        };

        videoEl.load();
      });

      setStatus('Video wird vorbereitet...');
      setProgress(5);

      // MediaRecorder-WebM Bug: duration = Infinity → tatsächliche Länge per Seek ermitteln.
      // Funktioniert weil das Blob komplett im Speicher liegt.
      if (!isFinite(videoEl.duration)) {
        console.log('[Video] Infinity-Duration (MediaRecorder-WebM), ermittle Länge per Seek...');
        videoEl.currentTime = 1e9; // Browser seeked zum letzten verfügbaren Frame
        await new Promise<void>(r => {
          const done = () => { videoEl.onseeked = null; r(); };
          videoEl.onseeked = done;
          setTimeout(done, 3000); // Fallback nach 3s
        });
        const detectedDuration = videoEl.currentTime;
        console.log(`[Video] Ermittelte Dauer: ${detectedDuration.toFixed(2)}s`);

        // Zurück zum Start
        videoEl.currentTime = 0;
        await new Promise<void>(r => {
          const done = () => { videoEl.onseeked = null; r(); };
          videoEl.onseeked = done;
          setTimeout(done, 1000);
        });
      }

      setStatus('MediaPipe wird geladen...');
      setProgress(10);

      // FIX 2: Mobile Downscaling — große Videos auf mobilen Geräten skalieren
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const maxDimension = isMobile ? 1280 : 1920;
      let canvasWidth = videoEl.videoWidth || 640;
      let canvasHeight = videoEl.videoHeight || 480;

      if (canvasWidth > maxDimension || canvasHeight > maxDimension) {
        console.log(`[Video] Downscaling von ${canvasWidth}×${canvasHeight} für Performance...`);
        const scale = maxDimension / Math.max(canvasWidth, canvasHeight);
        canvasWidth = Math.round(canvasWidth * scale);
        canvasHeight = Math.round(canvasHeight * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d')!;

      // Nach dem Seek ist videoEl.duration für MediaRecorder-WebM immer noch Infinity,
      // aber currentTime steht auf 0 — wir verwenden einen sicheren Fallback.
      const duration = isFinite(videoEl.duration) ? videoEl.duration : 30;
      const maxFrames = 20;
      const interval = duration / maxFrames;

      const allLandmarks: NormalizedLandmark[][] = [];
      const poseFrames: { timestamp: number; landmarks: NormalizedLandmark[] }[] = [];

      setStatus('Frames werden analysiert...');

      const analysisStart = performance.now();
      const frameDurations: number[] = [];

      // FIX 3: Frame-Extraction in try-catch — fehlerhafte Frames crashen nicht die ganze Analyse
      try {
        for (let i = 0; i < maxFrames; i++) {
          // FIX 1: Video-Time-Validierung — verhindert NaN/Infinity als currentTime (Mobile-Bug)
          const targetTime = i * interval;
          if (!isFinite(targetTime) || targetTime < 0 || targetTime > duration) {
            console.warn(`[Video] Frame ${i} übersprungen: ungültige Zeit ${targetTime}`);
            continue;
          }
          videoEl.currentTime = targetTime;

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
            poseFrames.push({ timestamp: targetTime, landmarks: lms });
          }

          setProgress(10 + Math.round((i / maxFrames) * 70));
        }
      } catch (frameError) {
        console.error('[Video] Frame-Extraction fehlgeschlagen:', frameError);
        throw new Error(
          'Video-Analyse fehlgeschlagen. Bitte versuche ein kürzeres oder kleineres Video.'
        );
      }

      const totalAnalysisMs = performance.now() - analysisStart;
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
        downscaled: canvasWidth !== (videoEl.videoWidth || 640),
        mobile: isMobile,
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

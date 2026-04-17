import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let poseLandmarker: PoseLandmarker | null = null;
let loadingPromise: Promise<PoseLandmarker> | null = null;
let activeDelegate: 'GPU' | 'CPU' = 'CPU';

export function getActiveDelegate(): 'GPU' | 'CPU' {
  return activeDelegate;
}

export async function getPoseLandmarker(): Promise<PoseLandmarker> {
  if (poseLandmarker) return poseLandmarker;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );

    // GPU zuerst versuchen, bei Fehler auf CPU zurückfallen
    for (const delegate of ['GPU', 'CPU'] as const) {
      try {
        const lm = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate,
          },
          runningMode: 'IMAGE',
          numPoses: 1,
        });
        poseLandmarker = lm;
        activeDelegate = delegate;
        console.info(`[MediaPipe] Delegate aktiv: ${delegate}`);
        return poseLandmarker;
      } catch (err) {
        console.warn(`[MediaPipe] ${delegate}-Delegate fehlgeschlagen, wechsle zu Fallback...`, err);
        poseLandmarker = null;
      }
    }

    throw new Error('MediaPipe konnte weder mit GPU noch mit CPU initialisiert werden.');
  })();

  return loadingPromise;
}

export async function detectPoseOnCanvas(
  canvas: HTMLCanvasElement
): Promise<{ landmarks: { x: number; y: number; z: number; visibility?: number }[] | null; durationMs: number }> {
  const lm = await getPoseLandmarker();
  const t0 = performance.now();
  const result = lm.detect(canvas);
  const durationMs = performance.now() - t0;
  const landmarks =
    result.landmarks && result.landmarks.length > 0 ? result.landmarks[0] : null;
  return { landmarks, durationMs };
}

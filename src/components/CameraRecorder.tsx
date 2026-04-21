import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, FlipHorizontal, Square, X } from 'lucide-react';

interface CameraRecorderProps {
  onRecorded: (file: File) => void;
  onClose: () => void;
}

type FacingMode = 'user' | 'environment';

// Bestes unterstütztes Format ermitteln
function getSupportedMimeType(): string {
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  return candidates.find(m => MediaRecorder.isTypeSupported(m)) ?? '';
}

export default function CameraRecorder({ onRecorded, onClose }: CameraRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  // ── Stream-Verwaltung ────────────────────────────────────────────────────────

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async (mode: FacingMode) => {
    stopStream();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError('Kamera konnte nicht geöffnet werden. Bitte Berechtigung erteilen.');
    }
  }, [stopStream]);

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  // Mehrere Kameras erkennen (für Flip-Button)
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        setHasMultipleCameras(devices.filter(d => d.kind === 'videoinput').length > 1);
      })
      .catch(() => {});
  }, []);

  // Kamera beim Mount starten, beim Unmount stoppen
  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handler ──────────────────────────────────────────────────────────────────

  const handleFlip = async () => {
    if (isRecording) return;
    const next: FacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    await startCamera(next);
  };

  const handleStart = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(
      streamRef.current,
      mimeType ? { mimeType } : undefined
    );
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([blob], `aufnahme-${Date.now()}.${ext}`, { type: blob.type });
      stopStream();
      onRecorded(file); // → direkt in Analyse-Pipeline
    };

    recorder.start(100);
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  };

  const handleStop = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Modal schließt sich via onRecorded → onClose im Parent
  };

  const handleClose = () => {
    if (isRecording) recorderRef.current?.stop();
    stopStream();
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-stone-900 rounded-2xl overflow-hidden border border-stone-700 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-white">Video aufnehmen</span>
          </div>
          <button
            onClick={handleClose}
            className="text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Kamera-Preview */}
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />

          {/* Fehler-Overlay */}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-950/80 p-6 text-center">
              <p className="text-red-400 text-sm">{cameraError}</p>
            </div>
          )}

          {/* REC-Indikator */}
          {isRecording && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-xs font-mono font-semibold">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}

          {/* Kamera-Flip */}
          {hasMultipleCameras && !isRecording && (
            <button
              onClick={handleFlip}
              title="Kamera wechseln"
              className="absolute top-3 right-3 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Aufnahme-Controls */}
        <div className="px-4 py-5 flex flex-col items-center gap-3">
          {!isRecording ? (
            <button
              onClick={handleStart}
              disabled={!!cameraError}
              className="flex items-center gap-2 px-8 py-3 bg-red-500 hover:bg-red-400 disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <span className="w-3 h-3 rounded-full bg-white" />
              Aufnahme starten
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-8 py-3 bg-stone-700 hover:bg-stone-600 text-white font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              Stopp &amp; Analysieren
            </button>
          )}
          <p className="text-stone-500 text-xs">
            10–15 Sekunden reichen für eine präzise Analyse
          </p>
        </div>
      </div>
    </div>
  );
}

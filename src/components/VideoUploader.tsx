import { useCallback, useState, useRef } from 'react';
import { Upload, Film, AlertCircle, ArrowLeft, Camera } from 'lucide-react';
import { ViewType } from '../types';
import CameraRecorder from './CameraRecorder';

interface VideoUploaderProps {
  viewType: ViewType;
  onUpload: (file: File) => void;
  onBack: () => void;
}

const VIEW_LABELS: Record<ViewType, string> = {
  side: 'Seitenansicht',
  back: 'Rückansicht',
  top: 'Vogelperspektive',
};

const VIEW_TIPS: Record<ViewType, string[]> = {
  side: [
    'Stelle die Kamera auf Schulterhöhe seitlich zu dir auf',
    'Der gesamte Körper muss von Kopf bis Fuß sichtbar sein',
    'Nimm die Schussposition ein und schieße mehrere Pfeile',
    'Heller Hintergrund für bessere Erkennung',
  ],
  back: [
    'Kamera direkt hinter dir, auf Schulterhöhe',
    'Beide Schultern und der gesamte Rücken müssen sichtbar sein',
    'Filme dich beim mehrfachen Schießen für stabile Analyse',
    'Guter Abstand: ca. 3–4 Meter hinter dir',
  ],
  top: [
    'Kamera senkrecht von oben (Stativ oder erhöhte Position)',
    'Gesamter Körper von Kopf bis Fuß sichtbar (Draufsicht)',
    'Fußstellung und Schulterachse gut erkennbar',
    'Nutze eine Leiter oder erhöhte Plattform für die Kamera',
  ],
};

export default function VideoUploader({ viewType, onUpload, onBack }: VideoUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = useCallback((file: File) => {
    setError(null);
    if (!file.type.startsWith('video/')) {
      setError('Bitte nur Videodateien hochladen (MP4, MOV, WebM).');
      return;
    }
    const maxMB = 200;
    if (file.size > maxMB * 1024 * 1024) {
      setError(`Datei zu groß. Maximal ${maxMB} MB erlaubt.`);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSet(file);
  }, [validateAndSet]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  }, [validateAndSet]);

  // Aufgenommenes Video direkt in die Analyse-Pipeline übergeben
  const handleRecorded = useCallback((file: File) => {
    setShowCamera(false);
    validateAndSet(file);
  }, [validateAndSet]);

  const handleAnalyze = () => {
    if (selectedFile) onUpload(selectedFile);
  };

  return (
    <>
      {/* Kamera-Modal */}
      {showCamera && (
        <CameraRecorder
          onRecorded={handleRecorded}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm">Ansicht wechseln</span>
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-stone-800 border border-stone-700 rounded-full px-3 py-1 mb-3">
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">{VIEW_LABELS[viewType]}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Video hochladen</h1>
          <p className="text-stone-400">10–15 Sekunden reichen für eine präzise Analyse.</p>
        </div>

        {/* Upload-Bereich */}
        <div
          className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer ${
            dragOver
              ? 'border-amber-400 bg-amber-500/10'
              : preview
              ? 'border-stone-600 bg-stone-800/50'
              : 'border-stone-600 bg-stone-800/30 hover:border-stone-500 hover:bg-stone-800/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !preview && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleChange}
          />

          {preview ? (
            <div className="p-4">
              <video
                src={preview}
                className="w-full rounded-xl max-h-64 object-contain bg-black"
                controls
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-stone-400 text-sm truncate max-w-xs">{selectedFile?.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                    setSelectedFile(null);
                    if (inputRef.current) inputRef.current.value = '';
                  }}
                  className="text-xs text-stone-500 hover:text-white transition-colors ml-4"
                >
                  Entfernen
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
              <div className="w-14 h-14 bg-stone-700 rounded-2xl flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-stone-400" />
              </div>
              <p className="text-white font-medium mb-1">Video hierher ziehen</p>
              <p className="text-stone-400 text-sm mb-3">oder klicken zum Auswählen</p>
              <p className="text-stone-500 text-xs">MP4, MOV, WebM bis 200 MB</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tipps */}
        <div className="mt-8 bg-stone-800/50 rounded-2xl border border-stone-700/50 p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Tipps für {VIEW_LABELS[viewType]}</h3>
          <ul className="space-y-2">
            {VIEW_TIPS[viewType].map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-stone-400">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-stone-700 text-xs text-stone-300 flex items-center justify-center flex-shrink-0 font-medium">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Action-Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setShowCamera(true)}
            className="flex items-center justify-center gap-2 flex-1 py-4 bg-stone-800 hover:bg-stone-700 border border-stone-700 hover:border-stone-600 text-stone-300 hover:text-white font-semibold rounded-xl transition-all duration-200 text-sm cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            Aufnehmen
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!selectedFile}
            className="flex-[2] py-4 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 disabled:text-stone-500 text-stone-900 disabled:cursor-not-allowed font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/20 text-sm"
          >
            Haltung analysieren
          </button>
        </div>
      </div>
    </>
  );
}

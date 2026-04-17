import { useState, useCallback } from 'react';
import { ViewType, AppPhase } from './types';
import Header from './components/Header';
import ViewSelector from './components/ViewSelector';
import VideoUploader from './components/VideoUploader';
import AnalysisProgress from './components/AnalysisProgress';
import AnalysisResults from './components/AnalysisResults';
import AnalysisHistory from './components/AnalysisHistory';
import { usePoseAnalysis } from './hooks/usePoseAnalysis';
import { useSessionId } from './hooks/useSessionId';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('select');
  const [viewType, setViewType] = useState<ViewType>('side');
  const { analyze, progress, status, result, error, reset } = usePoseAnalysis();
  const sessionId = useSessionId();

  const handleViewSelect = useCallback((view: ViewType) => {
    setViewType(view);
    setPhase('upload');
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    setPhase('analyzing');
    await analyze(file, viewType, sessionId);
    setPhase('results');
  }, [analyze, viewType, sessionId]);

  const handleReset = useCallback(() => {
    reset();
    setPhase('select');
  }, [reset]);

  const handleNewAnalysis = useCallback(() => {
    reset();
    setPhase('upload');
  }, [reset]);

  const handleShowHistory = useCallback(() => {
    setPhase('history');
  }, []);

  return (
    <div className="min-h-screen bg-stone-950">
      <Header onReset={handleReset} onShowHistory={handleShowHistory} />

      <main>
        {phase === 'select' && (
          <ViewSelector onSelect={handleViewSelect} sessionId={sessionId} />
        )}

        {phase === 'upload' && (
          <VideoUploader
            viewType={viewType}
            onUpload={handleUpload}
            onBack={handleReset}
          />
        )}

        {phase === 'analyzing' && (
          <AnalysisProgress progress={progress} status={status} />
        )}

        {phase === 'results' && result && (
          <AnalysisResults
            result={result}
            onReset={handleReset}
            onNewAnalysis={handleNewAnalysis}
            onShowHistory={handleShowHistory}
            sessionId={sessionId}
          />
        )}

        {phase === 'results' && error && (
          <div className="max-w-lg mx-auto px-4 py-24 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Analyse fehlgeschlagen</h2>
            <p className="text-stone-400 mb-6 text-sm">{error}</p>
            <button
              onClick={handleNewAnalysis}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-xl transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        )}

        {phase === 'history' && (
          <AnalysisHistory sessionId={sessionId} onBack={() => setPhase('select')} />
        )}
      </main>
    </div>
  );
}

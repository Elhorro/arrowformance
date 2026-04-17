export type ViewType = 'side' | 'back' | 'top';

export type AppPhase = 'select' | 'upload' | 'analyzing' | 'results' | 'history';

export interface ViewOption {
  id: ViewType;
  label: string;
  description: string;
  icon: string;
  metrics: string[];
}

export interface PostureMetric {
  label: string;
  value: number | string;
  unit?: string;
  score: number;
  status: 'good' | 'warning' | 'poor';
  feedback: string;
}

export interface PerformanceStats {
  delegate: 'GPU' | 'CPU';
  totalAnalysisMs: number;
  avgFrameMs: number;
  minFrameMs: number;
  maxFrameMs: number;
}

export interface AnalysisResult {
  viewType: ViewType;
  overallScore: number;
  metrics: PostureMetric[];
  feedback: string[];
  frameCount: number;
  poseFrames: PoseFrame[];
  performanceStats: PerformanceStats;
}

export interface PoseFrame {
  timestamp: number;
  landmarks: NormalizedLandmark[];
}

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface AnalysisSession {
  id: string;
  view_type: ViewType;
  metrics: Record<string, unknown>;
  score: number;
  feedback: string[];
  frame_count: number;
  created_at: string;
}

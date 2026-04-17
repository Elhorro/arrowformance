import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Analysis Sessions ────────────────────────────────────────────────────────

export async function saveAnalysisSession(data: {
  session_id: string;
  view_type: string;
  metrics: Record<string, unknown>;
  score: number;
  feedback: string[];
  frame_count: number;
  performance_stats?: Record<string, unknown>;
}) {
  const { data: result, error } = await supabase
    .from('analysis_sessions')
    .insert([data])
    .select()
    .maybeSingle();

  if (error) throw error;
  return result;
}

export interface HistoryEntry {
  id: string;
  view_type: string;
  score: number;
  frame_count: number;
  created_at: string;
  performance_stats: Record<string, unknown> | null;
}

export async function fetchSessionHistory(sessionId: string): Promise<HistoryEntry[]> {
  const { data, error } = await supabase
    .from('analysis_sessions')
    .select('id, view_type, score, frame_count, created_at, performance_stats')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as HistoryEntry[];
}

// ─── Banner Tracking ──────────────────────────────────────────────────────────

export async function trackBannerImpression(
  bannerId: string,
  sessionId: string,
  viewType?: string
): Promise<void> {
  try {
    await supabase.from('banner_impressions').insert([{
      banner_id: bannerId,
      session_id: sessionId,
      view_type: viewType ?? null,
    }]);
  } catch (e) {
    console.warn('[Banner] Impression-Tracking fehlgeschlagen:', e);
  }
}

export async function trackBannerClick(
  bannerId: string,
  sessionId: string,
  targetUrl: string
): Promise<void> {
  try {
    await supabase.from('banner_clicks').insert([{
      banner_id: bannerId,
      session_id: sessionId,
      target_url: targetUrl,
    }]);
  } catch (e) {
    console.warn('[Banner] Klick-Tracking fehlgeschlagen:', e);
  }
}

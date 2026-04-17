-- session_id zur analysis_sessions Tabelle hinzufügen
ALTER TABLE analysis_sessions
  ADD COLUMN IF NOT EXISTS session_id TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_analysis_sessions_session_id
  ON analysis_sessions (session_id);

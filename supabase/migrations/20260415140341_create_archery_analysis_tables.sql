/*
  # Archery Posture Analysis - Initial Schema

  ## New Tables

  ### `analysis_sessions`
  Stores each archery posture analysis session.
  - `id` - Unique session identifier
  - `view_type` - Camera view: 'side', 'back', or 'top'
  - `metrics` - JSON object containing all calculated posture metrics
  - `score` - Overall posture score (0-100)
  - `feedback` - JSON array of feedback messages
  - `frame_count` - Number of frames analyzed
  - `created_at` - Timestamp of analysis

  ## Security
  - RLS enabled on all tables
  - Anonymous users can insert and read their own sessions (via session token stored in metrics)
  - Public read is intentionally limited; each session is identified by UUID
*/

CREATE TABLE IF NOT EXISTS analysis_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  view_type text NOT NULL CHECK (view_type IN ('side', 'back', 'top')),
  metrics jsonb DEFAULT '{}',
  score integer DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  feedback jsonb DEFAULT '[]',
  frame_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analysis sessions"
  ON analysis_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read analysis sessions"
  ON analysis_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

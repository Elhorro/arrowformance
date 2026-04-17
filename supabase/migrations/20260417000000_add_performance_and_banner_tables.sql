-- performance_stats Spalte zur bestehenden Tabelle hinzufügen
ALTER TABLE analysis_sessions
  ADD COLUMN IF NOT EXISTS performance_stats jsonb DEFAULT NULL;

-- Banner-Tracking: Impressionen
CREATE TABLE IF NOT EXISTS banner_impressions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id  text NOT NULL,
  session_id text NOT NULL,
  view_type  text,
  viewed_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banner_impressions_banner_id
  ON banner_impressions (banner_id);

-- Banner-Tracking: Klicks
CREATE TABLE IF NOT EXISTS banner_clicks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id  text NOT NULL,
  session_id text NOT NULL,
  target_url text,
  clicked_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banner_clicks_banner_id
  ON banner_clicks (banner_id);

-- Row Level Security
ALTER TABLE banner_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_clicks     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert impressions" ON banner_impressions;
DROP POLICY IF EXISTS "Anyone can read impressions"   ON banner_impressions;
DROP POLICY IF EXISTS "Anyone can insert clicks"      ON banner_clicks;
DROP POLICY IF EXISTS "Anyone can read clicks"        ON banner_clicks;

CREATE POLICY "Anyone can insert impressions"
  ON banner_impressions FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can read impressions"
  ON banner_impressions FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can insert clicks"
  ON banner_clicks FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can read clicks"
  ON banner_clicks FOR SELECT TO anon, authenticated USING (true);

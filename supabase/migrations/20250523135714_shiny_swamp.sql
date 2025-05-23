/*
  # Initial database schema

  1. New Tables
    - `users` - Store user information and preferences
    - `airtable_configs` - Store Airtable API credentials
    - `dashboards` - Store dashboard configurations
    - `kpis` - Store KPI definitions
    - `dashboard_kpis` - Many-to-many relationship between dashboards and KPIs

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Airtable configurations table
CREATE TABLE IF NOT EXISTS airtable_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  base_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dashboards table
CREATE TABLE IF NOT EXISTS dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  layout JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- KPIs table
CREATE TABLE IF NOT EXISTS kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  query_config JSONB NOT NULL,
  visualization_type TEXT NOT NULL,
  visualization_config JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dashboard KPIs junction table
CREATE TABLE IF NOT EXISTS dashboard_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
  kpi_id UUID REFERENCES kpis(id) ON DELETE CASCADE,
  position JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dashboard_id, kpi_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE airtable_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_kpis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for airtable_configs
CREATE POLICY "Users can view their own Airtable configs"
  ON airtable_configs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Airtable configs"
  ON airtable_configs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Airtable configs"
  ON airtable_configs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Airtable configs"
  ON airtable_configs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for dashboards
CREATE POLICY "Users can view their own dashboards"
  ON dashboards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboards"
  ON dashboards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboards"
  ON dashboards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboards"
  ON dashboards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for kpis
CREATE POLICY "Users can view their own KPIs"
  ON kpis
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KPIs"
  ON kpis
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KPIs"
  ON kpis
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own KPIs"
  ON kpis
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for dashboard_kpis
CREATE POLICY "Users can view their own dashboard KPIs"
  ON dashboard_kpis
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = dashboard_kpis.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own dashboard KPIs"
  ON dashboard_kpis
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = dashboard_kpis.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own dashboard KPIs"
  ON dashboard_kpis
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = dashboard_kpis.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own dashboard KPIs"
  ON dashboard_kpis
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = dashboard_kpis.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );
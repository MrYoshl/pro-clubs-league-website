/*
  # Pro Clubs League Database Schema

  1. New Tables
    - `profiles` - Player profiles with Discord usernames and Pro Club names
    - `teams` - Team information with managers
    - `team_memberships` - Junction table for player-team relationships
    - `admin_roles` - Track admin users
    - `manager_assignments` - Track team manager assignments
    - `free_agent_approvals` - Track approval status for free agents

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Separate policies for admins, managers, and players

  3. Features
    - Custom user profiles linked to Supabase Auth
    - Team management with manager assignments
    - Player stats tracking (goals, assists, average rating)
    - Free agent approval system
    - Position tracking for players
*/

-- Create custom types
CREATE TYPE player_position AS ENUM (
  'GK', 'LB', 'CB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'
);

CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  discord_username text UNIQUE NOT NULL,
  pro_clubs_name text NOT NULL,
  position player_position DEFAULT 'ST',
  goals integer DEFAULT 0,
  assists integer DEFAULT 0,
  average_rating decimal(3,1) DEFAULT 0.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team memberships (junction table)
CREATE TABLE IF NOT EXISTS team_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(player_id, team_id)
);

-- Admin roles
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES profiles(id),
  granted_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Manager assignments
CREATE TABLE IF NOT EXISTS manager_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES profiles(id),
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, team_id)
);

-- Free agent approvals
CREATE TABLE IF NOT EXISTS free_agent_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status approval_status DEFAULT 'pending',
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(player_id)
);

-- Insert default teams
INSERT INTO teams (name, logo_url) VALUES
  ('Manchester United', '/team-logos/man-utd.png'),
  ('Liverpool FC', '/team-logos/liverpool.png'),
  ('Chelsea FC', '/team-logos/chelsea.png'),
  ('Arsenal FC', '/team-logos/arsenal.png'),
  ('Manchester City', '/team-logos/man-city.png'),
  ('Tottenham', '/team-logos/tottenham.png')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_agent_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Managers can update their team players' stats"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM manager_assignments ma
      JOIN team_memberships tm ON ma.team_id = tm.team_id
      WHERE ma.user_id = auth.uid() AND tm.player_id = profiles.id
    )
  );

-- RLS Policies for teams
CREATE POLICY "Teams are viewable by everyone"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage teams"
  ON teams FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for team_memberships
CREATE POLICY "Team memberships are viewable by everyone"
  ON team_memberships FOR SELECT
  USING (true);

CREATE POLICY "Managers can manage their team memberships"
  ON team_memberships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM manager_assignments
      WHERE user_id = auth.uid() AND team_id = team_memberships.team_id
    )
  );

-- RLS Policies for admin_roles
CREATE POLICY "Admin roles are viewable by admins"
  ON admin_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can manage admin roles"
  ON admin_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for manager_assignments
CREATE POLICY "Manager assignments are viewable by everyone"
  ON manager_assignments FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage manager assignments"
  ON manager_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for free_agent_approvals
CREATE POLICY "Users can view their own approval status"
  ON free_agent_approvals FOR SELECT
  USING (player_id = auth.uid());

CREATE POLICY "Admins can view all approvals"
  ON free_agent_approvals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can manage approvals"
  ON free_agent_approvals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
    )
  );

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, discord_username, pro_clubs_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'discord_username', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'pro_clubs_name', 'Player')
  );
  
  -- Auto-create free agent approval record
  INSERT INTO free_agent_approvals (player_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
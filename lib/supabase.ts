import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          discord_username: string;
          pro_clubs_name: string;
          position: string;
          goals: number;
          assists: number;
          average_rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          discord_username: string;
          pro_clubs_name: string;
          position?: string;
          goals?: number;
          assists?: number;
          average_rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          discord_username?: string;
          pro_clubs_name?: string;
          position?: string;
          goals?: number;
          assists?: number;
          average_rating?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_memberships: {
        Row: {
          id: string;
          player_id: string;
          team_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          team_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          team_id?: string;
          joined_at?: string;
        };
      };
      admin_roles: {
        Row: {
          id: string;
          user_id: string;
          granted_by: string | null;
          granted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          granted_by?: string | null;
          granted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          granted_by?: string | null;
          granted_at?: string;
        };
      };
      manager_assignments: {
        Row: {
          id: string;
          user_id: string;
          team_id: string;
          assigned_by: string | null;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id: string;
          assigned_by?: string | null;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_id?: string;
          assigned_by?: string | null;
          assigned_at?: string;
        };
      };
      free_agent_approvals: {
        Row: {
          id: string;
          player_id: string;
          status: 'pending' | 'approved' | 'rejected';
          approved_by: string | null;
          approved_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          status?: 'pending' | 'approved' | 'rejected';
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          status?: 'pending' | 'approved' | 'rejected';
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Team = Database['public']['Tables']['teams']['Row'];
export type TeamMembership = Database['public']['Tables']['team_memberships']['Row'];
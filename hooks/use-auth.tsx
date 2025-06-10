'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAdmin: boolean;
  isManager: boolean;
  loading: boolean;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id, session.user);
        checkRoles(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadProfile(session.user.id, session.user);
          await checkRoles(session.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsManager(false);
        }
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      data?.subscription.unsubscribe();
    };
  }, []);

  // Loads the profile, and creates it if missing
  const loadProfile = async (userId: string, userObj?: User) => {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && status === 406) {
        // No profile exists, so create one
        const insertData: any = { id: userId };
        if (userObj?.user_metadata?.user_name) {
          insertData.discord_username = userObj.user_metadata.user_name;
        }
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(insertData);
        if (insertError) {
          // If duplicate key error, just try loading the profile again
          if (insertError.code === '23505') {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
            setProfile(existingProfile ?? null);
            return;
          }
          console.error('Profile insert error:', insertError);
          alert(`Profile insert error: ${JSON.stringify(insertError, null, 2)}`);
          throw insertError;
        }
        // Try loading again
        return await loadProfile(userId, userObj);
      }
      if (error) {
        console.error('Profile select error:', error);
        alert(`Profile select error: ${JSON.stringify(error, null, 2)}`);
        throw error;
      }
      setProfile(data ?? null);
    } catch (error) {
      console.error('Error loading profile:', error);
      alert(`Error loading profile: ${JSON.stringify(error, null, 2)}`);
      setProfile(null);
    }
  };

  const checkRoles = async (userId: string) => {
    try {
      // Check admin role
      const { data: adminData } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('user_id', userId)
        .single();

      setIsAdmin(!!adminData);

      // Check manager role
      const { data: managerData } = await supabase
        .from('manager_assignments')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      setIsManager(!!managerData);
    } catch (error) {
      console.error('Error checking roles:', error);
    }
  };

  const signInWithDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    // Reload profile after update
    await loadProfile(user.id, user);
  };

  const value = {
    user,
    profile,
    session,
    isAdmin,
    isManager,
    loading,
    signInWithDiscord,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const GUEST_USER: User = {
  id: 'guest-user-001',
  app_metadata: {},
  user_metadata: { full_name: 'Gautam (Admin)' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'gautam@finora.local',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

const GUEST_PROFILE: Profile = {
  id: 'guest-user-001',
  full_name: 'Gautam (Admin)',
  email: 'gautam@finora.local',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always default to active guest user so NO LOGIN is required
  const [user, setUser] = useState<User | null>(GUEST_USER);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('finora_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return GUEST_PROFILE;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          // Keep guest user
          setUser(GUEST_USER);
          setLoading(false);
        }
      }).catch(() => {
        setUser(GUEST_USER);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            setSession(session);
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            setUser(GUEST_USER);
            setLoading(false);
          }
        }
      );

      return () => subscription.unsubscribe();
    } catch (e) {
      setUser(GUEST_USER);
      setLoading(false);
    }
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured) {
      const newProfile: Profile = {
        id: 'user-' + Date.now(),
        full_name: fullName,
        email,
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(newProfile);
      localStorage.setItem('finora_profile', JSON.stringify(newProfile));
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      const current = profile || GUEST_PROFILE;
      const updated = { ...current, email };
      setProfile(updated);
      localStorage.setItem('finora_profile', JSON.stringify(updated));
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function signOut() {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // ignore
      }
    }
    // Return to guest mode seamlessly
    setUser(GUEST_USER);
    setProfile(GUEST_PROFILE);
  }

  async function resetPassword(email: string) {
    if (!isSupabaseConfigured) return { error: null };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    const updated = { ...(profile || GUEST_PROFILE), ...updates };
    setProfile(updated);
    localStorage.setItem('finora_profile', JSON.stringify(updated));

    if (isSupabaseConfigured && user && user.id !== GUEST_USER.id) {
      try {
        const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
        if (error) return { error: new Error(error.message) };
      } catch (error) {
        return { error: error as Error };
      }
    }
    return { error: null };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

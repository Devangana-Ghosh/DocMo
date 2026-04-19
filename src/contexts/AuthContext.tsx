import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentProfile, signIn, signOut, signUp } from '../services/api';
import type { Profile, UserRole } from '../types/backend';

interface AuthContextValue {
  profile: Profile | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string, expectedRole: UserRole) => Promise<Profile>;
  signUpWithPassword: (email: string, password: string, role: UserRole, fullName: string, phone?: string) => Promise<{ profile: Profile | null; needsEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  function buildFallbackProfile(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }, role: UserRole): Profile {
    const email = user.email ?? undefined;
    const fromMetadata = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined;
    const fromEmail = email ? email.split('@')[0].replace(/[._-]+/g, ' ') : undefined;

    return {
      id: user.id,
      role,
      full_name: fromMetadata ?? fromEmail ?? 'Signed-in user',
      email,
    };
  }

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
        if (!active) return;

        if (session?.user) {
          const storedRole = window.localStorage.getItem('docmo:last-role') as UserRole | null;
          setProfile(buildFallbackProfile(session.user, storedRole ?? 'patient'));
          setLoading(false);

          const current = await getCurrentProfile().catch(() => null);
          if (active && current) {
            setProfile(current);
          }
          return;
        }

        setProfile(null);
      } catch {
        if (active) setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void bootstrap();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setProfile(null);
        window.localStorage.removeItem('docmo:last-role');
        return;
      }

      const storedRole = window.localStorage.getItem('docmo:last-role') as UserRole | null;
      setProfile(buildFallbackProfile(session.user, storedRole ?? 'patient'));

      void getCurrentProfile()
        .then((current) => {
          if (current) setProfile(current);
        })
        .catch(() => undefined);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      loading,
      signInWithPassword: async (email, password, expectedRole) => {
        const nextProfile = await signIn(email, password, expectedRole);

        window.localStorage.setItem('docmo:last-role', nextProfile.role);
        setProfile(nextProfile);

        void getCurrentProfile()
          .then(async (currentProfile) => {
            if (!currentProfile) return;
            if (currentProfile.role !== expectedRole) {
              await signOut();
              window.localStorage.removeItem('docmo:last-role');
              setProfile(null);
              return;
            }
            setProfile(currentProfile);
          })
          .catch(() => undefined);

        return nextProfile;
      },
      signUpWithPassword: async (email, password, role, fullName, phone) => {
        const result = await signUp(email, password, role, fullName, phone);

        if (result.profile) {
          window.localStorage.setItem('docmo:last-role', result.profile.role);
          setProfile(result.profile);
        }

        return result;
      },
      logout: async () => {
        await signOut();
        window.localStorage.removeItem('docmo:last-role');
        setProfile(null);
      },
    }),
    [loading, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

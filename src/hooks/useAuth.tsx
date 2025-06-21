
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/user';

interface AuthUser extends User {
  role?: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch user profile to get role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('auth_uid', session.user.id)
            .single();
          
          const userWithRole = {
            ...session.user,
            role: profile?.role as UserRole
          };
          
          setAuthState({
            user: userWithRole,
            session,
            loading: false,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            loading: false,
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch user profile to get role
        supabase
          .from('profiles')
          .select('role')
          .eq('auth_uid', session.user.id)
          .single()
          .then(({ data: profile }) => {
            const userWithRole = {
              ...session.user,
              role: profile?.role as UserRole
            };
            
            setAuthState({
              user: userWithRole,
              session,
              loading: false,
            });
          });
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    ...authState,
    signOut,
  };
};

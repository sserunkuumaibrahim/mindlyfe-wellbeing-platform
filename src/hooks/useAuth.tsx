
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
    let isMounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) {
            setAuthState({ user: null, session: null, loading: false });
          }
          return;
        }

        if (session?.user && isMounted) {
          await fetchUserWithRole(session);
        } else if (isMounted) {
          setAuthState({ user: null, session: null, loading: false });
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err);
        if (isMounted) {
          setAuthState({ user: null, session: null, loading: false });
        }
      }
    };

    // Fetch user profile with role
    const fetchUserWithRole = async (session: Session) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('auth_uid', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          if (isMounted) {
            setAuthState({
              user: { ...session.user, role: 'individual' },
              session,
              loading: false,
            });
          }
          return;
        }
        
        const userWithRole = {
          ...session.user,
          role: (profile?.role as UserRole) || 'individual'
        };
        
        if (isMounted) {
          setAuthState({
            user: userWithRole,
            session,
            loading: false,
          });
        }
      } catch (err) {
        console.error('Error in fetchUserWithRole:', err);
        if (isMounted) {
          setAuthState({
            user: { ...session.user, role: 'individual' },
            session,
            loading: false,
          });
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!isMounted) return;

        if (session?.user) {
          await fetchUserWithRole(session);
        } else {
          setAuthState({
            user: null,
            session: null,
            loading: false,
          });
        }
      }
    );

    // Get initial session
    getInitialSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    ...authState,
    signOut,
  };
};

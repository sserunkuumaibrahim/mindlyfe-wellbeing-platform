
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
    let timeoutId: NodeJS.Timeout;

    // Set a timeout to prevent infinite loading
    const setLoadingTimeout = () => {
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('Auth loading timeout reached, setting loading to false');
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      }, 10000); // 10 second timeout
    };

    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoadingTimeout();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (timeoutId) clearTimeout(timeoutId);
        
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
        if (timeoutId) clearTimeout(timeoutId);
        if (isMounted) {
          setAuthState({ user: null, session: null, loading: false });
        }
      }
    };

    // Fetch user profile with role
    const fetchUserWithRole = async (session: Session) => {
      try {
        // Add timeout for profile fetch
         const profilePromise = supabase
           .from('profiles')
           .select('role')
           .eq('auth_uid', session.user.id)
           .single();
 
         const timeoutPromise = new Promise<never>((_, reject) => {
           setTimeout(() => reject(new Error('Profile fetch timeout')), 8000);
         });
 
         const result = await Promise.race([
           profilePromise,
           timeoutPromise
         ]);
         
         const { data: profile, error } = result;

        if (error) {
          console.error('Error fetching user profile:', error);
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
        // Even if profile fetch fails, set user with session to prevent infinite loading
        if (isMounted) {
          setAuthState({ 
            user: { ...session.user, role: 'individual' }, 
            session, 
            loading: false 
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
      if (timeoutId) clearTimeout(timeoutId);
      subscription?.unsubscribe();
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

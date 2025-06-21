
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
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          try {
            // Fetch user profile to get role with error handling
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('auth_uid', session.user.id)
              .single();
            
            if (error) {
              console.error('Error fetching profile:', error);
              // Set user without role if profile fetch fails
              setAuthState({
                user: { ...session.user, role: 'individual' },
                session,
                loading: false,
              });
              return;
            }
            
            const userWithRole = {
              ...session.user,
              role: (profile?.role as UserRole) || 'individual'
            };
            
            setAuthState({
              user: userWithRole,
              session,
              loading: false,
            });
          } catch (err) {
            console.error('Error in auth state change:', err);
            // Fallback to user without role
            setAuthState({
              user: { ...session.user, role: 'individual' },
              session,
              loading: false,
            });
          }
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
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
        return;
      }
      
      if (session?.user) {
        // Fetch user profile to get role
        supabase
          .from('profiles')
          .select('role')
          .eq('auth_uid', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error) {
              console.error('Error fetching profile on init:', error);
              // Set user without role if profile fetch fails
              setAuthState({
                user: { ...session.user, role: 'individual' },
                session,
                loading: false,
              });
              return;
            }
            
            const userWithRole = {
              ...session.user,
              role: (profile?.role as UserRole) || 'individual'
            };
            
            setAuthState({
              user: userWithRole,
              session,
              loading: false,
            });
          })
          .catch(err => {
            console.error('Error in session init:', err);
            setAuthState({
              user: { ...session.user, role: 'individual' },
              session,
              loading: false,
            });
          });
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    }).catch(err => {
      console.error('Error getting initial session:', err);
      setAuthState(prev => ({ ...prev, loading: false }));
    });

    return () => subscription.unsubscribe();
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

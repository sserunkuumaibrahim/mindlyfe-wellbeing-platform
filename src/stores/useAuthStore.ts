
import { create } from 'zustand';
import { toast } from "@/hooks/use-toast";
import { supabase } from '../integrations/supabase/client';
import { RegisterDTO, ResetPasswordDTO } from '@/types/auth';

export type UserRole = 'individual' | 'therapist' | 'org_admin';
export type GenderType = 'male' | 'female';

export interface User {
  id: string;
  auth_uid: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: GenderType;
  country?: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  mfaRequired: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordDTO) => Promise<void>;
  verifyMFA: (code: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  mfaRequired: false,
  
  checkAuth: async () => {
    try {
      set({ loading: true });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_uid', session.user.id)
          .single();

        if (profile && !profileError) {
          set({
            user: profile,
            isAuthenticated: true,
            loading: false,
          });
        } else {
          await supabase.auth.signOut();
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: 'Failed to check authentication status',
      });
    }
  },
  
  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_uid', data.user.id)
          .single();

        if (profile && !profileError) {
          set({
            user: profile,
            isAuthenticated: true,
            loading: false,
          });

          toast({
            title: "Login successful",
            description: `Welcome back, ${profile.first_name}!`,
          });
        } else {
          throw new Error('Profile not found');
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({
        error: errorMessage,
        loading: false,
      });
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  },
  
  register: async (data: RegisterDTO) => {
    try {
      set({ loading: true, error: null });
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: data.role,
            first_name: data.first_name,
            last_name: data.last_name,
            phone_number: data.phone_number || null,
            date_of_birth: data.date_of_birth || null,
            gender: data.gender || null,
            country: data.country || null,
            preferred_language: data.preferred_language || 'en',
          },
        },
      });

      if (error) {
        throw error;
      }

      set({ loading: false });

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      set({
        error: errorMessage,
        loading: false,
      });
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      set({ loading: true });
      
      await supabase.auth.signOut();
      
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: unknown) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      });
    }
  },

  forgotPassword: async (email: string) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      set({ loading: false });
      
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      
      set({
        error: errorMessage,
        loading: false,
      });
      
      toast({
        title: "Reset failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  },

  resetPassword: async (data: ResetPasswordDTO) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        throw error;
      }

      set({ loading: false });
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      
      set({
        error: errorMessage,
        loading: false,
      });
      
      toast({
        title: "Reset failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  },

  verifyMFA: async (code: string) => {
    try {
      set({ loading: true, error: null });
      
      // For now, we'll simulate MFA verification
      // In a real implementation, you'd verify the code with Supabase
      console.log('MFA code:', code);
      
      set({ 
        loading: false,
        mfaRequired: false 
      });
      
      toast({
        title: "MFA verified",
        description: "Two-factor authentication verified successfully.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'MFA verification failed';
      
      set({
        error: errorMessage,
        loading: false,
      });
      
      toast({
        title: "MFA failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  },
  
  clearError: () => set({ error: null }),
}));

// Set up auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  const { checkAuth } = useAuthStore.getState();
  
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    checkAuth();
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  }
});

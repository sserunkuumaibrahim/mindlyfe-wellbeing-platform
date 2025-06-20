
import { create } from 'zustand';
import { toast } from "@/components/ui/use-toast";
import { User } from '@/types/user';
import { AuthResponse, LoginDTO, RegisterDTO, ResetPasswordDTO } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  mfaRequired: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  verifyMFA: (code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordDTO) => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

// Helper function to convert profile data from Supabase to User type
const convertProfileToUser = (profile: any): User => {
  return {
    ...profile,
    date_of_birth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
    last_login_at: profile.last_login_at ? new Date(profile.last_login_at) : undefined,
    password_changed_at: new Date(profile.password_changed_at),
    locked_until: profile.locked_until ? new Date(profile.locked_until) : undefined,
    created_at: new Date(profile.created_at),
    updated_at: new Date(profile.updated_at),
  } as User;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  mfaRequired: false,
  loading: false,
  error: null,
  
  checkAuth: async () => {
    try {
      set({ loading: true });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user profile from our custom profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_uid', session.user.id)
          .single();

        if (profile && !profileError) {
          set({
            user: convertProfileToUser(profile),
            isAuthenticated: true,
            loading: false,
          });
        } else {
          // Profile not found, clear session
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
  
  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_uid', data.user.id)
          .single();

        if (profile && !profileError) {
          // Update last login
          await supabase
            .from('profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', profile.id);

          // Log the login
          await supabase
            .from('audit_logs')
            .insert({
              profile_id: profile.id,
              action: 'USER_LOGIN',
              resource_type: 'profile',
              resource_id: profile.id,
              details: { email: credentials.email }
            });

          set({
            user: convertProfileToUser(profile),
            isAuthenticated: true,
            loading: false,
          });

          toast({
            title: "Login successful",
            description: `Welcome back, ${profile.full_name}!`,
          });
        } else {
          throw new Error('Profile not found');
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
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
  
  register: async (data) => {
    try {
      set({ loading: true, error: null });
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: data.full_name,
            role: data.role,
            phone_number: data.phone_number,
            date_of_birth: data.date_of_birth?.toISOString(),
            gender: data.gender,
            country: data.country,
            preferred_language: data.preferred_language,
            // Add role-specific data
            ...(data.role === 'individual' ? {
              mental_health_history: (data as any).mental_health_history,
              therapy_goals: (data as any).therapy_goals?.join(','),
              communication_pref: (data as any).communication_pref,
              opt_in_newsletter: (data as any).opt_in_newsletter,
              opt_in_sms: (data as any).opt_in_sms,
              emergency_contact_name: (data as any).emergency_contact_name,
              emergency_contact_phone: (data as any).emergency_contact_phone,
              preferred_therapist_gender: (data as any).preferred_therapist_gender,
            } : {}),
            ...(data.role === 'therapist' ? {
              national_id_number: (data as any).national_id_number,
              license_body: (data as any).license_body,
              license_number: (data as any).license_number,
              license_expiry_date: (data as any).license_expiry_date?.toISOString(),
              insurance_provider: (data as any).insurance_provider,
              insurance_policy_number: (data as any).insurance_policy_number,
              insurance_expiry_date: (data as any).insurance_expiry_date?.toISOString(),
              years_experience: (data as any).years_experience,
              specializations: (data as any).specializations?.join(','),
              languages_spoken: (data as any).languages_spoken?.join(','),
              education_background: (data as any).education_background,
              hourly_rate: (data as any).hourly_rate,
              bio: (data as any).bio,
            } : {}),
            ...(data.role === 'org_admin' ? {
              organization_name: (data as any).organization_name,
              organization_type: (data as any).organization_type,
              registration_number: (data as any).registration_number,
              date_of_establishment: (data as any).date_of_establishment?.toISOString(),
              tax_id_number: (data as any).tax_id_number,
              num_employees: (data as any).num_employees,
              official_website: (data as any).official_website,
              address: (data as any).address,
              city: (data as any).city,
              state_province: (data as any).state_province,
              postal_code: (data as any).postal_code,
              representative_job_title: (data as any).representative_job_title,
              representative_national_id: (data as any).representative_national_id,
            } : {}),
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
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      set({
        error: errorMessage,
        loading: false,
      });
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  },
  
  logout: async () => {
    try {
      set({ loading: true });
      
      const { user } = get();
      
      // Log the logout
      if (user) {
        await supabase
          .from('audit_logs')
          .insert({
            profile_id: user.id,
            action: 'USER_LOGOUT',
            resource_type: 'profile',
            resource_id: user.id,
          });
      }
      
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
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Logout failed',
      });
    }
  },
  
  refreshToken: async () => {
    try {
      set({ loading: true });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_uid', session.user.id)
          .single();

        if (profile) {
          set({
            user: convertProfileToUser(profile),
            isAuthenticated: true,
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
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },
  
  verifyMFA: async (code) => {
    set({ loading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({
      mfaRequired: false,
      loading: false,
    });
    toast({
      title: "Verification successful (mock)",
      description: "MFA verification (mock).",
    });
  },
  
  forgotPassword: async (email) => {
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
        title: "Password reset email sent",
        description: "Please check your email for password reset instructions.",
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to send reset email',
        loading: false,
      });
    }
  },
  
  resetPassword: async (data) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      set({ loading: false });
      toast({
        title: "Password reset successful",
        description: "Your password has been updated successfully.",
      });
    } catch (error: any) {
      set({
        error: error.message || 'Password reset failed',
        loading: false,
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

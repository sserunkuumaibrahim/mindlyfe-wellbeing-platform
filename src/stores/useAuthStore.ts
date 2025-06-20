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
    full_name: profile.full_name || `${profile.first_name} ${profile.last_name}`,
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
            description: `Welcome back, ${profile.first_name}!`,
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
      
      // Prepare metadata based on role
      const metadata: Record<string, any> = {
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        phone_number: data.phone_number,
        date_of_birth: data.date_of_birth?.toISOString(),
        gender: data.gender,
        country: data.country,
        preferred_language: data.preferred_language,
      };

      // Add role-specific data
      if (data.role === 'individual') {
        const individualData = data as any;
        Object.assign(metadata, {
          mental_health_history: individualData.mental_health_history,
          therapy_goals: individualData.therapy_goals?.join(','),
          communication_pref: individualData.communication_pref,
          opt_in_newsletter: individualData.opt_in_newsletter,
          opt_in_sms: individualData.opt_in_sms,
          emergency_contact_name: individualData.emergency_contact_name,
          emergency_contact_phone: individualData.emergency_contact_phone,
          preferred_therapist_gender: individualData.preferred_therapist_gender,
        });
      } else if (data.role === 'therapist') {
        const therapistData = data as any;
        Object.assign(metadata, {
          national_id_number: therapistData.national_id_number,
          license_body: therapistData.license_body,
          license_number: therapistData.license_number,
          license_expiry_date: therapistData.license_expiry_date?.toISOString(),
          insurance_provider: therapistData.insurance_provider,
          insurance_policy_number: therapistData.insurance_policy_number,
          insurance_expiry_date: therapistData.insurance_expiry_date?.toISOString(),
          years_experience: therapistData.years_experience,
          specializations: therapistData.specializations?.join(','),
          languages_spoken: therapistData.languages_spoken?.join(','),
          education_background: therapistData.education_background,
          certifications: therapistData.certifications?.join(','),
          hourly_rate: therapistData.hourly_rate,
          bio: therapistData.bio,
        });
      } else if (data.role === 'org_admin') {
        const orgData = data as any;
        Object.assign(metadata, {
          organization_name: orgData.organization_name,
          organization_type: orgData.organization_type,
          registration_number: orgData.registration_number,
          date_of_establishment: orgData.date_of_establishment?.toISOString(),
          tax_id_number: orgData.tax_id_number,
          num_employees: orgData.num_employees,
          official_website: orgData.official_website,
          address: orgData.address,
          city: orgData.city,
          state_province: orgData.state_province,
          postal_code: orgData.postal_code,
          representative_job_title: orgData.representative_job_title,
          representative_national_id: orgData.representative_national_id,
          billing_contact_email: orgData.billing_contact_email,
          billing_contact_phone: orgData.billing_contact_phone,
        });
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: metadata,
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
      throw error;
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

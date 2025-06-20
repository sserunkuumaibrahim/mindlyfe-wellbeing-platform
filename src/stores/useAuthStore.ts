import { create } from 'zustand';
import { toast } from "@/components/ui/use-toast";
import { User, UserRole, IndividualProfile, TherapistProfile, OrganizationProfile } from '../types/user';
import { LoginDTO, BaseRegisterDTO, IndividualRegisterDTO, TherapistRegisterDTO, OrganizationRegisterDTO } from '../types/auth';
import { supabase } from '../integrations/supabase/client';

type RegisterData = IndividualRegisterDTO | TherapistRegisterDTO | OrganizationRegisterDTO;

// Type for Supabase profile data
interface SupabaseProfile {
  id: string;
  auth_uid: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  country?: string;
  preferred_language: string;
  profile_photo_url?: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  last_login_at?: string;
  password_changed_at: string;
  failed_login_attempts: number;
  locked_until?: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  mfaRequired: boolean;
  loading: boolean;
  error: string | null;
  login: (data: LoginDTO) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

// Helper function to convert profile data from Supabase to User type
const convertProfileToUser = (profile: SupabaseProfile): User => {
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
  
  register: async (data) => {
    try {
      set({ loading: true, error: null });
      
      // Prepare metadata based on role
      const metadata: Record<string, unknown> = {
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        phone: data.phone_number,
        date_of_birth: data.date_of_birth?.toISOString().split('T')[0],
        gender: data.gender,
        country: data.country,
        preferred_language: data.preferred_language,
      };

      console.log('Registration metadata:', metadata);

      // Add role-specific data
      if (data.role === 'individual') {
        const individualData = data as IndividualRegisterDTO;
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
        const therapistData = data as TherapistRegisterDTO;
        Object.assign(metadata, {
          national_id_number: therapistData.national_id_number,
          license_body: therapistData.license_body,
          license_number: therapistData.license_number,
          license_expiry_date: therapistData.license_expiry_date?.toISOString().split('T')[0],
          insurance_provider: therapistData.insurance_provider,
          insurance_policy_number: therapistData.insurance_policy_number,
          insurance_expiry_date: therapistData.insurance_expiry_date?.toISOString().split('T')[0],
          years_experience: therapistData.years_experience ? Number(therapistData.years_experience) : null,
          specializations: therapistData.specializations?.join(','),
          languages_spoken: therapistData.languages_spoken?.join(','),
          education_background: therapistData.education_background,
          certifications: therapistData.certifications?.join(','),

          bio: therapistData.bio,
        });
      } else if (data.role === 'org_admin') {
        const orgData = data as OrganizationRegisterDTO;
        Object.assign(metadata, {
          organization_name: orgData.organization_name,
          organization_type: orgData.organization_type,
          registration_number: orgData.registration_number,
          date_of_establishment: orgData.date_of_establishment?.toISOString().split('T')[0],
          tax_id_number: orgData.tax_id_number,
          num_employees: orgData.num_employees ? Number(orgData.num_employees) : null,
          official_website: orgData.official_website,
          address: orgData.address,
          city: orgData.city,
          state: orgData.state_province,
          postal_code: orgData.postal_code,
          representative_name: `${data.first_name} ${data.last_name}`,
          representative_job_title: orgData.representative_job_title,
          representative_national_id: orgData.representative_national_id,
          billing_contact_email: orgData.billing_contact_email,
          billing_contact_phone: orgData.billing_contact_phone,
        });
      }

      console.log('Attempting signup with:', {
        email: data.email,
        metadata: metadata
      });

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        phone: data.phone_number,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: metadata,
        },
      });

      if (error) {
        console.error('Supabase signup error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          details: error
        });
        
        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.message.includes('duplicate key')) {
          if (error.message.includes('license_number')) {
            errorMessage = 'This license number is already registered. Please check your license number.';
          } else if (error.message.includes('email')) {
            errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
          } else {
            errorMessage = 'Some of the information provided is already in use. Please check your details.';
          }
        } else if (error.message.includes('not-null')) {
          errorMessage = 'Please fill in all required fields.';
        } else if (error.message.includes('check constraint')) {
          errorMessage = 'Please check that all values are valid (e.g., years of experience should be a positive number).';
        }
        
        throw new Error(errorMessage);
      }

      console.log('Signup successful:', authData);

      set({ loading: false });

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
    } catch (error: unknown) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error instanceof Error) {
        // Handle specific database constraint errors
        if (error.message.includes('duplicate key value violates unique constraint')) {
          if (error.message.includes('license_number')) {
            errorMessage = 'This license number is already registered. Please check your license number or contact support if you believe this is an error.';
          } else if (error.message.includes('email')) {
            errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
          } else if (error.message.includes('registration_number')) {
            errorMessage = 'This organization registration number is already in use. Please verify your registration number.';
          } else {
            errorMessage = 'Some of the information provided is already in use. Please check your details.';
          }
        } else if (error.message.includes('violates not-null constraint') || error.message.includes('is required')) {
          // Extract field name from error message if possible
          const fieldMatch = error.message.match(/(\w+)\s+is required/);
          if (fieldMatch) {
            const fieldName = fieldMatch[1].replace('_', ' ');
            errorMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required. Please fill in all required fields.`;
          } else {
            errorMessage = 'Please fill in all required fields. Some mandatory information is missing.';
          }
        } else if (error.message.includes('check constraint')) {
          if (error.message.includes('years_experience')) {
            errorMessage = 'Years of experience must be a valid positive number.';
          } else if (error.message.includes('num_employees')) {
            errorMessage = 'Number of employees must be a positive number.';
          } else if (error.message.includes('expiry_date')) {
            errorMessage = 'Please ensure all expiry dates are valid and in the future.';
          } else {
            errorMessage = 'Please check that all values are valid and meet the required criteria.';
          }
        } else if (error.message.includes('invalid input syntax')) {
          if (error.message.includes('date')) {
            errorMessage = 'Please enter valid dates in the correct format.';
          } else if (error.message.includes('integer')) {
            errorMessage = 'Please enter valid numbers for numeric fields.';
          } else {
            errorMessage = 'Please check the format of your input data.';
          }
        } else if (error.message.includes('value too long')) {
          errorMessage = 'Some of your input is too long. Please shorten your text and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
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
    } catch (error: unknown) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
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
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Failed to send reset email',
        loading: false,
      });
    }
  },
  
  resetPassword: async (token: string, newPassword: string) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      set({ loading: false });
      toast({
        title: "Password reset successful",
        description: "Your password has been updated successfully.",
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Password reset failed',
        loading: false,
      });
    }
  },
  
  clearError: () => set({ error: null }),

  updateProfile: async (data: Partial<User>) => {
    try {
      set({ loading: true, error: null });
      
      // Convert Date objects to ISO strings for database compatibility
      const updateData: Record<string, string | number | boolean | null | undefined> = {};
      
      // Copy all non-Date fields
      Object.keys(data).forEach(key => {
        const value = data[key as keyof typeof data];
        if (value instanceof Date) {
          // Handle date fields specifically
          if (key === 'date_of_birth') {
            updateData[key] = value.toISOString().split('T')[0];
          } else {
            updateData[key] = value.toISOString();
          }
        } else {
          updateData[key] = value as string | number | boolean | null | undefined;
        }
      });
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', get().user?.id);
      
      if (error) throw error;
      
      // Refresh user data
      await get().checkAuth();
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Profile update failed',
        loading: false,
      });
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      set({ loading: false });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Password change failed',
        loading: false,
      });
    }
  },

  requestPasswordReset: async (email: string) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      set({ loading: false });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Password reset request failed',
        loading: false,
      });
    }
  },

  verifyEmail: async (token: string) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });
      
      if (error) throw error;
      
      set({ loading: false });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Email verification failed',
        loading: false,
      });
    }
  },

  resendVerificationEmail: async () => {
    try {
      set({ loading: true, error: null });
      
      const user = get().user;
      if (!user?.email) {
        throw new Error('No user email found');
      }
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });
      
      if (error) throw error;
      
      set({ loading: false });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Resend verification failed',
        loading: false,
      });
    }
  },
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

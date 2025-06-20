
import { create } from 'zustand';
import { toast } from "@/hooks/use-toast";
import { User, UserRole, IndividualProfile, TherapistProfile, OrganizationProfile } from '../types/user';
import { LoginDTO, BaseRegisterDTO, IndividualRegisterDTO, TherapistRegisterDTO, OrganizationRegisterDTO, ResetPasswordDTO } from '../types/auth';
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
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordDTO) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  verifyMFA: (code: string) => Promise<void>;
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
      
      // Prepare clean metadata - only include valid, non-empty values
      const metadata: Record<string, string | number | boolean> = {
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
      };

      // Add optional fields only if they have valid values
      if (data.phone_number?.trim()) {
        metadata.phone_number = data.phone_number.trim();
      }
      
      if (data.date_of_birth) {
        metadata.date_of_birth = data.date_of_birth.toISOString().split('T')[0];
      }
      
      if (data.gender && data.gender.trim() !== '') {
        metadata.gender = data.gender;
      }
      
      if (data.country?.trim()) {
        metadata.country = data.country.trim();
      }
      
      if (data.preferred_language?.trim()) {
        metadata.preferred_language = data.preferred_language.trim();
      }

      console.log('Clean registration metadata:', metadata);

      // Add role-specific data
      if (data.role === 'individual') {
        const individualData = data as IndividualRegisterDTO;
        
        if (individualData.mental_health_history?.trim()) {
          metadata.mental_health_history = individualData.mental_health_history.trim();
        }
        
        if (individualData.therapy_goals?.length) {
          metadata.therapy_goals = individualData.therapy_goals.join(',');
        }
        
        if (individualData.communication_pref) {
          metadata.communication_pref = individualData.communication_pref;
        }
        
        if (typeof individualData.opt_in_newsletter === 'boolean') {
          metadata.opt_in_newsletter = individualData.opt_in_newsletter;
        }
        
        if (typeof individualData.opt_in_sms === 'boolean') {
          metadata.opt_in_sms = individualData.opt_in_sms;
        }
        
        if (individualData.emergency_contact_name?.trim()) {
          metadata.emergency_contact_name = individualData.emergency_contact_name.trim();
        }
        
        if (individualData.emergency_contact_phone?.trim()) {
          metadata.emergency_contact_phone = individualData.emergency_contact_phone.trim();
        }
        
        if (individualData.preferred_therapist_gender && individualData.preferred_therapist_gender.trim() !== '') {
          metadata.preferred_therapist_gender = individualData.preferred_therapist_gender;
        }
      } else if (data.role === 'therapist') {
        const therapistData = data as TherapistRegisterDTO;
        
        // Required fields for therapists
        metadata.national_id_number = therapistData.national_id_number;
        metadata.license_body = therapistData.license_body;
        metadata.license_number = therapistData.license_number;
        metadata.insurance_provider = therapistData.insurance_provider;
        metadata.insurance_policy_number = therapistData.insurance_policy_number;
        
        if (therapistData.license_expiry_date) {
          metadata.license_expiry_date = therapistData.license_expiry_date.toISOString().split('T')[0];
        }
        
        if (therapistData.insurance_expiry_date) {
          metadata.insurance_expiry_date = therapistData.insurance_expiry_date.toISOString().split('T')[0];
        }
        
        if (typeof therapistData.years_experience === 'number') {
          metadata.years_experience = therapistData.years_experience;
        }
        
        if (therapistData.specializations?.length) {
          metadata.specializations = therapistData.specializations.join(',');
        }
        
        if (therapistData.languages_spoken?.length) {
          metadata.languages_spoken = therapistData.languages_spoken.join(',');
        }
        
        if (therapistData.education_background?.trim()) {
          metadata.education_background = therapistData.education_background.trim();
        }
        
        if (therapistData.certifications?.length) {
          metadata.certifications = therapistData.certifications.join(',');
        }
        
        if (therapistData.bio?.trim()) {
          metadata.bio = therapistData.bio.trim();
        }
      } else if (data.role === 'org_admin') {
        const orgData = data as OrganizationRegisterDTO;
        
        // Required fields for organizations
        metadata.organization_name = orgData.organization_name;
        metadata.registration_number = orgData.registration_number;
        metadata.tax_id_number = orgData.tax_id_number;
        
        if (orgData.organization_type) {
          metadata.organization_type = orgData.organization_type;
        }
        
        if (orgData.date_of_establishment) {
          metadata.date_of_establishment = orgData.date_of_establishment.toISOString().split('T')[0];
        }
        
        if (typeof orgData.num_employees === 'number') {
          metadata.num_employees = orgData.num_employees;
        }
        
        if (orgData.official_website?.trim()) {
          metadata.official_website = orgData.official_website.trim();
        }
        
        if (orgData.address?.trim()) {
          metadata.address = orgData.address.trim();
        }
        
        if (orgData.city?.trim()) {
          metadata.city = orgData.city.trim();
        }
        
        if (orgData.state_province?.trim()) {
          metadata.state_province = orgData.state_province.trim();
        }
        
        if (orgData.postal_code?.trim()) {
          metadata.postal_code = orgData.postal_code.trim();
        }
        
        if (orgData.representative_job_title?.trim()) {
          metadata.representative_job_title = orgData.representative_job_title.trim();
        }
        
        if (orgData.representative_national_id?.trim()) {
          metadata.representative_national_id = orgData.representative_national_id.trim();
        }
        
        if (orgData.billing_contact_email?.trim()) {
          metadata.billing_contact_email = orgData.billing_contact_email.trim();
        }
        
        if (orgData.billing_contact_phone?.trim()) {
          metadata.billing_contact_phone = orgData.billing_contact_phone.trim();
        }
      }

      console.log('Attempting signup with clean metadata:', metadata);

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: metadata,
        },
      });

      if (error) {
        console.error('Supabase signup error:', error);
        
        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = 'This email address is already registered. Please try logging in instead.';
        } else if (error.message.includes('duplicate key')) {
          if (error.message.includes('license_number')) {
            errorMessage = 'This license number is already registered. Please check your license number.';
          } else if (error.message.includes('email')) {
            errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
          } else {
            errorMessage = 'Some of the information provided is already in use. Please check your details.';
          }
        } else if (error.message.includes('Database error')) {
          errorMessage = 'There was an issue with your registration. Please check all required fields are filled correctly and try again.';
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
        errorMessage = error.message;
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

  forgotPassword: async (email: string) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      set({ loading: false });
      
      toast({
        title: "Reset link sent",
        description: "Please check your email for the password reset link.",
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Password reset request failed',
        loading: false,
      });
    }
  },

  resetPassword: async (data: ResetPasswordDTO) => {
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
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Password reset failed',
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

  verifyMFA: async (code: string) => {
    try {
      set({ loading: true, error: null });
      
      // For now, just simulate MFA verification
      // In a real implementation, this would verify the MFA code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set({ 
        mfaRequired: false,
        loading: false 
      });
      
      toast({
        title: "MFA verification successful",
        description: "Two-factor authentication verified.",
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'MFA verification failed',
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

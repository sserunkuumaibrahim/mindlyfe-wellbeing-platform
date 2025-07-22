
import { create } from 'zustand';
import { toast } from "@/lib/toast";
import { User, UserRole, GenderType, IndividualProfile, TherapistProfile, OrganizationProfile } from '../types/user';
import { LoginDTO, BaseRegisterDTO, IndividualRegisterDTO, TherapistRegisterDTO, OrganizationRegisterDTO, ResetPasswordDTO } from '../types/auth';
import { postgresqlClient, type ApiResponse } from '../integrations/postgresql/client';

type RegisterData = IndividualRegisterDTO | TherapistRegisterDTO | OrganizationRegisterDTO;

// Type for PostgreSQL profile data
interface PostgreSQLProfile {
  id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  full_name?: string;
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
  role_data?: Record<string, unknown>;
  documents?: Array<{
    id: string;
    file_name: string;
    file_path: string;
    mime_type: string;
    status: string;
    created_at: string;
  }>;
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
  refreshSession: () => Promise<boolean>;
}

// Helper function to convert profile data from PostgreSQL to User type
const convertProfileToUser = (profile: PostgreSQLProfile): User => {
  return {
    id: profile.id,
    auth_uid: profile.id, // Use id as auth_uid
    role: profile.role,
    first_name: profile.first_name,
    last_name: profile.last_name,
    full_name: profile.full_name || `${profile.first_name} ${profile.last_name}`,
    email: profile.email,
    phone_number: profile.phone_number,
    date_of_birth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
    gender: profile.gender as GenderType,
    country: profile.country,
    preferred_language: profile.preferred_language,
    profile_photo_url: profile.profile_photo_url,
    is_active: profile.is_active,
    is_email_verified: profile.is_email_verified,
    is_phone_verified: profile.is_phone_verified,
    last_login_at: profile.last_login_at ? new Date(profile.last_login_at) : undefined,
    password_changed_at: new Date(profile.password_changed_at),
    failed_login_attempts: profile.failed_login_attempts,
    locked_until: profile.locked_until ? new Date(profile.locked_until) : undefined,
    created_at: new Date(profile.created_at),
    updated_at: new Date(profile.updated_at),
  } as User;
};

// Helper function to handle API errors
const handleApiError = (result: ApiResponse<unknown>, defaultMessage: string): string => {
  if (result.error) {
    if (result.code === 'VALIDATION_ERROR' && result.details?.fields) {
      // Format validation errors
      const fields = result.details.fields as string[];
      return `Validation error in fields: ${fields.join(', ')}`;
    } else if (result.code) {
      return `${result.error} (${result.code})`;
    } else {
      return result.error;
    }
  }
  return defaultMessage;
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
      
      const session = postgresqlClient.getCurrentSession();
      
      if (session?.user) {
        try {
          // Get user profile with additional data
          const profileResult = await postgresqlClient.getProfile();
          
          if (profileResult.data) {
            // Convert profile data to User type
            const userData: PostgreSQLProfile = {
              id: session.user.id,
              role: session.user.role as UserRole,
              first_name: session.user.first_name,
              last_name: session.user.last_name,
              email: session.user.email,
              preferred_language: 'en',
              is_active: true,
              is_email_verified: session.user.email_confirmed,
              is_phone_verified: false,
              password_changed_at: new Date().toISOString(),
              failed_login_attempts: 0,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at,
              ...(profileResult.data as Partial<PostgreSQLProfile>)
            };
            
            set({
              user: convertProfileToUser(userData as PostgreSQLProfile),
              isAuthenticated: true,
              loading: false,
            });
            return;
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
        }
        
        // If profile fetch fails, use session user data
        set({
          user: {
            id: session.user.id,
            auth_uid: session.user.id, // Use id as auth_uid
            email: session.user.email,
            first_name: session.user.first_name,
            last_name: session.user.last_name,
            role: session.user.role as UserRole,
            email_confirmed: session.user.email_confirmed,
            created_at: new Date(session.user.created_at),
            updated_at: new Date(session.user.updated_at),
            is_active: true,
            is_email_verified: session.user.email_confirmed,
            is_phone_verified: false,
            password_changed_at: new Date(),
            failed_login_attempts: 0,
            preferred_language: 'en',
            full_name: `${session.user.first_name} ${session.user.last_name}`
          } as User,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        // Try to refresh token if available
        const refreshed = await get().refreshSession();
        
        if (!refreshed) {
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
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
  
  refreshSession: async () => {
    try {
      const result = await postgresqlClient.refreshAccessToken();
      
      if (result.data) {
        try {
          // Get user profile with additional data
          const profileResult = await postgresqlClient.getProfile();
          
          if (profileResult.data) {
            // Convert profile data to User type
            const userData: PostgreSQLProfile = {
              id: result.data.user.id,
              role: result.data.user.role as UserRole,
              first_name: result.data.user.first_name,
              last_name: result.data.user.last_name,
              email: result.data.user.email,
              preferred_language: 'en',
              is_active: true,
              is_email_verified: result.data.user.email_confirmed,
              is_phone_verified: false,
              password_changed_at: new Date().toISOString(),
              failed_login_attempts: 0,
              created_at: result.data.user.created_at,
              updated_at: result.data.user.updated_at,
              ...(profileResult.data as Partial<PostgreSQLProfile>)
            };
            
            set({
              user: convertProfileToUser(userData as PostgreSQLProfile),
              isAuthenticated: true,
              loading: false,
            });
            return true;
          }
        } catch (profileError) {
          console.error('Error fetching profile after refresh:', profileError);
        }
        
        // If profile fetch fails, use session user data
        set({
          user: {
            id: result.data.user.id,
            auth_uid: result.data.user.id, // Use id as auth_uid
            email: result.data.user.email,
            first_name: result.data.user.first_name,
            last_name: result.data.user.last_name,
            role: result.data.user.role as UserRole,
            email_confirmed: result.data.user.email_confirmed,
            created_at: new Date(result.data.user.created_at),
            updated_at: new Date(result.data.user.updated_at),
            is_active: true,
            is_email_verified: result.data.user.email_confirmed,
            is_phone_verified: false,
            password_changed_at: new Date(),
            failed_login_attempts: 0,
            preferred_language: 'en',
            full_name: `${result.data.user.first_name} ${result.data.user.last_name}`
          } as User,
          isAuthenticated: true,
          loading: false,
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  },
  
  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      
      const result = await postgresqlClient.signIn(credentials.email, credentials.password);

      if (result.error) {
        const errorMessage = handleApiError(result, 'Login failed');
        throw new Error(errorMessage);
      }

      if (result.data?.user) {
        try {
          // Get user profile with additional data
          const profileResult = await postgresqlClient.getProfile();
          
          if (profileResult.data) {
            // Convert profile data to User type
            const userData: PostgreSQLProfile = {
              id: result.data.user.id,
              role: result.data.user.role as UserRole,
              first_name: result.data.user.first_name,
              last_name: result.data.user.last_name,
              email: result.data.user.email,
              preferred_language: 'en',
              is_active: true,
              is_email_verified: result.data.user.email_confirmed,
              is_phone_verified: false,
              password_changed_at: new Date().toISOString(),
              failed_login_attempts: 0,
              created_at: result.data.user.created_at,
              updated_at: result.data.user.updated_at,
              ...(profileResult.data as Partial<PostgreSQLProfile>)
            };
            
            set({
              user: convertProfileToUser(userData as PostgreSQLProfile),
              isAuthenticated: true,
              loading: false,
            });
            
            toast({
              title: "Login successful",
              description: `Welcome back, ${result.data.user.first_name}!`,
            });
            return;
          }
        } catch (profileError) {
          console.error('Error fetching profile after login:', profileError);
        }
        
        // If profile fetch fails, use session user data
        set({
          user: {
            id: result.data.user.id,
            auth_uid: result.data.user.id, // Use id as auth_uid
            email: result.data.user.email,
            first_name: result.data.user.first_name,
            last_name: result.data.user.last_name,
            role: result.data.user.role as UserRole,
            email_confirmed: result.data.user.email_confirmed,
            created_at: new Date(result.data.user.created_at),
            updated_at: new Date(result.data.user.updated_at),
            is_active: true,
            is_email_verified: result.data.user.email_confirmed,
            is_phone_verified: false,
            password_changed_at: new Date(),
            failed_login_attempts: 0,
            preferred_language: 'en',
            full_name: `${result.data.user.first_name} ${result.data.user.last_name}`
          } as User,
          isAuthenticated: true,
          loading: false,
        });
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${result.data.user.first_name}!`,
        });
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
      
      // Handle file uploads for documents
      const documents: Record<string, string> = {};
      
      // TODO: Implement actual file upload functionality
      // For now, we'll simulate document URLs for testing
      
      if (data.role === 'therapist') {
        const therapistData = data as TherapistRegisterDTO;
        
        if (therapistData.licenseDocument) {
          // Simulate file upload and get URL
          const fileName = therapistData.licenseDocument.name;
          const fileType = therapistData.licenseDocument.type;
          const mockUrl = `https://storage.example.com/documents/${Date.now()}-${fileName}`;
          documents.license_document_url = mockUrl;
          
          console.log('License document would be uploaded:', {
            name: fileName,
            type: fileType,
            url: mockUrl
          });
        }
        
        if (therapistData.insuranceDocument) {
          const fileName = therapistData.insuranceDocument.name;
          const mockUrl = `https://storage.example.com/documents/${Date.now()}-${fileName}`;
          documents.insurance_document_url = mockUrl;
        }
        
        if (therapistData.idDocument) {
          const fileName = therapistData.idDocument.name;
          const mockUrl = `https://storage.example.com/documents/${Date.now()}-${fileName}`;
          documents.id_document_url = mockUrl;
        }
        
        if (therapistData.otherDocuments?.length) {
          const fileNames = therapistData.otherDocuments.map(doc => doc.name).join(', ');
          const mockUrl = `https://storage.example.com/documents/${Date.now()}-other`;
          documents.other_documents_urls = mockUrl;
          
          console.log('Other documents would be uploaded:', fileNames);
        }
      } else if (data.role === 'org_admin') {
        const orgData = data as OrganizationRegisterDTO;
        
        // Simulate document uploads for organization
        documents.proof_registration_url = `https://storage.example.com/documents/${Date.now()}-registration`;
        documents.auth_letter_url = `https://storage.example.com/documents/${Date.now()}-authorization`;
        documents.tax_certificate_url = `https://storage.example.com/documents/${Date.now()}-tax`;
      }
      
      // Prepare registration data
      const registrationData: Record<string, unknown> = {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        role: data.role,
      };
      
      // Add basic fields
      if (data.phone_number?.trim()) {
        registrationData.phone_number = data.phone_number.trim();
      }
      
      if (data.date_of_birth) {
        registrationData.date_of_birth = data.date_of_birth instanceof Date 
          ? data.date_of_birth.toISOString().split('T')[0]
          : data.date_of_birth;
      }
      
      if (data.gender?.trim()) {
        registrationData.gender = data.gender.trim();
      }
      
      if (data.country?.trim()) {
        registrationData.country = data.country.trim();
      }
      
      if (data.preferred_language?.trim()) {
        registrationData.preferred_language = data.preferred_language.trim();
      }
      
      // Add role-specific data to metadata
      const metadata: Record<string, unknown> = {};
      
      if (data.role === 'individual') {
        const individualData = data as IndividualRegisterDTO;
        
        if (individualData.mental_health_history?.trim()) {
          metadata.mental_health_history = individualData.mental_health_history.trim();
        }
        
        if (individualData.therapy_goals?.length) {
          metadata.therapy_goals = individualData.therapy_goals;
        }
        
        metadata.communication_pref = individualData.communication_pref || 'email';
        metadata.opt_in_newsletter = Boolean(individualData.opt_in_newsletter);
        metadata.opt_in_sms = Boolean(individualData.opt_in_sms);
        
        if (individualData.emergency_contact_name?.trim()) {
          metadata.emergency_contact_name = individualData.emergency_contact_name.trim();
        }
        
        if (individualData.emergency_contact_phone?.trim()) {
          metadata.emergency_contact_phone = individualData.emergency_contact_phone.trim();
        }
        
        if (individualData.preferred_therapist_gender?.trim()) {
          metadata.preferred_therapist_gender = individualData.preferred_therapist_gender.trim();
        }
      } else if (data.role === 'therapist') {
        const therapistData = data as TherapistRegisterDTO;
        
        // Required therapist fields
        if (!therapistData.national_id_number?.trim()) {
          throw new Error('National ID number is required for therapists');
        }
        if (!therapistData.license_body?.trim()) {
          throw new Error('License body is required for therapists');
        }
        if (!therapistData.license_number?.trim()) {
          throw new Error('License number is required for therapists');
        }
        
        metadata.national_id_number = therapistData.national_id_number.trim();
        metadata.license_body = therapistData.license_body.trim();
        metadata.license_number = therapistData.license_number.trim();
        
        if (therapistData.license_expiry_date) {
          metadata.license_expiry_date = therapistData.license_expiry_date instanceof Date
            ? therapistData.license_expiry_date.toISOString().split('T')[0]
            : therapistData.license_expiry_date;
        }
        
        if (therapistData.insurance_provider?.trim()) {
          metadata.insurance_provider = therapistData.insurance_provider.trim();
        }
        
        if (therapistData.insurance_policy_number?.trim()) {
          metadata.insurance_policy_number = therapistData.insurance_policy_number.trim();
        }
        
        if (therapistData.insurance_expiry_date) {
          metadata.insurance_expiry_date = therapistData.insurance_expiry_date instanceof Date
            ? therapistData.insurance_expiry_date.toISOString().split('T')[0]
            : therapistData.insurance_expiry_date;
        }
        
        if (typeof therapistData.years_experience === 'number' && therapistData.years_experience >= 0) {
          metadata.years_experience = therapistData.years_experience;
        }
        
        if (therapistData.specializations?.length) {
          metadata.specializations = therapistData.specializations;
        }
        
        if (therapistData.languages_spoken?.length) {
          metadata.languages_spoken = therapistData.languages_spoken;
        }
        
        if (therapistData.education_background?.trim()) {
          metadata.education_background = therapistData.education_background.trim();
        }
        
        if (therapistData.certifications?.length) {
          metadata.certifications = therapistData.certifications;
        }
        
        if (therapistData.bio?.trim()) {
          metadata.bio = therapistData.bio.trim();
        }
      } else if (data.role === 'org_admin') {
        const orgData = data as OrganizationRegisterDTO;
        
        // Required organization fields
        if (!orgData.organization_name?.trim()) {
          throw new Error('Organization name is required');
        }
        if (!orgData.registration_number?.trim()) {
          throw new Error('Registration number is required');
        }
        if (!orgData.tax_id_number?.trim()) {
          throw new Error('Tax ID number is required');
        }
        if (!orgData.representative_job_title?.trim()) {
          throw new Error('Representative job title is required');
        }
        if (!orgData.representative_national_id?.trim()) {
          throw new Error('Representative national ID is required');
        }
        
        metadata.organization_name = orgData.organization_name.trim();
        metadata.organization_type = orgData.organization_type || 'private_company';
        metadata.registration_number = orgData.registration_number.trim();
        metadata.tax_id_number = orgData.tax_id_number.trim();
        metadata.representative_name = `${data.first_name} ${data.last_name}`;
        metadata.representative_job_title = orgData.representative_job_title.trim();
        metadata.representative_national_id = orgData.representative_national_id.trim();
        
        if (orgData.date_of_establishment) {
          metadata.date_of_establishment = orgData.date_of_establishment instanceof Date
            ? orgData.date_of_establishment.toISOString().split('T')[0]
            : orgData.date_of_establishment;
        }
        
        if (typeof orgData.num_employees === 'number' && orgData.num_employees > 0) {
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
          metadata.state = orgData.state_province.trim();
        }
        
        if (orgData.postal_code?.trim()) {
          metadata.postal_code = orgData.postal_code.trim();
        }
        
        if (orgData.billing_contact_email?.trim()) {
          metadata.billing_contact_email = orgData.billing_contact_email.trim();
        }
        
        if (orgData.billing_contact_phone?.trim()) {
          metadata.billing_contact_phone = orgData.billing_contact_phone.trim();
        }
      }
      
      // Add metadata to registration data
      registrationData.metadata = metadata;
      
      // Add documents to registration data
      if (Object.keys(documents).length > 0) {
        registrationData.documents = documents;
      }

      // Call signup API
      const result = await postgresqlClient.signUp(
        data.email, 
        data.password, 
        data.role,
        registrationData
      );

      if (result.error) {
        const errorMessage = handleApiError(result, 'Registration failed');
        throw new Error(errorMessage);
      }

      if (result.data?.user) {
        // Set user and session if auto-login is enabled
        set({
          user: {
            id: result.data.user.id,
            auth_uid: result.data.user.id, // Use id as auth_uid
            email: result.data.user.email,
            first_name: result.data.user.first_name,
            last_name: result.data.user.last_name,
            role: result.data.user.role as UserRole,
            email_confirmed: result.data.user.email_confirmed,
            created_at: new Date(result.data.user.created_at),
            updated_at: new Date(result.data.user.updated_at),
            is_active: true,
            is_email_verified: result.data.user.email_confirmed,
            is_phone_verified: false,
            password_changed_at: new Date(),
            failed_login_attempts: 0,
            preferred_language: 'en',
            full_name: `${result.data.user.first_name} ${result.data.user.last_name}`
          } as User,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({ loading: false });
      }

      toast({
        title: "Registration successful!",
        description: "Your account has been created successfully.",
      });
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      
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
      set({ loading: true, error: null });
      
      const result = await postgresqlClient.signOut();
      
      if (result.error) {
        throw new Error(handleApiError(result, 'Logout failed'));
      }
      
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: unknown) {
      console.error('Logout error:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      });
      
      // Even if there's an error, clear the user state
      set({
        user: null,
        isAuthenticated: false
      });
    }
  },
  
  clearError: () => set({ error: null }),

  updateProfile: async (data: Partial<User>) => {
    try {
      set({ loading: true, error: null });
      
      // Separate base profile data and role-specific data
      const baseProfileData: Record<string, unknown> = {};
      const roleSpecificData: Record<string, unknown> = {};
      
      // Process fields for base profile
      const baseProfileFields = [
        'first_name', 'last_name', 'phone_number', 'date_of_birth',
        'gender', 'country', 'preferred_language', 'profile_photo_url'
      ];
      
      Object.entries(data).forEach(([key, value]) => {
        if (baseProfileFields.includes(key)) {
          if (value instanceof Date) {
            if (key === 'date_of_birth') {
              baseProfileData[key] = value.toISOString().split('T')[0];
            } else {
              baseProfileData[key] = value.toISOString();
            }
          } else {
            baseProfileData[key] = value;
          }
        } else {
          // All other fields go to role-specific data
          if (value instanceof Date) {
            roleSpecificData[key] = value.toISOString();
          } else {
            roleSpecificData[key] = value;
          }
        }
      });
      
      // Call the updateProfile API
      const result = await postgresqlClient.updateProfile({
        base_profile: baseProfileData,
        role_data: roleSpecificData
      });
      
      if (result.error) {
        const errorMessage = handleApiError(result, 'Profile update failed');
        throw new Error(errorMessage);
      }
      
      // Refresh user data
      await get().checkAuth();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      set({
        error: errorMessage,
        loading: false,
      });
      
      toast({
        title: "Profile update failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      set({ loading: false });
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      set({ loading: true, error: null });
      
      // Call the API to change password
      // This is a placeholder until the backend endpoint is implemented
      const mockResult = {
        data: { message: "Password changed successfully" },
        error: null,
        status: 200
      };
      
      if (mockResult.error) {
        throw new Error(mockResult.error);
      }
      
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      set({
        error: errorMessage,
        loading: false,
      });
      
      toast({
        title: "Password change failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      set({ loading: false });
    }
  },

  requestPasswordReset: async (email: string) => {
    try {
      set({ loading: true, error: null });
      
      const result = await postgresqlClient.resetPassword(email);
      
      if (result.error) {
        const errorMessage = handleApiError(result, 'Password reset request failed');
        throw new Error(errorMessage);
      }
      
      toast({
        title: "Password reset email sent",
        description: "If an account exists with this email, you will receive password reset instructions.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset request failed';
      set({
        error: errorMessage,
        loading: false,
      });
      
      toast({
        title: "Password reset failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      set({ loading: false });
    }
  },

  forgotPassword: async (email: string) => {
    try {
      set({ loading: true, error: null });
      
      // This is just an alias for requestPasswordReset
      await get().requestPasswordReset(email);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset request failed';
      set({
        error: errorMessage,
        loading: false,
      });
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (data: ResetPasswordDTO) => {
    try {
      set({ loading: true, error: null });
      
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      const result = await postgresqlClient.resetPasswordComplete(data.token, data.password);
      
      if (result.error) {
        const errorMessage = handleApiError(result, 'Password reset failed');
        throw new Error(errorMessage);
      }
      
      toast({
        title: "Password reset successful",
        description: "Your password has been reset successfully. You can now log in with your new password.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      set({
        error: errorMessage,
        loading: false,
      });
      
      toast({
        title: "Password reset failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      set({ loading: false });
    }
  },

  verifyEmail: async (token: string) => {
    try {
      set({ loading: true, error: null });
      
      const result = await postgresqlClient.confirmEmail(token);
      
      if (result.error) {
        const errorMessage = handleApiError(result, 'Email verification failed');
        throw new Error(errorMessage);
      }
      
      // Update user state if logged in
      const user = get().user;
      if (user) {
        set({
          user: {
            ...user,
            is_email_verified: true
          }
        });
      }
      
      toast({
        title: "Email verified",
        description: "Your email has been verified successfully.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      set({
        error: errorMessage,
        loading: false,
      });
      
      toast({
        title: "Email verification failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      set({ loading: false });
    }
  },

  resendVerificationEmail: async () => {
    try {
      set({ loading: true, error: null });
      
      const user = get().user;
      if (!user?.email) {
        throw new Error('No user email found');
      }
      
      // This is a placeholder until the backend endpoint is implemented
      const mockResult = {
        data: { message: "Verification email sent" },
        error: null,
        status: 200
      };
      
      if (mockResult.error) {
        throw new Error(mockResult.error);
      }
      
      toast({
        title: "Verification email sent",
        description: "A new verification email has been sent to your email address.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Resend verification failed';
      set({
        error: errorMessage,
        loading: false,
      });
      
      toast({
        title: "Resend verification failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      set({ loading: false });
    }
  },

  verifyMFA: async (code: string) => {
    try {
      set({ loading: true, error: null });
      
      // This is a placeholder until the backend endpoint is implemented
      if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
        throw new Error('Invalid verification code. Please enter a 6-digit code.');
      }
      
      // Simulate API call
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
      const errorMessage = error instanceof Error ? error.message : 'MFA verification failed';
      set({
        error: errorMessage,
        loading: false,
      });
      
      toast({
        title: "MFA verification failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  },
}));

// TODO: Implement auth state change listener for PostgreSQL backend
// This will be handled by the PostgreSQL client when implemented

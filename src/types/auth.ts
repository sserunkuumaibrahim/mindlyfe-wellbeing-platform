
import { User, UserRole, GenderType, CommunicationPreference, OrganizationType } from './user';
import { type AuthUser, type AuthSession } from '@/integrations/postgresql/client';

export type { GenderType, CommunicationPreference, OrganizationType, UserRole } from './user';

export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface BaseRegisterDTO {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: Date;
  gender?: GenderType;
  country?: string;
  preferred_language?: string;
}

export interface IndividualRegisterDTO extends BaseRegisterDTO {
  role: 'individual';
  mental_health_history?: string;
  therapy_goals?: string[];
  communication_pref?: CommunicationPreference;
  opt_in_newsletter?: boolean;
  opt_in_sms?: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_therapist_gender?: GenderType;
}

export interface TherapistRegisterDTO extends BaseRegisterDTO {
  role: 'therapist';
  national_id_number: string;
  license_body: string;
  license_number: string;
  license_expiry_date: Date;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_expiry_date?: Date;
  years_experience: number;
  specializations: string[];
  languages_spoken: string[];
  education_background?: string;
  certifications?: string[];
  bio?: string;
  // Document data
  documents?: Record<string, string>;
  // Document file objects
  licenseDocument?: File;
  insuranceDocument?: File;
  idDocument?: File;
  otherDocuments?: File[];
}

export interface OrganizationRegisterDTO extends BaseRegisterDTO {
  role: 'org_admin';
  organization_name: string;
  organization_type: OrganizationType;
  registration_number: string;
  date_of_establishment: Date;
  tax_id_number: string;
  num_employees: number;
  official_website?: string;
  address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  representative_job_title: string;
  representative_national_id: string;
  service_requirements?: Record<string, unknown>;
  billing_contact_email?: string;
  billing_contact_phone?: string;
}

export type RegisterDTO = IndividualRegisterDTO | TherapistRegisterDTO | OrganizationRegisterDTO;

export interface ResetPasswordDTO {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  mfaRequired?: boolean;
}

export interface MfaSetupResponse {
  secret: string;
  qrCode: string;
}

export interface MfaStatus {
  enabled: boolean;
  verified: boolean;
}

export interface VerificationCodeResponse {
  success: boolean;
  message: string;
}

export interface ExtendedAuthUser extends AuthUser {
  role: UserRole;
  // Additional profile data that might be returned from the backend
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

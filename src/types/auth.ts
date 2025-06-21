
export type UserRole = 'individual' | 'therapist' | 'org_admin';
export type GenderType = 'male' | 'female';
export type OrganizationType = 'private_company' | 'school' | 'ngo' | 'government' | 'healthcare' | 'other';

export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDTO {
  role: UserRole;
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: GenderType;
  country?: string;
  preferred_language?: string;
}

export interface TherapistRegisterDTO extends RegisterDTO {
  role: 'therapist';
  national_id_number: string;
  license_body: string;
  license_number: string;
  license_expiry_date: Date;
  insurance_provider: string;
  insurance_policy_number: string;
  insurance_expiry_date: Date;
  years_experience: number;
  specializations: string[];
  languages_spoken: string[];
  education_background?: string;
  certifications?: string[];
  hourly_rate?: number;
  bio?: string;
}

export interface OrganizationRegisterDTO extends RegisterDTO {
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
  service_requirements?: Record<string, any>;
  billing_contact_email?: string;
  billing_contact_phone?: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: any;
  mfaRequired?: boolean;
}

export interface MfaSetupResponse {
  qrCode: string;
  secret: string;
}

export interface MfaStatus {
  enabled: boolean;
  backupCodes?: string[];
}

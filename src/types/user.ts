
export type UserRole = 'individual' | 'therapist' | 'org_admin' | 'sys_admin' | 'super_admin';
export type ProfileStatus = 'pending_review' | 'approved' | 'rejected' | 'active' | 'inactive';
export type CommunicationPreference = 'email' | 'sms' | 'both';
export type GenderType = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type OrganizationType = 'private_company' | 'school' | 'ngo' | 'government' | 'healthcare' | 'other';
export type TwoFAMethod = 'email' | 'sms' | 'authenticator';

export interface User {
  id: string;
  auth_uid: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: Date;
  gender?: GenderType;
  country?: string;
  preferred_language: string;
  profile_photo_url?: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  last_login_at?: Date;
  password_changed_at: Date;
  failed_login_attempts: number;
  locked_until?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface IndividualProfile {
  id: string;
  mental_health_history?: string;
  therapy_goals?: string[];
  communication_pref: CommunicationPreference;
  opt_in_newsletter: boolean;
  opt_in_sms: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_therapist_gender?: GenderType;
  session_preferences?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface TherapistProfile {
  id: string;
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
  currency: string;
  status: ProfileStatus;
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: Date;
  availability?: Record<string, any>;
  bio?: string;
  license_document_url?: string;
  insurance_document_url?: string;
  id_document_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrganizationProfile {
  id: string;
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
  representative_name: string;
  representative_job_title: string;
  representative_national_id: string;
  status: ProfileStatus;
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: Date;
  service_requirements?: Record<string, any>;
  billing_contact_email?: string;
  billing_contact_phone?: string;
  proof_registration_url?: string;
  auth_letter_url?: string;
  tax_certificate_url?: string;
  org_structure_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserTwoFAMethod {
  id: string;
  profile_id: string;
  method: TwoFAMethod;
  secret?: string;
  backup_codes?: string[];
  is_verified: boolean;
  is_primary: boolean;
  created_at: Date;
  verified_at?: Date;
}

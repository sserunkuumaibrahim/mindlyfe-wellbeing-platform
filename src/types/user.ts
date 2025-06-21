
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

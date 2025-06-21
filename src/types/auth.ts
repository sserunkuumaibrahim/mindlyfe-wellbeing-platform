
export type UserRole = 'individual' | 'therapist' | 'org_admin';
export type GenderType = 'male' | 'female';

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

export interface ResetPasswordDTO {
  token: string;
  password: string;
  confirmPassword: string;
}

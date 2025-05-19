
import { User } from './user';

export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDTO {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
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

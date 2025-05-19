
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

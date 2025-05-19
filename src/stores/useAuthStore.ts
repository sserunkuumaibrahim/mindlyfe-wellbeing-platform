
import { create } from 'zustand';
import { toast } from "@/components/ui/use-toast";
import { User } from '@/types/user';
import { AuthResponse, LoginDTO, RegisterDTO, ResetPasswordDTO } from '@/types/auth';
import { apiClient } from '@/services/apiClient';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  mfaRequired: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  verifyMFA: (code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordDTO) => Promise<void>;
  clearError: () => void;
}

// Mock user data for UI preview
const MOCK_USER: User = {
  id: "1",
  email: "mock@mindlyfe.org",
  firstName: "Amanda",
  lastName: "Doe",
  isEmailVerified: true,
  mfaEnabled: false,
  createdAt: new Date("2024-01-01T09:00:00.000Z"),
  updatedAt: new Date("2024-04-01T09:00:00.000Z"),
  // If the User interface changes in the future, include additional fields as needed.
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  mfaRequired: false,
  loading: false,
  error: null,
  
  login: async (credentials) => {
    set({ loading: true, error: null });
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    // Always "succeed" with mock user
    set({
      user: MOCK_USER,
      isAuthenticated: true,
      mfaRequired: false,
      loading: false,
    });
    toast({
      title: "Login successful (mock)",
      description: `Welcome back, ${MOCK_USER.firstName}!`,
    });
  },
  
  register: async (data) => {
    set({ loading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 800));
    set({
      user: MOCK_USER,
      isAuthenticated: true,
      loading: false,
    });
    toast({
      title: "Registration successful (mock)",
      description: `Welcome to Mindlyfe, ${MOCK_USER.firstName}!`,
    });
  },
  
  logout: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 400));
    set({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    toast({
      title: "Logged out (mock)",
      description: "You have been logged out (mock).",
    });
  },
  
  refreshToken: async () => {
    // Simulate auto-login with mock user (for dashboard redirects)
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({
      user: MOCK_USER,
      isAuthenticated: true,
      loading: false,
    });
  },
  
  verifyMFA: async (code) => {
    set({ loading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({
      user: MOCK_USER,
      isAuthenticated: true,
      mfaRequired: false,
      loading: false,
    });
    toast({
      title: "Verification successful (mock)",
      description: "MFA verification (mock).",
    });
  },
  
  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ loading: false });
    toast({
      title: "Password reset email sent (mock)",
      description: "Please check your email (pretend email) to reset your password.",
    });
  },
  
  resetPassword: async (data) => {
    set({ loading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ loading: false });
    toast({
      title: "Password reset successful (mock)",
      description: "Password reset with mock logic.",
    });
  },
  
  clearError: () => set({ error: null }),
}));


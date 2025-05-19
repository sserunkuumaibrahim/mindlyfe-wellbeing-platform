
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  mfaRequired: false,
  loading: false,
  error: null,
  
  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      const response = await apiClient.auth.login(credentials);
      
      if (response.mfaRequired) {
        set({ 
          mfaRequired: true, 
          loading: false 
        });
        return;
      }
      
      set({ 
        user: response.user, 
        isAuthenticated: true, 
        mfaRequired: false,
        loading: false 
      });
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.firstName}!`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      set({ error: errorMessage, loading: false });
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
    }
  },
  
  register: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await apiClient.auth.register(data);
      
      set({ 
        user: response.user, 
        isAuthenticated: true, 
        loading: false 
      });
      
      toast({
        title: "Registration successful",
        description: `Welcome to Mindlyfe, ${response.user.firstName}!`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register';
      set({ error: errorMessage, loading: false });
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMessage,
      });
    }
  },
  
  logout: async () => {
    try {
      set({ loading: true });
      await apiClient.auth.logout();
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false 
      });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
      set({ loading: false });
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: errorMessage,
      });
    }
  },
  
  refreshToken: async () => {
    try {
      set({ loading: true });
      const response = await apiClient.auth.refreshToken();
      
      set({ 
        user: response.user, 
        isAuthenticated: true, 
        loading: false 
      });
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false 
      });
    }
  },
  
  verifyMFA: async (code) => {
    try {
      set({ loading: true, error: null });
      await apiClient.mfa.verify(code);
      
      // After successful MFA verification, refresh the user data
      const response = await apiClient.auth.refreshToken();
      
      set({ 
        user: response.user, 
        isAuthenticated: true, 
        mfaRequired: false,
        loading: false 
      });
      
      toast({
        title: "Verification successful",
        description: "MFA verification completed successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify MFA code';
      set({ error: errorMessage, loading: false });
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: errorMessage,
      });
    }
  },
  
  forgotPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      await apiClient.auth.forgotPassword(email);
      
      set({ loading: false });
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for instructions to reset your password.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send password reset email';
      set({ error: errorMessage, loading: false });
      toast({
        variant: "destructive",
        title: "Request failed",
        description: errorMessage,
      });
    }
  },
  
  resetPassword: async (data) => {
    try {
      set({ loading: true, error: null });
      await apiClient.auth.resetPassword(data);
      
      set({ loading: false });
      
      toast({
        title: "Password reset successful",
        description: "Your password has been reset successfully. You can now login with your new password.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      set({ error: errorMessage, loading: false });
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: errorMessage,
      });
    }
  },
  
  clearError: () => set({ error: null }),
}));

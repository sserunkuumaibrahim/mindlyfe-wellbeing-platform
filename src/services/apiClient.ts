
import { AuthResponse, LoginDTO, RegisterDTO, ResetPasswordDTO, MfaSetupResponse, MfaStatus } from '@/types/auth';
import { TherapySession } from '@/types/session';
import { User } from '@/types/user';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.mindlyfe.org';

interface ApiError extends Error {
  statusCode?: number;
  details?: Record<string, unknown>;
}

const createApiError = (message: string, statusCode?: number, details?: Record<string, unknown>): ApiError => {
  const error = new Error(message) as ApiError;
  if (statusCode) error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  
  if (!response.ok) {
    throw createApiError(
      data.message || 'An unexpected error occurred',
      response.status,
      data.details
    );
  }
  
  return data as T;
};

const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

const apiRequest = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: unknown
): Promise<T> => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};

const storeAuthData = (response: AuthResponse) => {
  localStorage.setItem('token', response.token);
  localStorage.setItem('refreshToken', response.refreshToken);
};

export { apiRequest };

export const apiClient = {
  // Auth
  auth: {
    login: async (data: LoginDTO): Promise<AuthResponse> => {
      const response = await apiRequest<AuthResponse>('/auth/login', 'POST', data);
      
      // Only store tokens if MFA is not required
      if (!response.mfaRequired) {
        storeAuthData(response);
      }
      
      return response;
    },
    
    register: async (data: RegisterDTO): Promise<AuthResponse> => {
      const response = await apiRequest<AuthResponse>('/auth/register', 'POST', data);
      storeAuthData(response);
      return response;
    },
    
    logout: async (): Promise<void> => {
      await apiRequest<void>('/auth/logout', 'POST');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    
    refreshToken: async (): Promise<AuthResponse> => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiRequest<AuthResponse>('/auth/refresh', 'POST', { refreshToken });
      storeAuthData(response);
      return response;
    },
    
    forgotPassword: async (email: string): Promise<void> => {
      await apiRequest<void>('/auth/forgot-password', 'POST', { email });
    },
    
    resetPassword: async (data: ResetPasswordDTO): Promise<void> => {
      await apiRequest<void>('/auth/reset-password', 'POST', data);
    },
  },
  
  // MFA
  mfa: {
    enable: async (): Promise<MfaSetupResponse> => {
      return apiRequest<MfaSetupResponse>('/mfa/enable', 'POST');
    },
    
    verify: async (code: string): Promise<void> => {
      await apiRequest<void>('/mfa/verify', 'POST', { code });
    },
    
    disable: async (code: string): Promise<void> => {
      await apiRequest<void>('/mfa/disable', 'POST', { code });
    },
    
    status: async (): Promise<MfaStatus> => {
      return apiRequest<MfaStatus>('/mfa/status', 'GET');
    },
  },
  
  // Sessions
  sessions: {
    list: async (): Promise<TherapySession[]> => {
      return apiRequest<TherapySession[]>('/sessions', 'GET');
    },
    
    terminate: async (sessionId: string): Promise<void> => {
      await apiRequest<void>(`/sessions/${sessionId}`, 'DELETE');
    },
    
    terminateAll: async (): Promise<void> => {
      await apiRequest<void>('/sessions', 'DELETE');
    },
  },
  
  // User
  user: {
    profile: async (): Promise<User> => {
      return apiRequest<User>('/user/profile', 'GET');
    },
    
    updateProfile: async (data: Partial<User>): Promise<User> => {
      return apiRequest<User>('/user/profile', 'PATCH', data);
    },
    
    changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<void> => {
      await apiRequest<void>('/user/change-password', 'POST', data);
    },
  },
};

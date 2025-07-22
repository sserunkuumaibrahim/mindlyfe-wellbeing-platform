import { AuthResponse, LoginDTO, RegisterDTO, ResetPasswordDTO, MfaSetupResponse, MfaStatus } from '@/types/auth';
import { TherapySession } from '@/types/session';
import { User } from '@/types/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Enhanced request cache and throttling with circuit breaker
const requestCache = new Map<string, { data: any; timestamp: number }>();
const pendingRequests = new Map<string, Promise<any>>();
const requestTimestamps = new Map<string, number[]>();
const failureCount = new Map<string, number>();
const circuitState = new Map<string, 'CLOSED' | 'OPEN' | 'HALF_OPEN'>();
const lastFailureTime = new Map<string, number>();

const CACHE_DURATION = 60000; // 60 seconds cache for better performance
const MAX_RETRIES = 2; // Reduced retries to prevent hammering
const RATE_LIMIT_WINDOW = 5000; // 5 seconds
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 requests per 5 seconds per endpoint
const CIRCUIT_BREAKER_THRESHOLD = 3; // Open circuit after 3 failures
const CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 seconds before trying again

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
  
  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

const apiRequest = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: unknown,
  retryCount: number = 0
): Promise<T> => {
  // Create cache key
  const cacheKey = method === 'GET' ? `${method}:${endpoint}` : null;
  
  // Circuit breaker check
  const circuitKey = endpoint;
  const currentState = circuitState.get(circuitKey) || 'CLOSED';
  const failures = failureCount.get(circuitKey) || 0;
  const lastFailure = lastFailureTime.get(circuitKey) || 0;
  const now = Date.now();
  
  if (currentState === 'OPEN') {
    if (now - lastFailure < CIRCUIT_BREAKER_TIMEOUT) {
      throw createApiError('Service temporarily unavailable. Please try again later.', 503);
    } else {
      // Move to half-open state
      circuitState.set(circuitKey, 'HALF_OPEN');
    }
  }
  
  // Rate limiting check - more aggressive
  const timestamps = requestTimestamps.get(endpoint) || [];
  const recentRequests = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    console.warn(`Rate limit exceeded for ${endpoint}. Requests: ${recentRequests.length}/${MAX_REQUESTS_PER_WINDOW}`);
    throw createApiError('Too many requests. Please wait before trying again.', 429);
  }
  
  // Update request timestamps
  recentRequests.push(now);
  requestTimestamps.set(endpoint, recentRequests);
  
  // Check cache for GET requests - extended cache duration
  if (cacheKey && requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Cache hit for ${endpoint}`);
      return cached.data;
    }
    requestCache.delete(cacheKey);
  }

  // Check if there's already a pending request for this endpoint
  if (cacheKey && pendingRequests.has(cacheKey)) {
    console.log(`Reusing pending request for ${endpoint}`);
    return pendingRequests.get(cacheKey);
  }

  const makeRequest = async (): Promise<T> => {
    try {
      console.log(`Making API request: ${method} ${endpoint}`);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      
      // Handle 401 Unauthorized - clear tokens and redirect to login
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        throw createApiError('Authentication required', 401);
      }

      const result = await handleResponse<T>(response);
      
      // Reset circuit breaker on success
      if (currentState !== 'CLOSED') {
        circuitState.set(circuitKey, 'CLOSED');
        failureCount.set(circuitKey, 0);
        console.log(`Circuit breaker reset for ${endpoint}`);
      }
      
      // Cache successful GET requests
      if (cacheKey && method === 'GET') {
        requestCache.set(cacheKey, { data: result, timestamp: Date.now() });
        console.log(`Cached response for ${endpoint}`);
      }
      
      return result;
    } catch (error) {
      // Track failures for circuit breaker
      const newFailures = failures + 1;
      failureCount.set(circuitKey, newFailures);
      lastFailureTime.set(circuitKey, Date.now());
      
      if (newFailures >= CIRCUIT_BREAKER_THRESHOLD) {
        circuitState.set(circuitKey, 'OPEN');
        console.warn(`Circuit breaker opened for ${endpoint} after ${newFailures} failures`);
      }
      
      // Handle network errors with exponential backoff retry (but only for non-circuit breaker cases)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        if (retryCount < MAX_RETRIES && currentState !== 'OPEN') {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s
          console.warn(`Retrying ${endpoint} in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return apiRequest<T>(endpoint, method, data, retryCount + 1);
        }
        throw createApiError('Network error: Unable to connect to server', 0);
      }
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    } finally {
      // Remove from pending requests
      if (cacheKey) {
        pendingRequests.delete(cacheKey);
      }
    }
  };

  const requestPromise = makeRequest();
  
  // Store pending request to prevent duplicates
  if (cacheKey) {
    pendingRequests.set(cacheKey, requestPromise);
  }
  
  return requestPromise;
};

const storeAuthData = (response: AuthResponse) => {
  localStorage.setItem('access_token', response.access_token);
  localStorage.setItem('refresh_token', response.refresh_token);
};

export { apiRequest };

// Utility functions for debugging and cache management
export const clearApiCache = () => {
  requestCache.clear();
  pendingRequests.clear();
  requestTimestamps.clear();
  failureCount.clear();
  circuitState.clear();
  lastFailureTime.clear();
  console.log('API cache and throttling state cleared');
};

export const getApiCacheStats = () => {
  return {
    cacheSize: requestCache.size,
    pendingRequests: pendingRequests.size,
    circuitStates: Object.fromEntries(circuitState),
    failureCounts: Object.fromEntries(failureCount)
  };
};

export const apiClient = {
  // Auth
  auth: {
    login: async (data: LoginDTO): Promise<AuthResponse> => {
      const response = await apiRequest<AuthResponse>('/auth/signin', 'POST', data);
      
      // Only store tokens if MFA is not required
      if (!response.mfaRequired) {
        storeAuthData(response);
      }
      
      return response;
    },
    
    register: async (data: RegisterDTO): Promise<AuthResponse> => {
      const response = await apiRequest<AuthResponse>('/auth/signup', 'POST', data);
      storeAuthData(response);
      return response;
    },
    
    logout: async (): Promise<void> => {
      await apiRequest<void>('/auth/signout', 'POST');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
    
    refreshToken: async (): Promise<AuthResponse> => {
      const refreshToken = localStorage.getItem('refresh_token');
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
      return apiRequest<User>('/profiles', 'GET');
    },
    
    updateProfile: async (data: Partial<User>): Promise<User> => {
      return apiRequest<User>('/profiles', 'PATCH', data);
    },
    
    changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<void> => {
      await apiRequest<void>('/auth/change-password', 'POST', data);
    },
  },
};

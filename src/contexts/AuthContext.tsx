import React, { createContext, useEffect, useState, useCallback } from 'react';
import { toast } from '@/lib/toast';
import { postgresClient as postgresqlClient, type AuthUser, type AuthSession, type ApiResponse } from '@/integrations/postgresql/client';
import { UserRole } from '@/types/user';
import { ExtendedAuthUser } from '@/types/auth';

// Define AuthContextType here to avoid circular dependencies
export interface AuthContextType {
  user: ExtendedAuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, userData?: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resetPasswordComplete: (token: string, newPassword: string) => Promise<void>;
  confirmEmail: (token: string) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUserProfile: (profileData: Record<string, unknown>) => Promise<void>;
}

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signIn: async () => { throw new Error('AuthContext not initialized') },
  signUp: async () => { throw new Error('AuthContext not initialized') },
  signOut: async () => { throw new Error('AuthContext not initialized') },
  resetPassword: async () => { throw new Error('AuthContext not initialized') },
  resetPasswordComplete: async () => { throw new Error('AuthContext not initialized') },
  confirmEmail: async () => { throw new Error('AuthContext not initialized') },
  refreshSession: async () => { throw new Error('AuthContext not initialized'); return false },
  updateUserProfile: async () => { throw new Error('AuthContext not initialized') },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedAuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch user profile with additional role-specific data
  const fetchUserProfile = useCallback(async () => {
    try {
      const profileResult = await postgresqlClient.getProfile();
      
      if (profileResult.error) {
        console.error('Error fetching user profile:', profileResult.error);
        return null;
      }
      
      if (profileResult.data) {
        const currentSession = postgresqlClient.getCurrentSession();
        if (!currentSession) return null;
        
        // Ensure we have a valid role from the user data
        const userRole = currentSession.user.role as UserRole;
        if (!userRole) {
          console.error('User role is missing in session data');
          return null;
        }
        
        // Combine session user with profile data
        const userWithRole: ExtendedAuthUser = {
          ...currentSession.user,
          role: userRole,
          // Add any additional profile data here
          ...(typeof profileResult.data === 'object' ? profileResult.data : {})
        };
        
        return userWithRole;
      }
      
      return null;
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  }, []);

  // Initialize auth state from stored session
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have a current session
      const currentSession = postgresqlClient.getCurrentSession();
      
      if (currentSession?.user) {
        // Validate that the user has a role
        if (!currentSession.user.role) {
          console.error('User role is missing in session data');
          setUser(null);
          setSession(null);
          postgresqlClient.signOut();
          return;
        }
        
        // Try to get additional profile data
        const userProfile = await fetchUserProfile();
        
        if (userProfile) {
          setUser(userProfile);
        } else {
          // Fall back to session user if profile fetch fails
          setUser({
            ...currentSession.user,
            role: currentSession.user.role as UserRole
          });
        }
        
        setSession(currentSession);
      } else {
        // No valid session found
        setUser(null);
        setSession(null);
        
        // Try to refresh token if refresh token exists
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const refreshResult = await postgresqlClient.refreshAccessToken();
            if (refreshResult.data) {
              // Successfully refreshed token
              // Validate that the user has a role
              if (!refreshResult.data.user.role) {
                console.error('User role is missing in refreshed session data');
                postgresqlClient.signOut();
                return;
              }
              
              const userProfile = await fetchUserProfile();
              
              if (userProfile) {
                setUser(userProfile);
              } else {
                setUser({
                  ...refreshResult.data.user,
                  role: refreshResult.data.user.role as UserRole
                });
              }
              
              setSession(refreshResult.data);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear any invalid tokens
            postgresqlClient.signOut();
          }
        }
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
      setError(err instanceof Error ? err.message : 'Authentication initialization failed');
      // Clear any invalid tokens on error
      postgresqlClient.signOut();
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [fetchUserProfile]);

  // Initialize auth on component mount
  useEffect(() => {
    initializeAuth();
    
    // Set up a timer to check token expiration periodically
    const tokenCheckInterval = setInterval(() => {
      const currentSession = postgresqlClient.getCurrentSession();
      
      // If session is about to expire (within 5 minutes), try to refresh it
      if (currentSession && currentSession.expires_at) {
        const expiresInMs = currentSession.expires_at - Date.now();
        if (expiresInMs < 300000) { // 5 minutes in milliseconds
          console.log('Token about to expire, refreshing...');
          // Use the client directly to avoid circular dependency
          postgresqlClient.refreshAccessToken().then(async (result) => {
            if (result.data) {
              // Get additional profile data
              const userProfile = await fetchUserProfile();
              
              if (userProfile) {
                setUser(userProfile);
              } else {
                setUser({
                  id: result.data.user.id,
                  email: result.data.user.email,
                  email_confirmed: result.data.user.email_confirmed,
                  first_name: result.data.user.first_name,
                  last_name: result.data.user.last_name,
                  created_at: result.data.user.created_at,
                  updated_at: result.data.user.updated_at,
                  role: result.data.user.role as UserRole,
                  last_login_at: result.data.user.last_login_at
                });
              }
              
              setSession(result.data);
            }
          }).catch(err => {
            console.error('Failed to refresh token:', err);
          });
        }
      }
      
      // If session is expired and we have a user, update state
      if (!currentSession && user) {
        console.log('Session expired, updating state');
        setUser(null);
        setSession(null);
      }
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [initializeAuth, user, fetchUserProfile]);

  // Handle API errors with standardized approach
  const handleApiError = (result: ApiResponse<unknown>, defaultMessage: string): string => {
    if (result.error) {
      if (result.code === 'VALIDATION_ERROR' && result.details?.fields) {
        // Format validation errors
        const fields = result.details.fields as string[];
        return `Validation error in fields: ${fields.join(', ')}`;
      } else if (result.code) {
        return `${result.error} (${result.code})`;
      } else {
        return result.error;
      }
    }
    return defaultMessage;
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await postgresqlClient.signIn(email, password);
      
      if (result.data && result.data.user) {
        // Validate that the user has a role
        if (!result.data.user.role) {
          const errorMessage = 'User role is missing in authentication response';
          console.error(errorMessage);
          setError(errorMessage);
          toast({
            title: "Login failed",
            description: "Authentication error: missing user role. Please contact support.",
            variant: "destructive",
          });
          throw new Error(errorMessage);
        }
        
        // Get additional profile data
        const userProfile = await fetchUserProfile();
        
        if (userProfile) {
          setUser(userProfile);
        } else {
          setUser({
            id: result.data.user.id,
            email: result.data.user.email,
            email_confirmed: result.data.user.email_confirmed,
            first_name: result.data.user.first_name,
            last_name: result.data.user.last_name,
            created_at: result.data.user.created_at,
            updated_at: result.data.user.updated_at,
            role: result.data.user.role as UserRole,
            last_login_at: result.data.user.last_login_at
          });
        }
        
        setSession(result.data);
        toast({
          title: "Login successful",
          description: `Welcome back, ${result.data.user.first_name}!`,
        });
      } else if (result.error) {
        const errorMessage = handleApiError(result, 'Sign in failed');
        setError(errorMessage);
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      } else {
        // No data and no error - unexpected response
        const errorMessage = 'Unexpected authentication response';
        setError(errorMessage);
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: UserRole, userData?: Record<string, unknown>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate role
      if (!role) {
        const errorMessage = 'User role is required for registration';
        setError(errorMessage);
        toast({
          title: "Registration failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }
      
      // Combine role with user data
      const metadata = {
        role,
        ...userData
      };
      
      const result = await postgresqlClient.signUp(email, password, metadata);
      
      if (result.data && result.data.user) {
        // Validate that the user has a role in the response
        if (!result.data.user.role) {
          const errorMessage = 'User role is missing in registration response';
          console.error(errorMessage);
          setError(errorMessage);
          toast({
            title: "Registration failed",
            description: "Authentication error: missing user role. Please contact support.",
            variant: "destructive",
          });
          throw new Error(errorMessage);
        }
        
        setUser({
          id: result.data.user.id,
          email: result.data.user.email,
          email_confirmed: result.data.user.email_confirmed,
          first_name: result.data.user.first_name,
          last_name: result.data.user.last_name,
          created_at: result.data.user.created_at,
          updated_at: result.data.user.updated_at,
          role: result.data.user.role as UserRole,
          last_login_at: result.data.user.last_login_at
        });
        setSession(result.data);
        toast({
          title: "Registration successful",
          description: "Your account has been created successfully.",
        });
      } else if (result.error) {
        const errorMessage = handleApiError(result, 'Registration failed');
        setError(errorMessage);
        toast({
          title: "Registration failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      } else {
        // No data and no error - unexpected response
        const errorMessage = 'Unexpected registration response';
        setError(errorMessage);
        toast({
          title: "Registration failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      await postgresqlClient.signOut();
      
      setUser(null);
      setSession(null);
      setError(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "There was a problem signing out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await postgresqlClient.resetPassword(email);
      
      if (result.error) {
        const errorMessage = handleApiError(result, 'Password reset failed');
        setError(errorMessage);
        toast({
          title: "Password reset failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }
      
      toast({
        title: "Password reset email sent",
        description: "If an account exists with this email, you will receive password reset instructions.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordComplete = async (token: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await postgresqlClient.resetPasswordComplete(token, newPassword);
      
      if (result.error) {
        const errorMessage = handleApiError(result, 'Password reset failed');
        setError(errorMessage);
        toast({
          title: "Password reset failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }
      
      toast({
        title: "Password reset successful",
        description: "Your password has been reset successfully. You can now log in with your new password.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmEmail = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await postgresqlClient.confirmEmail(token);
      
      if (result.error) {
        const errorMessage = handleApiError(result, 'Email confirmation failed');
        setError(errorMessage);
        toast({
          title: "Email confirmation failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }
      
      // Update user state if logged in
      if (user) {
        setUser({
          ...user,
          email_confirmed: true
        });
      }
      
      toast({
        title: "Email confirmed",
        description: "Your email has been confirmed successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email confirmation failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await postgresqlClient.refreshAccessToken();
      
      if (result.data) {
        // Validate that the user has a role
        if (!result.data.user.role) {
          console.error('User role is missing in refreshed session data');
          setError('Invalid user data: missing role');
          setUser(null);
          setSession(null);
          postgresqlClient.signOut();
          return false;
        }
        
        // Get additional profile data
        const userProfile = await fetchUserProfile();
        
        if (userProfile) {
          setUser(userProfile);
        } else {
          setUser({
            id: result.data.user.id,
            email: result.data.user.email,
            email_confirmed: result.data.user.email_confirmed,
            first_name: result.data.user.first_name,
            last_name: result.data.user.last_name,
            created_at: result.data.user.created_at,
            updated_at: result.data.user.updated_at,
            role: result.data.user.role as UserRole,
            last_login_at: result.data.user.last_login_at
          });
        }
        
        setSession(result.data);
        return true;
      } else if (result.error) {
        // Refresh failed with specific error
        console.error('Token refresh failed:', result.error);
        setError(`Session refresh failed: ${result.error}`);
        setUser(null);
        setSession(null);
        postgresqlClient.signOut();
        return false;
      } else {
        // Refresh failed without specific error
        console.error('Token refresh failed without error message');
        setError('Session expired. Please log in again.');
        setUser(null);
        setSession(null);
        postgresqlClient.signOut();
        return false;
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error refreshing session';
      setError(errorMessage);
      setUser(null);
      setSession(null);
      postgresqlClient.signOut();
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData: Record<string, unknown>) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await postgresqlClient.updateProfile(profileData);
      
      if (result.error) {
        const errorMessage = handleApiError(result, 'Profile update failed');
        setError(errorMessage);
        toast({
          title: "Profile update failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }
      
      // Refresh user data
      const userProfile = await fetchUserProfile();
      
      if (userProfile) {
        setUser(userProfile);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resetPasswordComplete,
    confirmEmail,
    refreshSession,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
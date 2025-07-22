
import { useContext, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';
import { toast } from '@/lib/toast';

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Set auth ready state once loading is complete
  useEffect(() => {
    if (!context.loading && !isAuthReady) {
      setIsAuthReady(true);
    }
  }, [context.loading, isAuthReady]);
  
  // Check if session is valid and redirect to login if not
  const checkAuthAndRedirect = useCallback(async (redirectPath: string = '/login') => {
    // If still loading, wait for it to complete
    if (context.loading) {
      return true;
    }
    
    // If no session, try to refresh
    if (!context.session) {
      try {
        const refreshed = await context.refreshSession();
        if (!refreshed) {
          // If refresh failed, redirect to login
          navigate(redirectPath);
          return false;
        }
      } catch (error) {
        console.error('Session refresh error:', error);
        navigate(redirectPath);
        return false;
      }
    }
    
    // Verify that user has a valid role
    if (context.user && !context.user.role) {
      toast({
        title: "Authentication Error",
        description: "User role is missing. Please log in again.",
        variant: "destructive",
      });
      await context.signOut();
      navigate(redirectPath);
      return false;
    }
    
    return true;
  }, [context, navigate]);
  
  // Redirect based on user role
  const redirectBasedOnRole = useCallback(() => {
    if (!context.user || context.loading) return;
    
    const role = context.user.role;
    
    switch (role) {
      case 'individual':
        navigate('/dashboard');
        break;
      case 'therapist':
        navigate('/therapist/dashboard');
        break;
      case 'org_admin':
        navigate('/organization/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        // If role is invalid, redirect to login
        toast({
          title: "Invalid Role",
          description: "Your user role is not recognized. Please contact support.",
          variant: "destructive",
        });
        context.signOut().then(() => navigate('/login'));
    }
  }, [context, navigate]);
  
  // Check if user has required role
  const hasRole = useCallback((requiredRoles: UserRole | UserRole[]) => {
    if (!context.user) return false;
    
    const userRole = context.user.role;
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(userRole);
    }
    
    return userRole === requiredRoles;
  }, [context.user]);
  
  // Check if user is authenticated with valid role
  const isAuthenticated = !!context.user && !!context.session && !!context.user.role;
  
  // Get user role safely
  const getUserRole = useCallback((): UserRole | null => {
    return context.user?.role || null;
  }, [context.user]);
  
  // Handle authentication errors
  const handleAuthError = useCallback((error: unknown): string => {
    const errorMessage = error instanceof Error ? error.message : 'Authentication error occurred';
    
    toast({
      title: "Authentication Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    return errorMessage;
  }, []);
  
  return {
    ...context,
    checkAuthAndRedirect,
    redirectBasedOnRole,
    hasRole,
    isAuthenticated,
    getUserRole,
    handleAuthError,
    isAuthReady,
  };
};

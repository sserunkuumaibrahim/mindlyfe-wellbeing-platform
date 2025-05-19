
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, mfaRequired, refreshToken, loading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated && !loading) {
        try {
          await refreshToken();
        } catch (error) {
          // Token refresh failed, user will be redirected
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, refreshToken, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (mfaRequired) {
    // Redirect to MFA verification page
    return <Navigate to="/mfa/verify" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import MfaVerify from "./pages/auth/MfaVerify";
import MfaSetup from "./pages/auth/MfaSetup";

// App Pages - Use the real dashboard from pages/dashboard/index.tsx
import Dashboard from "./pages/dashboard/index";

// Custom Redirect component for "/" route
function RootRedirect() {
  const { isAuthenticated, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return; // Wait for auth to resolve
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, navigate, location, loading]);

  // Loading spinner until redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status on app load
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Root route always redirects depending on auth */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* MFA routes */}
            <Route path="/mfa/verify" element={<MfaVerify />} />
            <Route
              path="/mfa/setup"
              element={
                <ProtectedRoute>
                  <MfaSetup />
                </ProtectedRoute>
              }
            />

            {/* Main dashboard - using the real database-connected dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Catch-all Route - redirect to dashboard or login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

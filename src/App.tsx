import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import MfaVerify from "./pages/auth/MfaVerify";
import MfaSetup from "./pages/auth/MfaSetup";

// App Pages
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Schedule from "./pages/Schedule";
import SidebarNav from "./components/schedule/SidebarNav";

import { useAuthStore } from "@/stores/useAuthStore";

// Custom Redirect component for "/" route
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

  // Optional: loading spinner until redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

// New pages
import TherapistMatchingPage from "@/pages/TherapistMatching";
import ProgressTrackingPage from "@/pages/ProgressTracking";
import AiAssistantPage from "@/pages/AI_Assistant";
import LifestyleManagementPage from "@/pages/LifestyleManagement";
import AdminDashboardPage from "@/pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Root route always redirects depending on auth */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/schedule" element={<Schedule />} />
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

          {/* Main navigation pages */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/assessment" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
          <Route path="/progress-tracking" element={<ProtectedRoute><ProgressTrackingPage /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
          <Route path="/therapist-matching" element={<ProtectedRoute><TherapistMatchingPage /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
          <Route path="/tools" element={<ProtectedRoute><ToolsPage /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
          <Route path="/wellness" element={<ProtectedRoute><WellnessPage /></ProtectedRoute>} />
          <Route path="/crisis" element={<ProtectedRoute><CrisisPage /></ProtectedRoute>} />
          <Route path="/lifestyle" element={<ProtectedRoute><LifestylePage /></ProtectedRoute>} />
          <Route path="/lifestyle-management" element={<ProtectedRoute><LifestyleManagementPage /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AiPage /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistantPage /></ProtectedRoute>} />
          <Route path="/personalization" element={<ProtectedRoute><PersonalizationPage /></ProtectedRoute>} />
          <Route path="/gamification" element={<ProtectedRoute><GamificationPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />

          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

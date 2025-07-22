
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import MfaVerify from "./pages/auth/MfaVerify";
import MfaSetup from "./pages/auth/MfaSetup";

// App Pages
import Dashboard from "./pages/dashboard/index";
import Sessions from "./pages/sessions/index";
import Messages from "./pages/messages/index";
import Availability from "./pages/availability/index";
import Settings from "./pages/settings/index";
import Notifications from "./pages/notifications/index";
import Billing from "./pages/billing/index";
import BookSession from "./components/booking/BookingSystem";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              {/* Public routes */}
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

              {/* Protected routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
              <Route path="/book-session" element={<ProtectedRoute><BookSession /></ProtectedRoute>} />
              <Route path="/booking" element={<ProtectedRoute><BookSession /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/availability" element={<ProtectedRoute><Availability /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
              <Route path="/workshops" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/resources" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/clients" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/earnings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/session-notes" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/team" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/team/invite" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

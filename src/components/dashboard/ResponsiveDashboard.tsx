
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UnifiedDashboard } from './UnifiedDashboard';
import { OrganizationDashboard } from './OrganizationDashboard';
import { AdminDashboard } from './AdminDashboard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const ResponsiveDashboard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Use unified responsive dashboard for individuals and therapists
  switch (user?.role) {
    case 'individual':
    case 'therapist':
      return <UnifiedDashboard />;
    case 'org_admin':
      return <OrganizationDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <UnifiedDashboard />;
  }
};


import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileDashboard } from './MobileDashboard';
import { IndividualDashboard } from './IndividualDashboard';
import { TherapistDashboard } from './TherapistDashboard';
import { OrganizationDashboard } from './OrganizationDashboard';
import { AdminDashboard } from './AdminDashboard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const ResponsiveDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Use mobile dashboard for mobile devices
  if (isMobile) {
    return <MobileDashboard />;
  }

  // Desktop dashboard based on user role
  switch (user?.role) {
    case 'individual':
      return <IndividualDashboard />;
    case 'therapist':
      return <TherapistDashboard />;
    case 'org_admin':
      return <OrganizationDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <IndividualDashboard />;
  }
};

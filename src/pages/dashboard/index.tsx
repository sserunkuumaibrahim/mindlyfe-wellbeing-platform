
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { IndividualDashboard } from '@/components/dashboard/IndividualDashboard';
import { TherapistDashboard } from '@/components/dashboard/TherapistDashboard';
import { OrganizationDashboard } from '@/components/dashboard/OrganizationDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access the dashboard.</p>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'individual':
        return <IndividualDashboard />;
      case 'therapist':
        return <TherapistDashboard />;
      case 'org_admin':
        return <OrganizationDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <p>Unknown user role: {user.role}</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}

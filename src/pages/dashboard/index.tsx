
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { IndividualDashboard } from '@/components/dashboard/IndividualDashboard';
import { TherapistDashboard } from '@/components/dashboard/TherapistDashboard';
import { OrganizationDashboard } from '@/components/dashboard/OrganizationDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();

  if (!profile) return null;

  const renderDashboard = () => {
    switch (profile.role) {
      case 'individual':
        return <IndividualDashboard />;
      case 'therapist':
        return <TherapistDashboard />;
      case 'org_admin':
        return <OrganizationDashboard />;
      case 'sys_admin':
      case 'super_admin':
        return <AdminDashboard />;
      default:
        return <IndividualDashboard />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Dashboard;

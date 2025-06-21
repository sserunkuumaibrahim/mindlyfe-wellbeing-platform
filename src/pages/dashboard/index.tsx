
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { IndividualDashboard } from '@/components/dashboard/IndividualDashboard';
import { TherapistDashboard } from '@/components/dashboard/TherapistDashboard';
import { OrganizationDashboard } from '@/components/dashboard/OrganizationDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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

  // Render appropriate dashboard based on user role
  if (user.role === 'individual') {
    return <IndividualDashboard />;
  } else if (user.role === 'therapist') {
    return <TherapistDashboard />;
  } else if (user.role === 'org_admin') {
    return <OrganizationDashboard />;
  } else if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Unknown user role: {user.role}</p>
    </div>
  );
}

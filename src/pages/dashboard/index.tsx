
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ResponsiveDashboard } from '@/components/dashboard/ResponsiveDashboard';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

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

  // For mobile, render dashboard without the sidebar layout
  if (isMobile) {
    return <ResponsiveDashboard />;
  }

  // For desktop, use the full dashboard layout
  return (
    <DashboardLayout>
      <ResponsiveDashboard />
    </DashboardLayout>
  );
}

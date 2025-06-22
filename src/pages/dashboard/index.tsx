
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#e3f1fa] via-[#f5fafe] to-[#fff]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#e3f1fa] via-[#f5fafe] to-[#fff]">
        <p>Authentication required. Please refresh the page.</p>
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

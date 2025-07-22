import { useAuth } from '@/hooks/useAuth';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { TherapistDashboard } from '@/components/dashboard/TherapistDashboard';
import { IndividualDashboard } from '@/components/dashboard/IndividualDashboard';

export const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'therapist':
      return <TherapistDashboard />;
    case 'individual':
      return <IndividualDashboard />;
    default:
      return <div>Unknown user role</div>;
  }
};

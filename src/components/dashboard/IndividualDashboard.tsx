import { useEffect, useState } from 'react';
import { apiRequest } from '@/services/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const IndividualDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user) {
        setLoading(true);
        try {
          const data = await apiRequest(`/api/users/${user.id}/dashboard`);
          setDashboardData(data);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Individual Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData?.sessions?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Therapists</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData?.therapists?.length || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
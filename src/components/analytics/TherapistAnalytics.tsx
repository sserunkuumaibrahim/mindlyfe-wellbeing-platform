
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { feedbackService } from '@/services/feedbackService';

export const TherapistAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    averageRating: 0,
    monthlyData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        // Fetch session statistics
        const { data: sessions, error } = await supabase
          .from('therapy_sessions')
          .select('status, scheduled_at')
          .eq('therapist_id', user.id);

        if (error) throw error;

        const totalSessions = sessions?.length || 0;
        const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;
        const cancelledSessions = sessions?.filter(s => s.status === 'cancelled').length || 0;

        // Get average rating
        const averageRating = await feedbackService.getAverageRating(user.id);

        // Calculate monthly data
        const monthlyMap = new Map();
        sessions?.forEach(session => {
          const month = new Date(session.scheduled_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
        });

        const monthlyData = Array.from(monthlyMap.entries()).map(([month, count]) => ({
          month,
          sessions: count,
        }));

        setAnalytics({
          totalSessions,
          completedSessions,
          cancelledSessions,
          averageRating,
          monthlyData,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.completedSessions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics.cancelledSessions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {analytics.averageRating.toFixed(1)} ⭐
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessions Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, MessageSquare, Star, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useOptimizedSessions } from '@/hooks/useOptimizedSessions';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const TherapistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions: allSessions, loading } = useOptimizedSessions();
  const [dashboardStats, setDashboardStats] = useState({
    activeClientsCount: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    reviewsCount: 0,
    todaySessionsCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Filter today's sessions efficiently
  const todaySessions = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return allSessions.filter(session => {
      const sessionDate = new Date(session.scheduled_at);
      return sessionDate >= today && sessionDate < tomorrow && session.status === 'scheduled';
    });
  }, [allSessions]);

  const upcomingSessions = React.useMemo(() => 
    allSessions
      .filter(session => session.status === 'scheduled' && new Date(session.scheduled_at) > new Date())
      .slice(0, 5)
  , [allSessions]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);
        
        // Fetch stats in parallel for better performance
        const [clientsResponse, earningsResponse, feedbackResponse] = await Promise.all([
          // Active clients (last 30 days)
          supabase
            .from('therapy_sessions')
            .select('client_id')
            .eq('therapist_id', user.id)
            .gte('scheduled_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          
          // Monthly earnings
          supabase
            .from('therapy_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('therapist_id', user.id)
            .eq('status', 'completed')
            .gte('scheduled_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
          
          // Feedback and ratings
          supabase
            .from('session_feedback')
            .select('rating')
            .eq('therapist_id', user.id)
        ]);

        // Process active clients
        const uniqueClients = new Set(clientsResponse.data?.map(session => session.client_id) || []);
        
        // Calculate earnings
        const monthlyEarnings = (earningsResponse.count || 0) * 76000;
        
        // Calculate average rating
        const ratings = feedbackResponse.data?.map(f => f.rating).filter(Boolean) || [];
        const averageRating = ratings.length > 0 
          ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10 
          : 0;

        setDashboardStats({
          activeClientsCount: uniqueClients.size,
          monthlyEarnings,
          averageRating,
          reviewsCount: ratings.length,
          todaySessionsCount: todaySessions.length
        });

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user, todaySessions.length]);

  const formatSessionTime = (scheduledAt: string) => {
    const date = new Date(scheduledAt);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Therapist Dashboard</h1>
          <p className="text-muted-foreground">Manage your practice and track your progress</p>
        </div>
        <Button onClick={() => navigate('/availability')}>
          <Calendar className="h-4 w-4 mr-2" />
          Manage Availability
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.todaySessionsCount}</div>
            <p className="text-xs text-muted-foreground">
              {todaySessions[0] ? `Next at ${formatSessionTime(todaySessions[0].scheduled_at).time}` : 'No sessions today'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeClientsCount}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {dashboardStats.monthlyEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.averageRating || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.reviewsCount > 0 ? `${dashboardStats.reviewsCount} reviews` : 'No reviews yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySessions.length > 0 ? (
                todaySessions.map((session) => {
                  const { time } = formatSessionTime(session.scheduled_at);
                  return (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">
                            {session.client?.first_name} {session.client?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{time}</p>
                        </div>
                        <Badge variant="outline">{session.session_type}</Badge>
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm">Start Session</Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sessions scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/clients')}
              >
                <Users className="h-6 w-6 mb-2" />
                View Clients
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/availability')}
              >
                <Calendar className="h-6 w-6 mb-2" />
                Availability
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/session-notes')}
              >
                <FileText className="h-6 w-6 mb-2" />
                Session Notes
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/earnings')}
              >
                <DollarSign className="h-6 w-6 mb-2" />
                Earnings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sessions Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.slice(0, 3).map((session) => {
                  const { date, time } = formatSessionTime(session.scheduled_at);
                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          {session.client?.first_name} {session.client?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{date} at {time}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{session.session_type}</Badge>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No upcoming sessions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

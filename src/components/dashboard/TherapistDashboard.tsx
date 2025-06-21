
import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, MessageSquare, Star, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const TherapistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions: allSessions, loading } = useSessions();
  const [activeClientsCount, setActiveClientsCount] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [pendingFeedback, setPendingFeedback] = useState(0);

  // Filter today's sessions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todaySessions = allSessions.filter(session => {
    const sessionDate = new Date(session.scheduled_at);
    return sessionDate >= today && sessionDate < tomorrow && session.status === 'scheduled';
  });

  const upcomingSessions = allSessions
    .filter(session => session.status === 'scheduled' && new Date(session.scheduled_at) > new Date())
    .slice(0, 5);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch active clients count (clients with sessions in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: activeClients } = await supabase
          .from('therapy_sessions')
          .select('client_id')
          .eq('therapist_id', user.id)
          .gte('scheduled_at', thirtyDaysAgo.toISOString());
        
        const uniqueClients = new Set(activeClients?.map(session => session.client_id) || []);
        setActiveClientsCount(uniqueClients.size);

        // Fetch completed sessions this month for earnings calculation
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { count: completedCount } = await supabase
          .from('therapy_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('therapist_id', user.id)
          .eq('status', 'completed')
          .gte('scheduled_at', startOfMonth.toISOString());
        
        // Estimate earnings (76,000 UGX per session)
        setMonthlyEarnings((completedCount || 0) * 76000);

        // Fetch ratings from session feedback
        const { data: feedbackData } = await supabase
          .from('session_feedback')
          .select('rating, session_id')
          .eq('therapist_id', user.id)
          .not('rating', 'is', null);
        
        if (feedbackData && feedbackData.length > 0) {
          const ratings = feedbackData.map(f => f.rating).filter(Boolean);
          const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
          setAverageRating(Math.round(average * 10) / 10);
          setReviewsCount(ratings.length);
        }

        // Count sessions without feedback
        const feedbackSessionIds = feedbackData?.map(f => f.session_id) || [];
        const { count: noFeedbackCount } = await supabase
          .from('therapy_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('therapist_id', user.id)
          .eq('status', 'completed')
          .not('id', 'in', `(${feedbackSessionIds.length > 0 ? feedbackSessionIds.map(id => `'${id}'`).join(',') : "''"})`)
          .gte('scheduled_at', thirtyDaysAgo.toISOString());
        
        setPendingFeedback(noFeedbackCount || 0);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatSessionTime = (scheduledAt: string) => {
    const date = new Date(scheduledAt);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

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
            <div className="text-2xl font-bold">{loading ? '...' : todaySessions.length}</div>
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
            <div className="text-2xl font-bold">{loading ? '...' : activeClientsCount}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : `UGX ${monthlyEarnings.toLocaleString()}`}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : averageRating || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {reviewsCount > 0 ? `${reviewsCount} reviews` : 'No reviews yet'}
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
              {loading ? (
                <div className="text-center text-muted-foreground">Loading sessions...</div>
              ) : todaySessions.length > 0 ? (
                todaySessions.map((session) => {
                  const { time } = formatSessionTime(session.scheduled_at);
                  return (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">
                            {session.individual_profile?.first_name} {session.individual_profile?.last_name}
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
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : upcomingSessions.length > 0 ? (
                upcomingSessions.slice(0, 3).map((session) => {
                  const { date, time } = formatSessionTime(session.scheduled_at);
                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          {session.individual_profile?.first_name} {session.individual_profile?.last_name}
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


import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, MessageSquare, Star } from 'lucide-react';
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

  // Filter today's sessions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todaySessions = allSessions.filter(session => {
    const sessionDate = new Date(session.scheduled_at);
    return sessionDate >= today && sessionDate < tomorrow && session.status === 'scheduled';
  });

  useEffect(() => {
    if (!user) return;

    // Fetch active clients count
    const fetchActiveClients = async () => {
      const { count } = await supabase
        .from('therapy_sessions')
        .select('client_id', { count: 'exact', head: true })
        .eq('therapist_id', user.id)
        .eq('status', 'completed')
        .gte('scheduled_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      setActiveClientsCount(count || 0);
    };

    // Fetch monthly earnings (placeholder - would need payment/billing table)
    const fetchMonthlyEarnings = async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count } = await supabase
        .from('therapy_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('therapist_id', user.id)
        .eq('status', 'completed')
        .gte('scheduled_at', startOfMonth.toISOString());
      
      // Assuming $80 per session (would come from actual billing data)
      setMonthlyEarnings((count || 0) * 80);
    };

    // Fetch average rating and reviews count from feedback table
    const fetchRatings = async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('rating')
        .eq('therapist_id', user.id);
      
      if (data && data.length > 0) {
        const ratings = data.map(feedback => feedback.rating).filter(Boolean);
        const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
        setAverageRating(Math.round(average * 10) / 10);
        setReviewsCount(ratings.length);
      }
    };

    fetchActiveClients();
    fetchMonthlyEarnings();
    fetchRatings();
  }, [user]);

  const formatSessionTime = (scheduledAt: string) => {
    const date = new Date(scheduledAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Therapist Dashboard</h1>
        <Button onClick={() => navigate('/dashboard/availability')}>
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
              {todaySessions[0] ? `Next at ${formatSessionTime(todaySessions[0].scheduled_at)}` : 'No sessions today'}
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
            <div className="text-2xl font-bold">{loading ? '...' : `$${monthlyEarnings.toLocaleString()}`}</div>
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
              {reviewsCount > 0 ? `Based on ${reviewsCount} reviews` : 'No reviews yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-muted-foreground">Loading sessions...</div>
            ) : todaySessions.length > 0 ? (
              todaySessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">
                        {session.individual_profile?.first_name} {session.individual_profile?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatSessionTime(session.scheduled_at)}
                      </p>
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
              ))
            ) : (
              <div className="text-center text-muted-foreground">No sessions scheduled for today</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
              onClick={() => navigate('/dashboard/clients')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Manage Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View client profiles, session history, and notes
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/dashboard/earnings')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              View Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your income and payment history
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/dashboard/notes')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Session Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Review and manage session documentation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

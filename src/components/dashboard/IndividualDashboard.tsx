
import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, CreditCard, Star, Clock, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const IndividualDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions: allSessions, loading } = useSessions();
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Filter sessions by status with proper typing
  const upcomingSessions = React.useMemo(() => {
    return allSessions
      .filter(session => 
        session.status === 'scheduled' && new Date(session.scheduled_at) > new Date()
      )
      .slice(0, 5);
  }, [allSessions]);
  
  const recentSessions = React.useMemo(() => {
     return allSessions
       .filter(session => session.status === 'completed')
       .slice(0, 5);
   }, [allSessions]);

  useEffect(() => {
    if (!user) return;

    // Fetch completed sessions count for this month
    const fetchCompletedSessions = async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count } = await supabase
        .from('therapy_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('status', 'completed')
        .gte('scheduled_at', startOfMonth.toISOString());
      
      setCompletedSessionsCount(count || 0);
    };

    // Fetch unread messages count
    const fetchUnreadMessages = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('read', false);
      
      setUnreadMessagesCount(count || 0);
    };

    fetchCompletedSessions();
    fetchUnreadMessages();
  }, [user]);

  const formatSessionDateTime = (scheduledAt: string) => {
    const date = new Date(scheduledAt);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
        <Button onClick={() => navigate('/dashboard/book')}>
          <Calendar className="h-4 w-4 mr-2" />
          Book Session
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingSessions[0] ? `Next: ${formatSessionDateTime(upcomingSessions[0].scheduled_at).date}` : 'No upcoming sessions'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : completedSessionsCount}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : unreadMessagesCount}</div>
            <p className="text-xs text-muted-foreground">
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/dashboard/messages')}>
                View all
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading sessions...</div>
            ) : upcomingSessions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No upcoming sessions. 
                <Button variant="link" onClick={() => navigate('/dashboard/book')} className="p-0 ml-1">
                  Book a session
                </Button>
              </div>
            ) : (
              upcomingSessions.map((session) => {
                const { date, time } = formatSessionDateTime(session.scheduled_at);
                return (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">
                          {session.therapist?.first_name} {session.therapist?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {date} at {time}
                        </p>
                      </div>
                      <Badge variant="outline">{session.session_type}</Badge>
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">Reschedule</Button>
                      <Button size="sm">Join Session</Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading recent sessions...</div>
            ) : recentSessions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No completed sessions yet.
              </div>
            ) : (
              recentSessions.map((session) => {
                const { date } = formatSessionDateTime(session.scheduled_at);
                return (
                  <div key={session.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">
                        {session.therapist?.first_name} {session.therapist?.last_name}
                      </p>
                      <div className="flex items-center space-x-1">
                        {session.rating && [...Array(session.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{date}</p>
                    {session.notes && <p className="text-sm">{session.notes}</p>}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, CreditCard, Star, Clock, Bell, BookOpen, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/services/apiClient';
import { IndividualDashboardData } from '@/types/dashboard';

export const IndividualDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<IndividualDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const upcomingSessions = React.useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.sessions
      .filter(session => 
        session.status === 'scheduled' && new Date(session.scheduled_at) > new Date()
      )
      .slice(0, 5);
  }, [dashboardData]);
  
  const recentSessions = React.useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.sessions
       .filter(session => session.status === 'completed')
       .slice(0, 5);
   }, [dashboardData]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const data = await apiRequest<IndividualDashboardData>(`/api/users/${user.id}/dashboard`);
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
          <div>
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground">Here's what's happening with your mental health journey</p>
          </div>
          <Button onClick={() => navigate('/booking')}>
            <Calendar className="h-4 w-4 mr-2" />
            Book Session
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <div className="text-2xl font-bold">{loading ? '...' : dashboardData?.sessions.filter(s => s.status === 'completed').length}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : 0}</div>
              <p className="text-xs text-muted-foreground">
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/messages')}>
                  View all
                </Button>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workshops</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : 0}</div>
              <p className="text-xs text-muted-foreground">Enrolled</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">Loading sessions...</div>
                ) : upcomingSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No upcoming sessions</p>
                    <p className="text-sm mb-4">Book your first therapy session to get started</p>
                    <Button onClick={() => navigate('/booking')}>
                      Book a Session
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
                  onClick={() => navigate('/booking')}
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  Book Session
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => navigate('/messages')}
                >
                  <MessageSquare className="h-6 w-6 mb-2" />
                  Messages
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => navigate('/workshops')}
                >
                  <Users className="h-6 w-6 mb-2" />
                  Workshops
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => navigate('/resources')}
                >
                  <BookOpen className="h-6 w-6 mb-2" />
                  Resources
                </Button>
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
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No completed sessions yet</p>
                  </div>
                ) : (
                  recentSessions.slice(0, 3).map((session) => {
                    const { date } = formatSessionDateTime(session.scheduled_at);
                    return (
                      <div key={session.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">
                            {session.therapist?.first_name} {session.therapist?.last_name}
                          </p>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{date}</p>
                        {session.notes && (
                          <p className="text-sm bg-muted p-2 rounded">{session.notes}</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
};

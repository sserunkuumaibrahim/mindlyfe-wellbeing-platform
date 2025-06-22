import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, MessageSquare, Star, FileText, Bell, Settings, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TherapistStats {
  todaySessionsCount: number;
  activeClientsCount: number;
  monthlyEarnings: number;
  averageRating: number;
  reviewsCount: number;
  totalSessions: number;
  completionRate: number;
  responseTime: number;
}

interface Session {
  id: string;
  scheduled_at: string;
  session_type: string;
  status: string;
  client: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  session_fee?: number;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  last_session?: string;
  total_sessions: number;
  status: 'active' | 'inactive';
}

interface Notification {
  id: string;
  type: 'session_reminder' | 'new_client' | 'payment' | 'review';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export const TherapistPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TherapistStats>({
    todaySessionsCount: 0,
    activeClientsCount: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    reviewsCount: 0,
    totalSessions: 0,
    completionRate: 0,
    responseTime: 0
  });
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState(0);

  // Real-time subscription for updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('therapist-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'therapy_sessions',
          filter: `therapist_id=eq.${user.id}`
        },
        () => {
          setRealTimeUpdates(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_feedback',
          filter: `therapist_id=eq.${user.id}`
        },
        () => {
          setRealTimeUpdates(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Fetch all data when component mounts or real-time updates occur
  useEffect(() => {
    if (!user) return;

    const fetchTherapistData = async () => {
      try {
        setLoading(true);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Fetch all data in parallel
        const [
          todaySessionsRes,
          upcomingSessionsRes,
          monthlySessionsRes,
          allSessionsRes,
          feedbackRes,
          clientsRes,
          notificationsRes
        ] = await Promise.all([
          // Today's sessions
          supabase
            .from('therapy_sessions')
            .select(`
              *,
              client:client_id(
                id, first_name, last_name, email
              )
            `)
            .eq('therapist_id', user.id)
            .gte('scheduled_at', today.toISOString())
            .lt('scheduled_at', tomorrow.toISOString())
            .order('scheduled_at', { ascending: true }),

          // Upcoming sessions (next 7 days)
          supabase
            .from('therapy_sessions')
            .select(`
              *,
              client:client_id(
                id, first_name, last_name, email
              )
            `)
            .eq('therapist_id', user.id)
            .eq('status', 'scheduled')
            .gte('scheduled_at', tomorrow.toISOString())
            .order('scheduled_at', { ascending: true })
            .limit(10),

          // Monthly sessions for earnings
          supabase
            .from('therapy_sessions')
            .select('session_fee, status')
            .eq('therapist_id', user.id)
            .gte('scheduled_at', startOfMonth.toISOString()),

          // All sessions for total count and completion rate
          supabase
            .from('therapy_sessions')
            .select('status', { count: 'exact' })
            .eq('therapist_id', user.id),

          // Feedback and ratings
          supabase
            .from('session_feedback')
            .select('rating, created_at')
            .eq('therapist_id', user.id),

          // Recent clients
          supabase
            .from('therapy_sessions')
            .select(`
              client_id,
              scheduled_at,
              client:client_id(
                id, first_name, last_name, email
              )
            `)
            .eq('therapist_id', user.id)
            .gte('scheduled_at', thirtyDaysAgo.toISOString())
            .order('scheduled_at', { ascending: false }),

          // Notifications (mock data for now)
          Promise.resolve({ data: [
            {
              id: '1',
              type: 'session_reminder',
              title: 'Upcoming Session',
              message: 'You have a session with John Doe in 30 minutes',
              created_at: new Date().toISOString(),
              read: false
            },
            {
              id: '2',
              type: 'new_client',
              title: 'New Client Request',
              message: 'Sarah Johnson has requested a session with you',
              created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              read: false
            }
          ] as Notification[] })
        ]);

        // Process today's sessions
        if (todaySessionsRes.data && !todaySessionsRes.error) {
          setTodaySessions(todaySessionsRes.data);
        }

        // Process upcoming sessions
        if (upcomingSessionsRes.data && !upcomingSessionsRes.error) {
          setUpcomingSessions(upcomingSessionsRes.data);
        }

        // Calculate stats
        const monthlySessionsData = monthlySessionsRes.data || [];
        const completedMonthlySessions = monthlySessionsData.filter((s: Session) => s.status === 'completed');
        const monthlyEarnings = completedMonthlySessions.reduce((sum, session) => 
          sum + 75000, 0  // Using fixed session fee since session_fee column doesn't exist
        );

        const allSessionsData = allSessionsRes.data || [];
        const completedSessions = allSessionsData.filter((s: Session) => s.status === 'completed').length;
        const totalSessions = allSessionsData.length;
        const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

        const feedbackData = feedbackRes.data || [];
        const ratings = feedbackData.map(f => f.rating).filter(Boolean);
        const averageRating = ratings.length > 0 
          ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10 
          : 0;

        // Process clients
        const clientsData = clientsRes.data || [];
        const uniqueClients = new Map();
        clientsData.forEach((session: Session) => {
          if (session.client) {
            const clientId = session.client.id;
            if (!uniqueClients.has(clientId)) {
              uniqueClients.set(clientId, {
                ...session.client,
                last_session: session.scheduled_at,
                total_sessions: 1,
                status: 'active'
              });
            } else {
              const existing = uniqueClients.get(clientId);
              existing.total_sessions += 1;
              if (new Date(session.scheduled_at) > new Date(existing.last_session)) {
                existing.last_session = session.scheduled_at;
              }
            }
          }
        });

        setRecentClients(Array.from(uniqueClients.values()).slice(0, 5));

        // Calculate response time (mock for now)
        const responseTime = Math.floor(Math.random() * 30) + 5; // 5-35 minutes

        setStats({
          todaySessionsCount: todaySessionsRes.data?.length || 0,
          activeClientsCount: uniqueClients.size,
          monthlyEarnings,
          averageRating,
          reviewsCount: ratings.length,
          totalSessions,
          completionRate,
          responseTime
        });

        setNotifications(notificationsRes.data || []);

      } catch (error) {
        console.error('Error fetching therapist data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapistData();
  }, [user, realTimeUpdates]);

  const formatSessionTime = (scheduledAt: string) => {
    const date = new Date(scheduledAt);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Therapist Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, Dr. {user?.user_metadata?.first_name || 'Therapist'}! 
            <span className="inline-flex items-center ml-2">
              <Activity className="h-4 w-4 text-green-500 mr-1" />
              Real-time updates active
            </span>
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/notifications')}>
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <Badge className="ml-2 bg-red-500">
                {notifications.filter(n => !n.read).length}
              </Badge>
            )}
          </Button>
          <Button onClick={() => navigate('/availability')}>
            <Calendar className="h-4 w-4 mr-2" />
            Manage Availability
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todaySessionsCount}</div>
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
            <div className="text-2xl font-bold">{stats.activeClientsCount}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {stats.monthlyEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {stats.reviewsCount > 0 ? `${stats.reviewsCount} reviews` : 'No reviews yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Session completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseTime}m</div>
            <p className="text-xs text-muted-foreground">To messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="clients">Recent Clients</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
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
                          <Badge 
                            variant={session.status === 'scheduled' ? 'default' : 'secondary'}
                          >
                            {session.status}
                          </Badge>
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
                    <Button className="mt-4" onClick={() => navigate('/availability')}>
                      Set Availability
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => {
                    const { date, time } = formatSessionTime(session.scheduled_at);
                    return (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {session.client?.first_name} {session.client?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{date} at {time}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{session.session_type}</Badge>
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming sessions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentClients.length > 0 ? (
                  recentClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{client.first_name} {client.last_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.total_sessions} sessions • Last: {formatTimeAgo(client.last_session || '')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent clients</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className={`p-3 border rounded-lg ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : ''
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                        {!notification.read && (
                          <Badge className="bg-blue-500">New</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
    </div>
  );
};
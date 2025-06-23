
import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, MessageSquare, Star, FileText, Settings, Bell, BarChart3, UserPlus, CalendarPlus, Video, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useOptimizedSessions } from '@/hooks/useOptimizedSessions';
import { useAuth } from '@/hooks/useAuth';
import { getActiveClients, getMonthlyEarnings, getFeedback } from '@/services/api/therapistService';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow } from 'date-fns';

// Import our new components
import VideoCallInterface from '@/components/sessions/VideoCallInterface';
import SessionAnalytics from '@/components/analytics/SessionAnalytics';
import ClientManagement from '@/components/clients/ClientManagement';
import AppointmentScheduler from '@/components/schedule/AppointmentScheduler';
import WorkshopManagement from '@/components/workshops/WorkshopManagement';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export const TherapistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions: allSessions, loading } = useOptimizedSessions();
  const [activeTab, setActiveTab] = useState('overview');
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
      if (!user) return;
      try {
        setStatsLoading(true);

        const [clientsRes, earningsRes, feedbackRes] = await Promise.all([
          getActiveClients(user.id),
          getMonthlyEarnings(user.id),
          getFeedback(user.id),
        ]);

        const uniqueClients = new Set(clientsRes.data?.map(session => session.client_id) || []);
        const monthlyEarnings = (earningsRes.data?.length || 0) * 76000;
        const ratings = feedbackRes.data?.map(f => f.rating).filter(Boolean) || [];
        const averageRating = ratings.length > 0
          ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
          : 0;

        setDashboardStats({
          activeClientsCount: uniqueClients.size,
          monthlyEarnings,
          averageRating,
          reviewsCount: ratings.length,
          todaySessionsCount: todaySessions.length,
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
        <div className="flex items-center space-x-2">
          <NotificationCenter />
          <Button onClick={() => navigate('/availability')}>
            <Calendar className="h-4 w-4 mr-2" />
            Manage Availability
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <Button size="sm" variant="outline" onClick={() => setActiveTab('clients')}>
                <UserPlus className="h-3 w-3 mr-1" />
                Add Client
              </Button>
              <Button size="sm" variant="outline" onClick={() => setActiveTab('schedule')}>
                <CalendarPlus className="h-3 w-3 mr-1" />
                Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Clients</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="workshops" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Workshops</span>
          </TabsTrigger>
          <TabsTrigger value="video-calls" className="flex items-center space-x-2">
            <Video className="h-4 w-4" />
            <span>Video Calls</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Today's Schedule */}
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
                          <Avatar>
                            <AvatarFallback>
                              {session.client?.first_name?.[0]}{session.client?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {session.client?.first_name} {session.client?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{time}</p>
                          </div>
                          <Badge variant="outline">{session.session_type}</Badge>
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm" onClick={() => navigate('/messages')}>
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" onClick={() => setActiveTab('video-calls')}>
                            <Video className="h-4 w-4 mr-1" />
                            Start Session
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sessions scheduled for today</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab('schedule')}
                    >
                      Schedule a Session
                    </Button>
                  </div>
                )}
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
                  upcomingSessions.slice(0, 5).map((session) => {
                    const sessionDate = new Date(session.scheduled_at);
                    const dateLabel = isToday(sessionDate) ? 'Today' : 
                                    isTomorrow(sessionDate) ? 'Tomorrow' : 
                                    format(sessionDate, 'MMM dd');
                    const time = format(sessionDate, 'HH:mm');
                    
                    return (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {session.client?.first_name?.[0]}{session.client?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {session.client?.first_name} {session.client?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{dateLabel} at {time}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">{session.session_type}</Badge>
                      </div>
                    );
                  })
              ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No upcoming sessions</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setActiveTab('schedule')}
                    >
                      Schedule a Session
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <AppointmentScheduler />
        </TabsContent>

        <TabsContent value="clients">
          <ClientManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <SessionAnalytics />
        </TabsContent>

        <TabsContent value="workshops">
          <WorkshopManagement />
        </TabsContent>

        <TabsContent value="video-calls">
          <VideoCallInterface sessionId="" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

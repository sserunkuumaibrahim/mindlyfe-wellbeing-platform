import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, CreditCard, Star, Clock, Bell, BookOpen, Users, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TherapySession {
  id: string;
  scheduled_at: string;
  session_type: string;
  status: string;
  client?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  therapist?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  session_fee?: number;
}

interface DashboardStats {
  upcomingSessions: number;
  unreadMessages: number;
  completedSessions: number;
  earnings?: number;
  clients?: number;
  workshops?: number;
}

interface RecentActivity {
  id: string;
  type: 'session' | 'message' | 'workshop';
  title: string;
  subtitle: string;
  time: string;
  status?: string;
}

export const UnifiedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions: allSessions, loading: sessionsLoading } = useSessions();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    upcomingSessions: 0,
    unreadMessages: 0,
    completedSessions: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<TherapySession[]>([]);

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  useEffect(() => {
    if (!user || sessionsLoading) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Base queries for all user types
        const promises = [];
        
        // Upcoming sessions
        promises.push(
          supabase
            .from('therapy_sessions')
            .select('*, therapist:therapist_id(first_name, last_name)')
            .eq(user.role === 'therapist' ? 'therapist_id' : 'client_id', user.id)
            .eq('status', 'scheduled')
            .gte('scheduled_at', new Date().toISOString())
            .order('scheduled_at', { ascending: true })
            .limit(5)
        );

        // Unread messages
        promises.push(
          supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('recipient_id', user.id)
            .eq('read', false)
        );

        // Completed sessions this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        promises.push(
          supabase
            .from('therapy_sessions')
            .select('*', { count: 'exact', head: true })
            .eq(user.role === 'therapist' ? 'therapist_id' : 'client_id', user.id)
            .eq('status', 'completed')
            .gte('scheduled_at', startOfMonth.toISOString())
        );

        // Recent activity (completed sessions)
        promises.push(
          supabase
            .from('therapy_sessions')
            .select('*, therapist:therapist_id(first_name, last_name), client:client_id(first_name, last_name)')
            .eq(user.role === 'therapist' ? 'therapist_id' : 'client_id', user.id)
            .eq('status', 'completed')
            .order('scheduled_at', { ascending: false })
            .limit(5)
        );

        // Role-specific queries
        if (user.role === 'therapist') {
          // Earnings this month
          promises.push(
            supabase
              .from('therapy_sessions')
              .select('session_fee')
              .eq('therapist_id', user.id)
              .eq('status', 'completed')
              .gte('scheduled_at', startOfMonth.toISOString())
          );

          // Total clients
          promises.push(
            supabase
              .from('therapy_sessions')
              .select('client_id')
              .eq('therapist_id', user.id)
              .eq('status', 'completed')
          );
        } else {
          // Upcoming workshops for individuals
          promises.push(
            supabase
              .from('workshops')
              .select('*', { count: 'exact', head: true })
              .gte('start_date', new Date().toISOString())
          );
        }

        const results = await Promise.all(promises);
        
        const [upcomingRes, unreadRes, completedRes, recentRes, ...roleSpecific] = results;

        // Set upcoming sessions
        setUpcomingSessions(upcomingRes.data || []);

        // Build stats object
        const newStats: DashboardStats = {
          upcomingSessions: upcomingRes.data?.length || 0,
          unreadMessages: unreadRes.count || 0,
          completedSessions: completedRes.count || 0
        };

        // Process role-specific data
        if (user.role === 'therapist' && roleSpecific.length >= 2) {
          const earningsData = roleSpecific[0].data || [];
          const clientsData = roleSpecific[1].data || [];
          
          newStats.earnings = earningsData.reduce((sum: number, session: TherapySession) => 
            sum + (session.session_fee || 75000), 0
          );
          newStats.clients = new Set(clientsData.map((s: TherapySession) => s.client?.id)).size;
        } else if (user.role !== 'therapist' && roleSpecific.length >= 1) {
          newStats.workshops = roleSpecific[0].count || 0;
        }

        setStats(newStats);

        // Process recent activity
        const activities: RecentActivity[] = (recentRes.data || []).map((session: TherapySession) => ({
          id: session.id,
          type: 'session' as const,
          title: user.role === 'therapist' 
            ? `Session with ${session.client?.first_name} ${session.client?.last_name}`
            : `Session with Dr. ${session.therapist?.first_name} ${session.therapist?.last_name}`,
          subtitle: 'Therapy Session',
          time: formatTimeAgo(session.scheduled_at),
          status: 'completed'
        }));

        setRecentActivity(activities);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, sessionsLoading]);

  // Quick actions based on user role
  const getQuickActions = () => {
    const baseActions = [
      { icon: MessageSquare, label: 'Messages', color: 'bg-blue-500', path: '/messages' },
      { icon: Bell, label: 'Notifications', color: 'bg-yellow-500', path: '/notifications' },
      { icon: CreditCard, label: 'Billing', color: 'bg-green-500', path: '/billing' }
    ];

    if (user?.role === 'therapist') {
      return [
        { icon: Calendar, label: 'Availability', color: 'bg-purple-500', path: '/availability' },
        { icon: Users, label: 'Clients', color: 'bg-indigo-500', path: '/clients' },
        ...baseActions
      ];
    } else {
      return [
        { icon: Calendar, label: 'Book Session', color: 'bg-purple-500', path: '/book-session' },
        { icon: BookOpen, label: 'Workshops', color: 'bg-pink-500', path: '/workshops' },
        ...baseActions
      ];
    }
  };

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  const quickActions = getQuickActions();

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {user?.user_metadata?.first_name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'therapist' 
            ? 'Manage your practice and connect with clients'
            : 'Continue your mental health journey'
          }
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                {loading ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <p className="text-2xl font-bold">{stats.upcomingSessions}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                {loading ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <p className="text-2xl font-bold">{stats.unreadMessages}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === 'therapist' ? 'Clients' : 'Completed Sessions'}
                </p>
                {loading ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <p className="text-2xl font-bold">
                    {user?.role === 'therapist' ? stats.clients : stats.completedSessions}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {user?.role === 'therapist' ? (
                <DollarSign className="h-5 w-5 text-yellow-500" />
              ) : (
                <BookOpen className="h-5 w-5 text-pink-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === 'therapist' ? 'Monthly Earnings' : 'Workshops'}
                </p>
                {loading ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <p className="text-2xl font-bold">
                    {user?.role === 'therapist' 
                      ? `$${stats.earnings || 0}` 
                      : stats.workshops || 0
                    }
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50"
                  onClick={() => handleQuickAction(action.path)}
                >
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-center">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Sessions</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/sessions')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {user?.role === 'therapist'
                          ? `Session with ${session.client?.first_name} ${session.client?.last_name}`
                          : `Session with Dr. ${session.therapist?.first_name} ${session.therapist?.last_name}`
                        }
                      </p>
                      <p className="text-sm text-gray-600">{formatDateTime(session.scheduled_at)}</p>
                      <Badge variant="outline" className="mt-1">
                        {session.session_type || 'Virtual'}
                      </Badge>
                    </div>
                    <Button size="sm" onClick={() => navigate('/sessions')}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No upcoming sessions</p>
                <Button onClick={() => navigate(user?.role === 'therapist' ? '/availability' : '/book-session')}>
                  {user?.role === 'therapist' ? 'Set Availability' : 'Book Session'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Star className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.subtitle} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
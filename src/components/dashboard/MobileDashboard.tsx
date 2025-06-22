
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  MessageSquare, 
  Users, 
  FileText, 
  Settings,
  Bell,
  CreditCard,
  BookOpen
} from 'lucide-react';

export const MobileDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    unreadMessages: 0,
    completedSessions: 0
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    session_date: string;
    therapist: {
      first_name: string;
      last_name: string;
    };
  }>>([]);
  const [upcomingSession, setUpcomingSession] = useState<{
    id: string;
    scheduled_at: string;
    session_type?: string;
    therapist?: {
      first_name: string;
      last_name: string;
    };
  } | null>(null);

  const quickActions = [
    { icon: Calendar, label: 'Sessions', color: 'bg-blue-500', path: '/sessions' },
    { icon: MessageSquare, label: 'Messages', color: 'bg-green-500', path: '/messages' },
    { icon: Users, label: 'Find Therapist', color: 'bg-purple-500', path: '/book-session' },
    { icon: FileText, label: 'Documents', color: 'bg-orange-500', path: '/documents' },
    { icon: BookOpen, label: 'Workshops', color: 'bg-pink-500', path: '/workshops' },
    { icon: CreditCard, label: 'Billing', color: 'bg-indigo-500', path: '/billing' },
    { icon: Bell, label: 'Notifications', color: 'bg-red-500', path: '/notifications' },
    { icon: Settings, label: 'Settings', color: 'bg-gray-500', path: '/settings' },
  ];

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch upcoming sessions count
        const { count: upcomingCount } = await supabase
          .from('therapy_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', user.id)
          .eq('status', 'scheduled')
          .gte('scheduled_at', new Date().toISOString());

        // Fetch unread messages count
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('is_read', false);

        // Fetch completed sessions this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { count: completedCount } = await supabase
          .from('therapy_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', user.id)
          .eq('status', 'completed')
          .gte('scheduled_at', startOfMonth.toISOString());

        // Fetch next upcoming session
        const { data: nextSession } = await supabase
          .from('therapy_sessions')
          .select(`
            *,
            therapist:profiles!therapy_sessions_therapist_id_fkey(
              first_name,
              last_name
            )
          `)
          .eq('client_id', user.id)
          .eq('status', 'scheduled')
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(1)
          .single();

        // Fetch recent activity (last 5 completed sessions)
        const { data: recentSessions } = await supabase
          .from('therapy_sessions')
          .select(`
            *,
            therapist:profiles!therapy_sessions_therapist_id_fkey(
              first_name,
              last_name
            )
          `)
          .eq('client_id', user.id)
          .eq('status', 'completed')
          .order('scheduled_at', { ascending: false })
          .limit(3);

        setStats({
          upcomingSessions: upcomingCount || 0,
          unreadMessages: unreadCount || 0,
          completedSessions: completedCount || 0
        });

        setUpcomingSession(nextSession);
        setRecentActivity(recentSessions || []);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

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
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Welcome back!</h1>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Overview</h2>
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            [
              { label: 'Upcoming Sessions', value: stats.upcomingSessions.toString(), change: 'This month' },
              { label: 'Unread Messages', value: stats.unreadMessages.toString(), change: 'New messages' },
              { label: 'Completed Sessions', value: stats.completedSessions.toString(), change: 'This month' },
            ].map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleQuickAction(action.path)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">{action.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Card>
          <CardContent className="p-4 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : recentActivity.length > 0 ? (
              recentActivity.map((session, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">
                      Session completed with Dr. {session.therapist?.first_name} {session.therapist?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{getTimeAgo(session.scheduled_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
        <Card>
          <CardContent className="p-4">
            {loading ? (
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ) : upcomingSession ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Session with Dr. {upcomingSession.therapist?.first_name} {upcomingSession.therapist?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{formatDateTime(upcomingSession.scheduled_at)}</p>
                  <Badge variant="outline" className="mt-1">
                    {upcomingSession.session_type || 'Virtual'}
                  </Badge>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/sessions')}
                >
                  View
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">No upcoming sessions</p>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/book-session')}
                >
                  Book Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

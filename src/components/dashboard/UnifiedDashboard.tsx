import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, CreditCard, Star, Clock, Bell, BookOpen, Users, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/services/apiClient';

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
  const [dataFetched, setDataFetched] = useState(false); // Flag to prevent re-fetching
  const [stats, setStats] = useState<DashboardStats>({
    upcomingSessions: 0,
    unreadMessages: 0,
    completedSessions: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<TherapySession[]>([]);

  // Quick actions for different user roles
  const quickActions = [
    {
      icon: Calendar,
      label: 'Schedule Session',
      color: 'bg-blue-500',
      path: '/booking'
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      color: 'bg-green-500',
      path: '/messages'
    },
    {
      icon: CreditCard,
      label: 'Billing',
      color: 'bg-purple-500',
      path: '/billing'
    },
    {
      icon: BookOpen,
      label: 'Resources',
      color: 'bg-orange-500',
      path: '/resources'
    },
    {
      icon: Users,
      label: 'Clients',
      color: 'bg-teal-500',
      path: user?.role === 'therapist' ? '/clients' : '/therapists'
    },
    {
      icon: Star,
      label: 'Reviews',
      color: 'bg-yellow-500',
      path: '/reviews'
    }
  ];

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  const renderSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Loading skeleton content */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Loading...
        </h1>
        <p className="text-gray-600 mt-1">
          Please wait while we load your dashboard
        </p>
      </div>
    </div>
  );

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
    let isMounted = true;

    const fetchDashboardData = async () => {
      // Prevent multiple calls and only fetch if user is available and we haven't fetched yet
      if (!user?.id || !isMounted || dataFetched || sessionsLoading) {
        return;
      }
      
      console.log('Fetching dashboard data for user:', user.id);
      
      try {
        setLoading(true);

        const response: any = await apiRequest(`/users/${user.id}/dashboard`, 'GET');
        
        if (!isMounted) return; // Check if component is still mounted
        
        // The API returns { sessions, profile, notifications }
        // Map this to the expected dashboard data structure
        const dashboardData = {
          stats: {
            upcomingSessions: response.sessions?.filter((s: any) => s.status === 'scheduled').length || 0,
            completedSessions: response.sessions?.filter((s: any) => s.status === 'completed').length || 0,
            unreadMessages: 0, // Default value since not provided by API
            earnings: 0, // Default value for therapists
            clients: response.sessions?.length || 0, // Total unique clients/sessions
            workshops: 0 // Default value
          },
          recentActivity: response.sessions?.slice(0, 5) || [],
          upcomingSessions: response.sessions?.filter((s: any) => s.status === 'scheduled').slice(0, 3) || []
        };

        setStats(dashboardData.stats);
        setRecentActivity(dashboardData.recentActivity);
        setUpcomingSessions(dashboardData.upcomingSessions);
        setDataFetched(true); // Mark as fetched to prevent re-fetching

        console.log('Dashboard data fetched successfully');

      } catch (error) {
        if (!isMounted) return;
        
        console.error('Error fetching dashboard data:', error);
        
        // Only set error state if it's not a network error (to prevent spam)
        if (!(error instanceof Error && (error.message.includes('Network error') || error.message.includes('Rate limit')))) {
          setStats({ 
            upcomingSessions: 0, 
            completedSessions: 0, 
            unreadMessages: 0,
            earnings: 0,
            clients: 0,
            workshops: 0
          });
          setRecentActivity([]);
          setUpcomingSessions([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Only fetch if user is available, sessions are not loading, and we haven't fetched yet
    if (user?.id && !sessionsLoading && !dataFetched) {
      fetchDashboardData();
    } else if (!user?.id) {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id, sessionsLoading, dataFetched]); // Include dataFetched in dependencies

  // Show loading state while user or sessions are loading
  if (!user || sessionsLoading || loading) {
    return renderSkeleton();
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name || 'User'}!
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
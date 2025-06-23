import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Users, Activity, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

interface AnalyticsEvent {
  id?: string;
  event_name: string;
  user_id?: string;
  session_id: string;
  properties?: Record<string, unknown>;
  timestamp: string;
  page_url?: string;
  created_at?: string;
}

interface Profile {
  user_type?: string;
}

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  errorRate: number;
  topPages: Array<{ page: string; views: number }>;
  userActions: Array<{ action: string; count: number }>;
  dailyStats: Array<{ date: string; users: number; sessions: number; errors: number }>;
  userTypes: Array<{ type: string; count: number; color: string }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // Fetch analytics events
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) throw error;

      // Fetch user profiles for user type analysis
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_type')
        .not('user_type', 'is', null);

      // Process the data
      const processedData = processAnalyticsData(events || [], profiles || []);
      setData(processedData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (events: AnalyticsEvent[], profiles: Profile[]): AnalyticsData => {
    // Calculate unique users and sessions
    const uniqueUsers = new Set(events.filter(e => e.user_id).map(e => e.user_id)).size;
    const uniqueSessions = new Set(events.map(e => e.session_id)).size;
    
    // Calculate session durations
    const sessionDurations = calculateSessionDurations(events);
    const avgSessionDuration = sessionDurations.length > 0 
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
      : 0;

    // Calculate error rate
    const errorEvents = events.filter(e => e.event_name === 'error_occurred');
    const errorRate = events.length > 0 ? (errorEvents.length / events.length) * 100 : 0;

    // Top pages
    const pageViews = events.filter(e => e.event_name === 'page_view');
    const pageStats = pageViews.reduce((acc, event) => {
      const page = (event.properties?.page as string) || event.page_url || 'Unknown';
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topPages = Object.entries(pageStats)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // User actions
    const actionEvents = events.filter(e => e.event_name === 'user_action');
    const actionStats = actionEvents.reduce((acc, event) => {
      const action = (event.properties?.action as string) || 'Unknown';
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const userActions = Object.entries(actionStats)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Daily stats
    const dailyStats = generateDailyStats(events);

    // User types
    const userTypeStats = profiles.reduce((acc, profile) => {
      const type = profile.user_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const userTypes = Object.entries(userTypeStats)
      .map(([type, count], index) => ({ 
        type, 
        count, 
        color: COLORS[index % COLORS.length] 
      }));

    return {
      totalUsers: uniqueUsers,
      activeUsers: uniqueUsers, // For now, same as total users
      totalSessions: uniqueSessions,
      avgSessionDuration,
      errorRate,
      topPages,
      userActions,
      dailyStats,
      userTypes
    };
  };

  const calculateSessionDurations = (events: any[]): number[] => {
    const sessionEvents = events.reduce((acc, event) => {
      const sessionId = event.session_id;
      if (!acc[sessionId]) {
        acc[sessionId] = [];
      }
      acc[sessionId].push(new Date(event.timestamp).getTime());
      return acc;
    }, {} as Record<string, number[]>);

    return Object.values(sessionEvents)
      .map(timestamps => {
        if (timestamps.length < 2) return 0;
        const sorted = timestamps.sort((a, b) => a - b);
        return (sorted[sorted.length - 1] - sorted[0]) / 1000 / 60; // Duration in minutes
      })
      .filter(duration => duration > 0);
  };

  const generateDailyStats = (events: any[]) => {
    const dailyData = events.reduce((acc, event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { users: new Set(), sessions: new Set(), errors: 0 };
      }
      
      if (event.user_id) acc[date].users.add(event.user_id);
      acc[date].sessions.add(event.session_id);
      if (event.event_name === 'error_occurred') acc[date].errors++;
      
      return acc;
    }, {} as Record<string, { users: Set<string>; sessions: Set<string>; errors: number }>);

    return Object.entries(dailyData)
      .map(([date, stats]) => ({
        date,
        users: stats.users.size,
        sessions: stats.sessions.size,
        errors: stats.errors
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 1) return '<1m';
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <select 
          value={dateRange} 
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1d">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active users in period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSessions}</div>
            <p className="text-xs text-muted-foreground">Unique sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(data.avgSessionDuration)}</div>
            <p className="text-xs text-muted-foreground">Average time per session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.errorRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Errors per total events</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="actions">User Actions</TabsTrigger>
          <TabsTrigger value="users">User Types</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" name="Users" />
                  <Line type="monotone" dataKey="sessions" stroke="#82ca9d" name="Sessions" />
                  <Line type="monotone" dataKey="errors" stroke="#ff7300" name="Errors" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topPages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="page" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.userActions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="action" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Types Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.userTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.userTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
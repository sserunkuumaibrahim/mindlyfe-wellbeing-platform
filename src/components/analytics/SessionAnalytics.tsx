import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Award,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface SessionMetrics {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  averageDuration: number;
  totalRevenue: number;
  uniqueClients: number;
  sessionsByType: { type: string; count: number; percentage: number }[];
  sessionsByDay: { day: string; count: number; revenue: number }[];
  clientSatisfaction: { rating: number; count: number }[];
  therapistPerformance: { therapist: string; sessions: number; rating: number; revenue: number }[];
}

interface SessionAnalyticsProps {
  className?: string;
  therapistId?: string; // If provided, show analytics for specific therapist
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const timeRangeOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: 'this-week', label: 'This week' },
  { value: 'this-month', label: 'This month' },
  { value: 'custom', label: 'Custom range' }
];

export const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({ 
  className, 
  therapistId 
}) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SessionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange, therapistId]);

  const getDateRange = () => {
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        return { start: subDays(now, 7), end: now };
      case '30d':
        return { start: subDays(now, 30), end: now };
      case '90d':
        return { start: subDays(now, 90), end: now };
      case 'this-week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'this-month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { start, end } = getDateRange();
      
      // Build query based on user role and therapistId filter
      let query = supabase
        .from('therapy_sessions')
        .select(`
          *,
          therapist:profiles!therapist_id(
            first_name,
            last_name
          ),
          client:profiles!client_id(
            first_name,
            last_name
          ),
          feedback:session_feedback(
            rating,
            feedback_text
          )
        `)
        .gte('scheduled_at', start.toISOString())
        .lte('scheduled_at', end.toISOString());

      // Filter by therapist if specified or if user is a therapist
      if (therapistId) {
        query = query.eq('therapist_id', therapistId);
      } else if (user.user_metadata?.role === 'therapist') {
        query = query.eq('therapist_id', user.id);
      }

      const { data: sessions, error } = await query;
      
      if (error) throw error;

      // Process the data to generate metrics
      const processedMetrics = processSessionData(sessions || []);
      setMetrics(processedMetrics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processSessionData = (sessions: any[]): SessionMetrics => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length;
    
    // Calculate average duration for completed sessions
    const completedSessionsWithDuration = sessions.filter(s => 
      s.status === 'completed' && s.actual_duration_minutes
    );
    const averageDuration = completedSessionsWithDuration.length > 0
      ? completedSessionsWithDuration.reduce((sum, s) => sum + s.actual_duration_minutes, 0) / completedSessionsWithDuration.length
      : 0;

    // Calculate total revenue
    const totalRevenue = sessions
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + ((s as any).session_fee || 0), 0);

    // Count unique clients
    const uniqueClients = new Set(sessions.map(s => s.client_id)).size;

    // Sessions by type
    const typeCount = sessions.reduce((acc, s) => {
      acc[s.session_type] = (acc[s.session_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sessionsByType = Object.entries(typeCount).map(([type, count]) => ({
      type: type.replace('_', ' ').toUpperCase(),
      count: count,
      percentage: Math.round((count / totalSessions) * 100)
    }));

    // Sessions by day
    const dayCount = sessions.reduce((acc, s) => {
      const day = format(new Date(s.scheduled_at), 'MMM dd');
      if (!acc[day]) {
        acc[day] = { count: 0, revenue: 0 };
      }
      acc[day].count += 1;
      if (s.status === 'completed') {
        acc[day].revenue += s.session_fee || 0;
      }
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);
    
    const sessionsByDay = Object.entries(dayCount).map(([day, data]) => ({
      day,
      count: data.count,
      revenue: data.revenue
    }));

    // Client satisfaction from feedback
    const feedbackData = sessions
      .filter(s => s.feedback && s.feedback.length > 0)
      .flatMap(s => s.feedback);
    
    const ratingCount = feedbackData.reduce((acc, f) => {
      acc[f.rating] = (acc[f.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const clientSatisfaction = Object.entries(ratingCount).map(([rating, count]) => ({
      rating: parseInt(rating),
      count
    })).sort((a, b) => a.rating - b.rating);

    // Therapist performance (if admin view)
    const therapistData = sessions.reduce((acc, s) => {
      const therapistName = `${s.therapist?.first_name} ${s.therapist?.last_name}`;
      if (!acc[therapistName]) {
        acc[therapistName] = { sessions: 0, totalRating: 0, ratingCount: 0, revenue: 0 };
      }
      acc[therapistName].sessions += 1;
      if (s.status === 'completed') {
        acc[therapistName].revenue += s.session_fee || 0;
      }
      if (s.feedback && s.feedback.length > 0) {
        s.feedback.forEach((f: any) => {
          acc[therapistName].totalRating += f.rating;
          acc[therapistName].ratingCount += 1;
        });
      }
      return acc;
    }, {} as Record<string, any>);
    
    const therapistPerformance = Object.entries(therapistData).map(([therapist, data]) => ({
      therapist,
      sessions: data.sessions,
      rating: data.ratingCount > 0 ? data.totalRating / data.ratingCount : 0,
      revenue: data.revenue
    }));

    return {
      totalSessions,
      completedSessions,
      cancelledSessions,
      averageDuration,
      totalRevenue,
      uniqueClients,
      sessionsByType,
      sessionsByDay,
      clientSatisfaction,
      therapistPerformance
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const exportData = (): void => {
    if (!metrics) return;
    
    const dataToExport = {
      summary: {
        totalSessions: metrics.totalSessions,
        completedSessions: metrics.completedSessions,
        cancelledSessions: metrics.cancelledSessions,
        averageDuration: metrics.averageDuration,
        totalRevenue: metrics.totalRevenue,
        uniqueClients: metrics.uniqueClients
      },
      sessionsByType: metrics.sessionsByType,
      sessionsByDay: metrics.sessionsByDay,
      clientSatisfaction: metrics.clientSatisfaction,
      therapistPerformance: metrics.therapistPerformance
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX'
    }).format(amount);
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    description?: string;
  }> = ({ title, value, change, icon, description }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className="text-gray-400">{icon}</div>
        </div>
        {change !== undefined && (
          <div className="flex items-center mt-4">
            {change >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={cn(
              "text-sm font-medium",
              change >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No data available</h3>
          <p className="text-gray-600">Unable to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Session Analytics</h1>
          <p className="text-gray-600">
            {therapistId ? 'Therapist performance insights' : 'Comprehensive session insights and metrics'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Sessions"
          value={metrics.totalSessions}
          icon={<Calendar className="h-6 w-6" />}
          description={`${metrics.completedSessions} completed, ${metrics.cancelledSessions} cancelled`}
        />
        
        <MetricCard
          title="Average Duration"
          value={`${Math.round(metrics.averageDuration)} min`}
          icon={<Clock className="h-6 w-6" />}
          description="Per completed session"
        />
        
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          icon={<TrendingUp className="h-6 w-6" />}
          description="From completed sessions"
        />
        
        <MetricCard
          title="Unique Clients"
          value={metrics.uniqueClients}
          icon={<Users className="h-6 w-6" />}
          description="Active in this period"
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          {!therapistId && <TabsTrigger value="performance">Performance</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Sessions by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Sessions by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.sessionsByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) => `${type} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {metrics.sessionsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Daily Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Session Count</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.sessionsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={metrics.sessionsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="satisfaction" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Client Satisfaction */}
            <Card>
              <CardHeader>
                <CardTitle>Client Satisfaction Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.clientSatisfaction}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Satisfaction Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.clientSatisfaction.map((item) => (
                    <div key={item.rating} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Award
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < item.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{item.rating} stars</span>
                      </div>
                      <Badge variant="secondary">{item.count} reviews</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {!therapistId && (
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Therapist Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.therapistPerformance.map((therapist, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{therapist.therapist}</h4>
                        <p className="text-sm text-gray-600">
                          {therapist.sessions} sessions • {formatCurrency(therapist.revenue)} revenue
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Award
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < Math.round(therapist.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">
                          {therapist.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default SessionAnalytics;
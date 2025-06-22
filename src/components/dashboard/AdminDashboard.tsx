
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Calendar, DollarSign, TrendingUp, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  totalSessions: number;
  totalRevenue: number;
  activeSubscriptions: number;
  pendingTherapists: number;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
  is_active: boolean;
  therapist_status?: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSessions: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    pendingTherapists: 0
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, allUsers]);

  const filterUsers = () => {
    let filtered = allUsers;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch session count
      const { count: sessionCount } = await supabase
        .from('therapy_sessions')
        .select('*', { count: 'exact', head: true });

      // Fetch revenue from paid invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('amount')
        .eq('status', 'paid');

      const totalRevenue = invoices?.reduce((sum, invoice) => sum + Number(invoice.amount), 0) || 0;

      // Fetch active subscriptions
      const { count: subscriptionCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch pending therapists
      const { count: pendingTherapistsCount } = await supabase
        .from('therapist_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_review');

      // Fetch recent users (last 10)
      const { data: users } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, created_at, is_active')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch all users for management
      const { data: allUsersData } = await supabase
        .from('profiles')
        .select(`
          id, 
          first_name, 
          last_name, 
          email, 
          role, 
          created_at, 
          is_active,
          therapist_profiles(status)
        `)
        .order('created_at', { ascending: false });

      const processedUsers = allUsersData?.map(user => ({
        ...user,
        therapist_status: user.therapist_profiles?.status || null
      })) || [];

      setStats({
        totalUsers: userCount || 0,
        totalSessions: sessionCount || 0,
        totalRevenue,
        activeSubscriptions: subscriptionCount || 0,
        pendingTherapists: pendingTherapistsCount || 0
      });

      setRecentUsers(users || []);
      setAllUsers(processedUsers);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const approveTherapist = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('therapist_profiles')
        .update({ status: 'approved' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Therapist approved successfully",
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error approving therapist:', error);
      toast({
        title: "Error",
        description: "Failed to approve therapist",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => window.location.reload()}>
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Therapy sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.pendingTherapists}</div>
            <p className="text-xs text-muted-foreground">
              Therapist reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <Button 
              variant={showAllUsers ? "secondary" : "default"}
              onClick={() => setShowAllUsers(!showAllUsers)}
            >
              {showAllUsers ? "Show Recent Only" : "Show All Users"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAllUsers && (
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="therapist">Therapist</SelectItem>
                  <SelectItem value="org_admin">Org Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-4">
            {(showAllUsers ? filteredUsers : recentUsers).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium">{user.first_name} {user.last_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.role === 'therapist' && user.therapist_status && (
                      <p className="text-xs text-muted-foreground">
                        Therapist Status: {user.therapist_status}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    user.role === 'admin' ? 'destructive' :
                    user.role === 'therapist' ? 'default' : 
                    user.role === 'org_admin' ? 'secondary' : 'outline'
                  }>
                    {user.role}
                  </Badge>
                  
                  <Badge variant={user.is_active ? 'default' : 'destructive'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>

                  {user.role === 'therapist' && user.therapist_status === 'pending_review' && (
                    <Button
                      size="sm"
                      onClick={() => approveTherapist(user.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant={user.is_active ? "destructive" : "default"}
                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                  >
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Pending Therapist Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-500">{stats.pendingTherapists}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Therapists waiting for approval
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">Good</p>
            <p className="text-sm text-muted-foreground mt-2">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{recentUsers.length}</p>
            <p className="text-sm text-muted-foreground mt-2">
              New users this week
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

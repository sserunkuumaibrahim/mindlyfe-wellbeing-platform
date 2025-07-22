
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Calendar, DollarSign, TrendingUp, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/services/apiClient';
import { toast } from '@/lib/toast';
import { AdminDashboardData, AdminUser } from '@/types/dashboard';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const data = await apiRequest<AdminDashboardData>('/api/admin/dashboard');
        setDashboardData(data);
        setFilteredUsers(data.users);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({ title: 'Error', description: 'Failed to load dashboard data' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const filterUsers = useCallback(() => {
    if (!dashboardData) return;
    
    let filtered = dashboardData.users;

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
  }, [dashboardData, searchTerm, roleFilter]);

  useEffect(() => {
    if (dashboardData) {
      filterUsers();
    }
  }, [filterUsers, dashboardData]);

  const handleApproveTherapist = async (userId: string) => {
    try {
      await apiRequest(`/api/admin/users/${userId}/approve`, 'POST');
      toast({ title: 'Success', description: 'Therapist approved' });
      // Refresh data
      const data = await apiRequest<AdminDashboardData>('/api/admin/dashboard');
      setDashboardData(data);
      setFilteredUsers(data.users);
    } catch (error) {
      console.error('Error approving therapist:', error);
      toast({ title: 'Error', description: 'Failed to approve therapist' });
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await apiRequest(`/api/admin/users/${userId}/deactivate`, 'POST');
      toast({ title: 'Success', description: 'User deactivated' });
      // Refresh data
      const data = await apiRequest<AdminDashboardData>('/api/admin/dashboard');
      setDashboardData(data);
      setFilteredUsers(data.users);
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({ title: 'Error', description: 'Failed to deactivate user' });
    }
  };

  const approveTherapist = async (userId: string) => {
    try {
      await apiRequest(`/api/admin/therapists/${userId}/approve`, 'POST');
      toast.success('Therapist approved successfully');
      // Refresh data
      const data = await apiRequest<AdminDashboardData>('/api/admin/dashboard');
      setDashboardData(data);
      setFilteredUsers(data.users);
    } catch (error) {
      console.error('Error approving therapist:', error);
      toast.error('Failed to approve therapist');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const action = currentStatus ? 'deactivate' : 'activate';
      await apiRequest(`/api/admin/users/${userId}/${action}`, 'POST');
      toast.success(`User ${action}d successfully`);
      // Refresh data
      const data = await apiRequest<AdminDashboardData>('/api/admin/dashboard');
      setDashboardData(data);
      setFilteredUsers(data.users);
    } catch (error) {
      console.error(`Error ${currentStatus ? 'deactivating' : 'activating'} user:`, error);
      toast.error(`Failed to ${currentStatus ? 'deactivate' : 'activate'} user`);
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
            <div className="text-2xl font-bold">{dashboardData?.stats.total_users || 0}</div>
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
            <div className="text-2xl font-bold">{dashboardData?.stats.total_sessions || 0}</div>
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
            <div className="text-2xl font-bold">UGX {dashboardData?.stats.total_revenue.toLocaleString() || '0'}</div>
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
            <div className="text-2xl font-bold">{dashboardData?.stats.active_subscriptions || 0}</div>
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
            <div className="text-2xl font-bold text-orange-500">{dashboardData?.stats.pending_therapists || 0}</div>
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
            {(showAllUsers ? filteredUsers : (dashboardData?.users.slice(0, 5) || [])).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium">{user.first_name} {user.last_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.role === 'therapist' && user.therapist_details && (
                      <p className="text-xs text-muted-foreground">
                        Therapist Status: {user.therapist_details.status}
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

                  {user.role === 'therapist' && user.therapist_details?.status === 'pending' && (
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
            <p className="text-2xl font-bold text-orange-500">{dashboardData?.stats.pending_therapists || 0}</p>
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
            <p className="text-2xl font-bold">{dashboardData?.users.filter(user => {
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              return new Date(user.created_at) >= oneWeekAgo;
            }).length || 0}</p>
            <p className="text-sm text-muted-foreground mt-2">
              New users this week
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

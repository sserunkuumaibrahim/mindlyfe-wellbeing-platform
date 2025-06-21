
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, DollarSign, Plus, TrendingUp, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface OrgStats {
  totalMembers: number;
  totalSessions: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  monthlySpend: number;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  sessions_used: number;
  joined_at: string;
}

export const OrganizationDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<OrgStats>({
    totalMembers: 0,
    totalSessions: 0,
    sessionsUsed: 0,
    sessionsRemaining: 0,
    monthlySpend: 0
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'org_admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Get organization profile
      const { data: orgProfile } = await supabase
        .from('organization_profiles')
        .select('id')
        .eq('id', user?.id)
        .single();

      if (!orgProfile) {
        toast({
          title: "Error",
          description: "Organization profile not found",
          variant: "destructive",
        });
        return;
      }

      // Fetch organization members with their session usage
      const { data: orgMembers } = await supabase
        .from('organization_members')
        .select(`
          annual_sessions_used,
          annual_sessions_limit,
          joined_at,
          profiles:profile_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('organization_id', orgProfile.id);

      // Calculate totals
      const totalMembers = orgMembers?.length || 0;
      const totalSessionsIncluded = orgMembers?.reduce((sum, member) => sum + (member.annual_sessions_limit || 0), 0) || 0;
      const totalSessionsUsed = orgMembers?.reduce((sum, member) => sum + (member.annual_sessions_used || 0), 0) || 0;
      const remainingSessions = totalSessionsIncluded - totalSessionsUsed;

      // Calculate monthly spend based on sessions used (76,000 UGX per session)
      const thisMonth = new Date();
      thisMonth.setDate(1);
      
      const { count: monthlySessionsUsed } = await supabase
        .from('therapy_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('scheduled_at', thisMonth.toISOString())
        .in('client_id', orgMembers?.map(m => m.profiles.id) || []);

      setStats({
        totalMembers,
        totalSessions: totalSessionsIncluded,
        sessionsUsed: totalSessionsUsed,
        sessionsRemaining: Math.max(0, remainingSessions),
        monthlySpend: (monthlySessionsUsed || 0) * 76000
      });

      // Format members data
      const formattedMembers = orgMembers?.map(member => ({
        id: member.profiles.id,
        first_name: member.profiles.first_name,
        last_name: member.profiles.last_name,
        email: member.profiles.email,
        sessions_used: member.annual_sessions_used,
        joined_at: member.joined_at
      })) || [];

      setMembers(formattedMembers);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Dashboard</h1>
          <p className="text-muted-foreground">Manage your team's mental health and wellness</p>
        </div>
        <Button onClick={() => navigate('/team/invite')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Remaining</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessionsRemaining}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalSessions} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessionsUsed}</div>
            <p className="text-xs text-muted-foreground">By team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {stats.monthlySpend.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Button variant="outline" onClick={() => navigate('/team')}>
                Manage Team
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No team members yet</p>
                  <p className="text-sm mb-4">Invite your first team member to get started</p>
                  <Button onClick={() => navigate('/team/invite')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </div>
              ) : (
                members.slice(0, 10).map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{member.first_name} {member.last_name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {member.sessions_used || 0} sessions used
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
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
                onClick={() => navigate('/team/invite')}
              >
                <Plus className="h-6 w-6 mb-2" />
                Add Member
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/team')}
              >
                <Users className="h-6 w-6 mb-2" />
                Manage Team
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/workshops')}
              >
                <Calendar className="h-6 w-6 mb-2" />
                Workshops
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/reports')}
              >
                <TrendingUp className="h-6 w-6 mb-2" />
                Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Sessions Used</span>
                <span className="text-sm text-muted-foreground">
                  {stats.sessionsUsed} / {stats.totalSessions}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ 
                    width: stats.totalSessions > 0 
                      ? `${(stats.sessionsUsed / stats.totalSessions) * 100}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted rounded">
                  <div className="text-lg font-bold">{stats.sessionsRemaining}</div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                </div>
                <div className="p-3 bg-muted rounded">
                  <div className="text-lg font-bold">
                    {stats.totalSessions > 0 
                      ? Math.round((stats.sessionsUsed / stats.totalSessions) * 100)
                      : 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">Utilized</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

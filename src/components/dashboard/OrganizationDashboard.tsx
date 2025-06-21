
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, DollarSign, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface OrgStats {
  totalMembers: number;
  totalSessions: number;
  sessionsUsed: number;
  sessionsRemaining: number;
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
    sessionsRemaining: 0
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

      if (!orgProfile) throw new Error('Organization not found');

      // Fetch organization members
      const { data: orgMembers } = await supabase
        .from('organization_members')
        .select(`
          sessions_used,
          joined_at,
          profiles:profile_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('organization_id', orgProfile.id);

      // Fetch active subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('sessions_included, sessions_used')
        .eq('organization_id', orgProfile.id)
        .eq('status', 'active')
        .single();

      const totalMembers = orgMembers?.length || 0;
      const sessionsIncluded = subscription?.sessions_included || 0;
      const sessionsUsed = subscription?.sessions_used || 0;
      const sessionsRemaining = Math.max(0, sessionsIncluded - sessionsUsed);

      setStats({
        totalMembers,
        totalSessions: sessionsIncluded,
        sessionsUsed,
        sessionsRemaining
      });

      // Format members data
      const formattedMembers = orgMembers?.map(member => ({
        id: member.profiles.id,
        first_name: member.profiles.first_name,
        last_name: member.profiles.last_name,
        email: member.profiles.email,
        sessions_used: member.sessions_used,
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
    return <div className="flex justify-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Organization Dashboard</h1>
        <Button onClick={() => navigate('/team')}>
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
            <p className="text-xs text-muted-foreground">
              Active members
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
              Included in subscription
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Used</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessionsUsed}</div>
            <p className="text-xs text-muted-foreground">
              By team members
            </p>
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
              Available for booking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Members</CardTitle>
            <Button onClick={() => navigate('/team')}>
              Manage Team
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium">{member.first_name} {member.last_name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {member.sessions_used} sessions used
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

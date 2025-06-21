
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, DollarSign, TrendingUp, Building, UserPlus } from 'lucide-react';
import { useRouter } from 'next/router';

export const OrganizationDashboard: React.FC = () => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your team's mental health services
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground">
              Within budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest member activities and sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Group Wellness Session</h4>
                  <p className="text-sm text-muted-foreground">
                    15 participants • Today at 2:00 PM
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Stress Management Workshop
                  </p>
                </div>
                <Button size="sm" variant="outline">View Details</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">New Member Registration</h4>
                  <p className="text-sm text-muted-foreground">
                    Sarah Johnson joined • 2 hours ago
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Marketing Department
                  </p>
                </div>
                <Button size="sm" variant="outline">Approve</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Monthly Report Generated</h4>
                  <p className="text-sm text-muted-foreground">
                    October 2024 • Yesterday
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Team wellness metrics available
                  </p>
                </div>
                <Button size="sm" variant="outline">Download</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Management */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/members')}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Members
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/dashboard/group-sessions')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Group Session
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/dashboard/reports')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View Reports
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/dashboard/organization')}
              >
                <Building className="mr-2 h-4 w-4" />
                Org Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium">Mental Health Awareness Week</p>
                  <p className="text-xs text-muted-foreground">
                    Nov 15-22 • 8 events scheduled
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium">Quarterly Wellness Survey</p>
                  <p className="text-xs text-muted-foreground">
                    Due Nov 30 • 45% completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

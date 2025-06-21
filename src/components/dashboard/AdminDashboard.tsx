
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, FileText, AlertTriangle, TrendingUp, Settings } from 'lucide-react';
import { useRouter } from 'next/router';

export const AdminDashboard: React.FC = () => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform administration and oversight
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              8 therapists, 15 organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2 critical, 1 warning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground">
              Uptime this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>
              Items requiring admin attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg border-orange-200 bg-orange-50">
                <div>
                  <h4 className="font-semibold">Therapist License Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    Dr. Michael Chen • License expires in 30 days
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Renewal documentation required
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">Review</Button>
                  <Button size="sm">Approve</Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg border-blue-200 bg-blue-50">
                <div>
                  <h4 className="font-semibold">Organization Registration</h4>
                  <p className="text-sm text-muted-foreground">
                    TechCorp Inc. • Submitted 2 days ago
                  </p>
                  <p className="text-xs text-muted-foreground">
                    500+ employees, enterprise plan
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">Review</Button>
                  <Button size="sm">Approve</Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Content Moderation</h4>
                  <p className="text-sm text-muted-foreground">
                    Reported content • Community guidelines
                  </p>
                  <p className="text-xs text-muted-foreground">
                    User complaint about inappropriate content
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">Review</Button>
                  <Button size="sm" variant="destructive">Remove</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Tools */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/admin/users')}
              >
                <Users className="mr-2 h-4 w-4" />
                User Management
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/dashboard/admin/approvals')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Approvals Queue
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/dashboard/admin/analytics')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Platform Analytics
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/dashboard/admin/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Healthy</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Services</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Gateway</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm text-yellow-600">Slow</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

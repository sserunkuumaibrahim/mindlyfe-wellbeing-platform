
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const quickActions = [
    { icon: Calendar, label: 'Sessions', color: 'bg-blue-500', href: '/sessions' },
    { icon: MessageSquare, label: 'Messages', color: 'bg-green-500', href: '/messages' },
    { icon: Users, label: 'Find Therapist', color: 'bg-purple-500', href: '/therapists' },
    { icon: FileText, label: 'Documents', color: 'bg-orange-500', href: '/documents' },
    { icon: BookOpen, label: 'Workshops', color: 'bg-pink-500', href: '/workshops' },
    { icon: CreditCard, label: 'Billing', color: 'bg-indigo-500', href: '/billing' },
    { icon: Bell, label: 'Notifications', color: 'bg-red-500', href: '/notifications' },
    { icon: Settings, label: 'Settings', color: 'bg-gray-500', href: '/settings' },
  ];

  const stats = [
    { label: 'Upcoming Sessions', value: '2', change: '+1 this week' },
    { label: 'Unread Messages', value: '5', change: 'New today' },
    { label: 'Active Goals', value: '3', change: '67% complete' },
  ];

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
          {stats.map((stat, index) => (
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
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
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
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Session completed with Dr. Sarah</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">New message from Dr. Sarah</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Joined stress management workshop</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session with Dr. Sarah Johnson</p>
                <p className="text-sm text-gray-600">Tomorrow at 2:00 PM</p>
                <Badge variant="outline" className="mt-1">Virtual</Badge>
              </div>
              <Button size="sm">Join</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

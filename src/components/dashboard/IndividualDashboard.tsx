
import React from 'react';
import { Calendar, MessageSquare, CreditCard, Star, Clock, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const IndividualDashboard: React.FC = () => {
  const navigate = useNavigate();

  const upcomingSessions = [
    {
      id: '1',
      therapist: 'Dr. Sarah Johnson',
      date: '2024-06-22',
      time: '10:00 AM',
      type: 'Virtual',
    },
    {
      id: '2',
      therapist: 'Dr. Michael Chen',
      date: '2024-06-25',
      time: '2:00 PM',
      type: 'Virtual',
    },
  ];

  const recentSessions = [
    {
      id: '1',
      therapist: 'Dr. Sarah Johnson',
      date: '2024-06-15',
      rating: 5,
      notes: 'Great session focused on anxiety management techniques.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
        <Button onClick={() => navigate('/dashboard/book')}>
          <Calendar className="h-4 w-4 mr-2" />
          Book Session
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground">Next: {upcomingSessions[0]?.date}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/dashboard/messages')}>
                View all
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">{session.therapist}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.date} at {session.time}
                    </p>
                  </div>
                  <Badge variant="outline">{session.type}</Badge>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">Reschedule</Button>
                  <Button size="sm">Join Session</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div key={session.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{session.therapist}</p>
                  <div className="flex items-center space-x-1">
                    {[...Array(session.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{session.date}</p>
                <p className="text-sm">{session.notes}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React from 'react';
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, Phone } from 'lucide-react';
import AppPageLayout from '@/components/ui/AppPageLayout';

export default function Sessions() {
  const { user } = useAuth();
  const { sessions, loading, cancelSession, rescheduleSession } = useSessions();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <AppPageLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Sessions</h1>
          {user?.role === 'individual' && (
            <Button onClick={() => window.location.href = '/book-session'}>
              Book New Session
            </Button>
          )}
        </div>

        <div className="grid gap-6">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
                <p className="text-gray-600 mb-4">
                  {user?.role === 'individual' 
                    ? 'You haven\'t booked any sessions yet.' 
                    : 'No sessions scheduled at the moment.'}
                </p>
                {user?.role === 'individual' && (
                  <Button onClick={() => window.location.href = '/book-session'}>
                    Book Your First Session
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {user?.role === 'individual' ? 'Session with ' + (session.therapist?.first_name + ' ' + session.therapist?.last_name) : 'Session with ' + (session.client?.first_name + ' ' + session.client?.last_name)}
                    </CardTitle>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{formatDate(session.scheduled_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{formatTime(session.scheduled_at)} ({session.duration_minutes} min)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-gray-500" />
                        <span className="capitalize">{session.session_type} Session</span>
                      </div>
                    </div>
                    
                    {session.status === 'scheduled' && (
                      <div className="flex gap-2 justify-end">
                        {session.google_meet_url && (
                          <Button 
                            size="sm" 
                            onClick={() => window.open(session.google_meet_url, '_blank')}
                          >
                            <Video className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => cancelSession(session.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {session.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-1">Session Notes:</h4>
                      <p className="text-sm text-gray-600">{session.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppPageLayout>
  );
}

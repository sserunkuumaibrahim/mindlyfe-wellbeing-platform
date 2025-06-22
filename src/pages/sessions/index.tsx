
import React, { useMemo } from 'react';
import { useOptimizedSessions } from '@/hooks/useOptimizedSessions';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, Phone, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AppPageLayout from '@/components/ui/AppPageLayout';
import { useNavigate } from 'react-router-dom';

export default function Sessions() {
  const { user } = useAuth();
  const { sessions, loading, error, cancelSession } = useOptimizedSessions();
  const navigate = useNavigate();

  const { upcomingSessions, pastSessions } = useMemo(() => {
    const now = new Date();
    const upcoming = sessions.filter(s => new Date(s.scheduled_at) > now && s.status === 'scheduled');
    const past = sessions.filter(s => new Date(s.scheduled_at) <= now || s.status !== 'scheduled');
    return { upcomingSessions: upcoming, pastSessions: past };
  }, [sessions]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'virtual':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'in_person':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <AppPageLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppPageLayout>
    );
  }

  if (error) {
    return (
      <AppPageLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
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
            <Button onClick={() => navigate('/book-session')}>
              Book New Session
            </Button>
          )}
        </div>

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
            <div className="grid gap-4">
              {upcomingSessions.map((session) => {
                const { date, time } = formatDateTime(session.scheduled_at);
                const otherUser = user?.role === 'individual' ? session.therapist : session.client;
                
                return (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {getSessionIcon(session.session_type)}
                          Session with {otherUser?.first_name} {otherUser?.last_name}
                        </CardTitle>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{time} ({session.duration_minutes} min)</span>
                          </div>
                        </div>
                        
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
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Past Sessions</h2>
            <div className="grid gap-4">
              {pastSessions.slice(0, 10).map((session) => {
                const { date, time } = formatDateTime(session.scheduled_at);
                const otherUser = user?.role === 'individual' ? session.therapist : session.client;
                
                return (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getSessionIcon(session.session_type)}
                          <div>
                            <p className="font-medium">
                              {otherUser?.first_name} {otherUser?.last_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {date} at {time}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                      {session.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">{session.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {sessions.length === 0 && (
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
                <Button onClick={() => navigate('/book-session')}>
                  Book Your First Session
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppPageLayout>
  );
}

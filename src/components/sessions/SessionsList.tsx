
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MapPin, 
  MoreVertical,
  X,
  Edit
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/hooks/useSessions';

interface SessionsListProps {
  viewMode?: 'grid' | 'list';
}

export const SessionsList: React.FC<SessionsListProps> = ({ viewMode = 'grid' }) => {
  const { user } = useAuth();
  const { sessions, loading, cancelSession, rescheduleSession } = useSessions();

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getSessionIcon = (sessionType: string) => {
    switch (sessionType) {
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { variant: 'default' as const, label: 'Scheduled' },
      completed: { variant: 'secondary' as const, label: 'Completed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' },
      in_progress: { variant: 'default' as const, label: 'In Progress' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const handleCancelSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to cancel this session?')) {
      await cancelSession(sessionId);
    }
  };

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No sessions found</h3>
          <p className="text-gray-500">You don't have any therapy sessions scheduled yet.</p>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getSessionIcon(session.session_type)}
                    <div>
                      <p className="font-medium">
                        {user?.role === 'therapist' 
                          ? `${session.client?.first_name} ${session.client?.last_name}`
                          : `${session.therapist?.first_name} ${session.therapist?.last_name}`
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(session.scheduled_at)} at {formatTime(session.scheduled_at)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(session.status)}
                  {isUpcoming(session.scheduled_at) && session.status === 'scheduled' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelSession(session.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <Card key={session.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getSessionIcon(session.session_type)}
                <CardTitle className="text-lg">
                  {session.session_type === 'virtual' ? 'Virtual Session' :
                   session.session_type === 'phone' ? 'Phone Session' : 'In-Person Session'}
                </CardTitle>
              </div>
              {getStatusBadge(session.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.role === 'therapist' 
                      ? `${session.client?.first_name?.[0]}${session.client?.last_name?.[0]}`
                      : `${session.therapist?.first_name?.[0]}${session.therapist?.last_name?.[0]}`
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {user?.role === 'therapist' 
                      ? `${session.client?.first_name} ${session.client?.last_name}`
                      : `${session.therapist?.first_name} ${session.therapist?.last_name}`
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.role === 'therapist' ? 'Client' : 'Therapist'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(session.scheduled_at)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{formatTime(session.scheduled_at)} ({session.duration_minutes} min)</span>
                </div>
              </div>

              {isUpcoming(session.scheduled_at) && session.status === 'scheduled' && (
                <div className="flex space-x-2 pt-4">
                  {session.session_type === 'virtual' && session.google_meet_url && (
                    <Button asChild size="sm" className="flex-1">
                      <a href={session.google_meet_url} target="_blank" rel="noopener noreferrer">
                        Join Session
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelSession(session.id)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

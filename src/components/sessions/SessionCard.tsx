
import React from 'react';
import { Calendar, Clock, Video, Phone, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface Person {
  first_name: string;
  last_name: string;
  profile_photo_url?: string;
}

interface Session {
  id: string;
  scheduled_at: string;
  status: string;
  session_type: string;
  duration_minutes: number;
  notes?: string;
  therapist?: Person;
  client?: Person;
}

interface SessionCardProps {
  session: Session;
  onJoin?: (session: Session) => void;
  onCancel?: (sessionId: string) => void;
  onReschedule?: (sessionId: string) => void;
  showActions?: boolean;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onJoin,
  onCancel,
  onReschedule,
  showActions = true,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionTypeIcon = (type: string) => {
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

  const isUpcoming = new Date(session.scheduled_at) > new Date();
  const canJoin = session.status === 'scheduled' && 
    Math.abs(new Date(session.scheduled_at).getTime() - new Date().getTime()) < 15 * 60 * 1000; // 15 minutes

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={session.therapist?.profile_photo_url || session.client?.profile_photo_url} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {session.therapist 
                  ? `${session.therapist.first_name} ${session.therapist.last_name}`
                  : `${session.client.first_name} ${session.client.last_name}`
                }
              </h3>
              <p className="text-sm text-muted-foreground">
                {session.therapist ? 'Therapist' : 'Client'}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(session.status)}>
            {session.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(session.scheduled_at), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(session.scheduled_at), 'hh:mm a')}</span>
          </div>
          <div className="flex items-center space-x-2">
            {getSessionTypeIcon(session.session_type)}
            <span className="capitalize">{session.session_type}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{session.duration_minutes} minutes</span>
          </div>
        </div>

        {showActions && session.status === 'scheduled' && (
          <div className="flex space-x-2 pt-2">
            {canJoin && onJoin && (
              <Button 
                onClick={() => onJoin(session)}
                className="flex-1"
              >
                Join Session
              </Button>
            )}
            {isUpcoming && onReschedule && (
              <Button 
                variant="outline" 
                onClick={() => onReschedule(session.id)}
                className="flex-1"
              >
                Reschedule
              </Button>
            )}
            {isUpcoming && onCancel && (
              <Button 
                variant="destructive" 
                onClick={() => onCancel(session.id)}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        )}

        {session.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">Notes:</p>
            <p className="text-sm mt-1">{session.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

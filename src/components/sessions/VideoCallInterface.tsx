import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Settings, 
  MessageSquare,
  Clock,
  Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getSessionJoinInfo, joinSession, endVideoCall } from '@/services/api/videoCallService';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

interface VideoCallInterfaceProps {
  sessionId: string;
  onCallEnd?: () => void;
  className?: string;
}

interface SessionDetails {
  id: string;
  therapist_name: string;
  client_name: string;
  scheduled_at: string;
  duration_minutes: number;
}

interface SessionJoinInfo {
  meeting_url: string;
  meeting_id: string;
  session_details: SessionDetails;
  can_join: boolean;
  join_window_start?: string;
  join_window_end?: string;
}

export const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  sessionId,
  onCallEnd,
  className
}) => {
  const { user } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<SessionJoinInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callStartTime = useRef<Date | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadSessionInfo();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionId, loadSessionInfo]);

  const loadSessionInfo = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await getSessionJoinInfo(sessionId, user.id);
      if (error) throw error;
      setSessionInfo(data as SessionJoinInfo | null);
      
      if (data && !data.can_join) {
        setError('Session is not available for joining at this time');
      }
    } catch (err) {
      console.error('Error loading session info:', err);
      setError('Failed to load session information');
      toast({
        title: "Error",
        description: "Failed to load session information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [sessionId, user]);

  const startCall = async () => {
    if (!sessionInfo?.can_join) {
      toast({
        title: "Cannot Join",
        description: "Session is not available for joining",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;
    try {
      await joinSession(sessionId, user.id);
      setIsConnected(true);
      callStartTime.current = new Date();
      
      // Start call duration timer
      intervalRef.current = setInterval(() => {
        if (callStartTime.current) {
          const duration = Math.floor((Date.now() - callStartTime.current.getTime()) / 1000);
          setCallDuration(duration);
        }
      }, 1000);

      // Open Google Meet in new window
      if (sessionInfo.meeting_url) {
        window.open(sessionInfo.meeting_url, '_blank', 'width=1200,height=800');
      }

      toast({
        title: "Call Started",
        description: "Video call session has begun",
      });
    } catch (err) {
      console.error('Error starting call:', err);
      toast({
        title: "Error",
        description: "Failed to start video call",
        variant: "destructive",
      });
    }
  };

  const endCall = async () => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const durationMinutes = callStartTime.current 
        ? Math.ceil((Date.now() - callStartTime.current.getTime()) / (1000 * 60))
        : undefined;

      await endVideoCall(sessionId, durationMinutes);
      setIsConnected(false);
      setCallDuration(0);
      callStartTime.current = null;

      toast({
        title: "Call Ended",
        description: "Video call session has ended",
      });

      onCallEnd?.();
    } catch (err) {
      console.error('Error ending call:', err);
      toast({
        title: "Error",
        description: "Failed to end video call properly",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  if (loading) {
    return (
      <Card className={cn("w-full max-w-4xl mx-auto", className)}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading session...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !sessionInfo) {
    return (
      <Card className={cn("w-full max-w-4xl mx-auto", className)}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Video className="h-16 w-16 mx-auto mb-2" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Session Unavailable</h3>
            <p className="text-gray-600 mb-4">{error || 'Session information not found'}</p>
            <Button onClick={loadSessionInfo} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { session_details } = sessionInfo;
  const scheduledDateTime = formatDateTime(session_details.scheduled_at);

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Therapy Session</CardTitle>
            <p className="text-gray-600">
              {scheduledDateTime.date} at {scheduledDateTime.time}
            </p>
          </div>
          {isConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(callDuration)}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Session Participants */}
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <Avatar className="h-16 w-16 mx-auto mb-2">
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {session_details.therapist_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <p className="font-medium">{session_details.therapist_name}</p>
            <p className="text-sm text-gray-500">Therapist</p>
          </div>
          
          <div className="flex items-center">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          
          <div className="text-center">
            <Avatar className="h-16 w-16 mx-auto mb-2">
              <AvatarImage src="" />
              <AvatarFallback className="bg-green-100 text-green-600">
                {session_details.client_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <p className="font-medium">{session_details.client_name}</p>
            <p className="text-sm text-gray-500">Client</p>
          </div>
        </div>

        {/* Video Call Controls */}
        <div className="bg-gray-50 rounded-lg p-6">
          {!isConnected ? (
            <div className="text-center space-y-4">
              <div className="text-gray-600">
                <Video className="h-12 w-12 mx-auto mb-2" />
                <p>Ready to start your therapy session?</p>
                <p className="text-sm">Duration: {session_details.duration_minutes} minutes</p>
              </div>
              
              {sessionInfo.can_join ? (
                <Button 
                  onClick={startCall}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Session
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-amber-600 font-medium">Session not yet available</p>
                  <p className="text-sm text-gray-500">
                    You can join 15 minutes before the scheduled time
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="secondary" className="bg-green-100 text-green-800 mb-2">
                  Session Active
                </Badge>
                <p className="text-sm text-gray-600">
                  Google Meet window should have opened. If not, 
                  <a 
                    href={sessionInfo.meeting_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    click here to join
                  </a>
                </p>
              </div>
              
              {/* Call Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant={isVideoEnabled ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                >
                  {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant={isAudioEnabled ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                >
                  {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={endCall}
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Call
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Session Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Clock className="h-5 w-5 mx-auto mb-1 text-blue-600" />
            <p className="font-medium">Duration</p>
            <p className="text-gray-600">{session_details.duration_minutes} min</p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Video className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="font-medium">Session Type</p>
            <p className="text-gray-600">Video Call</p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <MessageSquare className="h-5 w-5 mx-auto mb-1 text-purple-600" />
            <p className="font-medium">Meeting ID</p>
            <p className="text-gray-600 font-mono text-xs">
              {sessionInfo.meeting_id.slice(-8)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
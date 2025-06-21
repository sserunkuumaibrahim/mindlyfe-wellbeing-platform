
import { useState, useEffect } from 'react';
import { sessionService } from '@/services/sessionService';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export const useSessions = (status?: string) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      try {
        const data = await sessionService.getSessions(user.id, status);
        setSessions(data || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: "Error",
          description: "Failed to load sessions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user, status]);

  const bookSession = async (sessionData: any) => {
    try {
      const session = await sessionService.bookSession(sessionData);
      setSessions(prev => [...prev, session]);
      toast({
        title: "Success",
        description: "Session booked successfully!",
      });
      return session;
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Error",
        description: "Failed to book session",
        variant: "destructive",
      });
      throw error;
    }
  };

  const cancelSession = async (sessionId: string) => {
    try {
      await sessionService.cancelSession(sessionId);
      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId ? { ...s, status: 'cancelled' } : s
        )
      );
      toast({
        title: "Success",
        description: "Session cancelled successfully",
      });
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel session",
        variant: "destructive",
      });
      throw error;
    }
  };

  const rescheduleSession = async (sessionId: string, newDate: string) => {
    try {
      await sessionService.rescheduleSession({
        session_id: sessionId,
        new_scheduled_at: newDate,
      });
      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId 
            ? { ...s, scheduled_at: newDate, status: 'rescheduled' } 
            : s
        )
      );
      toast({
        title: "Success",
        description: "Session rescheduled successfully",
      });
    } catch (error) {
      console.error('Error rescheduling session:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule session",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    sessions,
    loading,
    bookSession,
    cancelSession,
    rescheduleSession,
    refetch: () => {
      if (user) {
        sessionService.getSessions(user.id, status).then(data => {
          setSessions(data || []);
        });
      }
    },
  };
};

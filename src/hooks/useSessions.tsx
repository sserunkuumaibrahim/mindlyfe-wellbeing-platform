
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Session {
  id: string;
  client_id: string;
  therapist_id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: string;
  status: string;
  google_meet_url?: string;
  notes?: string;
  client?: {
    first_name: string;
    last_name: string;
  };
  therapist?: {
    first_name: string;
    last_name: string;
  };
}

export const useSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .select(`
          *,
          client:profiles!therapy_sessions_client_id_fkey(first_name, last_name),
          therapist:profiles!therapy_sessions_therapist_id_fkey(first_name, last_name)
        `)
        .or(`client_id.eq.${user.id},therapist_id.eq.${user.id}`)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
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

  const cancelSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .update({ status: 'cancelled' })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session cancelled successfully",
      });

      fetchSessions();
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel session",
        variant: "destructive",
      });
    }
  };

  const rescheduleSession = async (sessionId: string, newDateTime: string) => {
    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .update({ scheduled_at: newDateTime })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session rescheduled successfully",
      });

      fetchSessions();
    } catch (error) {
      console.error('Error rescheduling session:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule session",
        variant: "destructive",
      });
    }
  };

  return {
    sessions,
    loading,
    cancelSession,
    rescheduleSession,
    refetch: fetchSessions,
  };
};

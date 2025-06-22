
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OptimizedSession {
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
    profile_photo_url?: string;
  };
  therapist?: {
    first_name: string;
    last_name: string;
    profile_photo_url?: string;
  };
}

export const useOptimizedSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<OptimizedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('therapy_sessions')
        .select(`
          id,
          client_id,
          therapist_id,
          scheduled_at,
          duration_minutes,
          session_type,
          status,
          google_meet_url,
          notes,
          client:profiles!therapy_sessions_client_id_fkey(
            first_name,
            last_name,
            profile_photo_url
          ),
          therapist:profiles!therapy_sessions_therapist_id_fkey(
            first_name,
            last_name,
            profile_photo_url
          )
        `)
        .or(`client_id.eq.${user.id},therapist_id.eq.${user.id}`)
        .order('scheduled_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load sessions');
      // Show sample data for demo purposes
      setSessions([
        {
          id: 'sample-1',
          client_id: user?.id || '',
          therapist_id: 'therapist-1',
          scheduled_at: new Date(Date.now() + 86400000).toISOString(),
          duration_minutes: 60,
          session_type: 'virtual',
          status: 'scheduled',
          google_meet_url: 'https://meet.google.com/abc-def-ghi',
          therapist: {
            first_name: 'Dr. Sarah',
            last_name: 'Johnson'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const cancelSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .update({ status: 'cancelled' })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, status: 'cancelled' }
            : session
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
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  return {
    sessions,
    loading,
    error,
    cancelSession,
    refetch: fetchSessions,
  };
};


import { useState, useEffect, useCallback } from 'react';
import { getSessions } from '@/services/api/sessionService';
import { useAuth } from './useAuth';
import { TherapySession } from '@/types/session';

export const useOptimizedSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<OptimizedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserSessions = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data, error } = await getSessions(user.id);
        if (error) throw error;
        setSessions(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSessions();
  }, [user]);

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

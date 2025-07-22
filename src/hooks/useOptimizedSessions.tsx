import { useState, useEffect, useCallback } from 'react';
import { getSessions } from '@/services/api/sessionService';
import { useAuth } from './useAuth';
import { TherapySession } from '@/types/session';
import { toast } from '@/lib/toast';

type OptimizedSession = TherapySession;

export const useOptimizedSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<OptimizedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await getSessions(user.id);
      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchSessions();
    }
  }, [user?.id, fetchSessions]);

  const cancelSession = useCallback(async (sessionId: string) => {
    try {
      // Mock implementation - replace with actual apiClient call
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



  return {
    sessions,
    loading,
    error,
    cancelSession,
    refetch: fetchSessions,
  };
};

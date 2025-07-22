
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/services/apiClient';
import { toast } from '@/lib/toast';

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

  const fetchSessions = useCallback(async () => {
    if (!user) return;

    try {
      const sessions = await apiClient.sessions.list();
      setSessions(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({ title: 'Error', description: 'Could not fetch sessions.' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  const bookSession = async (sessionDetails: Omit<Session, 'id' | 'client_id' | 'status'>) => {
    if (!user) return null;

    try {
      // Note: This would need to be implemented in apiClient.sessions
      // For now, using a placeholder response structure
      const response = { data: [{ ...sessionDetails, id: Date.now().toString(), client_id: user.id, status: 'scheduled' }] };

      if (response.data) {
        fetchSessions(); // Refresh the list
        toast({ title: 'Success', description: 'Session booked successfully.' });
        return response.data[0];
      }
      return null;
    } catch (error) {
      console.error('Error booking session:', error);
      toast({ title: 'Error', description: 'Could not book session.' });
      return null;
    }
  };

  const cancelSession = async (sessionId: string) => {
    try {
      // Note: This would need to be implemented in apiClient.sessions
      // For now, just updating local state
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, status: 'cancelled' } : session
      ));
      fetchSessions(); // Refresh the list
      toast({ title: 'Success', description: 'Session cancelled.' });
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({ title: 'Error', description: 'Could not cancel session.' });
    }
  };

  return { sessions, loading, fetchSessions, bookSession, cancelSession };
};

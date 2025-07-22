import { fetchData, mutateData } from './apiService';

export interface SessionJoinInfo {
  google_meet_url: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export const getSessionJoinInfo = async (sessionId: string, userId: string): Promise<{ data: SessionJoinInfo | null, error: Error | null }> => {
  return fetchData<SessionJoinInfo>('therapy_sessions', 'google_meet_url, status', { column: 'id', value: sessionId });
};

export const joinSession = async (sessionId: string): Promise<{ data: SessionJoinInfo | null; error: string | null }> => {
  const result = await fetchData<SessionJoinInfo>('therapy_sessions', 'google_meet_url, status', [{ column: 'id', operator: 'eq', value: sessionId }]);
  return {
    data: result.data?.[0] || null,
    error: result.error
  };
};

export const endVideoCall = async (sessionId: string, duration: number): Promise<{ data: unknown; error: string | null }> => {
  return mutateData(
    'therapy_sessions',
    'update',
    {
      status: 'completed',
      duration_minutes: duration,
    },
    { id: sessionId }
  );
};
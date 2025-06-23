import { fetchData, mutateData } from './apiService';

export interface SessionJoinInfo {
  google_meet_url: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export const getSessionJoinInfo = async (sessionId: string, userId: string): Promise<{ data: SessionJoinInfo | null, error: Error | null }> => {
  return fetchData<SessionJoinInfo>('therapy_sessions', 'google_meet_url, status', { column: 'id', value: sessionId });
};

export const joinSession = async (sessionId: string, userId: string): Promise<{ data: any, error: Error | null }> => {
  // In a real app, this might involve more complex logic,
  // like notifying other participants or updating presence status.
  console.log(`User ${userId} joining session ${sessionId}`);
  return Promise.resolve({ data: { success: true }, error: null });
};

export const endVideoCall = async (sessionId: string, durationMinutes?: number): Promise<{ data: any, error: Error | null }> => {
  return mutateData('therapy_sessions', {
    status: 'completed',
    duration_minutes: durationMinutes,
  }, 'update', { column: 'id', value: sessionId });
};
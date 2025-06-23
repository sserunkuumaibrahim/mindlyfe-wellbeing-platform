import { fetchData, mutateData } from './apiService';
import { TherapySession } from '@/types/session';

export const getSessions = (therapistId: string) => {
  return fetchData<TherapySession>('therapy_sessions', '*', [
    { column: 'therapist_id', operator: 'eq', value: therapistId },
  ]);
};

export const updateSessionStatus = (sessionId: string, status: string) => {
  return mutateData<TherapySession>(
    'therapy_sessions',
    'update',
    { status },
    { id: sessionId }
  );
};
import { fetchData } from './apiService';
import { TherapySession, SessionFeedback } from '@/types/session';

const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

export const getActiveClients = (therapistId: string) => {
  return fetchData<TherapySession>('therapy_sessions', 'client_id', [
    { column: 'therapist_id', operator: 'eq', value: therapistId },
    { column: 'scheduled_at', operator: 'gte', value: thirtyDaysAgo },
  ]);
};

export const getMonthlyEarnings = (therapistId: string) => {
  // This is a simplified version. In a real scenario, you'd likely have a proper invoice/payments table.
  // Here, we're just counting completed sessions and multiplying by a fixed rate.
  return fetchData<TherapySession>('therapy_sessions', 'id', [
    { column: 'therapist_id', operator: 'eq', value: therapistId },
    { column: 'status', operator: 'eq', value: 'completed' },
    { column: 'scheduled_at', operator: 'gte', value: startOfMonth },
  ]);
};

export const getFeedback = (therapistId: string) => {
  return fetchData<SessionFeedback>('session_feedback', 'rating', [
    { column: 'therapist_id', operator: 'eq', value: therapistId },
  ]);
};
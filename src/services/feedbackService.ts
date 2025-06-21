
import { supabase } from '@/integrations/supabase/client';

export interface FeedbackData {
  session_id: string;
  client_id: string;
  therapist_id: string;
  rating: number;
  feedback_text?: string;
}

export const feedbackService = {
  async submitFeedback(data: FeedbackData) {
    const { data: feedback, error } = await supabase
      .from('session_feedback')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return feedback;
  },

  async getFeedbackForTherapist(therapistId: string) {
    const { data, error } = await supabase
      .from('session_feedback')
      .select(`
        *,
        session:therapy_sessions(scheduled_at),
        client:profiles!session_feedback_client_id_fkey(first_name, last_name)
      `)
      .eq('therapist_id', therapistId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAverageRating(therapistId: string) {
    const { data, error } = await supabase
      .from('session_feedback')
      .select('rating')
      .eq('therapist_id', therapistId);

    if (error) throw error;
    
    if (!data || data.length === 0) return 0;
    
    const average = data.reduce((sum, feedback) => sum + (feedback.rating || 0), 0) / data.length;
    return Math.round(average * 10) / 10; // Round to 1 decimal place
  },
};

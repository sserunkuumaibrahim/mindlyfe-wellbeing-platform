
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type SessionStatus = Database['public']['Enums']['session_status'];
type SessionType = Database['public']['Enums']['session_type'];

export interface BookSessionData {
  therapist_id: string;
  client_id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: SessionType;
}

export interface RescheduleData {
  session_id: string;
  new_scheduled_at: string;
}

export const sessionService = {
  async bookSession(data: BookSessionData) {
    const { data: session, error } = await supabase
      .from('therapy_sessions')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return session;
  },

  async getSessions(userId: string, status?: SessionStatus) {
    let query = supabase
      .from('therapy_sessions')
      .select(`
        *,
        client:profiles!therapy_sessions_client_id_fkey(first_name, last_name, profile_photo_url),
        therapist:profiles!therapy_sessions_therapist_id_fkey(first_name, last_name, profile_photo_url)
      `)
      .or(`client_id.eq.${userId},therapist_id.eq.${userId}`)
      .order('scheduled_at', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateSessionStatus(sessionId: string, status: SessionStatus) {
    const { error } = await supabase
      .from('therapy_sessions')
      .update({ status })
      .eq('id', sessionId);

    if (error) throw error;
  },

  async rescheduleSession(data: RescheduleData) {
    const { error } = await supabase
      .from('therapy_sessions')
      .update({ 
        scheduled_at: data.new_scheduled_at,
        status: 'scheduled' as SessionStatus
      })
      .eq('id', data.session_id);

    if (error) throw error;
  },

  async cancelSession(sessionId: string) {
    const { error } = await supabase
      .from('therapy_sessions')
      .update({ status: 'cancelled' as SessionStatus })
      .eq('id', sessionId);

    if (error) throw error;
  },

  async addSessionNotes(sessionId: string, notes: string) {
    const { error } = await supabase
      .from('therapy_sessions')
      .update({ notes })
      .eq('id', sessionId);

    if (error) throw error;
  },
};

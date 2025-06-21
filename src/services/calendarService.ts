
import { supabase } from '@/integrations/supabase/client';

export interface CalendarEventData {
  profile_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: string;
  related_id?: string;
  reminder_minutes?: number;
}

export const calendarService = {
  async createEvent(data: CalendarEventData) {
    const { data: event, error } = await supabase
      .from('calendar_events')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return event;
  },

  async getUserEvents(profileId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('profile_id', profileId)
      .order('start_time');

    if (startDate) {
      query = query.gte('start_time', startDate);
    }
    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateEvent(eventId: string, updates: Partial<CalendarEventData>) {
    const { data, error } = await supabase
      .from('calendar_events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEvent(eventId: string) {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  },

  async syncWithGoogleCalendar(profileId: string) {
    // This would integrate with Google Calendar API
    // Implementation depends on OAuth setup
    console.log('Google Calendar sync for profile:', profileId);
  }
};

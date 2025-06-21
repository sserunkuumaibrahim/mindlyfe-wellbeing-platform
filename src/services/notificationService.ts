
import { supabase } from '@/integrations/supabase/client';

export interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, any>;
}

export const notificationService = {
  async createNotification(profileId: string, notification: NotificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        profile_id: profileId,
        ...notification,
      });

    if (error) throw error;
    return data;
  },

  async getNotifications(profileId: string, limit = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllAsRead(profileId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('profile_id', profileId)
      .eq('is_read', false);

    if (error) throw error;
  },
};

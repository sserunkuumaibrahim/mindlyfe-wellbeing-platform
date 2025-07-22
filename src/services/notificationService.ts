
import { postgresClient } from '@/integrations/postgresql/client';

export interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

export const notificationService = {
  async createNotification(profileId: string, notification: NotificationData) {
    const result = await postgresClient
      .from('notifications')
      .insert({
        profile_id: profileId,
        ...notification
      });

    if (result.error) throw new Error(result.error);
    return result.data;
  },

  async getUserNotifications(profileId: string, limit = 50) {
    const result = await postgresClient
      .from('notifications')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', false)
      .limit(limit)
      .execute();

    if (result.error) throw new Error(result.error);
    return result.data;
  },

  async markAsRead(notificationId: string) {
    const result = await postgresClient
      .from('notifications')
      .eq('id', notificationId)
      .update({ is_read: true });

    if (result.error) throw new Error(result.error);
  },

  async markAllAsRead(profileId: string) {
    const result = await postgresClient
      .from('notifications')
      .eq('profile_id', profileId)
      .eq('is_read', false)
      .update({ is_read: true });

    if (result.error) throw new Error(result.error);
  }
};

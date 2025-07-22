
import { postgresClient } from '@/integrations/postgresql/client';

export interface CreateWorkshopData {
  title: string;
  description?: string;
  facilitator_id: string;
  organization_id?: string;
  scheduled_at: string;
  duration_minutes: number;
  max_participants: number;
  price_ugx: number;
  workshop_type: string;
  materials_urls?: string[];
}

export const workshopService = {
  async createWorkshop(data: CreateWorkshopData) {
    try {
      const result = await postgresClient
        .from('workshops')
        .insert(data)
        .select()
        .single();
      return result.data;
    } catch (error) {
      throw new Error(`Failed to create workshop: ${error}`);
    }
  },

  async getWorkshops(organizationId?: string) {
    try {
      let query = postgresClient
        .from('workshops')
        .select(`
          *,
          facilitator:profiles!workshops_facilitator_id_fkey(first_name, last_name, profile_photo_url),
          organization:organization_profiles(organization_name),
          enrollments:workshop_enrollments(count)
        `)
        .order('scheduled_at', { ascending: true });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const result = await query;
      return result.data;
    } catch (error) {
      throw new Error(`Failed to get workshops: ${error}`);
    }
  },

  async enrollInWorkshop(workshopId: string, profileId: string) {
    try {
      const result = await postgresClient
        .from('workshop_enrollments')
        .insert({
          workshop_id: workshopId,
          profile_id: profileId
        })
        .select()
        .single();
      return result.data;
    } catch (error) {
      throw new Error(`Failed to enroll in workshop: ${error}`);
    }
  },

  async getUserEnrollments(profileId: string) {
    try {
      const result = await postgresClient
        .from('workshop_enrollments')
        .select(`
          *,
          workshop:workshops(
            title,
            description,
            scheduled_at,
            duration_minutes,
            facilitator:profiles!workshops_facilitator_id_fkey(first_name, last_name)
          )
        `)
        .eq('profile_id', profileId)
        .order('enrolled_at', { ascending: false });
      return result.data;
    } catch (error) {
      throw new Error(`Failed to get user enrollments: ${error}`);
    }
  }
};

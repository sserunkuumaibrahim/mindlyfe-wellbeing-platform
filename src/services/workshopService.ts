
import { supabase } from '@/integrations/supabase/client';

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
    const { data: workshop, error } = await supabase
      .from('workshops')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return workshop;
  },

  async getWorkshops(organizationId?: string) {
    let query = supabase
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

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async enrollInWorkshop(workshopId: string, profileId: string) {
    const { data, error } = await supabase
      .from('workshop_enrollments')
      .insert({
        workshop_id: workshopId,
        profile_id: profileId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserEnrollments(profileId: string) {
    const { data, error } = await supabase
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

    if (error) throw error;
    return data;
  }
};

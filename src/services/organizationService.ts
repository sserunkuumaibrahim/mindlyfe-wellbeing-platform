
import { supabase } from '@/integrations/supabase/client';
import { notificationService } from './notificationService';

export interface OrganizationInvitationData {
  organization_id: string;
  email: string;
  invited_by: string;
  role: 'admin' | 'member';
}

export const organizationService = {
  async inviteUser(data: OrganizationInvitationData) {
    const { data: invitation, error } = await supabase
      .from('organization_invitations')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    // Send notification to the invited user
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', data.email)
      .single();

    if (profile) {
      await notificationService.createNotification(profile.id, {
        title: 'Organization Invitation',
        message: 'You have been invited to join an organization',
        type: 'info',
        data: { invitation_id: invitation.id }
      });
    }

    return invitation;
  },

  async getOrganizationMembers(organizationId: string) {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        profile:profiles(first_name, last_name, email, profile_photo_url, role)
      `)
      .eq('organization_id', organizationId);

    if (error) throw error;
    return data;
  },

  async acceptInvitation(invitationId: string, profileId: string) {
    const { data: invitation, error: invitationError } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (invitationError) throw invitationError;

    // Update invitation status
    await supabase
      .from('organization_invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invitationId);

    // Add to organization members
    const { data: member, error } = await supabase
      .from('organization_members')
      .insert({
        organization_id: invitation.organization_id,
        profile_id: profileId,
        role: invitation.role
      })
      .select()
      .single();

    if (error) throw error;
    return member;
  },

  async getOrganizationStats(organizationId: string) {
    const { data, error } = await supabase
      .rpc('get_organization_dashboard_stats', { org_id: organizationId });

    if (error) throw error;
    return data;
  }
};

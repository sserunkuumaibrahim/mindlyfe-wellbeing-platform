
import { postgresqlClient } from '@/integrations/postgresql/client';
import { notificationService } from './notificationService';

export interface OrganizationInvitationData {
  organization_id: string;
  email: string;
  invited_by: string;
  role: 'admin' | 'member';
}

export const organizationService = {
  async inviteUser(data: OrganizationInvitationData) {
    const result = await postgresqlClient
      .from('organization_invitations')
      .insert(data)
      .select()
      .single()
      .execute();

    if (result.error) throw new Error(result.error);

    // Send notification to the invited user
    const profileResult = await postgresqlClient
      .from('profiles')
      .select('id')
      .eq('email', data.email)
      .single()
      .execute();

    if (profileResult.data) {
      await notificationService.createNotification(profileResult.data.id, {
        title: 'Organization Invitation',
        message: 'You have been invited to join an organization',
        type: 'info',
        data: { invitation_id: result.data.id }
      });
    }

    return result.data;
  },

  async getOrganizationMembers(organizationId: string) {
    const result = await postgresqlClient
      .from('organization_members')
      .select(`
        *,
        profile:profiles(first_name, last_name, email, profile_photo_url, role)
      `)
      .eq('organization_id', organizationId)
      .execute();

    if (result.error) throw new Error(result.error);
    return result.data;
  },

  async acceptInvitation(invitationId: string, profileId: string) {
    const invitationResult = await postgresqlClient
      .from('organization_invitations')
      .select('*')
      .eq('id', invitationId)
      .single()
      .execute();

    if (invitationResult.error) throw new Error(invitationResult.error);

    // Update invitation status
    const updateResult = await postgresqlClient
      .from('organization_invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invitationId)
      .execute();

    if (updateResult.error) throw new Error(updateResult.error);

    // Add to organization members
    const memberResult = await postgresqlClient
      .from('organization_members')
      .insert({
        organization_id: invitationResult.data.organization_id,
        profile_id: profileId,
        role: invitationResult.data.role
      })
      .select()
      .single()
      .execute();

    if (memberResult.error) throw new Error(memberResult.error);
    return memberResult.data;
  },

  async getOrganizationStats(organizationId: string) {
    const result = await postgresqlClient
      .rpc('get_organization_dashboard_stats', { org_id: organizationId })
      .execute();

    if (result.error) throw new Error(result.error);
    return result.data;
  }
};

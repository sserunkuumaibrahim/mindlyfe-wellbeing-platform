-- Add missing foreign key constraints
ALTER TABLE public.therapist_profiles
ADD CONSTRAINT fk_therapist_profiles_reviewed_by
FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.organization_profiles
ADD CONSTRAINT fk_organization_profiles_reviewed_by
FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.organization_members
ADD CONSTRAINT fk_organization_members_invited_by
FOREIGN KEY (invited_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.group_sessions
ADD CONSTRAINT fk_group_sessions_facilitator_id
FOREIGN KEY (facilitator_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.workshops
ADD CONSTRAINT fk_workshops_facilitator_id
FOREIGN KEY (facilitator_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.organization_invitations
ADD CONSTRAINT fk_organization_invitations_invited_by
FOREIGN KEY (invited_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.session_notes
ADD CONSTRAINT fk_session_notes_therapist_id
FOREIGN KEY (therapist_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.session_resources
ADD CONSTRAINT fk_session_resources_created_by
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.educational_content
ADD CONSTRAINT fk_educational_content_author_id
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.therapist_approval_workflow
ADD CONSTRAINT fk_therapist_approval_workflow_assigned_to
FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.license_verifications
ADD CONSTRAINT fk_license_verifications_verified_by
FOREIGN KEY (verified_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.compliance_checks
ADD CONSTRAINT fk_compliance_checks_resolved_by
FOREIGN KEY (resolved_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.search_history
ADD CONSTRAINT fk_search_history_clicked_therapist_id
FOREIGN KEY (clicked_therapist_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.data_deletion_requests
ADD CONSTRAINT fk_data_deletion_requests_processed_by
FOREIGN KEY (processed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.subscription_changes
ADD CONSTRAINT fk_subscription_changes_processed_by
FOREIGN KEY (processed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

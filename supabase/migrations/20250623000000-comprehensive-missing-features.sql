-- Comprehensive Migration for Missing Features
-- This migration adds all the missing functionality identified in the SRS

-- ============================================================================
-- 1. VIDEO CALL INTEGRATION TABLES
-- ============================================================================

-- Video call sessions table
CREATE TABLE IF NOT EXISTS public.video_call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
  google_meet_url TEXT,
  google_meet_id TEXT,
  call_started_at TIMESTAMPTZ,
  call_ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  recording_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. PAYMENT PROCESSING TABLES (DPO PAY INTEGRATION)
-- ============================================================================

-- Payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL CHECK (method_type IN ('card', 'mobile_money', 'bank_transfer')),
  provider TEXT NOT NULL, -- DPO, MTN, Airtel, etc.
  masked_details TEXT, -- Last 4 digits of card, phone number, etc.
  dpo_token TEXT, -- DPO PayVault token
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UGX',
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'subscription')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  dpo_transaction_id TEXT,
  dpo_reference TEXT,
  gateway_response JSONB,
  failure_reason TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Refunds table
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
  refund_transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  dpo_refund_id TEXT,
  processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. ADVANCED SESSION FEATURES
-- ============================================================================

-- Session rescheduling history
CREATE TABLE IF NOT EXISTS public.session_reschedule_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
  old_scheduled_at TIMESTAMPTZ NOT NULL,
  new_scheduled_at TIMESTAMPTZ NOT NULL,
  rescheduled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cancellation policies
CREATE TABLE IF NOT EXISTS public.cancellation_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  hours_before_session INTEGER NOT NULL DEFAULT 24,
  refund_percentage DECIMAL(5,2) NOT NULL DEFAULT 100.00 CHECK (refund_percentage >= 0 AND refund_percentage <= 100),
  policy_text TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Session notes and resources
CREATE TABLE IF NOT EXISTS public.session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  is_shared_with_client BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.session_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
  resource_title TEXT NOT NULL,
  resource_url TEXT,
  resource_type TEXT CHECK (resource_type IN ('document', 'video', 'audio', 'link', 'exercise')),
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. EMAIL/SMS NOTIFICATIONS
-- ============================================================================

-- Notification templates
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push')),
  subject TEXT, -- For emails
  body_template TEXT NOT NULL,
  variables JSONB, -- Template variables
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notification queue
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push')),
  recipient TEXT NOT NULL, -- Email or phone number
  subject TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  scheduled_for TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Session reminders
CREATE TABLE IF NOT EXISTS public.session_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24_hours', '2_hours', '30_minutes')),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'sms', 'both')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. CONTENT MANAGEMENT SYSTEM
-- ============================================================================

-- Content categories
CREATE TABLE IF NOT EXISTS public.content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_category_id UUID REFERENCES public.content_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Educational content
CREATE TABLE IF NOT EXISTS public.educational_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'video', 'audio', 'exercise', 'worksheet')),
  category_id UUID REFERENCES public.content_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tags TEXT[],
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_minutes INTEGER,
  thumbnail_url TEXT,
  file_url TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Resource library access
CREATE TABLE IF NOT EXISTS public.content_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.educational_content(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(content_id, profile_id)
);

-- ============================================================================
-- 6. ADVANCED ADMIN FEATURES
-- ============================================================================

-- Therapist approval workflow
CREATE TABLE IF NOT EXISTS public.therapist_approval_workflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES public.therapist_profiles(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL CHECK (current_step IN ('document_review', 'license_verification', 'background_check', 'interview', 'final_approval')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'on_hold')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  documents_verified BOOLEAN DEFAULT false,
  license_verified BOOLEAN DEFAULT false,
  background_check_completed BOOLEAN DEFAULT false,
  interview_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- License verification
CREATE TABLE IF NOT EXISTS public.license_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES public.therapist_profiles(id) ON DELETE CASCADE,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('manual', 'automated', 'third_party')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'expired')),
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verification_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  verification_notes TEXT,
  external_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compliance monitoring
CREATE TABLE IF NOT EXISTS public.compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL CHECK (check_type IN ('license_expiry', 'insurance_expiry', 'document_update', 'session_notes', 'data_retention')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'warning')),
  details JSONB,
  due_date TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 7. SEARCH & DISCOVERY
-- ============================================================================

-- Therapist search filters
CREATE TABLE IF NOT EXISTS public.therapist_search_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES public.therapist_profiles(id) ON DELETE CASCADE,
  specializations TEXT[] NOT NULL,
  languages TEXT[] NOT NULL,
  session_types TEXT[] NOT NULL,
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  availability_hours JSONB, -- Store available hours per day
  location_city TEXT,
  location_country TEXT,
  accepts_insurance BOOLEAN DEFAULT false,
  years_experience_min INTEGER,
  rating_average DECIMAL(3,2) DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  is_accepting_new_clients BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Search history for analytics
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  search_query TEXT,
  filters_applied JSONB,
  results_count INTEGER,
  clicked_therapist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_booked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 8. SECURITY FEATURES
-- ============================================================================

-- Two-factor authentication
CREATE TABLE IF NOT EXISTS public.two_factor_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  method TEXT NOT NULL CHECK (method IN ('email', 'sms', 'authenticator')),
  secret_key TEXT, -- For authenticator apps
  backup_codes TEXT[], -- Array of backup codes
  is_enabled BOOLEAN DEFAULT false,
  phone_number TEXT, -- For SMS 2FA
  email_address TEXT, -- For email 2FA
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security settings
CREATE TABLE IF NOT EXISTS public.security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  require_2fa BOOLEAN DEFAULT false,
  session_timeout_minutes INTEGER DEFAULT 60,
  password_expiry_days INTEGER DEFAULT 90,
  login_notification_enabled BOOLEAN DEFAULT true,
  suspicious_activity_alerts BOOLEAN DEFAULT true,
  data_export_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Login attempts tracking
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  two_fa_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 9. COMPLIANCE & DATA MANAGEMENT
-- ============================================================================

-- Consent forms
CREATE TABLE IF NOT EXISTS public.consent_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT NOT NULL,
  form_type TEXT NOT NULL CHECK (form_type IN ('therapy_consent', 'data_processing', 'recording_consent', 'minor_consent')),
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User consent records
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_form_id UUID REFERENCES public.consent_forms(id) ON DELETE CASCADE,
  consented BOOLEAN NOT NULL,
  consent_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  withdrawn_at TIMESTAMPTZ,
  UNIQUE(profile_id, consent_form_id)
);

-- Data retention policies
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL CHECK (data_type IN ('session_notes', 'messages', 'recordings', 'documents', 'audit_logs')),
  retention_period_days INTEGER NOT NULL,
  auto_delete BOOLEAN DEFAULT false,
  policy_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data deletion requests (GDPR)
CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('full_deletion', 'partial_deletion', 'data_export')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  requested_data_types TEXT[],
  reason TEXT,
  processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ,
  completion_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 10. SUBSCRIPTION MANAGEMENT ENHANCEMENTS
-- ============================================================================

-- Subscription change history
CREATE TABLE IF NOT EXISTS public.subscription_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'renewal', 'cancellation', 'reactivation')),
  old_plan_type TEXT,
  new_plan_type TEXT,
  old_amount DECIMAL(10,2),
  new_amount DECIMAL(10,2),
  effective_date TIMESTAMPTZ NOT NULL,
  prorated_amount DECIMAL(10,2),
  reason TEXT,
  processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Billing cycles
CREATE TABLE IF NOT EXISTS public.billing_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  cycle_start TIMESTAMPTZ NOT NULL,
  cycle_end TIMESTAMPTZ NOT NULL,
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  invoice_generated BOOLEAN DEFAULT false,
  payment_due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Video call sessions
CREATE INDEX IF NOT EXISTS idx_video_call_sessions_session_id ON public.video_call_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_video_call_sessions_status ON public.video_call_sessions(status);

-- Payment methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_profile_id ON public.payment_methods(profile_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON public.payment_methods(profile_id, is_default) WHERE is_default = true;

-- Payment transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_profile_id ON public.payment_transactions(profile_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_dpo_id ON public.payment_transactions(dpo_transaction_id);

-- Session features
CREATE INDEX IF NOT EXISTS idx_session_reschedule_history_session_id ON public.session_reschedule_history(session_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_session_id ON public.session_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_session_resources_session_id ON public.session_resources(session_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON public.notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON public.notification_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_session_reminders_session_id ON public.session_reminders(session_id);

-- Content management
CREATE INDEX IF NOT EXISTS idx_educational_content_category ON public.educational_content(category_id);
CREATE INDEX IF NOT EXISTS idx_educational_content_published ON public.educational_content(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_content_access_profile_id ON public.content_access(profile_id);

-- Search and discovery
CREATE INDEX IF NOT EXISTS idx_therapist_search_filters_therapist_id ON public.therapist_search_filters(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_search_specializations ON public.therapist_search_filters USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_search_history_profile_id ON public.search_history(profile_id);

-- Security
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email, created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON public.login_attempts(ip_address, created_at);

-- Compliance
CREATE INDEX IF NOT EXISTS idx_user_consents_profile_id ON public.user_consents(profile_id);
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_status ON public.data_deletion_requests(status);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscription_changes_subscription_id ON public.subscription_changes(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_cycles_subscription_id ON public.billing_cycles(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_cycles_status ON public.billing_cycles(status, payment_due_date);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.video_call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_reschedule_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_approval_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_search_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_cycles ENABLE ROW LEVEL SECURITY;

-- Video call sessions policies
CREATE POLICY "Users can view their video call sessions" ON public.video_call_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.therapy_sessions ts 
      WHERE ts.id = session_id 
      AND (ts.client_id = auth.uid() OR ts.therapist_id = auth.uid())
    )
  );

CREATE POLICY "Session participants can update video calls" ON public.video_call_sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.therapy_sessions ts 
      WHERE ts.id = session_id 
      AND (ts.client_id = auth.uid() OR ts.therapist_id = auth.uid())
    )
  );

-- Payment methods policies
CREATE POLICY "Users can manage their payment methods" ON public.payment_methods
  FOR ALL USING (profile_id = auth.uid());

-- Payment transactions policies
CREATE POLICY "Users can view their transactions" ON public.payment_transactions
  FOR SELECT USING (profile_id = auth.uid());

-- Session features policies
CREATE POLICY "Session participants can view reschedule history" ON public.session_reschedule_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.therapy_sessions ts 
      WHERE ts.id = session_id 
      AND (ts.client_id = auth.uid() OR ts.therapist_id = auth.uid())
    )
  );

CREATE POLICY "Therapists can manage their cancellation policies" ON public.cancellation_policies
  FOR ALL USING (therapist_id = auth.uid());

CREATE POLICY "Therapists can manage session notes" ON public.session_notes
  FOR ALL USING (therapist_id = auth.uid());

CREATE POLICY "Session participants can view shared notes" ON public.session_notes
  FOR SELECT USING (
    therapist_id = auth.uid() OR 
    (is_shared_with_client = true AND EXISTS (
      SELECT 1 FROM public.therapy_sessions ts 
      WHERE ts.id = session_id AND ts.client_id = auth.uid()
    ))
  );

-- Content management policies
CREATE POLICY "Anyone can view published content" ON public.educational_content
  FOR SELECT USING (is_published = true);

CREATE POLICY "Therapists can manage their content" ON public.educational_content
  FOR ALL USING (author_id = auth.uid());

CREATE POLICY "Users can track their content access" ON public.content_access
  FOR ALL USING (profile_id = auth.uid());

-- Search policies
CREATE POLICY "Anyone can view therapist search filters" ON public.therapist_search_filters
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Therapists can manage their search filters" ON public.therapist_search_filters
  FOR ALL USING (therapist_id = auth.uid());

CREATE POLICY "Users can view their search history" ON public.search_history
  FOR SELECT USING (profile_id = auth.uid());

-- Security policies
CREATE POLICY "Users can manage their 2FA settings" ON public.two_factor_auth
  FOR ALL USING (profile_id = auth.uid());

CREATE POLICY "Users can manage their security settings" ON public.security_settings
  FOR ALL USING (profile_id = auth.uid());

-- Compliance policies
CREATE POLICY "Users can view their consents" ON public.user_consents
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can manage their data deletion requests" ON public.data_deletion_requests
  FOR ALL USING (profile_id = auth.uid());

-- Admin policies
CREATE POLICY "Admins can manage approval workflows" ON public.therapist_approval_workflow
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.auth_uid = auth.uid() 
      AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage license verifications" ON public.license_verifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.auth_uid = auth.uid() 
      AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can view compliance checks" ON public.compliance_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.auth_uid = auth.uid() 
      AND p.role = 'admin'
    )
  );

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update therapist search filters when profile changes
CREATE OR REPLACE FUNCTION update_therapist_search_filters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'therapist_profiles' THEN
    INSERT INTO public.therapist_search_filters (
      therapist_id, specializations, languages, session_types,
      price_range_min, price_range_max, years_experience_min
    )
    VALUES (
      NEW.id, NEW.specializations, NEW.languages_spoken, 
      ARRAY['virtual', 'in_person'], NEW.hourly_rate, NEW.hourly_rate, NEW.years_experience
    )
    ON CONFLICT (therapist_id) DO UPDATE SET
      specializations = NEW.specializations,
      languages = NEW.languages_spoken,
      price_range_min = NEW.hourly_rate,
      price_range_max = NEW.hourly_rate,
      years_experience_min = NEW.years_experience,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search filters
CREATE TRIGGER update_therapist_search_filters_trigger
  AFTER INSERT OR UPDATE ON public.therapist_profiles
  FOR EACH ROW EXECUTE FUNCTION update_therapist_search_filters();

-- Function to create session reminders
CREATE OR REPLACE FUNCTION create_session_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Create reminders for both client and therapist
  INSERT INTO public.session_reminders (session_id, profile_id, reminder_type, notification_type)
  VALUES 
    (NEW.id, NEW.client_id, '24_hours', 'email'),
    (NEW.id, NEW.client_id, '2_hours', 'sms'),
    (NEW.id, NEW.therapist_id, '24_hours', 'email'),
    (NEW.id, NEW.therapist_id, '2_hours', 'email');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create session reminders
CREATE TRIGGER create_session_reminders_trigger
  AFTER INSERT ON public.therapy_sessions
  FOR EACH ROW EXECUTE FUNCTION create_session_reminders();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_video_call_sessions_updated_at
  BEFORE UPDATE ON public.video_call_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default notification templates
INSERT INTO public.notification_templates (name, type, subject, body_template, variables) VALUES
('session_reminder_24h', 'email', 'Session Reminder - Tomorrow', 
 'Hi {{client_name}}, you have a therapy session scheduled for tomorrow at {{session_time}} with {{therapist_name}}.', 
 '{"client_name": "string", "session_time": "datetime", "therapist_name": "string"}'),
('session_reminder_2h', 'sms', '', 
 'Reminder: Your therapy session with {{therapist_name}} starts in 2 hours at {{session_time}}.', 
 '{"therapist_name": "string", "session_time": "datetime"}'),
('session_cancelled', 'email', 'Session Cancelled', 
 'Your therapy session scheduled for {{session_time}} has been cancelled. Reason: {{reason}}', 
 '{"session_time": "datetime", "reason": "string"}'),
('payment_successful', 'email', 'Payment Confirmation', 
 'Your payment of {{amount}} {{currency}} has been processed successfully.', 
 '{"amount": "number", "currency": "string"}'),
('therapist_approved', 'email', 'Application Approved', 
 'Congratulations! Your therapist application has been approved. You can now start accepting clients.', 
 '{}');

-- Insert default consent forms
INSERT INTO public.consent_forms (title, content, version, form_type) VALUES
('Therapy Consent Form', 'I consent to receiving therapy services through this platform...', '1.0', 'therapy_consent'),
('Data Processing Consent', 'I consent to the processing of my personal data for therapy services...', '1.0', 'data_processing'),
('Session Recording Consent', 'I consent to the recording of therapy sessions for quality and training purposes...', '1.0', 'recording_consent');

-- Insert default data retention policies
INSERT INTO public.data_retention_policies (data_type, retention_period_days, auto_delete, policy_description) VALUES
('session_notes', 2555, false, 'Session notes retained for 7 years as per professional standards'),
('messages', 1095, true, 'Messages retained for 3 years then automatically deleted'),
('recordings', 1825, false, 'Session recordings retained for 5 years'),
('audit_logs', 2555, false, 'Audit logs retained for 7 years for compliance'),
('documents', 2555, false, 'User documents retained for 7 years');

-- Insert default content categories
INSERT INTO public.content_categories (name, description, sort_order) VALUES
('Mental Health Basics', 'Fundamental concepts in mental health and wellness', 1),
('Anxiety Management', 'Resources for managing anxiety and stress', 2),
('Depression Support', 'Content related to depression awareness and coping', 3),
('Relationship Skills', 'Communication and relationship building resources', 4),
('Mindfulness & Meditation', 'Mindfulness practices and meditation guides', 5),
('Self-Care Strategies', 'Self-care techniques and wellness practices', 6);

-- ============================================================================
-- FIX USER_ROLE ENUM ISSUE
-- ============================================================================

-- Fix user_role enum to include all valid roles used in the codebase
-- This resolves the "invalid input value for enum user_role: 'sys_admin'" error

-- Drop the existing enum and recreate it with the correct values
DROP TYPE IF EXISTS public.user_role CASCADE;

-- Create the user_role enum with all roles actually used in the codebase:
-- individual: Regular users/clients
-- therapist: Mental health professionals
-- org_admin: Organization administrators
-- admin: System administrators (replaces sys_admin and super_admin)
CREATE TYPE public.user_role AS ENUM (
    'individual',
    'therapist', 
    'org_admin',
    'admin'
);

-- Handle the profiles table role column properly
DO $$
BEGIN
    -- Check if the role column exists (it may have been dropped with CASCADE)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role' AND table_schema = 'public') THEN
        -- Add the role column if it doesn't exist
        ALTER TABLE public.profiles ADD COLUMN role public.user_role NOT NULL DEFAULT 'individual';
    ELSE
        -- Update existing role column type with proper conversion
        ALTER TABLE public.profiles 
        ALTER COLUMN role TYPE public.user_role 
        USING CASE 
            WHEN role::text = 'sys_admin' THEN 'admin'::public.user_role
            WHEN role::text = 'super_admin' THEN 'admin'::public.user_role
            ELSE COALESCE(role::text::public.user_role, 'individual'::public.user_role)
        END;
        
        -- Set default value
        ALTER TABLE public.profiles 
        ALTER COLUMN role SET DEFAULT 'individual'::public.user_role;
    END IF;
END $$;

-- Update any existing data that might have old role values
UPDATE public.profiles 
SET role = 'admin'::public.user_role 
WHERE role::text IN ('sys_admin', 'super_admin');

-- Recreate the handle_new_user function with the correct enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    user_role_value public.user_role;
    org_name TEXT;
    reg_number TEXT;
    tax_id TEXT;
    rep_job_title TEXT;
    rep_national_id TEXT;
    org_type TEXT;
    num_employees INTEGER;
BEGIN
    -- Get user email
    user_email := NEW.email;
    
    -- Get and validate user role
    user_role_value := COALESCE(
        (NEW.raw_user_meta_data ->> 'role')::public.user_role, 
        'individual'::public.user_role
    );
    
    -- Validate role is one of the allowed values
    IF user_role_value NOT IN ('individual', 'therapist', 'org_admin', 'admin') THEN
        user_role_value := 'individual'::public.user_role;
    END IF;
    
    RAISE LOG 'handle_new_user: Processing user % with email % and role %', NEW.id, user_email, user_role_value;
    
    -- Insert into profiles table
    INSERT INTO public.profiles (
        auth_uid,
        email,
        first_name,
        last_name,
        phone_number,
        date_of_birth,
        gender,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        user_email,
        COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
        NEW.raw_user_meta_data ->> 'phone_number',
        CASE 
            WHEN NEW.raw_user_meta_data ->> 'date_of_birth' IS NOT NULL 
            THEN (NEW.raw_user_meta_data ->> 'date_of_birth')::DATE
            ELSE NULL
        END,
        COALESCE((NEW.raw_user_meta_data ->> 'gender')::public.gender_type, NULL),
        user_role_value,
        NOW(),
        NOW()
    );
    
    -- Role-specific profile creation
    IF user_role_value = 'individual'::public.user_role THEN
        -- Create individual profile
        INSERT INTO public.individual_profiles (
            profile_id,
            emergency_contact_name,
            emergency_contact_phone,
            medical_history,
            current_medications,
            therapy_goals,
            preferred_session_type,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.raw_user_meta_data ->> 'emergency_contact_name',
            NEW.raw_user_meta_data ->> 'emergency_contact_phone',
            NEW.raw_user_meta_data ->> 'medical_history',
            NEW.raw_user_meta_data ->> 'current_medications',
            NEW.raw_user_meta_data ->> 'therapy_goals',
            COALESCE((NEW.raw_user_meta_data ->> 'preferred_session_type')::public.session_type, 'virtual'),
            NOW(),
            NOW()
        );
        
    ELSIF user_role_value = 'therapist'::public.user_role THEN
        -- Create therapist profile
        INSERT INTO public.therapist_profiles (
            id,
            license_number,
            license_body,
            national_id_number,
            specializations,
            years_experience,
            education_background,
            languages_spoken,
            bio,
            status,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data ->> 'license_number', 'PENDING'),
            COALESCE(NEW.raw_user_meta_data ->> 'license_body', 'Uganda Medical and Dental Practitioners Council'),
            COALESCE(NEW.raw_user_meta_data ->> 'national_id_number', 'PENDING'),
            CASE 
                WHEN NEW.raw_user_meta_data ->> 'specializations' IS NOT NULL 
                THEN (NEW.raw_user_meta_data ->> 'specializations')::TEXT[]
                ELSE ARRAY['General Therapy']::TEXT[]
            END,
            COALESCE((NEW.raw_user_meta_data ->> 'years_experience')::INTEGER, 0),
            NEW.raw_user_meta_data ->> 'education_background',
            CASE 
                WHEN NEW.raw_user_meta_data ->> 'languages_spoken' IS NOT NULL 
                THEN (NEW.raw_user_meta_data ->> 'languages_spoken')::TEXT[]
                ELSE ARRAY['English']::TEXT[]
            END,
            NEW.raw_user_meta_data ->> 'bio',
            'pending_review'::profile_status,
            NOW(),
            NOW()
        );
        
    ELSIF user_role_value = 'org_admin'::public.user_role THEN
        -- Validate required organization fields
        org_name := NEW.raw_user_meta_data ->> 'organization_name';
        reg_number := NEW.raw_user_meta_data ->> 'registration_number';
        tax_id := NEW.raw_user_meta_data ->> 'tax_id_number';
        rep_job_title := NEW.raw_user_meta_data ->> 'representative_job_title';
        rep_national_id := NEW.raw_user_meta_data ->> 'representative_national_id';
        
        IF org_name IS NULL OR org_name = '' THEN
            RAISE EXCEPTION 'Organization name is required for organization admins';
        END IF;
        
        IF reg_number IS NULL OR reg_number = '' THEN
            RAISE EXCEPTION 'Registration number is required for organization admins';
        END IF;
        
        IF tax_id IS NULL OR tax_id = '' THEN
            RAISE EXCEPTION 'Tax ID number is required for organization admins';
        END IF;
        
        -- Create organization profile
        INSERT INTO public.organization_profiles (
            profile_id,
            organization_name,
            registration_number,
            tax_id_number,
            date_of_establishment,
            organization_type,
            num_employees,
            representative_job_title,
            representative_national_id,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            org_name,
            reg_number,
            tax_id,
            CASE 
                WHEN NEW.raw_user_meta_data ->> 'date_of_establishment' IS NOT NULL 
                THEN (NEW.raw_user_meta_data ->> 'date_of_establishment')::DATE
                ELSE NULL
            END,
            COALESCE((NEW.raw_user_meta_data ->> 'organization_type')::public.organization_type, 'private_company'),
            COALESCE((NEW.raw_user_meta_data ->> 'num_employees')::INTEGER, 1),
            COALESCE(rep_job_title, 'Administrator'),
            rep_national_id,
            NOW(),
            NOW()
        );
    END IF;
    
    -- Log successful processing
    RAISE LOG 'Successfully processed new user: % with role: %', user_email, user_role_value;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user for user %: %', user_email, SQLERRM;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add comment for documentation
COMMENT ON TYPE public.user_role IS 'User roles: individual (clients), therapist (mental health professionals), org_admin (organization administrators), admin (system administrators)';
COMMENT ON FUNCTION public.handle_new_user() IS 'Handles new user registration with proper validation for required fields based on user role. Updated to use correct user_role enum values.';

COMMIT;
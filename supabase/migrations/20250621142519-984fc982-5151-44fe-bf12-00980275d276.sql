
-- Create all missing tables first
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  plan_type TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  price_ugx INTEGER NOT NULL,
  sessions_included INTEGER DEFAULT 0,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  event_type TEXT DEFAULT 'session',
  related_id UUID,
  google_calendar_id TEXT,
  reminder_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  required_for_role TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.document_categories(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'pending_review',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  facilitator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organization_profiles(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 90,
  max_participants INTEGER DEFAULT 20,
  price_ugx INTEGER DEFAULT 0,
  workshop_type TEXT DEFAULT 'mental_health',
  status TEXT DEFAULT 'scheduled',
  google_meet_url TEXT,
  materials_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workshop_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'enrolled',
  payment_status TEXT DEFAULT 'pending',
  UNIQUE(workshop_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organization_profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ
);

-- Now clear and insert correct pricing plans
DELETE FROM public.pricing_plans;

INSERT INTO public.pricing_plans (name, description, plan_type, billing_cycle, price_ugx, sessions_included, features) VALUES
('Professional Monthly', 'Monthly individual plan with 4 sessions', 'professional_monthly', 'monthly', 200000, 4, '{"video_calls": true, "messaging": true, "session_notes": true}'),
('Organization Annual', 'Annual organization plan - 680,000 UGX per user with 8 sessions', 'organization_annual', 'annual', 680000, 8, '{"video_calls": true, "messaging": true, "group_sessions": true, "analytics": true, "manual_billing": true}');

-- Update subscriptions table
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'automatic';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS num_users INTEGER DEFAULT 1;

-- Create organization invoices table
CREATE TABLE IF NOT EXISTS public.organization_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organization_profiles(id) ON DELETE CASCADE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  num_users INTEGER NOT NULL,
  amount_ugx INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Update organization_members table
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS annual_sessions_limit INTEGER DEFAULT 8;
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS annual_sessions_used INTEGER DEFAULT 0;
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS sessions_reset_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 year');

-- Create session pricing table
CREATE TABLE IF NOT EXISTS public.session_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_ugx INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert session pricing rules
INSERT INTO public.session_pricing (name, price_ugx, description) VALUES
('Individual Session (No Subscription)', 76000, 'Price per session for users without subscription'),
('Organization Excess Session', 76000, 'Price per session when organization member exceeds 8 annual sessions');

-- Insert document categories
INSERT INTO public.document_categories (name, description, required_for_role) VALUES
('Professional License', 'Professional therapy license document', ARRAY['therapist']),
('Insurance Certificate', 'Professional insurance certificate', ARRAY['therapist']),
('National ID', 'National identification document', ARRAY['therapist', 'org_admin']),
('Business Registration', 'Organization business registration certificate', ARRAY['org_admin']),
('Tax Certificate', 'Tax registration certificate', ARRAY['org_admin']);

-- Enable RLS on new tables
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_pricing ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active pricing plans" ON public.pricing_plans
FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their calendar events" ON public.calendar_events
FOR ALL USING (profile_id = (SELECT id FROM public.profiles WHERE auth_uid = auth.uid()));

CREATE POLICY "Anyone can view document categories" ON public.document_categories
FOR SELECT USING (true);

CREATE POLICY "Users can view their documents" ON public.documents
FOR ALL USING (profile_id = (SELECT id FROM public.profiles WHERE auth_uid = auth.uid()));

CREATE POLICY "Users can view workshops" ON public.workshops
FOR SELECT USING (true);

CREATE POLICY "Users can view their workshop enrollments" ON public.workshop_enrollments
FOR ALL USING (profile_id = (SELECT id FROM public.profiles WHERE auth_uid = auth.uid()));

CREATE POLICY "Users can view invitations sent to their email" ON public.organization_invitations
FOR SELECT USING (email = (SELECT email FROM public.profiles WHERE auth_uid = auth.uid()));

CREATE POLICY "Organization admins can view their invoices" ON public.organization_invoices
FOR SELECT USING (
  organization_id IN (
    SELECT id FROM public.organization_profiles 
    WHERE id = (SELECT id FROM public.profiles WHERE auth_uid = auth.uid())
  )
);

CREATE POLICY "Anyone can view active session pricing" ON public.session_pricing
FOR SELECT USING (is_active = true);

-- Create the payment check function
CREATE OR REPLACE FUNCTION public.check_session_payment_required(user_profile_id UUID)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH user_org_status AS (
    SELECT 
      om.organization_id,
      om.annual_sessions_used,
      om.annual_sessions_limit,
      om.sessions_reset_date
    FROM public.organization_members om
    WHERE om.profile_id = user_profile_id
    LIMIT 1
  ),
  user_subscription AS (
    SELECT 
      s.sessions_included,
      s.sessions_used,
      s.status,
      s.plan_type,
      s.start_date,
      s.end_date
    FROM public.subscriptions s
    WHERE s.profile_id = user_profile_id 
    AND s.status = 'active'
    AND s.plan_type = 'professional_monthly'
    AND s.end_date > now()
    LIMIT 1
  )
  SELECT 
    CASE 
      WHEN (SELECT organization_id FROM user_org_status) IS NOT NULL THEN
        CASE 
          WHEN (SELECT sessions_reset_date FROM user_org_status) < CURRENT_DATE THEN
            jsonb_build_object(
              'payment_required', false,
              'reason', 'organization_covered',
              'sessions_remaining', (SELECT annual_sessions_limit FROM user_org_status),
              'reset_sessions', true
            )
          WHEN (SELECT annual_sessions_used FROM user_org_status) < (SELECT annual_sessions_limit FROM user_org_status) THEN
            jsonb_build_object(
              'payment_required', false,
              'reason', 'organization_covered',
              'sessions_remaining', (SELECT annual_sessions_limit - annual_sessions_used FROM user_org_status)
            )
          ELSE
            jsonb_build_object(
              'payment_required', true,
              'reason', 'organization_limit_exceeded',
              'amount_ugx', 76000,
              'sessions_remaining', 0
            )
        END
      WHEN (SELECT status FROM user_subscription) = 'active' THEN
        CASE 
          WHEN (SELECT sessions_used FROM user_subscription) < (SELECT sessions_included FROM user_subscription) THEN
            jsonb_build_object(
              'payment_required', false,
              'reason', 'subscription_covered',
              'sessions_remaining', (SELECT sessions_included - sessions_used FROM user_subscription)
            )
          ELSE
            jsonb_build_object(
              'payment_required', true,
              'reason', 'subscription_limit_exceeded',
              'amount_ugx', 76000,
              'sessions_remaining', 0
            )
        END
      ELSE
        jsonb_build_object(
          'payment_required', true,
          'reason', 'no_subscription',
          'amount_ugx', 76000,
          'sessions_remaining', 0
        )
    END as payment_info;
$$;

-- Organization stats function
CREATE OR REPLACE FUNCTION public.get_organization_dashboard_stats(org_id UUID)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH current_invoice AS (
    SELECT 
      COUNT(om.*) as total_members,
      COUNT(om.*) * 680000 as annual_amount
    FROM public.organization_members om
    WHERE om.organization_id = org_id
  ),
  session_usage AS (
    SELECT 
      SUM(om.annual_sessions_used) as total_sessions_used,
      SUM(om.annual_sessions_limit) as total_sessions_included
    FROM public.organization_members om
    WHERE om.organization_id = org_id
  )
  SELECT jsonb_build_object(
    'total_members', (SELECT total_members FROM current_invoice),
    'annual_invoice_amount', (SELECT annual_amount FROM current_invoice),
    'per_user_cost', 680000,
    'sessions_per_user', 8,
    'total_sessions_included', (SELECT total_sessions_included FROM session_usage),
    'total_sessions_used', (SELECT total_sessions_used FROM session_usage),
    'pending_invoice_amount', (SELECT annual_amount FROM current_invoice)
  );
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_profile_id ON public.calendar_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_documents_profile_id ON public.documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_workshop_enrollments_profile_id ON public.workshop_enrollments(profile_id);
CREATE INDEX IF NOT EXISTS idx_organization_invoices_org_id ON public.organization_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_sessions ON public.organization_members(profile_id, annual_sessions_used, sessions_reset_date);

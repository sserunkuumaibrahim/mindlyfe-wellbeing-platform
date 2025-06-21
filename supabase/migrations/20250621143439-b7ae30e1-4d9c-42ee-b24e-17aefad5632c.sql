
-- Drop existing conflicting policies first
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Profile photos are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Therapists can upload session recordings" ON storage.objects;
DROP POLICY IF EXISTS "Session participants can view recordings" ON storage.objects;

-- Create storage buckets (ignore if they exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']),
  ('profile-photos', 'profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']),
  ('session-recordings', 'session-recordings', false, 1073741824, ARRAY['video/mp4', 'video/webm', 'audio/mp3', 'audio/wav'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can upload profile photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Profile photos are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Therapists can upload session recordings" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'session-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Session participants can view recordings" ON storage.objects
FOR SELECT USING (bucket_id = 'session-recordings');

-- Create all missing tables
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

CREATE TABLE IF NOT EXISTS public.session_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_ugx INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to existing tables
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'automatic';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS num_users INTEGER DEFAULT 1;

ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS annual_sessions_limit INTEGER DEFAULT 8;
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS annual_sessions_used INTEGER DEFAULT 0;
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS sessions_reset_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 year');

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.subscriptions(id);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'session';

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender gender_type;

-- Enable RLS on all new tables
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_pricing ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Anyone can view active pricing plans" ON public.pricing_plans;
DROP POLICY IF EXISTS "Users can manage their calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Anyone can view document categories" ON public.document_categories;
DROP POLICY IF EXISTS "Users can manage their documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view workshops" ON public.workshops;
DROP POLICY IF EXISTS "Facilitators can manage their workshops" ON public.workshops;
DROP POLICY IF EXISTS "Users can manage their workshop enrollments" ON public.workshop_enrollments;
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization admins can manage their invoices" ON public.organization_invoices;
DROP POLICY IF EXISTS "Anyone can view active session pricing" ON public.session_pricing;

-- Create RLS policies
CREATE POLICY "Anyone can view active pricing plans" ON public.pricing_plans
FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their calendar events" ON public.calendar_events
FOR ALL USING (profile_id = (SELECT id FROM public.profiles WHERE auth_uid = auth.uid()));

CREATE POLICY "Anyone can view document categories" ON public.document_categories
FOR SELECT USING (true);

CREATE POLICY "Users can manage their documents" ON public.documents
FOR ALL USING (profile_id = (SELECT id FROM public.profiles WHERE auth_uid = auth.uid()));

CREATE POLICY "Users can view workshops" ON public.workshops
FOR SELECT USING (true);

CREATE POLICY "Facilitators can manage their workshops" ON public.workshops
FOR ALL USING (facilitator_id = (SELECT id FROM public.profiles WHERE auth_uid = auth.uid()));

CREATE POLICY "Users can manage their workshop enrollments" ON public.workshop_enrollments
FOR ALL USING (profile_id = (SELECT id FROM public.profiles WHERE auth_uid = auth.uid()));

CREATE POLICY "Users can view invitations sent to their email" ON public.organization_invitations
FOR SELECT USING (email = (SELECT email FROM public.profiles WHERE auth_uid = auth.uid()));

CREATE POLICY "Organization admins can manage their invoices" ON public.organization_invoices
FOR ALL USING (
  organization_id IN (
    SELECT id FROM public.organization_profiles 
    WHERE id = (SELECT id FROM public.profiles WHERE auth_uid = auth.uid())
  )
);

CREATE POLICY "Anyone can view active session pricing" ON public.session_pricing
FOR SELECT USING (is_active = true);

-- Insert essential data
DELETE FROM public.pricing_plans;
INSERT INTO public.pricing_plans (name, description, plan_type, billing_cycle, price_ugx, sessions_included, features) VALUES
('Professional Monthly', 'Monthly individual plan with 4 sessions', 'professional_monthly', 'monthly', 200000, 4, '{"video_calls": true, "messaging": true, "session_notes": true}'),
('Organization Annual', 'Annual organization plan - 680,000 UGX per user with 8 sessions', 'organization_annual', 'annual', 680000, 8, '{"video_calls": true, "messaging": true, "group_sessions": true, "analytics": true, "manual_billing": true}');

DELETE FROM public.session_pricing;
INSERT INTO public.session_pricing (name, price_ugx, description) VALUES
('Individual Session (No Subscription)', 76000, 'Price per session for users without subscription'),
('Organization Excess Session', 76000, 'Price per session when organization member exceeds 8 annual sessions');

DELETE FROM public.document_categories;
INSERT INTO public.document_categories (name, description, required_for_role) VALUES
('Professional License', 'Professional therapy license document', ARRAY['therapist']),
('Insurance Certificate', 'Professional insurance certificate', ARRAY['therapist']),
('National ID', 'National identification document', ARRAY['therapist', 'org_admin']),
('Business Registration', 'Organization business registration certificate', ARRAY['org_admin']),
('Tax Certificate', 'Tax registration certificate', ARRAY['org_admin']);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_auth_uid ON public.profiles(auth_uid);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_calendar_events_profile_id ON public.calendar_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_documents_profile_id ON public.documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_documents_category_id ON public.documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_workshop_enrollments_profile_id ON public.workshop_enrollments(profile_id);
CREATE INDEX IF NOT EXISTS idx_workshop_enrollments_workshop_id ON public.workshop_enrollments(workshop_id);
CREATE INDEX IF NOT EXISTS idx_organization_invoices_org_id ON public.organization_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_sessions ON public.organization_members(profile_id, annual_sessions_used, sessions_reset_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_profile_id ON public.subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_client_therapist ON public.therapy_sessions(client_id, therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_scheduled_at ON public.therapy_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_participants ON public.messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_profile_unread ON public.notifications(profile_id, is_read);

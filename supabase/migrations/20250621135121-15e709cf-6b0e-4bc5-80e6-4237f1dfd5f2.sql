
-- Add missing status column to therapist_profiles
ALTER TABLE public.therapist_profiles 
ADD COLUMN IF NOT EXISTS status profile_status DEFAULT 'pending_review';

-- Create missing enum types
DO $$ 
BEGIN
    -- Session status enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
        CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled');
    END IF;
    
    -- Session type enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_type') THEN
        CREATE TYPE session_type AS ENUM ('virtual', 'in_person', 'phone');
    END IF;
    
    -- Profile status enum (if not exists)
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_status') THEN
        CREATE TYPE profile_status AS ENUM ('pending_review', 'approved', 'rejected', 'suspended');
    END IF;
END $$;

-- Add status column to therapy_sessions
ALTER TABLE public.therapy_sessions 
ADD COLUMN IF NOT EXISTS status session_status DEFAULT 'scheduled',
ADD COLUMN IF NOT EXISTS session_type session_type DEFAULT 'virtual';

-- Create session_feedback table
CREATE TABLE IF NOT EXISTS public.session_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table for billing
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organization_profiles(id) ON DELETE SET NULL,
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  sessions_included INTEGER NOT NULL DEFAULT 0,
  sessions_used INTEGER NOT NULL DEFAULT 0,
  amount_ugx INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create group_sessions table for organizations
CREATE TABLE IF NOT EXISTS public.group_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organization_profiles(id) ON DELETE CASCADE,
  facilitator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_participants INTEGER NOT NULL DEFAULT 10,
  google_meet_url TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create group_session_enrollments table
CREATE TABLE IF NOT EXISTS public.group_session_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_session_id UUID REFERENCES public.group_sessions(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'enrolled',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_session_id, profile_id)
);

-- Enable RLS on new tables
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_session_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for session_feedback
CREATE POLICY "Users can view relevant feedback" ON public.session_feedback
  FOR SELECT USING (client_id = auth.uid() OR therapist_id = auth.uid());

CREATE POLICY "Clients can create feedback" ON public.session_feedback
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their subscriptions" ON public.subscriptions
  FOR SELECT USING (profile_id = auth.uid() OR organization_id IN (
    SELECT om.organization_id FROM public.organization_members om 
    WHERE om.profile_id = auth.uid()
  ));

-- RLS Policies for group_sessions
CREATE POLICY "Org members can view org group sessions" ON public.group_sessions
  FOR SELECT USING (organization_id IN (
    SELECT om.organization_id FROM public.organization_members om 
    WHERE om.profile_id = auth.uid()
  ));

CREATE POLICY "Org admins can manage group sessions" ON public.group_sessions
  FOR ALL USING (organization_id IN (
    SELECT op.id FROM public.organization_profiles op 
    JOIN public.profiles p ON p.id = op.id 
    WHERE p.auth_uid = auth.uid() AND p.role = 'org_admin'
  ));

-- RLS Policies for group_session_enrollments
CREATE POLICY "Users can view their enrollments" ON public.group_session_enrollments
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can enroll themselves" ON public.group_session_enrollments
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_feedback_session ON public.session_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_session_feedback_client ON public.session_feedback(client_id);
CREATE INDEX IF NOT EXISTS idx_session_feedback_therapist ON public.session_feedback(therapist_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_profile ON public.subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_organization ON public.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_group_sessions_org ON public.group_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_group_session_enrollments_session ON public.group_session_enrollments(group_session_id);
CREATE INDEX IF NOT EXISTS idx_group_session_enrollments_profile ON public.group_session_enrollments(profile_id);

-- Update existing therapy_sessions status
UPDATE public.therapy_sessions SET status = 'scheduled' WHERE status IS NULL;
UPDATE public.therapy_sessions SET session_type = 'virtual' WHERE session_type IS NULL;

-- Update existing therapist_profiles status
UPDATE public.therapist_profiles SET status = 'pending_review' WHERE status IS NULL;

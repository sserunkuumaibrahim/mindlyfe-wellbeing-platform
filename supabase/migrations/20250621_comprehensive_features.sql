
-- Create sessions management tables
CREATE TABLE IF NOT EXISTS public.therapy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  session_type session_type NOT NULL DEFAULT 'virtual',
  status session_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  recording_url TEXT,
  google_meet_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create availability management table
CREATE TABLE IF NOT EXISTS public.therapist_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT true,
  specific_date DATE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table for secure communication
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payments/invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create session feedback table
CREATE TABLE IF NOT EXISTS public.session_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create group sessions table for organizations
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

-- Create group session enrollments
CREATE TABLE IF NOT EXISTS public.group_session_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_session_id UUID REFERENCES public.group_sessions(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'enrolled',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_session_id, profile_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_session_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth_uid = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth_uid = auth.uid());

-- RLS Policies for therapy_sessions
CREATE POLICY "Users can view their own sessions" ON public.therapy_sessions
  FOR SELECT USING (client_id = auth.uid() OR therapist_id = auth.uid());

CREATE POLICY "Clients can create sessions" ON public.therapy_sessions
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Session participants can update" ON public.therapy_sessions
  FOR UPDATE USING (client_id = auth.uid() OR therapist_id = auth.uid());

-- RLS Policies for therapist_availability
CREATE POLICY "Anyone can view availability" ON public.therapist_availability
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Therapists can manage their availability" ON public.therapist_availability
  FOR ALL USING (therapist_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their messages" ON public.messages
  FOR UPDATE USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (profile_id = auth.uid());

-- RLS Policies for invoices
CREATE POLICY "Users can view their invoices" ON public.invoices
  FOR SELECT USING (profile_id = auth.uid());

-- RLS Policies for session_feedback
CREATE POLICY "Users can view relevant feedback" ON public.session_feedback
  FOR SELECT USING (client_id = auth.uid() OR therapist_id = auth.uid());

CREATE POLICY "Clients can create feedback" ON public.session_feedback
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_client ON public.therapy_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_therapist ON public.therapy_sessions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_scheduled_at ON public.therapy_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_therapist_availability_therapist ON public.therapist_availability(therapist_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_invoices_profile ON public.invoices(profile_id);

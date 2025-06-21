
-- Create invoices table first
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UGX',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add subscription and organization billing tables
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organization_profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('professional_monthly', 'organization_annual')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  sessions_included INTEGER NOT NULL DEFAULT 0,
  sessions_used INTEGER NOT NULL DEFAULT 0,
  amount_ugx INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subscription_owner_check CHECK (
    (profile_id IS NOT NULL AND organization_id IS NULL) OR
    (profile_id IS NULL AND organization_id IS NOT NULL)
  )
);

-- Add organization members table
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organization_profiles(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  sessions_used INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, profile_id)
);

-- Update invoices table to support different payment scenarios
ALTER TABLE public.invoices ADD COLUMN subscription_id UUID REFERENCES public.subscriptions(id);
ALTER TABLE public.invoices ADD COLUMN payment_type TEXT DEFAULT 'session' CHECK (payment_type IN ('session', 'subscription', 'overage'));

-- Add therapist availability table
CREATE TABLE public.therapist_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT true,
  specific_date DATE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT availability_date_check CHECK (
    (is_recurring = true AND day_of_week IS NOT NULL AND specific_date IS NULL) OR
    (is_recurring = false AND specific_date IS NOT NULL AND day_of_week IS NULL)
  )
);

-- Add notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'booking_confirmation', 'new_booking', 'payment_confirmation', 'payment_failed')),
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add messages table for messaging system
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image')),
  file_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add Google Meet URL to therapy sessions
ALTER TABLE public.therapy_sessions ADD COLUMN google_meet_url TEXT;

-- Enable RLS on all tables
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Service role can manage invoices" ON public.invoices
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (
    profile_id = auth.uid() OR 
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for organization_members
CREATE POLICY "Organization members can view their membership" ON public.organization_members
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Organization admins can manage members" ON public.organization_members
  FOR ALL USING (
    organization_id IN (
      SELECT id FROM public.organization_profiles 
      WHERE id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE profile_id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Service role can manage organization members" ON public.organization_members
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for therapist_availability
CREATE POLICY "Therapists can manage their availability" ON public.therapist_availability
  FOR ALL USING (therapist_id = auth.uid());

CREATE POLICY "Users can view therapist availability" ON public.therapist_availability
  FOR SELECT USING (is_available = true);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Service role can manage notifications" ON public.notifications
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their received messages" ON public.messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- Create function to get user conversations
CREATE OR REPLACE FUNCTION public.get_user_conversations(user_id_param UUID)
RETURNS TABLE (
  conversation_id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  other_user_photo TEXT,
  last_message TEXT,
  last_message_time TIMESTAMPTZ,
  unread_count BIGINT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH conversation_partners AS (
    SELECT DISTINCT 
      CASE 
        WHEN sender_id = user_id_param THEN recipient_id
        ELSE sender_id 
      END as partner_id,
      CASE 
        WHEN sender_id = user_id_param THEN recipient_id::text
        ELSE sender_id::text 
      END as conversation_id
    FROM public.messages 
    WHERE sender_id = user_id_param OR recipient_id = user_id_param
  ),
  last_messages AS (
    SELECT DISTINCT ON (
      CASE 
        WHEN sender_id < recipient_id THEN sender_id::text || recipient_id::text
        ELSE recipient_id::text || sender_id::text
      END
    )
      CASE 
        WHEN sender_id < recipient_id THEN sender_id::text || recipient_id::text
        ELSE recipient_id::text || sender_id::text
      END as conv_id,
      content,
      created_at,
      CASE 
        WHEN sender_id = user_id_param THEN recipient_id
        ELSE sender_id 
      END as other_user_id
    FROM public.messages 
    WHERE sender_id = user_id_param OR recipient_id = user_id_param
    ORDER BY 
      CASE 
        WHEN sender_id < recipient_id THEN sender_id::text || recipient_id::text
        ELSE recipient_id::text || sender_id::text
      END,
      created_at DESC
  ),
  unread_counts AS (
    SELECT 
      sender_id as other_user_id,
      COUNT(*) as unread_count
    FROM public.messages 
    WHERE recipient_id = user_id_param AND is_read = false
    GROUP BY sender_id
  )
  SELECT 
    lm.conv_id::UUID as conversation_id,
    lm.other_user_id,
    (p.first_name || ' ' || p.last_name) as other_user_name,
    p.profile_photo_url as other_user_photo,
    lm.content as last_message,
    lm.created_at as last_message_time,
    COALESCE(uc.unread_count, 0) as unread_count
  FROM last_messages lm
  JOIN public.profiles p ON p.id = lm.other_user_id
  LEFT JOIN unread_counts uc ON uc.other_user_id = lm.other_user_id
  ORDER BY lm.created_at DESC;
$$;

-- Create indexes for performance
CREATE INDEX idx_invoices_profile_id ON public.invoices(profile_id);
CREATE INDEX idx_subscriptions_profile_id ON public.subscriptions(profile_id);
CREATE INDEX idx_subscriptions_organization_id ON public.subscriptions(organization_id);
CREATE INDEX idx_organization_members_profile_id ON public.organization_members(profile_id);
CREATE INDEX idx_organization_members_organization_id ON public.organization_members(organization_id);
CREATE INDEX idx_therapist_availability_therapist_id ON public.therapist_availability(therapist_id);
CREATE INDEX idx_notifications_profile_id ON public.notifications(profile_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_recipient ON public.messages(sender_id, recipient_id);
CREATE INDEX idx_therapy_sessions_scheduled_at ON public.therapy_sessions(scheduled_at);

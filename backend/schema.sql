
-- Consolidated SQL Schema for MindLyfe

-- Drop all existing objects in reverse dependency order to ensure a clean slate
-- This section is for development/testing purposes to easily reset the database.
-- In a production environment, you would typically apply migrations incrementally.

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS update_therapist_search_filters_trigger ON public.therapist_profiles CASCADE;
DROP TRIGGER IF EXISTS create_session_reminders_trigger ON public.therapy_sessions CASCADE;
DROP TRIGGER IF EXISTS update_video_call_sessions_updated_at ON public.video_call_sessions CASCADE;
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON public.payment_methods CASCADE;
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON public.payment_transactions CASCADE;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS update_individual_profiles_updated_at ON public.individual_profiles CASCADE;
DROP TRIGGER IF EXISTS update_therapist_profiles_updated_at ON public.therapist_profiles CASCADE;
DROP TRIGGER IF EXISTS update_organization_profiles_updated_at ON public.organization_profiles CASCADE;
DROP TRIGGER IF EXISTS update_therapy_sessions_updated_at ON public.therapy_sessions CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.upload_document(TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_codes() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_conversations(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_session_payment_required(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_organization_dashboard_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_therapist_search_filters() CASCADE;
DROP FUNCTION IF EXISTS public.create_session_reminders() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can view own individual profile" ON public.individual_profiles CASCADE;
DROP POLICY IF EXISTS "Users can view own therapist profile" ON public.therapist_profiles CASCADE;
DROP POLICY IF EXISTS "Users can view own organization profile" ON public.organization_profiles CASCADE;
DROP POLICY IF EXISTS "Users can manage own 2FA methods" ON public.user_2fa_methods CASCADE;
DROP POLICY IF EXISTS "Users can access own verification codes" ON public.verification_codes CASCADE;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.therapy_sessions CASCADE;
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs CASCADE;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Anyone can upload profile photos" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Profile photos are publicly viewable" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Therapists can upload session recordings" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Session participants can view recordings" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices CASCADE;
DROP POLICY IF EXISTS "Service role can manage invoices" ON public.invoices CASCADE;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions CASCADE;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions CASCADE;
DROP POLICY IF EXISTS "Organization members can view their membership" ON public.organization_members CASCADE;
DROP POLICY IF EXISTS "Organization admins can manage members" ON public.organization_members CASCADE;
DROP POLICY IF EXISTS "Service role can manage organization members" ON public.organization_members CASCADE;
DROP POLICY IF EXISTS "Therapists can manage their availability" ON public.therapist_availability CASCADE;
DROP POLICY IF EXISTS "Users can view therapist availability" ON public.therapist_availability CASCADE;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications CASCADE;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications CASCADE;
DROP POLICY IF EXISTS "Service role can manage notifications" ON public.notifications CASCADE;
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages CASCADE;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages CASCADE;
DROP POLICY IF EXISTS "Users can update their received messages" ON public.messages CASCADE;
DROP POLICY IF EXISTS "Users can update their messages" ON public.messages CASCADE;
DROP POLICY IF EXISTS "Users can view relevant feedback" ON public.session_feedback CASCADE;
DROP POLICY IF EXISTS "Clients can create feedback" ON public.session_feedback CASCADE;
DROP POLICY IF EXISTS "Org members can view org group sessions" ON public.group_sessions CASCADE;
DROP POLICY IF EXISTS "Org admins can manage group sessions" ON public.group_sessions CASCADE;
DROP POLICY IF EXISTS "Users can view their enrollments" ON public.group_session_enrollments CASCADE;
DROP POLICY IF EXISTS "Users can enroll themselves" ON public.group_session_enrollments CASCADE;
DROP POLICY IF EXISTS "Anyone can view active pricing plans" ON public.pricing_plans CASCADE;
DROP POLICY IF EXISTS "Users can view their calendar events" ON public.calendar_events CASCADE;
DROP POLICY IF EXISTS "Users can manage their calendar events" ON public.calendar_events CASCADE;
DROP POLICY IF EXISTS "Anyone can view document categories" ON public.document_categories CASCADE;
DROP POLICY IF EXISTS "Users can view their documents" ON public.documents CASCADE;
DROP POLICY IF EXISTS "Users can manage their documents" ON public.documents CASCADE;
DROP POLICY IF EXISTS "Users can view workshops" ON public.workshops CASCADE;
DROP POLICY IF EXISTS "Facilitators can manage their workshops" ON public.workshops CASCADE;
DROP POLICY IF EXISTS "Users can view their workshop enrollments" ON public.workshop_enrollments CASCADE;
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON public.organization_invitations CASCADE;
DROP POLICY IF EXISTS "Organization admins can view their invoices" ON public.organization_invoices CASCADE;
DROP POLICY IF EXISTS "Organization admins can manage their invoices" ON public.organization_invoices CASCADE;
DROP POLICY IF EXISTS "Anyone can view active session pricing" ON public.session_pricing CASCADE;
DROP POLICY IF EXISTS "Users can view their video call sessions" ON public.video_call_sessions CASCADE;
DROP POLICY IF EXISTS "Session participants can update video calls" ON public.video_call_sessions CASCADE;
DROP POLICY IF EXISTS "Users can manage their payment methods" ON public.payment_methods CASCADE;
DROP POLICY IF EXISTS "Users can view their transactions" ON public.payment_transactions CASCADE;
DROP POLICY IF EXISTS "Session participants can view reschedule history" ON public.session_reschedule_history CASCADE;
DROP POLICY IF EXISTS "Therapists can manage their cancellation policies" ON public.cancellation_policies CASCADE;
DROP POLICY IF EXISTS "Therapists can manage session notes" ON public.session_notes CASCADE;
DROP POLICY IF EXISTS "Session participants can view shared notes" ON public.session_notes CASCADE;
DROP POLICY IF EXISTS "Anyone can view published content" ON public.educational_content CASCADE;
DROP POLICY IF EXISTS "Therapists can manage their content" ON public.educational_content CASCADE;
DROP POLICY IF EXISTS "Users can track their content access" ON public.content_access CASCADE;
DROP POLICY IF EXISTS "Anyone can view therapist search filters" ON public.therapist_search_filters CASCADE;
DROP POLICY IF EXISTS "Therapists can manage their search filters" ON public.therapist_search_filters CASCADE;
DROP POLICY IF EXISTS "Users can view their search history" ON public.search_history CASCADE;
DROP POLICY IF EXISTS "Users can manage their 2FA settings" ON public.two_factor_auth CASCADE;
DROP POLICY IF EXISTS "Users can manage their security settings" ON public.security_settings CASCADE;
DROP POLICY IF EXISTS "Users can view their consents" ON public.user_consents CASCADE;
DROP POLICY IF EXISTS "Users can manage their data deletion requests" ON public.data_deletion_requests CASCADE;
DROP POLICY IF EXISTS "Admins can manage approval workflows" ON public.therapist_approval_workflow CASCADE;
DROP POLICY IF EXISTS "Admins can manage license verifications" ON public.license_verifications CASCADE;
DROP POLICY IF EXISTS "Admins can view compliance checks" ON public.compliance_checks CASCADE;
DROP POLICY IF EXISTS "Allow profile creation on signup" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Enable profile creation for authenticated users and triggers" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Allow individual profile creation" ON public.individual_profiles CASCADE;
DROP POLICY IF EXISTS "Enable individual profile creation" ON public.individual_profiles CASCADE;
DROP POLICY IF EXISTS "Allow therapist profile creation" ON public.therapist_profiles CASCADE;
DROP POLICY IF EXISTS "Enable therapist profile creation" ON public.therapist_profiles CASCADE;
DROP POLICY IF EXISTS "Allow organization profile creation" ON public.organization_profiles CASCADE;
DROP POLICY IF EXISTS "Enable organization profile creation" ON public.organization_profiles CASCADE;


-- Drop tables
DROP TABLE IF EXISTS public.video_call_sessions CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;
DROP TABLE IF EXISTS public.payment_transactions CASCADE;
DROP TABLE IF EXISTS public.refunds CASCADE;
DROP TABLE IF EXISTS public.session_reschedule_history CASCADE;
DROP TABLE IF EXISTS public.cancellation_policies CASCADE;
DROP TABLE IF EXISTS public.session_notes CASCADE;
DROP TABLE IF EXISTS public.session_resources CASCADE;
DROP TABLE IF EXISTS public.notification_templates CASCADE;
DROP TABLE IF EXISTS public.notification_queue CASCADE;
DROP TABLE IF EXISTS public.session_reminders CASCADE;
DROP TABLE IF EXISTS public.content_categories CASCADE;
DROP TABLE IF EXISTS public.educational_content CASCADE;
DROP TABLE IF EXISTS public.content_access CASCADE;
DROP TABLE IF EXISTS public.therapist_approval_workflow CASCADE;
DROP TABLE IF EXISTS public.license_verifications CASCADE;
DROP TABLE IF EXISTS public.compliance_checks CASCADE;
DROP TABLE IF EXISTS public.therapist_search_filters CASCADE;
DROP TABLE IF EXISTS public.search_history CASCADE;
DROP TABLE IF EXISTS public.two_factor_auth CASCADE;
DROP TABLE IF EXISTS public.security_settings CASCADE;
DROP TABLE IF EXISTS public.login_attempts CASCADE;
DROP TABLE IF EXISTS public.consent_forms CASCADE;
DROP TABLE IF EXISTS public.user_consents CASCADE;
DROP TABLE IF EXISTS public.data_retention_policies CASCADE;
DROP TABLE IF EXISTS public.data_deletion_requests CASCADE;
DROP TABLE IF EXISTS public.subscription_changes CASCADE;
DROP TABLE IF EXISTS public.billing_cycles CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.organization_members CASCADE;
DROP TABLE IF EXISTS public.therapist_availability CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.session_feedback CASCADE;
DROP TABLE IF EXISTS public.group_sessions CASCADE;
DROP TABLE IF EXISTS public.group_session_enrollments CASCADE;
DROP TABLE IF EXISTS public.pricing_plans CASCADE;
DROP TABLE IF EXISTS public.calendar_events CASCADE;
DROP TABLE IF EXISTS public.document_categories CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.workshops CASCADE;
DROP TABLE IF EXISTS public.workshop_enrollments CASCADE;
DROP TABLE IF EXISTS public.organization_invitations CASCADE;
DROP TABLE IF EXISTS public.organization_invoices CASCADE;
DROP TABLE IF EXISTS public.session_pricing CASCADE;
DROP TABLE IF EXISTS public.password_history CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.consent_records CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.verification_codes CASCADE;
DROP TABLE IF EXISTS public.user_2fa_methods CASCADE;
DROP TABLE IF EXISTS public.individual_profiles CASCADE;
DROP TABLE IF EXISTS public.therapist_profiles CASCADE;
DROP TABLE IF EXISTS public.organization_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS profile_status CASCADE;
DROP TYPE IF EXISTS communication_preference CASCADE;
DROP TYPE IF EXISTS gender_type CASCADE;
DROP TYPE IF EXISTS organization_type CASCADE;
DROP TYPE IF EXISTS two_fa_method CASCADE;
DROP TYPE IF EXISTS verification_purpose CASCADE;
DROP TYPE IF EXISTS session_type CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;


-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('individual', 'therapist', 'org_admin', 'admin');
CREATE TYPE profile_status AS ENUM ('pending_review', 'approved', 'rejected', 'active', 'inactive', 'suspended');
CREATE TYPE communication_preference AS ENUM ('email', 'sms', 'both');
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE organization_type AS ENUM ('private_company', 'school', 'ngo', 'government', 'healthcare', 'other');
CREATE TYPE two_fa_method AS ENUM ('email', 'sms', 'authenticator', 'totp');
CREATE TYPE verification_purpose AS ENUM ('signup', 'password_reset', '2fa', 'login', 'email_verification', 'phone_verification', 'two_fa_setup');
CREATE TYPE session_type AS ENUM ('virtual', 'in_person', 'phone');
CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'canceled', 'no_show', 'in_progress', 'cancelled', 'rescheduled');

-- Main profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid UUID UNIQUE, -- This will be managed by our custom auth system, not Supabase auth.users
  role user_role NOT NULL DEFAULT 'individual',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  date_of_birth DATE,
  gender gender_type,
  country TEXT,
  preferred_language TEXT DEFAULT 'en',
  profile_photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_email_verified BOOLEAN NOT NULL DEFAULT false,
  is_phone_verified BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  password_changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Individual client profiles
CREATE TABLE public.individual_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  mental_health_history TEXT,
  therapy_goals TEXT[],
  communication_pref communication_preference NOT NULL DEFAULT 'email',
  opt_in_newsletter BOOLEAN NOT NULL DEFAULT false,
  opt_in_sms BOOLEAN NOT NULL DEFAULT false,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  preferred_therapist_gender gender_type,
  session_preferences JSONB DEFAULT '{}',
  medical_history TEXT,
  current_medications TEXT,
  preferred_session_type session_type DEFAULT 'virtual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Therapist profiles
CREATE TABLE public.therapist_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  national_id_number TEXT NOT NULL,
  license_body TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  license_expiry_date DATE,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  insurance_expiry_date DATE,
  years_experience INTEGER NOT NULL DEFAULT 0 CHECK (years_experience >= 0),
  specializations TEXT[] NOT NULL DEFAULT ARRAY['General'],
  languages_spoken TEXT[] NOT NULL DEFAULT ARRAY['English'],
  education_background TEXT,
  certifications TEXT[],
  hourly_rate DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  status profile_status NOT NULL DEFAULT 'pending_review',
  review_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  availability JSONB DEFAULT '{}',
  bio TEXT,
  license_document_url TEXT,
  insurance_document_url TEXT,
  id_document_url TEXT,
  uploaded_documents JSONB DEFAULT '{}',
  other_documents_urls TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Organization profiles
CREATE TABLE public.organization_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  organization_type organization_type NOT NULL DEFAULT 'private_company',
  registration_number TEXT NOT NULL UNIQUE,
  date_of_establishment DATE,
  tax_id_number TEXT NOT NULL,
  num_employees INTEGER NOT NULL DEFAULT 1 CHECK (num_employees > 0),
  official_website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  representative_name TEXT NOT NULL,
  representative_job_title TEXT NOT NULL,
  representative_national_id TEXT NOT NULL,
  status profile_status NOT NULL DEFAULT 'pending_review',
  review_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  service_requirements JSONB DEFAULT '{}',
  billing_contact_email TEXT,
  billing_contact_phone TEXT,
  proof_registration_url TEXT,
  auth_letter_url TEXT,
  tax_certificate_url TEXT,
  org_structure_url TEXT,
  uploaded_documents JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Two-factor authentication methods
CREATE TABLE public.user_2fa_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  method two_fa_method NOT NULL,
  secret TEXT, -- For TOTP authenticator
  backup_codes TEXT[], -- Encrypted backup codes
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(profile_id, method)
);

-- Verification codes for various purposes
CREATE TABLE public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  purpose verification_purpose NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Password history to enforce password uniqueness
CREATE TABLE public.password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Organization members (employees/members under an organization)
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES profiles(id),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  annual_sessions_limit INTEGER DEFAULT 8,
  annual_sessions_used INTEGER DEFAULT 0,
  sessions_reset_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
  UNIQUE(organization_id, profile_id)
);

-- Therapy sessions
CREATE TABLE public.therapy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organization_profiles(id),
  session_type session_type NOT NULL DEFAULT 'virtual',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status session_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
  therapist_notes TEXT,
  meeting_url TEXT,
  recording_url TEXT,
  google_meet_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comprehensive audit logging
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User sessions for single-session enforcement (for custom auth)
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Consent records for compliance
CREATE TABLE public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'terms_of_service', 'privacy_policy', 'treatment_consent'
  consent_version TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  consented_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE SET NULL,
  subscription_id UUID, -- Will be linked after subscriptions table is created
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UGX',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_type TEXT DEFAULT 'session' CHECK (payment_type IN ('session', 'subscription', 'overage')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions table
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
  billing_type TEXT DEFAULT 'automatic',
  num_users INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subscription_owner_check CHECK (
    (profile_id IS NOT NULL AND organization_id IS NULL) OR
    (profile_id IS NULL AND organization_id IS NOT NULL)
  )
);

-- Add foreign key to invoices table for subscription_id
ALTER TABLE public.invoices
ADD CONSTRAINT fk_invoices_subscription
FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;

-- Therapist availability table
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

-- Notifications table
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

-- Messages table for secure communication
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image')),
  file_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Session feedback table
CREATE TABLE public.session_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Group sessions table for organizations
CREATE TABLE public.group_sessions (
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

-- Group session enrollments
CREATE TABLE public.group_session_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_session_id UUID REFERENCES public.group_sessions(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'enrolled',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_session_id, profile_id)
);

-- Pricing plans table
CREATE TABLE public.pricing_plans (
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

-- Calendar events table
CREATE TABLE public.calendar_events (
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

-- Document categories table
CREATE TABLE public.document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  required_for_role TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents table
CREATE TABLE public.documents (
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

-- Workshops table
CREATE TABLE public.workshops (
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

-- Workshop enrollments table
CREATE TABLE public.workshop_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'enrolled',
  payment_status TEXT DEFAULT 'pending',
  UNIQUE(workshop_id, profile_id)
);

-- Organization invitations table
CREATE TABLE public.organization_invitations (
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

-- Organization invoices table
CREATE TABLE public.organization_invoices (
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

-- Session pricing table
CREATE TABLE public.session_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_ugx INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Video call sessions table
CREATE TABLE public.video_call_sessions (
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

-- Payment methods table
CREATE TABLE public.payment_methods (
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
CREATE TABLE public.payment_transactions (
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
CREATE TABLE public.refunds (
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

-- Session rescheduling history
CREATE TABLE public.session_reschedule_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
  old_scheduled_at TIMESTAMPTZ NOT NULL,
  new_scheduled_at TIMESTAMPTZ NOT NULL,
  rescheduled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cancellation policies
CREATE TABLE public.cancellation_policies (
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
CREATE TABLE public.session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  is_shared_with_client BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.session_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
  resource_title TEXT NOT NULL,
  resource_url TEXT,
  resource_type TEXT CHECK (resource_type IN ('document', 'video', 'audio', 'link', 'exercise')),
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notification templates
CREATE TABLE public.notification_templates (
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
CREATE TABLE public.notification_queue (
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
CREATE TABLE public.session_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24_hours', '2_hours', '30_minutes')),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'sms', 'both')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Content categories
CREATE TABLE public.content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_category_id UUID REFERENCES public.content_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Educational content
CREATE TABLE public.educational_content (
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
CREATE TABLE public.content_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.educational_content(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(content_id, profile_id)
);

-- Therapist approval workflow
CREATE TABLE public.therapist_approval_workflow (
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

-- License verifications
CREATE TABLE public.license_verifications (
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
CREATE TABLE public.compliance_checks (
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

-- Therapist search filters
CREATE TABLE public.therapist_search_filters (
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
CREATE TABLE public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  search_query TEXT,
  filters_applied JSONB,
  results_count INTEGER,
  clicked_therapist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_booked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Two-factor authentication
CREATE TABLE public.two_factor_auth (
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
CREATE TABLE public.security_settings (
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
CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  two_fa_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Consent forms
CREATE TABLE public.consent_forms (
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
CREATE TABLE public.user_consents (
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
CREATE TABLE public.data_retention_policies (
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
CREATE TABLE public.data_deletion_requests (
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

-- Subscription change history
CREATE TABLE public.subscription_changes (
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
CREATE TABLE public.billing_cycles (
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


-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    profile_id UUID;
    user_role_value user_role;
    user_email TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
    user_phone TEXT;
    org_name TEXT;
    reg_number TEXT;
    tax_id TEXT;
    rep_job_title TEXT;
    rep_national_id TEXT;
    org_type TEXT;
    num_employees INTEGER;
BEGIN
    -- Extract user data with defaults
    user_email := COALESCE(NEW.email, '');
    user_first_name := COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'User');
    user_last_name := COALESCE(NEW.raw_user_meta_data ->> 'last_name', '');
    user_phone := COALESCE(NEW.raw_user_meta_data ->> 'phone_number', '');
    
    -- Validate email
    IF user_email = '' THEN
        RAISE LOG 'Email is required for user creation';
        RETURN NEW;
    END IF;
    
    -- Extract and validate role with explicit casting
    BEGIN
        user_role_value := COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'individual'::public.user_role);
    EXCEPTION WHEN OTHERS THEN
        user_role_value := 'individual'::public.user_role;
        RAISE LOG 'Invalid role specified, defaulting to individual: %', SQLERRM;
    END;
    
    -- Insert into profiles table with explicit schema and type references
    BEGIN
        INSERT INTO public.profiles (
            auth_uid,
            role,
            first_name,
            last_name,
            email,
            phone_number,
            is_email_verified,
            gender,
            country,
            preferred_language,
            date_of_birth
        ) VALUES (
            NEW.id,
            user_role_value,
            user_first_name,
            user_last_name,
            user_email,
            NULLIF(user_phone, ''),
            NEW.email_confirmed_at IS NOT NULL,
            CASE 
                WHEN NEW.raw_user_meta_data ->> 'gender' IN ('male', 'female') 
                THEN (NEW.raw_user_meta_data ->> 'gender')::public.gender_type
                ELSE NULL
            END,
            NULLIF(NEW.raw_user_meta_data ->> 'country', ''),
            COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'preferred_language', ''), 'en'),
            CASE 
                WHEN NEW.raw_user_meta_data ->> 'date_of_birth' IS NOT NULL AND NEW.raw_user_meta_data ->> 'date_of_birth' != ''
                THEN (NEW.raw_user_meta_data ->> 'date_of_birth')::date
                ELSE NULL
            END
        ) RETURNING id INTO profile_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating profile: %', SQLERRM;
        RETURN NEW;
    END;
    
    -- Insert role-specific data
    BEGIN
        IF user_role_value = 'individual'::public.user_role THEN
            INSERT INTO public.individual_profiles (
                id,
                mental_health_history,
                therapy_goals,
                communication_pref,
                opt_in_newsletter,
                opt_in_sms,
                emergency_contact_name,
                emergency_contact_phone,
                preferred_therapist_gender,
                medical_history,
                current_medications,
                preferred_session_type
            ) VALUES (
                profile_id,
                NULLIF(NEW.raw_user_meta_data ->> 'mental_health_history', ''),
                CASE 
                    WHEN NEW.raw_user_meta_data ->> 'therapy_goals' IS NOT NULL AND NEW.raw_user_meta_data ->> 'therapy_goals' != '' 
                    THEN string_to_array(NEW.raw_user_meta_data ->> 'therapy_goals', ',')
                    ELSE NULL
                END,
                CASE 
                    WHEN NEW.raw_user_meta_data ->> 'communication_pref' IN ('email', 'sms', 'both')
                    THEN (NEW.raw_user_meta_data ->> 'communication_pref')::public.communication_preference
                    ELSE 'email'::public.communication_preference
                END,
                COALESCE((NEW.raw_user_meta_data ->> 'opt_in_newsletter')::boolean, false),
                COALESCE((NEW.raw_user_meta_data ->> 'opt_in_sms')::boolean, false),
                NULLIF(NEW.raw_user_meta_data ->> 'emergency_contact_name', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'emergency_contact_phone', ''),
                CASE 
                    WHEN NEW.raw_user_meta_data ->> 'preferred_therapist_gender' IN ('male', 'female')
                    THEN (NEW.raw_user_meta_data ->> 'preferred_therapist_gender')::public.gender_type
                    ELSE NULL
                END,
                NULLIF(NEW.raw_user_meta_data ->> 'medical_history', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'current_medications', ''),
                COALESCE((NEW.raw_user_meta_data ->> 'preferred_session_type')::public.session_type, 'virtual')
            );
        ELSIF user_role_value = 'therapist'::public.user_role THEN
            INSERT INTO public.therapist_profiles (
                id,
                national_id_number,
                license_body,
                license_number,
                license_expiry_date,
                insurance_provider,
                insurance_policy_number,
                insurance_expiry_date,
                years_experience,
                specializations,
                languages_spoken,
                education_background,
                certifications,
                hourly_rate,
                bio,
                license_document_url,
                insurance_document_url,
                id_document_url,
                other_documents_urls
            ) VALUES (
                profile_id,
                COALESCE(NEW.raw_user_meta_data ->> 'national_id_number', 'PENDING'),
                COALESCE(NEW.raw_user_meta_data ->> 'license_body', 'Uganda Medical and Dental Practitioners Council'),
                COALESCE(NEW.raw_user_meta_data ->> 'license_number', 'TEMP_' || profile_id::text),
                CASE 
                    WHEN NEW.raw_user_meta_data ->> 'license_expiry_date' IS NOT NULL AND NEW.raw_user_meta_data ->> 'license_expiry_date' != ''
                    THEN (NEW.raw_user_meta_data ->> 'license_expiry_date')::date
                    ELSE NULL
                END,
                NULLIF(NEW.raw_user_meta_data ->> 'insurance_provider', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'insurance_policy_number', ''),
                CASE 
                    WHEN NEW.raw_user_meta_data ->> 'insurance_expiry_date' IS NOT NULL AND NEW.raw_user_meta_data ->> 'insurance_expiry_date' != ''
                    THEN (NEW.raw_user_meta_data ->> 'insurance_expiry_date')::date
                    ELSE NULL
                END,
                COALESCE((NEW.raw_user_meta_data ->> 'years_experience')::integer, 0),
                COALESCE(
                    CASE 
                        WHEN NEW.raw_user_meta_data ->> 'specializations' IS NOT NULL AND NEW.raw_user_meta_data ->> 'specializations' != ''
                        THEN string_to_array(NEW.raw_user_meta_data ->> 'specializations', ',')
                        ELSE ARRAY['General']
                    END, 
                    ARRAY['General']
                ),
                COALESCE(
                    CASE 
                        WHEN NEW.raw_user_meta_data ->> 'languages_spoken' IS NOT NULL AND NEW.raw_user_meta_data ->> 'languages_spoken' != ''
                        THEN string_to_array(NEW.raw_user_meta_data ->> 'languages_spoken', ',')
                        ELSE ARRAY['English']
                    END, 
                    ARRAY['English']
                ),
                NULLIF(NEW.raw_user_meta_data ->> 'education_background', ''),
                CASE 
                    WHEN NEW.raw_user_meta_data ->> 'certifications' IS NOT NULL AND NEW.raw_user_meta_data ->> 'certifications' != '' 
                    THEN string_to_array(NEW.raw_user_meta_data ->> 'certifications', ',')
                    ELSE NULL
                END,
                COALESCE((NEW.raw_user_meta_data ->> 'hourly_rate')::decimal, NULL),
                NULLIF(NEW.raw_user_meta_data ->> 'bio', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'license_document_url', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'insurance_document_url', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'id_document_url', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'other_documents_urls', '')
            );
        ELSIF user_role_value = 'org_admin'::public.user_role THEN
            INSERT INTO public.organization_profiles (
                id,
                organization_name,
                organization_type,
                registration_number,
                date_of_establishment,
                tax_id_number,
                num_employees,
                representative_name,
                representative_job_title,
                representative_national_id,
                official_website,
                address,
                city,
                state,
                postal_code,
                billing_contact_email,
                billing_contact_phone
            ) VALUES (
                profile_id,
                COALESCE(NEW.raw_user_meta_data ->> 'organization_name', 'TEMP_ORG'),
                COALESCE(
                    (NEW.raw_user_meta_data ->> 'organization_type')::public.organization_type, 
                    'private_company'
                ),
                COALESCE(NEW.raw_user_meta_data ->> 'registration_number', 'TEMP_REG_' || profile_id::text),
                CASE 
                    WHEN NEW.raw_user_meta_data ->> 'date_of_establishment' IS NOT NULL AND NEW.raw_user_meta_data ->> 'date_of_establishment' != ''
                    THEN (NEW.raw_user_meta_data ->> 'date_of_establishment')::date
                    ELSE NULL
                END,
                COALESCE(NEW.raw_user_meta_data ->> 'tax_id_number', 'TEMP_TAX_' || profile_id::text),
                COALESCE((NEW.raw_user_meta_data ->> 'num_employees')::integer, 1),
                CONCAT(user_first_name, ' ', user_last_name),
                COALESCE(NEW.raw_user_meta_data ->> 'representative_job_title', 'Administrator'),
                COALESCE(NEW.raw_user_meta_data ->> 'representative_national_id', 'TEMP_REP_ID'),
                NULLIF(NEW.raw_user_meta_data ->> 'official_website', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'address', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'city', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'state_province', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'postal_code', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'billing_contact_email', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'billing_contact_phone', '')
            );
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating role-specific profile: %', SQLERRM;
    END;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.upload_document(
  file_path TEXT,
  file_type TEXT,
  profile_type TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  result JSONB;
BEGIN
  -- In a self-hosted environment, auth.uid() is not directly available.
  -- You would need to pass the user_id from your application's authentication context.
  -- For now, we'll assume a placeholder or direct user_id from the application.
  -- Replace this with actual user ID retrieval logic from your backend.
  user_id := '00000000-0000-0000-0000-000000000000'; -- Placeholder: Replace with actual user ID
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Update the appropriate profile table with document info
  IF profile_type = 'therapist' THEN
    UPDATE public.therapist_profiles 
    SET uploaded_documents = COALESCE(uploaded_documents, '{}'::jsonb) || 
        jsonb_build_object(file_type, jsonb_build_object(
          'path', file_path,
          'uploaded_at', now()
        ))
    WHERE id = user_id;
  ELSIF profile_type = 'organization' THEN
    UPDATE public.organization_profiles 
    SET uploaded_documents = COALESCE(uploaded_documents, '{}'::jsonb) || 
        jsonb_build_object(file_type, jsonb_build_object(
          'path', file_path,
          'uploaded_at', now()
        ))
    WHERE id = user_id;
  END IF;
  
  result := jsonb_build_object('success', true, 'path', file_path);
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM public.verification_codes 
    WHERE expires_at < now() OR is_used = true;
END;
$$ LANGUAGE plpgsql;

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
        WHEN sender_id < recipient_id THEN sender_id::text
        ELSE recipient_id::text
      END || 
      CASE 
        WHEN sender_id < recipient_id THEN recipient_id::text
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


-- Indexes
CREATE INDEX idx_profiles_auth_uid ON public.profiles(auth_uid);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_therapist_profiles_status ON public.therapist_profiles(status);
CREATE INDEX idx_organization_profiles_status ON public.organization_profiles(status);
CREATE INDEX idx_verification_codes_profile_purpose ON public.verification_codes(profile_id, purpose);
CREATE INDEX idx_verification_codes_expires_at ON public.verification_codes(expires_at);
CREATE INDEX idx_therapy_sessions_client_id ON public.therapy_sessions(client_id);
CREATE INDEX idx_therapy_sessions_therapist_id ON public.therapy_sessions(therapist_id);
CREATE INDEX idx_therapy_sessions_scheduled_at ON public.therapy_sessions(scheduled_at);
CREATE INDEX idx_audit_logs_profile_id ON public.audit_logs(profile_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_user_sessions_profile_id ON public.user_sessions(profile_id);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX idx_invoices_profile_id ON public.invoices(profile_id);
CREATE INDEX idx_subscriptions_profile_id ON public.subscriptions(profile_id);
CREATE INDEX idx_subscriptions_organization_id ON public.subscriptions(organization_id);
CREATE INDEX idx_organization_members_profile_id ON public.organization_members(profile_id);
CREATE INDEX idx_organization_members_organization_id ON public.organization_members(organization_id);
CREATE INDEX idx_therapist_availability_therapist_id ON public.therapist_availability(therapist_id);
CREATE INDEX idx_notifications_profile_id ON public.notifications(profile_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_recipient ON public.messages(sender_id, recipient_id);
CREATE INDEX idx_session_feedback_session ON public.session_feedback(session_id);
CREATE INDEX idx_session_feedback_client ON public.session_feedback(client_id);
CREATE INDEX idx_session_feedback_therapist ON public.session_feedback(therapist_id);
CREATE INDEX idx_subscriptions_profile ON public.subscriptions(profile_id);
CREATE INDEX idx_subscriptions_organization ON public.subscriptions(organization_id);
CREATE INDEX idx_group_sessions_org ON public.group_sessions(organization_id);
CREATE INDEX idx_group_session_enrollments_session ON public.group_session_enrollments(group_session_id);
CREATE INDEX idx_group_session_enrollments_profile ON public.group_session_enrollments(profile_id);
CREATE INDEX idx_calendar_events_profile_id ON public.calendar_events(profile_id);
CREATE INDEX idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX idx_documents_profile_id ON public.documents(profile_id);
CREATE INDEX idx_documents_category_id ON public.documents(category_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_workshop_enrollments_profile_id ON public.workshop_enrollments(profile_id);
CREATE INDEX idx_workshop_enrollments_workshop_id ON public.workshop_enrollments(workshop_id);
CREATE INDEX idx_organization_invoices_org_id ON public.organization_invoices(organization_id);
CREATE INDEX idx_organization_members_sessions ON public.organization_members(profile_id, annual_sessions_used, sessions_reset_date);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_therapy_sessions_client_therapist ON public.therapy_sessions(client_id, therapist_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_participants ON public.messages(sender_id, recipient_id);
CREATE INDEX idx_notifications_profile_unread ON public.notifications(profile_id, is_read);
CREATE INDEX idx_therapist_profiles_license_number ON public.therapist_profiles(license_number);
CREATE INDEX idx_organization_profiles_registration_number ON public.organization_profiles(registration_number);
CREATE INDEX idx_video_call_sessions_session_id ON public.video_call_sessions(session_id);
CREATE INDEX idx_video_call_sessions_status ON public.video_call_sessions(status);
CREATE INDEX idx_payment_methods_profile_id ON public.payment_methods(profile_id);
CREATE INDEX idx_payment_methods_is_default ON public.payment_methods(profile_id, is_default) WHERE is_default = true;
CREATE INDEX idx_payment_transactions_profile_id ON public.payment_transactions(profile_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_transactions_dpo_id ON public.payment_transactions(dpo_transaction_id);
CREATE INDEX idx_session_reschedule_history_session_id ON public.session_reschedule_history(session_id);
CREATE INDEX idx_session_notes_session_id ON public.session_notes(session_id);
CREATE INDEX idx_session_resources_session_id ON public.session_resources(session_id);
CREATE INDEX idx_notification_queue_status ON public.notification_queue(status);
CREATE INDEX idx_notification_queue_scheduled ON public.notification_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_session_reminders_session_id ON public.session_reminders(session_id);
CREATE INDEX idx_educational_content_category ON public.educational_content(category_id);
CREATE INDEX idx_educational_content_published ON public.educational_content(is_published, published_at);
CREATE INDEX idx_content_access_profile_id ON public.content_access(profile_id);
CREATE INDEX idx_therapist_search_filters_therapist_id ON public.therapist_search_filters(therapist_id);
CREATE INDEX idx_therapist_search_specializations ON public.therapist_search_filters USING GIN(specializations);
CREATE INDEX idx_search_history_profile_id ON public.search_history(profile_id);
CREATE INDEX idx_login_attempts_email ON public.login_attempts(email, created_at);
CREATE INDEX idx_login_attempts_ip ON public.login_attempts(ip_address, created_at);
CREATE INDEX idx_user_consents_profile_id ON public.user_consents(profile_id);
CREATE INDEX idx_data_deletion_requests_status ON public.data_deletion_requests(status);
CREATE INDEX idx_subscription_changes_subscription_id ON public.subscription_changes(subscription_id);
CREATE INDEX idx_billing_cycles_subscription_id ON public.billing_cycles(subscription_id);
CREATE INDEX idx_billing_cycles_status ON public.billing_cycles(status, payment_due_date);


-- Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_individual_profiles_updated_at BEFORE UPDATE ON public.individual_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapist_profiles_updated_at BEFORE UPDATE ON public.therapist_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_profiles_updated_at BEFORE UPDATE ON public.organization_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapy_sessions_updated_at BEFORE UPDATE ON public.therapy_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_call_sessions_updated_at
  BEFORE UPDATE ON public.video_call_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapist_search_filters_trigger
  AFTER INSERT OR UPDATE ON public.therapist_profiles
  FOR EACH ROW EXECUTE FUNCTION update_therapist_search_filters();

CREATE TRIGGER create_session_reminders_trigger
  AFTER INSERT ON public.therapy_sessions
  FOR EACH ROW EXECUTE FUNCTION create_session_reminders();

-- Initial Data Inserts
INSERT INTO public.pricing_plans (name, description, plan_type, billing_cycle, price_ugx, sessions_included, features) VALUES
('Professional Monthly', 'Monthly individual plan with 4 sessions', 'professional_monthly', 'monthly', 200000, 4, '{"video_calls": true, "messaging": true, "session_notes": true}'),
('Organization Annual', 'Annual organization plan - 680,000 UGX per user with 8 sessions', 'organization_annual', 'annual', 680000, 8, '{"video_calls": true, "messaging": true, "group_sessions": true, "analytics": true, "manual_billing": true}');

INSERT INTO public.session_pricing (name, price_ugx, description) VALUES
('Individual Session (No Subscription)', 76000, 'Price per session for users without subscription'),
('Organization Excess Session', 76000, 'Price per session when organization member exceeds 8 annual sessions');

INSERT INTO public.document_categories (name, description, required_for_role) VALUES
('Professional License', 'Professional therapy license document', ARRAY['therapist']),
('Insurance Certificate', 'Professional insurance certificate', ARRAY['therapist']),
('National ID', 'National identification document', ARRAY['therapist', 'org_admin']),
('Business Registration', 'Organization business registration certificate', ARRAY['org_admin']),
('Tax Certificate', 'Tax registration certificate', ARRAY['org_admin']);

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

INSERT INTO public.consent_forms (title, content, version, form_type) VALUES
('Therapy Consent Form', 'I consent to receiving therapy services through this platform...', '1.0', 'therapy_consent'),
('Data Processing Consent', 'I consent to the processing of my personal data for therapy services...', '1.0', 'data_processing'),
('Session Recording Consent', 'I consent to the recording of therapy sessions for quality and training purposes...', '1.0', 'recording_consent');

INSERT INTO public.data_retention_policies (data_type, retention_period_days, auto_delete, policy_description) VALUES
('session_notes', 2555, false, 'Session notes retained for 7 years as per professional standards'),
('messages', 1095, true, 'Messages retained for 3 years then automatically deleted'),
('recordings', 1825, false, 'Session recordings retained for 5 years'),
('audit_logs', 2555, false, 'Audit logs retained for 7 years for compliance'),
('documents', 2555, false, 'User documents retained for 7 years');

INSERT INTO public.content_categories (name, description, sort_order) VALUES
('Mental Health Basics', 'Fundamental concepts in mental health and wellness', 1),
('Anxiety Management', 'Resources for managing anxiety and stress', 2),
('Depression Support', 'Content related to depression awareness and coping', 3),
('Relationship Skills', 'Communication and relationship building resources', 4),
('Mindfulness & Meditation', 'Mindfulness practices and meditation guides', 5),
('Self-Care Strategies', 'Self-care techniques and wellness practices', 6);

-- Update existing data
UPDATE public.therapy_sessions SET status = 'scheduled' WHERE status IS NULL;
UPDATE public.therapy_sessions SET session_type = 'virtual' WHERE session_type IS NULL;
UPDATE public.therapist_profiles SET status = 'pending_review' WHERE status IS NULL;
UPDATE public.therapist_profiles SET status = 'pending_review' WHERE status IS NULL;
UPDATE public.organization_profiles SET status = 'pending_review' WHERE status IS NULL;
UPDATE public.profiles SET gender = NULL WHERE gender IS NOT NULL AND gender::text NOT IN ('male', 'female');
UPDATE public.individual_profiles SET preferred_therapist_gender = NULL WHERE preferred_therapist_gender IS NOT NULL AND preferred_therapist_gender::text NOT IN ('male', 'female');
UPDATE public.profiles SET role = 'admin'::public.user_role WHERE role::text IN ('sys_admin', 'super_admin');

-- Test Accounts (for local development/testing only)
-- Clean up existing test data to avoid conflicts
DELETE FROM public.messages WHERE sender_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org');
DELETE FROM public.notifications WHERE profile_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org');
DELETE FROM public.therapy_sessions WHERE client_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org') OR therapist_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org');
DELETE FROM public.therapist_availability WHERE therapist_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org');
DELETE FROM public.therapist_profiles WHERE id IN (SELECT id FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org');
DELETE FROM public.organization_profiles WHERE id IN (SELECT id FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org');
DELETE FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org';

-- Insert into profiles (super admin)
INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    is_email_verified,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'kawekwa@mindlyfe.org',
    'Douglas',
    'Kawekwa',
    'admin',
    true,
    now(),
    now()
);

-- Insert support team members
INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    is_email_verified,
    created_at,
    updated_at
) VALUES 
(
    '00000000-0000-0000-0000-000000000002',
    'support1@mindlyfe.org',
    'Sarah',
    'Johnson',
    'admin',
    true,
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000003',
    'michael.chen@mindlyfe.org',
    'Michael',
    'Chen',
    'admin',
    true,
    now(),
    now()
);

-- Insert demo organization admin
INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    is_email_verified,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000004',
    'demo@techcorp.org',
    'Emma',
    'Wilson',
    'org_admin',
    true,
    now(),
    now()
);

INSERT INTO public.organization_profiles (
    id,
    organization_name,
    registration_number,
    tax_id_number,
    representative_name,
    representative_job_title,
    representative_national_id,
    organization_type,
    num_employees,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000004',
    'TechCorp Solutions',
    'TC001',
    'TX123456789',
    'Emma Wilson',
    'HR Director',
    'NID001',
    'private_company',
    250,
    now(),
    now()
);

-- Insert therapists
INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    is_email_verified,
    created_at,
    updated_at
) VALUES 
(
    '00000000-0000-0000-0000-000000000005',
    'dr.smith@mindlyfe.org',
    'Dr. Jennifer',
    'Smith',
    'therapist',
    true,
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000006',
    'dr.brown@mindlyfe.org',
    'Dr. Robert',
    'Brown',
    'therapist',
    true,
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000007',
    'dr.davis@mindlyfe.org',
    'Dr. Lisa',
    'Davis',
    'therapist',
    true,
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000008',
    'dr.garcia@mindlyfe.org',
    'Dr. Maria',
    'Garcia',
    'therapist',
    true,
    now(),
    now()
);

INSERT INTO public.therapist_profiles (
    id,
    national_id_number,
    license_body,
    license_number,
    insurance_provider,
    insurance_policy_number,
    years_experience,
    specializations,
    languages_spoken,
    bio,
    status,
    created_at,
    updated_at
) VALUES 
(
    '00000000-0000-0000-0000-000000000005',
    'NID002',
    'Uganda Allied Health Board',
    'LIC001',
    'Professional Indemnity Ltd',
    'PI001',
    8,
    ARRAY['Anxiety','Depression','PTSD'],
    ARRAY['English','Luganda'],
    'Experienced clinical psychologist specializing in trauma and anxiety disorders.',
    'approved',
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000006',
    'NID003',
    'Uganda Allied Health Board',
    'LIC002',
    'Professional Indemnity Ltd',
    'PI002',
    12,
    ARRAY['Couples Therapy','Family Therapy','Relationship Issues'],
    ARRAY['English','Swahili'],
    'Licensed marriage and family therapist with over a decade of experience.',
    'approved',
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000007',
    'NID004',
    'Uganda Allied Health Board',
    'LIC003',
    'Professional Indemnity Ltd',
    'PI003',
    6,
    ARRAY['Addiction','Substance Abuse','Recovery'],
    ARRAY['English','French'],
    'Specialized addiction counselor helping clients overcome substance abuse and behavioral addictions.',
    'approved',
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000008',
    'NID005',
    'Uganda Allied Health Board',
    'LIC004',
    'Professional Indemnity Ltd',
    'PI004',
    10,
    ARRAY['Child Psychology','Adolescent Therapy','Behavioral Issues'],
    ARRAY['English','Spanish','Luganda'],
    'Child and adolescent psychologist specializing in developmental and behavioral challenges.',
    'approved',
    now(),
    now()
);

-- Create therapist availability
INSERT INTO public.therapist_availability (
    therapist_id,
    day_of_week,
    start_time,
    end_time,
    is_available,
    is_recurring,
    created_at,
    updated_at
) 
SELECT 
    p.id,
    days.day_num,
    '09:00:00'::time,
    '17:00:00'::time,
    true,
    true,
    now(),
    now()
FROM public.profiles p
CROSS JOIN (
    SELECT generate_series(1, 5) as day_num
) days
WHERE p.role = 'therapist' AND p.email LIKE 'dr.%@mindlyfe.org';

-- Create some sample therapy sessions for testing
INSERT INTO public.therapy_sessions (
    client_id,
    therapist_id,
    scheduled_at,
    duration_minutes,
    session_type,
    status,
    created_at,
    updated_at
) VALUES 
-- Upcoming sessions
(
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000005',
    now() + interval '2 days',
    60,
    'virtual',
    'scheduled',
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000006',
    now() + interval '1 week',
    60,
    'virtual',
    'scheduled',
    now(),
    now()
),
-- Past completed sessions
(
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000005',
    now() - interval '1 week',
    60,
    'virtual',
    'completed',
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000007',
    now() - interval '2 weeks',
    60,
    'virtual',
    'completed',
    now(),
    now()
);

-- Create sample notifications for testing
INSERT INTO public.notifications (
    profile_id,
    title,
    message,
    type,
    is_read,
    created_at
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Welcome to Mindlyfe',
    'Your super admin account has been created successfully.',
    'info',
    false,
    now()
),
(
    '00000000-0000-0000-0000-000000000004',
    'Organization Setup Complete',
    'Your organization profile has been set up. You can now invite team members.',
    'success',
    false,
    now()
),
(
    '00000000-0000-0000-0000-000000000005',
    'Therapist Profile Approved',
    'Your therapist profile has been approved and is now active.',
    'success',
    false,
    now()
);

-- Create sample messages for testing
INSERT INTO public.messages (
    sender_id,
    recipient_id,
    conversation_id,
    content,
    message_type,
    is_read,
    created_at
) VALUES 
(
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000005',
    gen_random_uuid(),
    'Hello Dr. Smith, I wanted to confirm our upcoming session.',
    'text',
    false,
    now() - interval '1 hour'
),
(
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000004',
    gen_random_uuid(),
    'Hi Emma, yes our session is confirmed for Thursday at 2 PM. Looking forward to it!',
    'text',
    false,
    now() - interval '30 minutes'
);

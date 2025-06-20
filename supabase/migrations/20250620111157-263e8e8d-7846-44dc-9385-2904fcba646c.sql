
-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('individual', 'therapist', 'org_admin', 'sys_admin', 'super_admin');
CREATE TYPE profile_status AS ENUM ('pending_review', 'approved', 'rejected', 'active', 'inactive');
CREATE TYPE communication_preference AS ENUM ('email', 'sms', 'both');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE organization_type AS ENUM ('private_company', 'school', 'ngo', 'government', 'healthcare', 'other');
CREATE TYPE two_fa_method AS ENUM ('email', 'sms', 'authenticator');
CREATE TYPE verification_purpose AS ENUM ('signup', 'password_reset', '2fa', 'login');
CREATE TYPE session_type AS ENUM ('virtual', 'in_person');
CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'canceled', 'no_show');

-- Main profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role user_role NOT NULL DEFAULT 'individual',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  date_of_birth DATE,
  gender gender_type,
  country TEXT,
  preferred_language TEXT DEFAULT 'en',
  profile_photo_url TEXT,
  is_active BOOLEAN DEFAULT false,
  is_email_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Individual client profiles
CREATE TABLE public.individual_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  mental_health_history TEXT,
  therapy_goals TEXT[],
  communication_pref communication_preference DEFAULT 'email',
  opt_in_newsletter BOOLEAN DEFAULT false,
  opt_in_sms BOOLEAN DEFAULT false,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  preferred_therapist_gender gender_type,
  session_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Therapist profiles
CREATE TABLE public.therapist_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  national_id_number TEXT NOT NULL,
  license_body TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  license_expiry_date DATE NOT NULL,
  insurance_provider TEXT NOT NULL,
  insurance_policy_number TEXT NOT NULL,
  insurance_expiry_date DATE NOT NULL,
  years_experience INTEGER NOT NULL CHECK (years_experience >= 0),
  specializations TEXT[] NOT NULL,
  languages_spoken TEXT[] NOT NULL,
  education_background TEXT,
  certifications TEXT[],
  hourly_rate DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  status profile_status DEFAULT 'pending_review',
  review_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  availability JSONB DEFAULT '{}',
  bio TEXT,
  license_document_url TEXT,
  insurance_document_url TEXT,
  id_document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Organization profiles
CREATE TABLE public.organization_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  organization_type organization_type NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  date_of_establishment DATE NOT NULL,
  tax_id_number TEXT NOT NULL,
  num_employees INTEGER NOT NULL CHECK (num_employees > 0),
  official_website TEXT,
  address TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  representative_name TEXT NOT NULL,
  representative_job_title TEXT NOT NULL,
  representative_national_id TEXT NOT NULL,
  status profile_status DEFAULT 'pending_review',
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Two-factor authentication methods
CREATE TABLE public.user_2fa_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  method two_fa_method NOT NULL,
  secret TEXT, -- For TOTP authenticator
  backup_codes TEXT[], -- Encrypted backup codes
  is_verified BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(profile_id, method)
);

-- Verification codes for various purposes
CREATE TABLE public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  purpose verification_purpose NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Password history to enforce password uniqueness
CREATE TABLE public.password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Organization members (employees/members under an organization)
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization_profiles(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_within_org TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES profiles(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(organization_id, profile_id)
);

-- Therapy sessions
CREATE TABLE public.therapy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) NOT NULL,
  therapist_id UUID REFERENCES profiles(id) NOT NULL,
  organization_id UUID REFERENCES organization_profiles(id),
  session_type session_type NOT NULL DEFAULT 'virtual',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status session_status NOT NULL DEFAULT 'scheduled',
  session_notes TEXT,
  client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
  therapist_notes TEXT,
  meeting_url TEXT,
  recording_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Comprehensive audit logging
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User sessions for single-session enforcement
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Consent records for compliance
CREATE TABLE public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'terms_of_service', 'privacy_policy', 'treatment_consent'
  consent_version TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  consented_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
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

-- Function to handle new user creation from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value user_role;
    user_email TEXT;
    user_name TEXT;
BEGIN
    -- Extract role from raw_user_meta_data, default to 'individual'
    user_role_value := COALESCE(NEW.raw_user_meta_data ->> 'role', 'individual')::user_role;
    user_email := COALESCE(NEW.email, NEW.raw_user_meta_data ->> 'email');
    user_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User');
    
    -- Insert into profiles table
    INSERT INTO public.profiles (
        auth_uid,
        role,
        full_name,
        email,
        phone_number,
        is_email_verified
    ) VALUES (
        NEW.id,
        user_role_value,
        user_name,
        user_email,
        NEW.phone,
        NEW.email_confirmed_at IS NOT NULL
    );
    
    -- Insert into role-specific table based on role
    IF user_role_value = 'individual' THEN
        INSERT INTO public.individual_profiles (id) VALUES (
            (SELECT id FROM public.profiles WHERE auth_uid = NEW.id)
        );
    ELSIF user_role_value = 'therapist' THEN
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
            languages_spoken
        ) VALUES (
            (SELECT id FROM public.profiles WHERE auth_uid = NEW.id),
            COALESCE(NEW.raw_user_meta_data ->> 'national_id_number', ''),
            COALESCE(NEW.raw_user_meta_data ->> 'license_body', ''),
            COALESCE(NEW.raw_user_meta_data ->> 'license_number', ''),
            COALESCE((NEW.raw_user_meta_data ->> 'license_expiry_date')::date, CURRENT_DATE + INTERVAL '1 year'),
            COALESCE(NEW.raw_user_meta_data ->> 'insurance_provider', ''),
            COALESCE(NEW.raw_user_meta_data ->> 'insurance_policy_number', ''),
            COALESCE((NEW.raw_user_meta_data ->> 'insurance_expiry_date')::date, CURRENT_DATE + INTERVAL '1 year'),
            COALESCE((NEW.raw_user_meta_data ->> 'years_experience')::integer, 0),
            COALESCE(string_to_array(NEW.raw_user_meta_data ->> 'specializations', ','), ARRAY['General']),
            COALESCE(string_to_array(NEW.raw_user_meta_data ->> 'languages_spoken', ','), ARRAY['English'])
        );
    ELSIF user_role_value = 'org_admin' THEN
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
            representative_national_id
        ) VALUES (
            (SELECT id FROM public.profiles WHERE auth_uid = NEW.id),
            COALESCE(NEW.raw_user_meta_data ->> 'organization_name', ''),
            COALESCE((NEW.raw_user_meta_data ->> 'organization_type')::organization_type, 'private_company'),
            COALESCE(NEW.raw_user_meta_data ->> 'registration_number', ''),
            COALESCE((NEW.raw_user_meta_data ->> 'date_of_establishment')::date, CURRENT_DATE),
            COALESCE(NEW.raw_user_meta_data ->> 'tax_id_number', ''),
            COALESCE((NEW.raw_user_meta_data ->> 'num_employees')::integer, 1),
            user_name,
            COALESCE(NEW.raw_user_meta_data ->> 'representative_job_title', ''),
            COALESCE(NEW.raw_user_meta_data ->> 'representative_national_id', '')
        );
    END IF;
    
    -- Log the user creation
    INSERT INTO public.audit_logs (
        profile_id,
        action,
        resource_type,
        resource_id,
        details
    ) VALUES (
        (SELECT id FROM public.profiles WHERE auth_uid = NEW.id),
        'USER_CREATED',
        'profile',
        (SELECT id FROM public.profiles WHERE auth_uid = NEW.id),
        jsonb_build_object('role', user_role_value, 'email', user_email)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to clean up expired verification codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM public.verification_codes 
    WHERE expires_at < now() OR is_used = true;
END;
$$ LANGUAGE plpgsql;

-- Basic RLS policies (more specific ones will be added based on requirements)

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = auth_uid);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = auth_uid);

-- Individual profiles policies
CREATE POLICY "Individuals can view own profile" ON public.individual_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = individual_profiles.id 
            AND profiles.auth_uid = auth.uid()
        )
    );

-- Therapist profiles policies
CREATE POLICY "Therapists can view own profile" ON public.therapist_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = therapist_profiles.id 
            AND profiles.auth_uid = auth.uid()
        )
    );

-- Organization profiles policies
CREATE POLICY "Org admins can view own profile" ON public.organization_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = organization_profiles.id 
            AND profiles.auth_uid = auth.uid()
        )
    );

-- 2FA methods policies
CREATE POLICY "Users can manage own 2FA methods" ON public.user_2fa_methods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = user_2fa_methods.profile_id 
            AND profiles.auth_uid = auth.uid()
        )
    );

-- Verification codes policies
CREATE POLICY "Users can access own verification codes" ON public.verification_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = verification_codes.profile_id 
            AND profiles.auth_uid = auth.uid()
        )
    );

-- Therapy sessions policies
CREATE POLICY "Users can view own sessions" ON public.therapy_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.auth_uid = auth.uid() 
            AND (profiles.id = therapy_sessions.client_id OR profiles.id = therapy_sessions.therapist_id)
        )
    );

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = audit_logs.profile_id 
            AND profiles.auth_uid = auth.uid()
        )
    );

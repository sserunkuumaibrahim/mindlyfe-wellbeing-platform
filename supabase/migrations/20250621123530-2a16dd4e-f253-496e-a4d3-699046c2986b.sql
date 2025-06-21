
-- Comprehensive database reset and setup for Mindlyfe authentication system
-- This migration will clean up existing data and create a proper foundation

-- First, drop all existing data and constraints to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop all existing tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.verification_codes CASCADE;
DROP TABLE IF EXISTS public.user_2fa_methods CASCADE;
DROP TABLE IF EXISTS public.therapy_sessions CASCADE;
DROP TABLE IF EXISTS public.organization_profiles CASCADE;
DROP TABLE IF EXISTS public.therapist_profiles CASCADE;
DROP TABLE IF EXISTS public.individual_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop all existing enum types
DROP TYPE IF EXISTS verification_purpose CASCADE;
DROP TYPE IF EXISTS two_fa_method CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS session_type CASCADE;
DROP TYPE IF EXISTS profile_status CASCADE;
DROP TYPE IF EXISTS communication_preference CASCADE;
DROP TYPE IF EXISTS organization_type CASCADE;
DROP TYPE IF EXISTS gender_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Create all enum types
CREATE TYPE user_role AS ENUM ('individual', 'therapist', 'org_admin');
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE organization_type AS ENUM ('private_company', 'school', 'ngo', 'government', 'healthcare', 'other');
CREATE TYPE communication_preference AS ENUM ('email', 'sms', 'both');
CREATE TYPE profile_status AS ENUM ('pending_review', 'approved', 'rejected', 'suspended');
CREATE TYPE session_type AS ENUM ('virtual', 'in_person');
CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE two_fa_method AS ENUM ('totp', 'sms', 'email');
CREATE TYPE verification_purpose AS ENUM ('email_verification', 'phone_verification', 'password_reset', 'two_fa_setup');

-- Create the main profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_uid UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'individual',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email TEXT NOT NULL,
    phone_number TEXT,
    date_of_birth DATE,
    gender gender_type,
    country TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'en',
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

-- Create individual profiles table
CREATE TABLE public.individual_profiles (
    id UUID NOT NULL PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    mental_health_history TEXT,
    therapy_goals TEXT[],
    communication_pref communication_preference NOT NULL DEFAULT 'email',
    opt_in_newsletter BOOLEAN NOT NULL DEFAULT false,
    opt_in_sms BOOLEAN NOT NULL DEFAULT false,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    preferred_therapist_gender gender_type,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create therapist profiles table
CREATE TABLE public.therapist_profiles (
    id UUID NOT NULL PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    national_id_number TEXT NOT NULL,
    license_body TEXT NOT NULL,
    license_number TEXT NOT NULL UNIQUE,
    license_expiry_date DATE,
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    insurance_expiry_date DATE,
    years_experience INTEGER NOT NULL DEFAULT 0,
    specializations TEXT[] NOT NULL DEFAULT ARRAY['General'],
    languages_spoken TEXT[] NOT NULL DEFAULT ARRAY['English'],
    education_background TEXT,
    certifications TEXT[],
    bio TEXT,
    status profile_status NOT NULL DEFAULT 'pending_review',
    license_document_url TEXT,
    insurance_document_url TEXT,
    id_document_url TEXT,
    other_documents_urls TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization profiles table
CREATE TABLE public.organization_profiles (
    id UUID NOT NULL PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    organization_type organization_type NOT NULL DEFAULT 'private_company',
    registration_number TEXT NOT NULL UNIQUE,
    date_of_establishment DATE,
    tax_id_number TEXT NOT NULL,
    num_employees INTEGER NOT NULL DEFAULT 1,
    representative_name TEXT NOT NULL,
    representative_job_title TEXT NOT NULL,
    representative_national_id TEXT NOT NULL,
    official_website TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    billing_contact_email TEXT,
    billing_contact_phone TEXT,
    status profile_status NOT NULL DEFAULT 'pending_review',
    service_requirements JSONB,
    uploaded_documents JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create 2FA methods table
CREATE TABLE public.user_2fa_methods (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    method two_fa_method NOT NULL,
    secret TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    backup_codes TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(profile_id, method)
);

-- Create verification codes table
CREATE TABLE public.verification_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    purpose verification_purpose NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create therapy sessions table
CREATE TABLE public.therapy_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    session_type session_type NOT NULL DEFAULT 'virtual',
    status session_status NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    recording_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit logs table
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for therapist documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('therapist-documents', 'therapist-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = auth_uid);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = auth_uid);

-- Create RLS policies for individual profiles
CREATE POLICY "Users can manage own individual profile" ON public.individual_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = individual_profiles.id 
            AND profiles.auth_uid = auth.uid()
        )
    );

-- Create RLS policies for therapist profiles
CREATE POLICY "Users can manage own therapist profile" ON public.therapist_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = therapist_profiles.id 
            AND profiles.auth_uid = auth.uid()
        )
    );

-- Create RLS policies for organization profiles
CREATE POLICY "Users can manage own organization profile" ON public.organization_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = organization_profiles.id 
            AND profiles.auth_uid = auth.uid()
        )
    );

-- Create RLS policies for other tables
CREATE POLICY "Users can manage own 2FA methods" ON public.user_2fa_methods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = user_2fa_methods.profile_id 
            AND profiles.auth_uid = auth.uid()
        )
    );

CREATE POLICY "Users can access own verification codes" ON public.verification_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = verification_codes.profile_id 
            AND profiles.auth_uid = auth.uid()
        )
    );

CREATE POLICY "Users can view own sessions" ON public.therapy_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.auth_uid = auth.uid() 
            AND (profiles.id = therapy_sessions.client_id OR profiles.id = therapy_sessions.therapist_id)
        )
    );

CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = audit_logs.profile_id 
            AND profiles.auth_uid = auth.uid()
        )
    );

-- Create storage policies for therapist documents
CREATE POLICY "Users can upload their own documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'therapist-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'therapist-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create comprehensive user registration function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    profile_id UUID;
    user_role_value user_role;
    user_email TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
    user_phone TEXT;
BEGIN
    -- Extract and validate user data from metadata
    user_email := COALESCE(NEW.email, '');
    user_first_name := COALESCE(NEW.raw_user_meta_data ->> 'first_name', '');
    user_last_name := COALESCE(NEW.raw_user_meta_data ->> 'last_name', '');
    user_phone := COALESCE(NEW.raw_user_meta_data ->> 'phone_number', '');
    
    -- Validate required fields
    IF user_email = '' THEN
        RAISE EXCEPTION 'Email is required';
    END IF;
    
    IF user_first_name = '' THEN
        RAISE EXCEPTION 'First name is required';
    END IF;
    
    IF user_last_name = '' THEN
        RAISE EXCEPTION 'Last name is required';
    END IF;
    
    -- Extract and validate role
    BEGIN
        user_role_value := COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'individual');
    EXCEPTION WHEN OTHERS THEN
        user_role_value := 'individual';
    END;
    
    -- Insert into profiles table
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
            THEN (NEW.raw_user_meta_data ->> 'gender')::gender_type
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
    
    -- Insert role-specific data
    IF user_role_value = 'individual' THEN
        INSERT INTO public.individual_profiles (
            id,
            mental_health_history,
            therapy_goals,
            communication_pref,
            opt_in_newsletter,
            opt_in_sms,
            emergency_contact_name,
            emergency_contact_phone,
            preferred_therapist_gender
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
                THEN (NEW.raw_user_meta_data ->> 'communication_pref')::communication_preference
                ELSE 'email'::communication_preference
            END,
            COALESCE((NEW.raw_user_meta_data ->> 'opt_in_newsletter')::boolean, false),
            COALESCE((NEW.raw_user_meta_data ->> 'opt_in_sms')::boolean, false),
            NULLIF(NEW.raw_user_meta_data ->> 'emergency_contact_name', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'emergency_contact_phone', ''),
            CASE 
                WHEN NEW.raw_user_meta_data ->> 'preferred_therapist_gender' IN ('male', 'female')
                THEN (NEW.raw_user_meta_data ->> 'preferred_therapist_gender')::gender_type
                ELSE NULL
            END
        );
    ELSIF user_role_value = 'therapist' THEN
        -- Validate required therapist fields
        IF COALESCE(NEW.raw_user_meta_data ->> 'national_id_number', '') = '' THEN
            RAISE EXCEPTION 'National ID number is required for therapists';
        END IF;
        
        IF COALESCE(NEW.raw_user_meta_data ->> 'license_body', '') = '' THEN
            RAISE EXCEPTION 'License body is required for therapists';
        END IF;
        
        IF COALESCE(NEW.raw_user_meta_data ->> 'license_number', '') = '' THEN
            RAISE EXCEPTION 'License number is required for therapists';
        END IF;
        
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
            bio,
            license_document_url,
            insurance_document_url,
            id_document_url,
            other_documents_urls
        ) VALUES (
            profile_id,
            NEW.raw_user_meta_data ->> 'national_id_number',
            NEW.raw_user_meta_data ->> 'license_body',
            NEW.raw_user_meta_data ->> 'license_number',
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
            NULLIF(NEW.raw_user_meta_data ->> 'bio', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'license_document_url', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'insurance_document_url', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'id_document_url', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'other_documents_urls', '')
        );
    ELSIF user_role_value = 'org_admin' THEN
        -- Validate required organization fields
        IF COALESCE(NEW.raw_user_meta_data ->> 'organization_name', '') = '' THEN
            RAISE EXCEPTION 'Organization name is required for organization admins';
        END IF;
        
        IF COALESCE(NEW.raw_user_meta_data ->> 'registration_number', '') = '' THEN
            RAISE EXCEPTION 'Registration number is required for organization admins';
        END IF;
        
        IF COALESCE(NEW.raw_user_meta_data ->> 'tax_id_number', '') = '' THEN
            RAISE EXCEPTION 'Tax ID number is required for organization admins';
        END IF;
        
        IF COALESCE(NEW.raw_user_meta_data ->> 'representative_job_title', '') = '' THEN
            RAISE EXCEPTION 'Representative job title is required for organization admins';
        END IF;
        
        IF COALESCE(NEW.raw_user_meta_data ->> 'representative_national_id', '') = '' THEN
            RAISE EXCEPTION 'Representative national ID is required for organization admins';
        END IF;
        
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
            NEW.raw_user_meta_data ->> 'organization_name',
            COALESCE(
                (NEW.raw_user_meta_data ->> 'organization_type')::organization_type, 
                'private_company'
            ),
            NEW.raw_user_meta_data ->> 'registration_number',
            CASE 
                WHEN NEW.raw_user_meta_data ->> 'date_of_establishment' IS NOT NULL AND NEW.raw_user_meta_data ->> 'date_of_establishment' != ''
                THEN (NEW.raw_user_meta_data ->> 'date_of_establishment')::date
                ELSE NULL
            END,
            NEW.raw_user_meta_data ->> 'tax_id_number',
            COALESCE((NEW.raw_user_meta_data ->> 'num_employees')::integer, 1),
            CONCAT(user_first_name, ' ', user_last_name),
            NEW.raw_user_meta_data ->> 'representative_job_title',
            NEW.raw_user_meta_data ->> 'representative_national_id',
            NULLIF(NEW.raw_user_meta_data ->> 'official_website', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'address', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'city', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'state_province', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'postal_code', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'billing_contact_email', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'billing_contact_phone', '')
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
        profile_id,
        'USER_CREATED',
        'profile',
        profile_id,
        jsonb_build_object('role', user_role_value, 'email', user_email)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add helpful indexes for performance
CREATE INDEX idx_profiles_auth_uid ON public.profiles(auth_uid);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_therapist_profiles_license_number ON public.therapist_profiles(license_number);
CREATE INDEX idx_organization_profiles_registration_number ON public.organization_profiles(registration_number);
CREATE INDEX idx_audit_logs_profile_id ON public.audit_logs(profile_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Add comments for documentation
COMMENT ON TABLE public.profiles IS 'Main user profiles table containing common user information';
COMMENT ON TABLE public.individual_profiles IS 'Extended profile information for individual users seeking therapy';
COMMENT ON TABLE public.therapist_profiles IS 'Extended profile information for therapist users';
COMMENT ON TABLE public.organization_profiles IS 'Extended profile information for organization admin users';
COMMENT ON FUNCTION public.handle_new_user() IS 'Handles new user registration with proper validation for required fields based on user role';

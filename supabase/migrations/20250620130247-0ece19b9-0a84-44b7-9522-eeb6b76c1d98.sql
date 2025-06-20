
-- First, add the missing gender column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender gender_type;

-- Recreate the gender_type enum with only male and female
DROP TYPE IF EXISTS gender_type CASCADE;
CREATE TYPE gender_type AS ENUM ('male', 'female');

-- Add the gender column back after recreating the enum
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender gender_type;

-- Ensure all other enum types exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('individual', 'therapist', 'org_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE organization_type AS ENUM ('private_company', 'school', 'ngo', 'government', 'healthcare', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE communication_preference AS ENUM ('email', 'sms', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE profile_status AS ENUM ('pending_review', 'approved', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_type AS ENUM ('virtual', 'in_person');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE two_fa_method AS ENUM ('totp', 'sms', 'email');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_purpose AS ENUM ('email_verification', 'phone_verification', 'password_reset', 'two_fa_setup');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update table columns to use the correct enum types (skip gender since we just added it)
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role USING role::text::user_role;

-- Update individual_profiles columns
ALTER TABLE public.individual_profiles 
ALTER COLUMN communication_pref TYPE communication_preference USING communication_pref::text::communication_preference;

-- Add preferred_therapist_gender column if it doesn't exist
ALTER TABLE public.individual_profiles 
ADD COLUMN IF NOT EXISTS preferred_therapist_gender gender_type;

-- Update other profile tables
ALTER TABLE public.therapist_profiles 
ALTER COLUMN status TYPE profile_status USING status::text::profile_status;

ALTER TABLE public.organization_profiles 
ALTER COLUMN organization_type TYPE organization_type USING organization_type::text::organization_type;

ALTER TABLE public.organization_profiles 
ALTER COLUMN status TYPE profile_status USING status::text::profile_status;

-- Update session tables
ALTER TABLE public.therapy_sessions 
ALTER COLUMN session_type TYPE session_type USING session_type::text::session_type;

ALTER TABLE public.therapy_sessions 
ALTER COLUMN status TYPE session_status USING status::text::session_status;

-- Update other tables
ALTER TABLE public.user_2fa_methods 
ALTER COLUMN method TYPE two_fa_method USING method::text::two_fa_method;

ALTER TABLE public.verification_codes 
ALTER COLUMN purpose TYPE verification_purpose USING purpose::text::verification_purpose;

-- Recreate the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value user_role;
    user_email TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
    profile_id UUID;
BEGIN
    -- Extract role from raw_user_meta_data, default to 'individual'
    user_role_value := COALESCE(NEW.raw_user_meta_data ->> 'role', 'individual')::user_role;
    user_email := COALESCE(NEW.email, NEW.raw_user_meta_data ->> 'email');
    user_first_name := COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'User');
    user_last_name := COALESCE(NEW.raw_user_meta_data ->> 'last_name', '');
    
    -- Insert into profiles table
    INSERT INTO public.profiles (
        auth_uid,
        role,
        first_name,
        last_name,
        full_name,
        email,
        phone_number,
        is_email_verified,
        gender
    ) VALUES (
        NEW.id,
        user_role_value,
        user_first_name,
        user_last_name,
        CONCAT(user_first_name, ' ', user_last_name),
        user_email,
        NEW.phone,
        NEW.email_confirmed_at IS NOT NULL,
        CASE 
            WHEN NEW.raw_user_meta_data ->> 'gender' IN ('male', 'female') 
            THEN (NEW.raw_user_meta_data ->> 'gender')::gender_type
            ELSE NULL
        END
    ) RETURNING id INTO profile_id;
    
    -- Insert into role-specific table based on role
    IF user_role_value = 'individual' THEN
        INSERT INTO public.individual_profiles (id) VALUES (profile_id);
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
            profile_id,
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
            profile_id,
            COALESCE(NEW.raw_user_meta_data ->> 'organization_name', ''),
            COALESCE((NEW.raw_user_meta_data ->> 'organization_type')::organization_type, 'private_company'),
            COALESCE(NEW.raw_user_meta_data ->> 'registration_number', ''),
            COALESCE((NEW.raw_user_meta_data ->> 'date_of_establishment')::date, CURRENT_DATE),
            COALESCE(NEW.raw_user_meta_data ->> 'tax_id_number', ''),
            COALESCE((NEW.raw_user_meta_data ->> 'num_employees')::integer, 1),
            CONCAT(user_first_name, ' ', user_last_name),
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
        profile_id,
        'USER_CREATED',
        'profile',
        profile_id,
        jsonb_build_object('role', user_role_value, 'email', user_email)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

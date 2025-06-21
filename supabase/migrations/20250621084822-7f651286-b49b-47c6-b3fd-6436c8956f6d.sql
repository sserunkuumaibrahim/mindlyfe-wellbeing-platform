
-- First, let's ensure all enum types exist with the correct values
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('individual', 'therapist', 'org_admin');

DROP TYPE IF EXISTS gender_type CASCADE;
CREATE TYPE gender_type AS ENUM ('male', 'female');

DROP TYPE IF EXISTS organization_type CASCADE;
CREATE TYPE organization_type AS ENUM ('private_company', 'school', 'ngo', 'government', 'healthcare', 'other');

DROP TYPE IF EXISTS communication_preference CASCADE;
CREATE TYPE communication_preference AS ENUM ('email', 'sms', 'both');

DROP TYPE IF EXISTS profile_status CASCADE;
CREATE TYPE profile_status AS ENUM ('pending_review', 'approved', 'rejected', 'suspended');

DROP TYPE IF EXISTS session_type CASCADE;
CREATE TYPE session_type AS ENUM ('virtual', 'in_person');

DROP TYPE IF EXISTS session_status CASCADE;
CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');

DROP TYPE IF EXISTS two_fa_method CASCADE;
CREATE TYPE two_fa_method AS ENUM ('totp', 'sms', 'email');

-- Fix the verification_purpose enum to match expected database values
DROP TYPE IF EXISTS verification_purpose CASCADE;
CREATE TYPE verification_purpose AS ENUM ('signup', 'password_reset', '2fa', 'login');

-- Add missing columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'individual';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender gender_type;

-- Now safely alter existing columns to use correct enum types
DO $$
BEGIN
    -- Fix role column type if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles 
        ALTER COLUMN role TYPE user_role USING COALESCE(role::text::user_role, 'individual');
    END IF;
    
    -- Fix communication_pref in individual_profiles if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'individual_profiles' AND column_name = 'communication_pref') THEN
        ALTER TABLE public.individual_profiles 
        ALTER COLUMN communication_pref TYPE communication_preference 
        USING COALESCE(communication_pref::text::communication_preference, 'email');
    END IF;
    
    -- Fix organization_type in organization_profiles if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'organization_profiles' AND column_name = 'organization_type') THEN
        ALTER TABLE public.organization_profiles 
        ALTER COLUMN organization_type TYPE organization_type 
        USING COALESCE(organization_type::text::organization_type, 'private_company');
    END IF;
    
    -- Fix status columns if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'therapist_profiles' AND column_name = 'status') THEN
        ALTER TABLE public.therapist_profiles 
        ALTER COLUMN status TYPE profile_status 
        USING COALESCE(status::text::profile_status, 'pending_review');
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'organization_profiles' AND column_name = 'status') THEN
        ALTER TABLE public.organization_profiles 
        ALTER COLUMN status TYPE profile_status 
        USING COALESCE(status::text::profile_status, 'pending_review');
    END IF;
    
    -- Fix session tables if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'therapy_sessions' AND column_name = 'session_type') THEN
        ALTER TABLE public.therapy_sessions 
        ALTER COLUMN session_type TYPE session_type 
        USING COALESCE(session_type::text::session_type, 'virtual');
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'therapy_sessions' AND column_name = 'status') THEN
        ALTER TABLE public.therapy_sessions 
        ALTER COLUMN status TYPE session_status 
        USING COALESCE(status::text::session_status, 'scheduled');
    END IF;
    
    -- Fix 2FA and verification tables if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_2fa_methods' AND column_name = 'method') THEN
        ALTER TABLE public.user_2fa_methods 
        ALTER COLUMN method TYPE two_fa_method 
        USING COALESCE(method::text::two_fa_method, 'email');
    END IF;
    
    -- Fix verification_codes table with correct enum values
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'verification_codes' AND column_name = 'purpose') THEN
        ALTER TABLE public.verification_codes 
        ALTER COLUMN purpose TYPE verification_purpose 
        USING COALESCE(purpose::text::verification_purpose, 'signup');
    END IF;
END $$;

-- Add preferred_therapist_gender column to individual_profiles if it doesn't exist
ALTER TABLE public.individual_profiles 
ADD COLUMN IF NOT EXISTS preferred_therapist_gender gender_type;

-- Create or replace the handle_new_user function
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
    -- Extract user data from metadata with validation
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
        full_name,
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
        CONCAT(user_first_name, ' ', user_last_name),
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
        
        IF COALESCE(NEW.raw_user_meta_data ->> 'insurance_provider', '') = '' THEN
            RAISE EXCEPTION 'Insurance provider is required for therapists';
        END IF;
        
        IF COALESCE(NEW.raw_user_meta_data ->> 'insurance_policy_number', '') = '' THEN
            RAISE EXCEPTION 'Insurance policy number is required for therapists';
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
            hourly_rate,
            bio
        ) VALUES (
            profile_id,
            NEW.raw_user_meta_data ->> 'national_id_number',
            NEW.raw_user_meta_data ->> 'license_body',
            NEW.raw_user_meta_data ->> 'license_number',
            COALESCE(
                (NEW.raw_user_meta_data ->> 'license_expiry_date')::date, 
                CURRENT_DATE + INTERVAL '1 year'
            ),
            NEW.raw_user_meta_data ->> 'insurance_provider',
            NEW.raw_user_meta_data ->> 'insurance_policy_number',
            COALESCE(
                (NEW.raw_user_meta_data ->> 'insurance_expiry_date')::date, 
                CURRENT_DATE + INTERVAL '1 year'
            ),
            COALESCE((NEW.raw_user_meta_data ->> 'years_experience')::integer, 0),
            COALESCE(
                string_to_array(NEW.raw_user_meta_data ->> 'specializations', ','), 
                ARRAY['General']
            ),
            COALESCE(
                string_to_array(NEW.raw_user_meta_data ->> 'languages_spoken', ','), 
                ARRAY['English']
            ),
            NULLIF(NEW.raw_user_meta_data ->> 'education_background', ''),
            CASE 
                WHEN NEW.raw_user_meta_data ->> 'certifications' IS NOT NULL AND NEW.raw_user_meta_data ->> 'certifications' != '' 
                THEN string_to_array(NEW.raw_user_meta_data ->> 'certifications', ',')
                ELSE NULL
            END,
            CASE 
                WHEN NEW.raw_user_meta_data ->> 'hourly_rate' IS NOT NULL AND NEW.raw_user_meta_data ->> 'hourly_rate' != ''
                THEN (NEW.raw_user_meta_data ->> 'hourly_rate')::decimal
                ELSE NULL
            END,
            NULLIF(NEW.raw_user_meta_data ->> 'bio', '')
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
            postal_code
        ) VALUES (
            profile_id,
            NEW.raw_user_meta_data ->> 'organization_name',
            CASE 
                WHEN NEW.raw_user_meta_data ->> 'organization_type' IN ('private_company', 'school', 'ngo', 'government', 'healthcare', 'other')
                THEN (NEW.raw_user_meta_data ->> 'organization_type')::organization_type
                ELSE 'private_company'::organization_type
            END,
            NEW.raw_user_meta_data ->> 'registration_number',
            COALESCE(
                (NEW.raw_user_meta_data ->> 'date_of_establishment')::date, 
                CURRENT_DATE
            ),
            NEW.raw_user_meta_data ->> 'tax_id_number',
            COALESCE((NEW.raw_user_meta_data ->> 'num_employees')::integer, 1),
            CONCAT(user_first_name, ' ', user_last_name),
            COALESCE(NEW.raw_user_meta_data ->> 'representative_job_title', 'Administrator'),
            COALESCE(NEW.raw_user_meta_data ->> 'representative_national_id', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'official_website', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'address', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'city', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'state_province', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'postal_code', '')
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
EXCEPTION WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE EXCEPTION 'Registration failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

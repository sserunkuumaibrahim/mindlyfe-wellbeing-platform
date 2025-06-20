
-- Create only the missing enum types (skip user_role and gender_type as they already exist)
DO $$ 
BEGIN
    -- Create profile_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_status') THEN
        CREATE TYPE profile_status AS ENUM ('pending_review', 'approved', 'rejected', 'active', 'inactive');
    END IF;
    
    -- Create communication_preference enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'communication_preference') THEN
        CREATE TYPE communication_preference AS ENUM ('email', 'sms', 'both');
    END IF;
    
    -- Create organization_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_type') THEN
        CREATE TYPE organization_type AS ENUM ('private_company', 'school', 'ngo', 'government', 'healthcare', 'other');
    END IF;
    
    -- Create two_fa_method enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'two_fa_method') THEN
        CREATE TYPE two_fa_method AS ENUM ('email', 'sms', 'authenticator');
    END IF;
    
    -- Create session_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_type') THEN
        CREATE TYPE session_type AS ENUM ('virtual', 'in_person');
    END IF;
    
    -- Create session_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
        CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');
    END IF;
    
    -- Create verification_purpose enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_purpose') THEN
        CREATE TYPE verification_purpose AS ENUM ('email_verification', 'phone_verification', 'password_reset', 'two_factor_auth');
    END IF;
END $$;

-- Add missing columns to organization_profiles table
ALTER TABLE public.organization_profiles 
ADD COLUMN IF NOT EXISTS state TEXT;

-- Update the handle_new_user function to handle all the required fields properly
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
    -- Extract user data from metadata
    user_role_value := COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'individual');
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
        NULLIF(NEW.raw_user_meta_data ->> 'gender', '')::gender_type,
        NULLIF(NEW.raw_user_meta_data ->> 'country', ''),
        COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'preferred_language', ''), 'en'),
        NULLIF(NEW.raw_user_meta_data ->> 'date_of_birth', '')::date
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
            COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'communication_pref', '')::communication_preference, 'email'),
            COALESCE((NEW.raw_user_meta_data ->> 'opt_in_newsletter')::boolean, false),
            COALESCE((NEW.raw_user_meta_data ->> 'opt_in_sms')::boolean, false),
            NULLIF(NEW.raw_user_meta_data ->> 'emergency_contact_name', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'emergency_contact_phone', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'preferred_therapist_gender', '')::gender_type
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
            NULLIF((NEW.raw_user_meta_data ->> 'hourly_rate')::decimal, 0),
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
            COALESCE(
                (NEW.raw_user_meta_data ->> 'organization_type')::organization_type, 
                'private_company'
            ),
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add helpful comments
COMMENT ON FUNCTION public.handle_new_user() IS 'Handles new user registration with proper validation for required fields based on user role';

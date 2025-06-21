
-- First, let's safely recreate the user_role enum and fix the trigger
DO $$ 
BEGIN
    -- Drop the existing trigger and function to avoid conflicts
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
    
    -- Recreate the user_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('individual', 'therapist', 'org_admin');
    END IF;
    
    -- Ensure all other required enums exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('male', 'female');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'communication_preference') THEN
        CREATE TYPE communication_preference AS ENUM ('email', 'sms', 'both');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_status') THEN
        CREATE TYPE profile_status AS ENUM ('pending_review', 'approved', 'rejected', 'suspended');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_type') THEN
        CREATE TYPE organization_type AS ENUM ('private_company', 'school', 'ngo', 'government', 'healthcare', 'other');
    END IF;
END $$;

-- Recreate the handle_new_user function with proper error handling
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
    user_first_name := COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'User');
    user_last_name := COALESCE(NEW.raw_user_meta_data ->> 'last_name', '');
    user_phone := COALESCE(NEW.raw_user_meta_data ->> 'phone_number', '');
    
    -- Validate required fields
    IF user_email = '' THEN
        RAISE EXCEPTION 'Email is required';
    END IF;
    
    -- Extract and validate role with proper error handling
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
            bio
        ) VALUES (
            profile_id,
            COALESCE(NEW.raw_user_meta_data ->> 'national_id_number', 'TEMP_ID'),
            COALESCE(NEW.raw_user_meta_data ->> 'license_body', 'TEMP_BODY'),
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
            NULLIF(NEW.raw_user_meta_data ->> 'bio', '')
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
            COALESCE(NEW.raw_user_meta_data ->> 'organization_name', 'TEMP_ORG'),
            COALESCE(
                (NEW.raw_user_meta_data ->> 'organization_type')::organization_type, 
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
            COALESCE(NEW.raw_user_meta_data ->> 'representative_national_id', 'TEMP_REP_ID')
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
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't block user creation
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

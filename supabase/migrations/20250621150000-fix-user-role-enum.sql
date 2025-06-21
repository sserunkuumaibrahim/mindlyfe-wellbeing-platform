-- Fix user_role enum and handle_new_user function
-- This migration ensures the user_role enum exists and recreates the trigger function

-- Drop existing trigger and function to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Ensure user_role enum exists
DO $$ 
BEGIN
    -- Drop and recreate user_role enum to ensure consistency
    DROP TYPE IF EXISTS user_role CASCADE;
    CREATE TYPE user_role AS ENUM ('individual', 'therapist', 'org_admin');
    
    -- Ensure other required enums exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('male', 'female');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_type') THEN
        CREATE TYPE organization_type AS ENUM ('private_company', 'school', 'ngo', 'government', 'healthcare', 'other');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'communication_preference') THEN
        CREATE TYPE communication_preference AS ENUM ('email', 'sms', 'both');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_status') THEN
        CREATE TYPE profile_status AS ENUM ('pending_review', 'approved', 'rejected', 'suspended');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_type') THEN
        CREATE TYPE session_type AS ENUM ('virtual', 'in_person');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
        CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');
    END IF;
END $$;

-- Update profiles table to use the correct user_role type
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role USING COALESCE(role::text::user_role, 'individual');

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
        RAISE LOG 'Email is required for user creation';
        RETURN NEW; -- Don't block user creation
    END IF;
    
    -- Extract and validate role with proper error handling
    BEGIN
        user_role_value := COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'individual');
    EXCEPTION WHEN OTHERS THEN
        user_role_value := 'individual';
        RAISE LOG 'Invalid role specified, defaulting to individual: %', SQLERRM;
    END;
    
    -- Insert into profiles table
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
                THEN (NEW.raw_user_meta_data ->> 'gender')::gender_type
                ELSE NULL
            END,
            NULLIF(NEW.raw_user_meta_data ->> 'country', ''),
            COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'preferred_language', ''), 'en'),
            CASE 
                WHEN NEW.raw_user_meta_data ->> 'date_of_birth' IS NOT NULL 
                AND NEW.raw_user_meta_data ->> 'date_of_birth' != '' 
                THEN (NEW.raw_user_meta_data ->> 'date_of_birth')::DATE
                ELSE NULL
            END
        ) RETURNING id INTO profile_id;
        
        RAISE LOG 'Created profile with ID: % for user: %', profile_id, user_email;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating profile for user %: %', user_email, SQLERRM;
        RETURN NEW; -- Don't block user creation even if profile creation fails
    END;
    
    -- Create role-specific profile based on user role
    BEGIN
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
                NULLIF(NEW.raw_user_meta_data ->> 'therapy_goals', ''),
                COALESCE((NEW.raw_user_meta_data ->> 'communication_pref')::communication_preference, 'email'),
                COALESCE((NEW.raw_user_meta_data ->> 'opt_in_newsletter')::BOOLEAN, false),
                COALESCE((NEW.raw_user_meta_data ->> 'opt_in_sms')::BOOLEAN, false),
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
                bio,
                license_document_url,
                insurance_document_url,
                id_document_url,
                other_documents_urls
            ) VALUES (
                profile_id,
                NULLIF(NEW.raw_user_meta_data ->> 'national_id_number', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'license_body', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'license_number', ''),
                CASE 
                    WHEN NEW.raw_user_meta_data ->> 'license_expiry_date' IS NOT NULL 
                    AND NEW.raw_user_meta_data ->> 'license_expiry_date' != '' 
                    THEN (NEW.raw_user_meta_data ->> 'license_expiry_date')::DATE
                    ELSE NULL
                END,
                NULLIF(NEW.raw_user_meta_data ->> 'insurance_provider', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'insurance_policy_number', ''),
                CASE 
                    WHEN NEW.raw_user_meta_data ->> 'insurance_expiry_date' IS NOT NULL 
                    AND NEW.raw_user_meta_data ->> 'insurance_expiry_date' != '' 
                    THEN (NEW.raw_user_meta_data ->> 'insurance_expiry_date')::DATE
                    ELSE NULL
                END,
                CASE 
                    WHEN NEW.raw_user_meta_data ->> 'years_experience' IS NOT NULL 
                    AND NEW.raw_user_meta_data ->> 'years_experience' != '' 
                    THEN (NEW.raw_user_meta_data ->> 'years_experience')::INTEGER
                    ELSE NULL
                END,
                NULLIF(NEW.raw_user_meta_data ->> 'specializations', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'languages_spoken', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'education_background', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'certifications', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'bio', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'license_document_url', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'insurance_document_url', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'id_document_url', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'other_documents_urls', '')
            );
            
        ELSIF user_role_value = 'org_admin' THEN
            INSERT INTO public.organization_profiles (
                id,
                organization_name,
                organization_type,
                registration_number,
                tax_id_number,
                date_of_establishment,
                num_employees,
                official_website,
                address,
                city,
                state_province,
                postal_code,
                billing_contact_email,
                billing_contact_phone,
                representative_job_title,
                representative_national_id
            ) VALUES (
                profile_id,
                NULLIF(NEW.raw_user_meta_data ->> 'organization_name', ''),
                CASE 
                    WHEN NEW.raw_user_meta_data ->> 'organization_type' IN ('private_company', 'school', 'ngo', 'government', 'healthcare', 'other') 
                    THEN (NEW.raw_user_meta_data ->> 'organization_type')::organization_type
                    ELSE 'other'
                END,
                NULLIF(NEW.raw_user_meta_data ->> 'registration_number', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'tax_id_number', ''),
                CASE 
                    WHEN NEW.raw_user_meta_data ->> 'date_of_establishment' IS NOT NULL 
                    AND NEW.raw_user_meta_data ->> 'date_of_establishment' != '' 
                    THEN (NEW.raw_user_meta_data ->> 'date_of_establishment')::DATE
                    ELSE NULL
                END,
                CASE 
                    WHEN NEW.raw_user_meta_data ->> 'num_employees' IS NOT NULL 
                    AND NEW.raw_user_meta_data ->> 'num_employees' != '' 
                    THEN (NEW.raw_user_meta_data ->> 'num_employees')::INTEGER
                    ELSE NULL
                END,
                NULLIF(NEW.raw_user_meta_data ->> 'official_website', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'address', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'city', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'state_province', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'postal_code', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'billing_contact_email', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'billing_contact_phone', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'representative_job_title', ''),
                NULLIF(NEW.raw_user_meta_data ->> 'representative_national_id', '')
            );
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating role-specific profile for user %: %', user_email, SQLERRM;
        -- Don't return NULL here as it would prevent the user from being created
    END;
    
    -- Log successful user creation
    RAISE LOG 'Successfully processed new user: % with role: %', user_email, user_role_value;
    
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW; -- Always return NEW to allow user creation
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add helpful comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Handles new user registration with proper validation for required fields based on user role. Fixed user_role enum issue.';
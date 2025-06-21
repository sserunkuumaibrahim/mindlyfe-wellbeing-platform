-- Temporary production fix for email service configuration issue
-- This migration disables email confirmation until SMTP is properly configured
-- Error: "535 Incorrect authentication data" indicates email service misconfiguration

BEGIN;

-- Update auth configuration to temporarily disable email confirmation
-- This allows user registration to proceed while email service is being fixed
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_email_confirmations = false,
  enable_email_change_confirmations = false
WHERE true;

-- If config table doesn't exist or is empty, insert default values
INSERT INTO auth.config (enable_signup, enable_email_confirmations, enable_email_change_confirmations)
SELECT true, false, false
WHERE NOT EXISTS (SELECT 1 FROM auth.config);

-- Update the handle_new_user function to auto-confirm emails temporarily
-- This ensures users can register and use the platform immediately
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    profile_id UUID;
    user_role_value public.user_role;
    user_email TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
    user_phone TEXT;
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
    
    -- TEMPORARY: Auto-confirm email since email service is misconfigured
    -- Remove this when email service is properly configured
    IF NEW.email_confirmed_at IS NULL THEN
        UPDATE auth.users 
        SET email_confirmed_at = now(),
            updated_at = now()
        WHERE id = NEW.id;
    END IF;
    
    -- Insert into profiles table with explicit schema and type references
    -- Auto-verify email temporarily due to email service issues
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
            true, -- Auto-verify temporarily
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
    
    -- Insert role-specific data for individual users only
    BEGIN
        IF user_role_value = 'individual'::public.user_role THEN
            INSERT INTO public.individual_profiles (
                id,
                mental_health_history,
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
                END
            );
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating individual profile: %', SQLERRM;
    END;
    
    RAISE LOG 'Successfully created user profile for: % (email auto-verified due to email service issues)', user_email;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to use the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;

-- NOTE: This is a temporary fix for production email service issues
-- Once email service is properly configured with correct SMTP credentials:
-- 1. Revert email confirmation settings to enabled
-- 2. Remove auto-email verification from handle_new_user function
-- 3. Test email delivery thoroughly before deploying
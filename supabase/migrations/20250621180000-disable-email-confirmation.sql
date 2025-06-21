-- Disable email confirmation for development environment
-- This allows users to register without email verification

BEGIN;

-- Update auth configuration to disable email confirmation
-- This is safe for development but should be enabled in production
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_email_confirmations = false,
  enable_email_change_confirmations = false
WHERE true;

-- If the config table doesn't exist or doesn't have these columns,
-- we'll handle it gracefully
DO $$
BEGIN
    -- Try to insert default config if table is empty
    IF NOT EXISTS (SELECT 1 FROM auth.config LIMIT 1) THEN
        INSERT INTO auth.config (enable_signup, enable_email_confirmations, enable_email_change_confirmations)
        VALUES (true, false, false)
        ON CONFLICT DO NOTHING;
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        -- Config table doesn't exist, which is fine for some Supabase versions
        RAISE NOTICE 'auth.config table does not exist, skipping configuration update';
    WHEN undefined_column THEN
        -- Columns don't exist, which is fine for some Supabase versions
        RAISE NOTICE 'Email confirmation columns do not exist, skipping configuration update';
END $$;

-- Alternative approach: Update the handle_new_user function to automatically confirm emails
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
    
    -- Auto-confirm email for development (remove this in production)
    IF NEW.email_confirmed_at IS NULL THEN
        UPDATE auth.users 
        SET email_confirmed_at = now()
        WHERE id = NEW.id;
    END IF;
    
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
            true, -- Auto-verify email for development
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
    
    -- Insert role-specific data for individual users only (simplified)
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
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
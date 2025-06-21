-- Production fix for user_role enum issue
-- This migration ensures the user_role enum exists and all dependencies work
-- Maintains email confirmation for production environment

BEGIN;

-- Drop existing trigger and function completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop and recreate ALL enum types to ensure they exist in the correct schema
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.gender_type CASCADE;
DROP TYPE IF EXISTS public.organization_type CASCADE;
DROP TYPE IF EXISTS public.communication_preference CASCADE;
DROP TYPE IF EXISTS public.profile_status CASCADE;

-- Create all enum types in public schema
CREATE TYPE public.user_role AS ENUM ('individual', 'therapist', 'org_admin');
CREATE TYPE public.gender_type AS ENUM ('male', 'female');
CREATE TYPE public.organization_type AS ENUM ('private_company', 'school', 'ngo', 'government', 'healthcare', 'other');
CREATE TYPE public.communication_preference AS ENUM ('email', 'sms', 'both');
CREATE TYPE public.profile_status AS ENUM ('pending_review', 'approved', 'rejected', 'suspended');

-- Ensure tables exist with proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_uid UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role NOT NULL DEFAULT 'individual',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email TEXT NOT NULL,
    phone_number TEXT,
    date_of_birth DATE,
    gender public.gender_type,
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

-- Update existing profiles table if it exists
DO $$
BEGIN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN role public.user_role NOT NULL DEFAULT 'individual';
    ELSE
        -- Update existing role column type
        ALTER TABLE public.profiles 
        ALTER COLUMN role TYPE public.user_role USING COALESCE(role::text::public.user_role, 'individual');
    END IF;
    
    -- Update gender column type if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'gender' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles 
        ALTER COLUMN gender TYPE public.gender_type USING 
        CASE 
            WHEN gender::text IN ('male', 'female') THEN gender::text::public.gender_type
            ELSE NULL
        END;
    END IF;
END $$;

-- Ensure individual_profiles table exists
CREATE TABLE IF NOT EXISTS public.individual_profiles (
    id UUID NOT NULL PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    mental_health_history TEXT,
    therapy_goals TEXT[],
    communication_pref public.communication_preference NOT NULL DEFAULT 'email',
    opt_in_newsletter BOOLEAN NOT NULL DEFAULT false,
    opt_in_sms BOOLEAN NOT NULL DEFAULT false,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    preferred_therapist_gender public.gender_type,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update individual_profiles communication_pref column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'individual_profiles' AND column_name = 'communication_pref' AND table_schema = 'public') THEN
        ALTER TABLE public.individual_profiles ADD COLUMN communication_pref public.communication_preference NOT NULL DEFAULT 'email';
    ELSE
        ALTER TABLE public.individual_profiles 
        ALTER COLUMN communication_pref TYPE public.communication_preference 
        USING COALESCE(communication_pref::text::public.communication_preference, 'email');
    END IF;
END $$;

-- Create production-ready handle_new_user function with proper email verification
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
    
    -- Insert into profiles table with explicit schema and type references
    -- Maintain proper email verification status from Supabase auth
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
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

COMMIT;
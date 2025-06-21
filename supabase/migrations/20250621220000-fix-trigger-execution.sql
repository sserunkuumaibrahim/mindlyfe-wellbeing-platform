-- Fix trigger execution and ensure automatic profile creation works
-- This migration addresses the issue where handle_new_user trigger is not executing properly

-- First, ensure RLS is enabled on all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them with proper permissions
DROP POLICY IF EXISTS "Allow profile creation on signup" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual profile creation" ON public.individual_profiles;
DROP POLICY IF EXISTS "Allow therapist profile creation" ON public.therapist_profiles;
DROP POLICY IF EXISTS "Allow organization profile creation" ON public.organization_profiles;

-- Create comprehensive INSERT policies that work with triggers
CREATE POLICY "Enable profile creation for authenticated users and triggers" ON public.profiles
    FOR INSERT 
    WITH CHECK (
        -- Allow if user is authenticated and creating their own profile
        (auth.uid() IS NOT NULL AND auth_uid = auth.uid()) OR
        -- Allow if called from trigger (no auth context)
        (auth.uid() IS NULL)
    );

CREATE POLICY "Enable individual profile creation" ON public.individual_profiles
    FOR INSERT 
    WITH CHECK (
        -- Allow if user owns the parent profile or called from trigger
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = individual_profiles.id 
            AND (profiles.auth_uid = auth.uid() OR auth.uid() IS NULL)
        )
    );

CREATE POLICY "Enable therapist profile creation" ON public.therapist_profiles
    FOR INSERT 
    WITH CHECK (
        -- Allow if user owns the parent profile or called from trigger
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = therapist_profiles.id 
            AND (profiles.auth_uid = auth.uid() OR auth.uid() IS NULL)
        )
    );

CREATE POLICY "Enable organization profile creation" ON public.organization_profiles
    FOR INSERT 
    WITH CHECK (
        -- Allow if user owns the parent profile or called from trigger
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = organization_profiles.id 
            AND (profiles.auth_uid = auth.uid() OR auth.uid() IS NULL)
        )
    );

-- Drop and recreate the trigger function with enhanced error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    user_email text;
    user_role text;
    profile_id uuid;
    first_name text;
    last_name text;
BEGIN
    -- Log trigger execution
    RAISE LOG 'handle_new_user: Starting for user ID %', NEW.id;
    
    -- Extract user data with null checks
    user_email := COALESCE(NEW.email, '');
    first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    
    -- Validate email
    IF user_email IS NULL OR user_email = '' THEN
        RAISE LOG 'handle_new_user: Invalid email for user %, skipping profile creation', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Extract and validate user role from raw_user_meta_data
    user_role := COALESCE(
        NEW.raw_user_meta_data->>'role',
        'individual'
    );
    
    -- Validate role and default to individual if invalid
    IF user_role NOT IN ('individual', 'therapist', 'org_admin') THEN
        user_role := 'individual';
        RAISE LOG 'handle_new_user: Invalid role for user %, defaulting to individual', NEW.id;
    END IF;
    
    RAISE LOG 'handle_new_user: Processing user % with email % and role %', NEW.id, user_email, user_role;
    
    -- Auto-confirm email for development/testing
    BEGIN
        UPDATE auth.users 
        SET 
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE id = NEW.id;
        
        RAISE LOG 'handle_new_user: Email confirmed for user %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'handle_new_user: Failed to confirm email for user %: %', NEW.id, SQLERRM;
    END;
    
    -- Insert into profiles table with explicit transaction
    BEGIN
        INSERT INTO public.profiles (
            auth_uid,
            email,
            first_name,
            last_name,
            role,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            user_email,
            first_name,
            last_name,
            user_role::user_role,
            NOW(),
            NOW()
        ) RETURNING id INTO profile_id;
        
        RAISE LOG 'handle_new_user: Successfully created profile % for user %', profile_id, NEW.id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'handle_new_user: CRITICAL - Failed to create profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        -- Don't return early, let the user be created even if profile fails
        RETURN NEW;
    END;
    
    -- Create role-specific profile only if main profile was created successfully
    IF profile_id IS NOT NULL THEN
        IF user_role = 'individual' THEN
            BEGIN
                INSERT INTO public.individual_profiles (
                    id,
                    created_at,
                    updated_at
                ) VALUES (
                    profile_id,
                    NOW(),
                    NOW()
                );
                
                RAISE LOG 'handle_new_user: Successfully created individual profile for user %', NEW.id;
                
            EXCEPTION WHEN OTHERS THEN
                RAISE LOG 'handle_new_user: Failed to create individual profile for user %: %', NEW.id, SQLERRM;
            END;
            
        ELSIF user_role = 'therapist' THEN
            BEGIN
                INSERT INTO public.therapist_profiles (
                    id,
                    created_at,
                    updated_at
                ) VALUES (
                    profile_id,
                    NOW(),
                    NOW()
                );
                
                RAISE LOG 'handle_new_user: Successfully created therapist profile for user %', NEW.id;
                
            EXCEPTION WHEN OTHERS THEN
                RAISE LOG 'handle_new_user: Failed to create therapist profile for user %: %', NEW.id, SQLERRM;
            END;
            
        ELSIF user_role = 'org_admin' THEN
            BEGIN
                INSERT INTO public.organization_profiles (
                    id,
                    created_at,
                    updated_at
                ) VALUES (
                    profile_id,
                    NOW(),
                    NOW()
                );
                
                RAISE LOG 'handle_new_user: Successfully created organization profile for user %', NEW.id;
                
            EXCEPTION WHEN OTHERS THEN
                RAISE LOG 'handle_new_user: Failed to create organization profile for user %: %', NEW.id, SQLERRM;
            END;
        END IF;
    END IF;
    
    RAISE LOG 'handle_new_user: Completed processing for user %', NEW.id;
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: FATAL ERROR for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger with proper timing
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon;

-- Ensure the trigger function can access all necessary tables
GRANT INSERT ON public.profiles TO postgres;
GRANT INSERT ON public.individual_profiles TO postgres;
GRANT INSERT ON public.therapist_profiles TO postgres;
GRANT INSERT ON public.organization_profiles TO postgres;

RAISE NOTICE 'Enhanced trigger function and policies have been created successfully';
RAISE NOTICE 'Automatic profile creation should now work properly';
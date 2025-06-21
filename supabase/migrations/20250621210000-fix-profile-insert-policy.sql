-- Fix profile creation by adding INSERT policy for profiles table
-- This allows the handle_new_user trigger to create profiles

-- Add INSERT policy for profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Allow profile creation on signup'
    ) THEN
        CREATE POLICY "Allow profile creation on signup" ON public.profiles
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Add INSERT policy for individual_profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'individual_profiles' AND policyname = 'Allow individual profile creation'
    ) THEN
        CREATE POLICY "Allow individual profile creation" ON public.individual_profiles
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Add INSERT policy for therapist_profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'therapist_profiles' AND policyname = 'Allow therapist profile creation'
    ) THEN
        CREATE POLICY "Allow therapist profile creation" ON public.therapist_profiles
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Add INSERT policy for organization_profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'organization_profiles' AND policyname = 'Allow organization profile creation'
    ) THEN
        CREATE POLICY "Allow organization profile creation" ON public.organization_profiles
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Recreate the handle_new_user trigger to ensure it's working
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_email text;
    user_role text;
    profile_id uuid;
BEGIN
    -- Extract user data
    user_email := NEW.email;
    
    -- Validate email
    IF user_email IS NULL OR user_email = '' THEN
        RAISE LOG 'handle_new_user: Invalid email for user %', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Extract and validate user role from raw_user_meta_data
    user_role := COALESCE(
        NEW.raw_user_meta_data->>'role',
        'individual'
    );
    
    -- Validate role
    IF user_role NOT IN ('individual', 'therapist', 'org_admin') THEN
        user_role := 'individual';
    END IF;
    
    -- Temporarily auto-confirm emails for production
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE id = NEW.id AND email_confirmed_at IS NULL;
    
    -- Insert into profiles table
    BEGIN
        INSERT INTO public.profiles (
            auth_uid,
            email,
            role,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            user_email,
            user_role::user_role,
            NOW(),
            NOW()
        ) RETURNING id INTO profile_id;
        
        RAISE LOG 'handle_new_user: Created profile % for user %', profile_id, NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'handle_new_user: Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
    END;
    
    -- Create role-specific profile
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
            
            RAISE LOG 'handle_new_user: Created individual profile for user %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'handle_new_user: Failed to create individual profile for user %: %', NEW.id, SQLERRM;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

RAISE NOTICE 'Profile INSERT policies and trigger have been fixed';
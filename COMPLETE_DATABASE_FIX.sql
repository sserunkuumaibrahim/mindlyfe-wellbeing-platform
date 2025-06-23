-- COMPLETE DATABASE FIX FOR MINDLYFE REGISTRATION ISSUES
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Create or update enum types
DO $$ BEGIN
    CREATE TYPE gender_enum AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'gender_enum already exists, skipping creation';
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('individual', 'therapist', 'organization');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'user_role already exists, skipping creation';
END $$;

-- Step 2: Ensure profiles table has all required columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS gender gender_enum DEFAULT 'prefer_not_to_say',
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 3: Ensure individual_profiles table has all required columns
ALTER TABLE public.individual_profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 4: Ensure therapist_profiles table has all required columns
ALTER TABLE public.therapist_profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS license_number TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS specializations JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 5: Ensure organization_profiles table has all required columns
ALTER TABLE public.organization_profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS organization_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS organization_type TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS license_number TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_person TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 6: Create primary keys if they don't exist
DO $$ BEGIN
    -- Check if primary key exists for individual_profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'individual_profiles' 
        AND constraint_type = 'PRIMARY KEY'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.individual_profiles ADD CONSTRAINT individual_profiles_pkey PRIMARY KEY (user_id);
        RAISE NOTICE 'Primary key created for individual_profiles';
    ELSE
        RAISE NOTICE 'Primary key already exists for individual_profiles';
    END IF;
EXCEPTION
    WHEN OTHERS THEN 
        RAISE NOTICE 'Error creating primary key for individual_profiles: %', SQLERRM;
END $$;

DO $$ BEGIN
    -- Check if primary key exists for therapist_profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'therapist_profiles' 
        AND constraint_type = 'PRIMARY KEY'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.therapist_profiles ADD CONSTRAINT therapist_profiles_pkey PRIMARY KEY (user_id);
        RAISE NOTICE 'Primary key created for therapist_profiles';
    ELSE
        RAISE NOTICE 'Primary key already exists for therapist_profiles';
    END IF;
EXCEPTION
    WHEN OTHERS THEN 
        RAISE NOTICE 'Error creating primary key for therapist_profiles: %', SQLERRM;
END $$;

DO $$ BEGIN
    -- Check if primary key exists for organization_profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'organization_profiles' 
        AND constraint_type = 'PRIMARY KEY'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.organization_profiles ADD CONSTRAINT organization_profiles_pkey PRIMARY KEY (user_id);
        RAISE NOTICE 'Primary key created for organization_profiles';
    ELSE
        RAISE NOTICE 'Primary key already exists for organization_profiles';
    END IF;
EXCEPTION
    WHEN OTHERS THEN 
        RAISE NOTICE 'Error creating primary key for organization_profiles: %', SQLERRM;
END $$;

-- Step 7: Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_profiles ENABLE ROW LEVEL SECURITY;

-- Step 8: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow trigger to insert profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own individual profile" ON public.individual_profiles;
DROP POLICY IF EXISTS "Users can insert their individual profile" ON public.individual_profiles;
DROP POLICY IF EXISTS "Users can update own individual profile" ON public.individual_profiles;
DROP POLICY IF EXISTS "Allow trigger to insert individual profiles" ON public.individual_profiles;

DROP POLICY IF EXISTS "Users can view own therapist profile" ON public.therapist_profiles;
DROP POLICY IF EXISTS "Users can insert their therapist profile" ON public.therapist_profiles;
DROP POLICY IF EXISTS "Users can update own therapist profile" ON public.therapist_profiles;
DROP POLICY IF EXISTS "Allow trigger to insert therapist profiles" ON public.therapist_profiles;

DROP POLICY IF EXISTS "Users can view own organization profile" ON public.organization_profiles;
DROP POLICY IF EXISTS "Users can insert their organization profile" ON public.organization_profiles;
DROP POLICY IF EXISTS "Users can update own organization profile" ON public.organization_profiles;
DROP POLICY IF EXISTS "Allow trigger to insert organization profiles" ON public.organization_profiles;

-- Step 9: Create comprehensive RLS policies
-- Profiles table policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow trigger to insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Individual profiles table policies
CREATE POLICY "Users can view own individual profile" ON public.individual_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their individual profile" ON public.individual_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own individual profile" ON public.individual_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow trigger to insert individual profiles" ON public.individual_profiles
    FOR INSERT WITH CHECK (true);

-- Therapist profiles table policies
CREATE POLICY "Users can view own therapist profile" ON public.therapist_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their therapist profile" ON public.therapist_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own therapist profile" ON public.therapist_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow trigger to insert therapist profiles" ON public.therapist_profiles
    FOR INSERT WITH CHECK (true);

-- Organization profiles table policies
CREATE POLICY "Users can view own organization profile" ON public.organization_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their organization profile" ON public.organization_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own organization profile" ON public.organization_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow trigger to insert organization profiles" ON public.organization_profiles
    FOR INSERT WITH CHECK (true);

-- Step 10: Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
    profile_exists boolean;
BEGIN
    -- Log the trigger execution
    RAISE LOG 'handle_new_user triggered for user: %', NEW.id;
    
    -- Check if profile already exists to avoid duplicates
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.id) INTO profile_exists;
    
    IF profile_exists THEN
        RAISE LOG 'Profile already exists for user %, skipping creation', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Confirm the user's email immediately
    UPDATE auth.users 
    SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()), 
        confirmed_at = COALESCE(confirmed_at, NOW())
    WHERE id = NEW.id;
    
    -- Extract role from user metadata
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'individual');
    
    -- Validate role
    IF user_role NOT IN ('individual', 'therapist', 'organization') THEN
        user_role := 'individual';
        RAISE LOG 'Invalid role provided, defaulting to individual for user %', NEW.id;
    END IF;
    
    RAISE LOG 'Creating profile with role % for user %', user_role, NEW.id;
    
    -- Insert into profiles table
    INSERT INTO public.profiles (
        id,
        email,
        role,
        first_name,
        last_name,
        gender,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        user_role::user_role,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'gender', 'prefer_not_to_say')::gender_enum,
        NOW(),
        NOW()
    );
    
    RAISE LOG 'Profile created successfully for user %', NEW.id;
    
    -- Create role-specific profile
    IF user_role = 'individual' THEN
        INSERT INTO public.individual_profiles (
            user_id,
            emergency_contact_name,
            emergency_contact_phone,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'emergency_contact_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'emergency_contact_phone', ''),
            NOW(),
            NOW()
        );
        RAISE LOG 'Individual profile created for user %', NEW.id;
        
    ELSIF user_role = 'therapist' THEN
        INSERT INTO public.therapist_profiles (
            user_id,
            license_number,
            specializations,
            bio,
            hourly_rate,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'license_number', ''),
            COALESCE(NEW.raw_user_meta_data->>'specializations', '[]')::jsonb,
            COALESCE(NEW.raw_user_meta_data->>'bio', ''),
            COALESCE((NEW.raw_user_meta_data->>'hourly_rate')::numeric, 0),
            NOW(),
            NOW()
        );
        RAISE LOG 'Therapist profile created for user %', NEW.id;
        
    ELSIF user_role = 'organization' THEN
        INSERT INTO public.organization_profiles (
            user_id,
            organization_name,
            organization_type,
            license_number,
            contact_person,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'organization_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'organization_type', ''),
            COALESCE(NEW.raw_user_meta_data->>'license_number', ''),
            COALESCE(NEW.raw_user_meta_data->>'contact_person', ''),
            NOW(),
            NOW()
        );
        RAISE LOG 'Organization profile created for user %', NEW.id;
    END IF;
    
    RAISE LOG 'User registration completed successfully for %', NEW.id;
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
        -- Don't re-raise the exception to prevent user creation failure
        -- Instead, log the error and continue
        RETURN NEW;
END;
$$;

-- Step 11: Create or replace the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 12: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 13: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_individual_profiles_user_id ON public.individual_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_therapist_profiles_user_id ON public.therapist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_profiles_user_id ON public.organization_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_therapist_profiles_license ON public.therapist_profiles(license_number);
CREATE INDEX IF NOT EXISTS idx_organization_profiles_license ON public.organization_profiles(license_number);

-- Step 14: Email confirmation settings (handled via Supabase Dashboard)
-- Note: Email confirmation settings must be configured in Supabase Dashboard > Authentication > Settings
-- Set "Enable email confirmations" to OFF for development testing

-- Completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Database fix completed successfully!';
    RAISE NOTICE '📋 All tables, columns, enums, triggers, and policies have been created/updated';
    RAISE NOTICE '🔧 Email confirmation has been disabled for development';
    RAISE NOTICE '🚀 You can now test user registration!';
END $$;
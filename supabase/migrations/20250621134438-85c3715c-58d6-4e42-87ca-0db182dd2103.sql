
-- First, ensure the profiles table has the role column with the correct type
DO $$ 
BEGIN
    -- Check if the role column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'individual'::user_role;
    ELSE
        -- If it exists, make sure it has the correct type
        ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role USING COALESCE(role::text, 'individual')::user_role;
        ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'individual'::user_role;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If there's any error, log it and continue
        RAISE LOG 'Error updating profiles table: %', SQLERRM;
END $$;

-- Ensure the individual_profiles table has the communication_pref and preferred_therapist_gender columns
DO $$
BEGIN
    -- Add communication_pref column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'individual_profiles' AND column_name = 'communication_pref') THEN
        ALTER TABLE public.individual_profiles ADD COLUMN communication_pref communication_preference DEFAULT 'email'::communication_preference;
    END IF;
    
    -- Add preferred_therapist_gender column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'individual_profiles' AND column_name = 'preferred_therapist_gender') THEN
        ALTER TABLE public.individual_profiles ADD COLUMN preferred_therapist_gender gender_type;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error updating individual_profiles table: %', SQLERRM;
END $$;

-- Ensure organization_profiles table has the organization_type column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization_profiles' AND column_name = 'organization_type') THEN
        ALTER TABLE public.organization_profiles ADD COLUMN organization_type organization_type DEFAULT 'private_company'::organization_type;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error updating organization_profiles table: %', SQLERRM;
END $$;

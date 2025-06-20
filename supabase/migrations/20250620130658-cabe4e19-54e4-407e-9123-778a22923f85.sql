
-- First, ensure the trigger exists and is properly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify all enum types exist and are properly defined
DO $$ 
BEGIN
    -- Check if user_role enum exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('individual', 'therapist', 'org_admin');
    END IF;
    
    -- Check if gender_type enum exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('male', 'female');
    END IF;
    
    -- Verify the profiles table has all required columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'individual'::user_role;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') THEN
        ALTER TABLE public.profiles ADD COLUMN gender gender_type;
    END IF;
END $$;

-- Make sure the role column uses the correct type
DO $$
BEGIN
    ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role USING role::text::user_role;
EXCEPTION
    WHEN OTHERS THEN
        -- If conversion fails, set a default and try again
        UPDATE public.profiles SET role = 'individual' WHERE role IS NULL;
        ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role USING COALESCE(role::text, 'individual')::user_role;
END $$;

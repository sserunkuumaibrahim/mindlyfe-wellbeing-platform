
-- Drop all existing tables and start fresh
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.consent_records CASCADE;
DROP TABLE IF EXISTS public.individual_profiles CASCADE;
DROP TABLE IF EXISTS public.organization_members CASCADE;
DROP TABLE IF EXISTS public.organization_profiles CASCADE;
DROP TABLE IF EXISTS public.password_history CASCADE;
DROP TABLE IF EXISTS public.therapist_profiles CASCADE;
DROP TABLE IF EXISTS public.therapy_sessions CASCADE;
DROP TABLE IF EXISTS public.user_2fa_methods CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.verification_codes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop all existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_codes() CASCADE;
DROP FUNCTION IF EXISTS public.upload_document(text, text, text) CASCADE;

-- Drop all existing enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS gender_type CASCADE;
DROP TYPE IF EXISTS organization_type CASCADE;
DROP TYPE IF EXISTS communication_preference CASCADE;
DROP TYPE IF EXISTS profile_status CASCADE;
DROP TYPE IF EXISTS session_type CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS two_fa_method CASCADE;
DROP TYPE IF EXISTS verification_purpose CASCADE;

-- Create simple enums
CREATE TYPE user_role AS ENUM ('individual', 'therapist', 'org_admin');
CREATE TYPE gender_type AS ENUM ('male', 'female');

-- Create a simple profiles table that works
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'individual',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  date_of_birth DATE,
  gender gender_type,
  country TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = auth_uid);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = auth_uid);

-- Create a simple trigger function that works
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    auth_uid,
    role,
    first_name,
    last_name,
    email,
    phone_number,
    date_of_birth,
    gender,
    country,
    preferred_language
  ) VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'individual'),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data ->> 'phone_number',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'date_of_birth' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'date_of_birth')::date
      ELSE NULL
    END,
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'gender' IN ('male', 'female')
      THEN (NEW.raw_user_meta_data ->> 'gender')::gender_type
      ELSE NULL
    END,
    NEW.raw_user_meta_data ->> 'country',
    COALESCE(NEW.raw_user_meta_data ->> 'preferred_language', 'en')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

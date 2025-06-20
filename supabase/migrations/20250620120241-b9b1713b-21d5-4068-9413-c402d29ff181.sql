
-- First, let's check and create the documents bucket if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') THEN
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('documents', 'documents', false);
    END IF;
END $$;

-- Enable realtime for therapist_profiles and organization_profiles
ALTER TABLE public.therapist_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.organization_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'therapist_profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.therapist_profiles;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'organization_profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.organization_profiles;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
END $$;

-- Update therapist profiles status to pending_review by default for new registrations
UPDATE public.therapist_profiles 
SET status = 'pending_review' 
WHERE status IS NULL;

-- Update organization profiles status to pending_review by default for new registrations  
UPDATE public.organization_profiles 
SET status = 'pending_review' 
WHERE status IS NULL;

-- Create function to handle document uploads
CREATE OR REPLACE FUNCTION public.upload_document(
  file_path TEXT,
  file_type TEXT,
  profile_type TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  result JSONB;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Update the appropriate profile table with document info
  IF profile_type = 'therapist' THEN
    UPDATE public.therapist_profiles 
    SET uploaded_documents = COALESCE(uploaded_documents, '{}'::jsonb) || 
        jsonb_build_object(file_type, jsonb_build_object(
          'path', file_path,
          'uploaded_at', now()
        ))
    WHERE id = (SELECT id FROM public.profiles WHERE auth_uid = user_id);
  ELSIF profile_type = 'organization' THEN
    UPDATE public.organization_profiles 
    SET uploaded_documents = COALESCE(uploaded_documents, '{}'::jsonb) || 
        jsonb_build_object(file_type, jsonb_build_object(
          'path', file_path,
          'uploaded_at', now()
        ))
    WHERE id = (SELECT id FROM public.profiles WHERE auth_uid = user_id);
  END IF;
  
  result := jsonb_build_object('success', true, 'path', file_path);
  RETURN result;
END;
$$;

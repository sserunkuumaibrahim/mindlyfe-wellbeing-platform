
-- Add document upload fields to therapist_profiles
ALTER TABLE public.therapist_profiles 
ADD COLUMN IF NOT EXISTS uploaded_documents JSONB DEFAULT '{}';

-- Add document upload fields to organization_profiles  
ALTER TABLE public.organization_profiles 
ADD COLUMN IF NOT EXISTS uploaded_documents JSONB DEFAULT '{}';

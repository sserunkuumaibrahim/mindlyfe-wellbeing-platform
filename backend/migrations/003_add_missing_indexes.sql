-- Add missing indexes
CREATE INDEX idx_therapist_profiles_specializations ON public.therapist_profiles USING GIN(specializations);
CREATE INDEX idx_therapist_profiles_languages_spoken ON public.therapist_profiles USING GIN(languages_spoken);

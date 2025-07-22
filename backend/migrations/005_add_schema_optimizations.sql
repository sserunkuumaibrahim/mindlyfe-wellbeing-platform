-- Add foreign key to invoices table
ALTER TABLE public.invoices
ADD CONSTRAINT fk_invoices_subscription
FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;

-- Add foreign key to password_history table
ALTER TABLE public.password_history
ADD CONSTRAINT fk_password_history_profile
FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add indexes for dashboard and search queries
CREATE INDEX idx_therapist_profiles_specializations ON public.therapist_profiles USING GIN(specializations);
CREATE INDEX idx_therapist_profiles_languages_spoken ON public.therapist_profiles USING GIN(languages_spoken);

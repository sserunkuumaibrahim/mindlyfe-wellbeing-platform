
-- Add comprehensive RLS policies for all tables, only if they don't already exist

-- Profiles table policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = auth_uid);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = auth_uid);
    END IF;
END $$;

-- Individual profiles policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'individual_profiles' AND policyname = 'Users can view own individual profile'
    ) THEN
        CREATE POLICY "Users can view own individual profile" ON public.individual_profiles
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE profiles.id = individual_profiles.id 
                    AND profiles.auth_uid = auth.uid()
                )
            );
    END IF;
END $$;

-- Therapist profiles policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'therapist_profiles' AND policyname = 'Users can view own therapist profile'
    ) THEN
        CREATE POLICY "Users can view own therapist profile" ON public.therapist_profiles
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE profiles.id = therapist_profiles.id 
                    AND profiles.auth_uid = auth.uid()
                )
            );
    END IF;
END $$;

-- Organization profiles policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'organization_profiles' AND policyname = 'Users can view own organization profile'
    ) THEN
        CREATE POLICY "Users can view own organization profile" ON public.organization_profiles
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE profiles.id = organization_profiles.id 
                    AND profiles.auth_uid = auth.uid()
                )
            );
    END IF;
END $$;

-- 2FA methods policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_2fa_methods' AND policyname = 'Users can manage own 2FA methods'
    ) THEN
        CREATE POLICY "Users can manage own 2FA methods" ON public.user_2fa_methods
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE profiles.id = user_2fa_methods.profile_id 
                    AND profiles.auth_uid = auth.uid()
                )
            );
    END IF;
END $$;

-- Verification codes policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'verification_codes' AND policyname = 'Users can access own verification codes'
    ) THEN
        CREATE POLICY "Users can access own verification codes" ON public.verification_codes
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE profiles.id = verification_codes.profile_id 
                    AND profiles.auth_uid = auth.uid()
                )
            );
    END IF;
END $$;

-- Therapy sessions policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'therapy_sessions' AND policyname = 'Users can view own sessions'
    ) THEN
        CREATE POLICY "Users can view own sessions" ON public.therapy_sessions
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE profiles.auth_uid = auth.uid() 
                    AND (profiles.id = therapy_sessions.client_id OR profiles.id = therapy_sessions.therapist_id)
                )
            );
    END IF;
END $$;

-- Audit logs policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'audit_logs' AND policyname = 'Users can view own audit logs'
    ) THEN
        CREATE POLICY "Users can view own audit logs" ON public.audit_logs
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE profiles.id = audit_logs.profile_id 
                    AND profiles.auth_uid = auth.uid()
                )
            );
    END IF;
END $$;

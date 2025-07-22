-- PostgreSQL Authentication Migration Script
-- This script creates the authentication system to replace Supabase Auth

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Users table (replaces auth.users from Supabase)
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email_confirmed BOOLEAN DEFAULT false,
    email_confirmed_at TIMESTAMPTZ,
    confirmation_token TEXT,
    confirmation_sent_at TIMESTAMPTZ,
    recovery_token TEXT,
    recovery_sent_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    raw_app_meta_data JSONB DEFAULT '{}',
    raw_user_meta_data JSONB DEFAULT '{}',
    is_super_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    phone TEXT,
    phone_confirmed BOOLEAN DEFAULT false,
    phone_confirmed_at TIMESTAMPTZ,
    banned_until TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Sessions table for JWT token management
CREATE TABLE auth.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    refresh_token_hash TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Refresh tokens table
CREATE TABLE auth.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    parent_token_hash TEXT,
    revoked BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE auth.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email verification tokens
CREATE TABLE auth.email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Login attempts for rate limiting
CREATE TABLE auth.login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    ip_address INET NOT NULL,
    success BOOLEAN NOT NULL,
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for auth tables
CREATE INDEX idx_auth_users_email ON auth.users(email);
CREATE INDEX idx_auth_users_confirmation_token ON auth.users(confirmation_token);
CREATE INDEX idx_auth_users_recovery_token ON auth.users(recovery_token);
CREATE INDEX idx_auth_sessions_user_id ON auth.sessions(user_id);
CREATE INDEX idx_auth_sessions_token_hash ON auth.sessions(token_hash);
CREATE INDEX idx_auth_sessions_expires_at ON auth.sessions(expires_at);
CREATE INDEX idx_auth_refresh_tokens_user_id ON auth.refresh_tokens(user_id);
CREATE INDEX idx_auth_refresh_tokens_token_hash ON auth.refresh_tokens(token_hash);
CREATE INDEX idx_auth_refresh_tokens_expires_at ON auth.refresh_tokens(expires_at);
CREATE INDEX idx_auth_password_reset_tokens_user_id ON auth.password_reset_tokens(user_id);
CREATE INDEX idx_auth_password_reset_tokens_token_hash ON auth.password_reset_tokens(token_hash);
CREATE INDEX idx_auth_email_verification_tokens_user_id ON auth.email_verification_tokens(user_id);
CREATE INDEX idx_auth_email_verification_tokens_token_hash ON auth.email_verification_tokens(token_hash);
CREATE INDEX idx_auth_login_attempts_email ON auth.login_attempts(email);
CREATE INDEX idx_auth_login_attempts_ip_address ON auth.login_attempts(ip_address);
CREATE INDEX idx_auth_login_attempts_attempted_at ON auth.login_attempts(attempted_at);

-- Apply updated_at triggers to auth tables
CREATE TRIGGER update_auth_users_updated_at BEFORE UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_auth_sessions_updated_at BEFORE UPDATE ON auth.sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Authentication functions

-- Function to create a new user
CREATE OR REPLACE FUNCTION auth.create_user(
    p_email TEXT,
    p_password TEXT,
    p_user_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
    confirmation_token TEXT;
BEGIN
    -- Generate confirmation token
    confirmation_token := encode(gen_random_bytes(32), 'hex');
    
    -- Insert user
    INSERT INTO auth.users (
        email,
        password_hash,
        confirmation_token,
        confirmation_sent_at,
        raw_user_meta_data
    ) VALUES (
        LOWER(p_email),
        crypt(p_password, gen_salt('bf', 12)),
        confirmation_token,
        NOW(),
        p_user_metadata
    ) RETURNING id INTO user_id;
    
    -- Create corresponding profile
    INSERT INTO public.profiles (user_id, email)
    VALUES (user_id, LOWER(p_email));
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate user
CREATE OR REPLACE FUNCTION auth.authenticate_user(
    p_email TEXT,
    p_password TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    email_confirmed BOOLEAN,
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    user_record RECORD;
    attempt_count INTEGER;
BEGIN
    -- Check rate limiting (max 5 failed attempts per hour)
    SELECT COUNT(*) INTO attempt_count
    FROM auth.login_attempts
    WHERE email = LOWER(p_email)
    AND ip_address = p_ip_address
    AND success = false
    AND attempted_at > NOW() - INTERVAL '1 hour';
    
    IF attempt_count >= 5 THEN
        -- Log failed attempt
        INSERT INTO auth.login_attempts (email, ip_address, success)
        VALUES (LOWER(p_email), p_ip_address, false);
        
        RETURN QUERY SELECT NULL::UUID, ''::TEXT, false::BOOLEAN, false::BOOLEAN, 'Too many failed attempts. Please try again later.'::TEXT;
        RETURN;
    END IF;
    
    -- Get user record
    SELECT u.id, u.email, u.password_hash, u.email_confirmed, u.deleted_at, u.banned_until
    INTO user_record
    FROM auth.users u
    WHERE u.email = LOWER(p_email);
    
    -- Check if user exists and password is correct
    IF user_record.id IS NULL OR user_record.password_hash != crypt(p_password, user_record.password_hash) THEN
        -- Log failed attempt
        INSERT INTO auth.login_attempts (email, ip_address, success)
        VALUES (LOWER(p_email), p_ip_address, false);
        
        RETURN QUERY SELECT NULL::UUID, ''::TEXT, false::BOOLEAN, false::BOOLEAN, 'Invalid email or password.'::TEXT;
        RETURN;
    END IF;
    
    -- Check if user is deleted
    IF user_record.deleted_at IS NOT NULL THEN
        RETURN QUERY SELECT NULL::UUID, ''::TEXT, false::BOOLEAN, false::BOOLEAN, 'Account has been deleted.'::TEXT;
        RETURN;
    END IF;
    
    -- Check if user is banned
    IF user_record.banned_until IS NOT NULL AND user_record.banned_until > NOW() THEN
        RETURN QUERY SELECT NULL::UUID, ''::TEXT, false::BOOLEAN, false::BOOLEAN, 'Account is temporarily banned.'::TEXT;
        RETURN;
    END IF;
    
    -- Log successful attempt
    INSERT INTO auth.login_attempts (email, ip_address, success)
    VALUES (LOWER(p_email), p_ip_address, true);
    
    -- Update last sign in
    UPDATE auth.users SET last_sign_in_at = NOW() WHERE id = user_record.id;
    
    RETURN QUERY SELECT 
        user_record.id,
        user_record.email,
        user_record.email_confirmed,
        true::BOOLEAN,
        'Authentication successful.'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to confirm email
CREATE OR REPLACE FUNCTION auth.confirm_email(
    p_token TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Find user by confirmation token
    SELECT id INTO user_id
    FROM auth.users
    WHERE confirmation_token = p_token
    AND email_confirmed = false
    AND confirmation_sent_at > NOW() - INTERVAL '24 hours';
    
    IF user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Confirm email
    UPDATE auth.users
    SET 
        email_confirmed = true,
        email_confirmed_at = NOW(),
        confirmation_token = NULL
    WHERE id = user_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to request password reset
CREATE OR REPLACE FUNCTION auth.request_password_reset(
    p_email TEXT
)
RETURNS TEXT AS $$
DECLARE
    user_id UUID;
    reset_token TEXT;
BEGIN
    -- Find user
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = LOWER(p_email)
    AND deleted_at IS NULL;
    
    IF user_id IS NULL THEN
        -- Return a token anyway to prevent email enumeration
        RETURN encode(gen_random_bytes(32), 'hex');
    END IF;
    
    -- Generate reset token
    reset_token := encode(gen_random_bytes(32), 'hex');
    
    -- Store reset token
    INSERT INTO auth.password_reset_tokens (user_id, token_hash, expires_at)
    VALUES (user_id, reset_token, NOW() + INTERVAL '1 hour');
    
    RETURN reset_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset password
CREATE OR REPLACE FUNCTION auth.reset_password(
    p_token TEXT,
    p_new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Find valid reset token
    SELECT prt.user_id INTO user_id
    FROM auth.password_reset_tokens prt
    WHERE prt.token_hash = p_token
    AND prt.used = false
    AND prt.expires_at > NOW();
    
    IF user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Update password
    UPDATE auth.users
    SET password_hash = crypt(p_new_password, gen_salt('bf', 12))
    WHERE id = user_id;
    
    -- Mark token as used
    UPDATE auth.password_reset_tokens
    SET used = true
    WHERE token_hash = p_token;
    
    -- Revoke all existing sessions
    DELETE FROM auth.sessions WHERE user_id = user_id;
    DELETE FROM auth.refresh_tokens WHERE user_id = user_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION auth.cleanup_expired_tokens()
RETURNS VOID AS $$
BEGIN
    -- Clean up expired sessions
    DELETE FROM auth.sessions WHERE expires_at < NOW();
    
    -- Clean up expired refresh tokens
    DELETE FROM auth.refresh_tokens WHERE expires_at < NOW();
    
    -- Clean up expired password reset tokens
    DELETE FROM auth.password_reset_tokens WHERE expires_at < NOW();
    
    -- Clean up expired email verification tokens
    DELETE FROM auth.email_verification_tokens WHERE expires_at < NOW();
    
    -- Clean up old login attempts (keep only last 7 days)
    DELETE FROM auth.login_attempts WHERE attempted_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up expired tokens (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-auth-tokens', '0 2 * * *', 'SELECT auth.cleanup_expired_tokens();');

COMMIT;

-- Create comprehensive test accounts for platform testing (with conflict handling)

-- First, clean up any existing test data to avoid conflicts
DELETE FROM public.messages WHERE sender_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org');
DELETE FROM public.notifications WHERE profile_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org');
DELETE FROM public.therapy_sessions WHERE client_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org') OR therapist_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org');
DELETE FROM public.therapist_availability WHERE therapist_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org');
DELETE FROM public.therapist_profiles WHERE id IN (SELECT id FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org');
DELETE FROM public.organization_profiles WHERE id IN (SELECT id FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org');
DELETE FROM public.profiles WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org';
DELETE FROM auth.users WHERE email LIKE '%@mindlyfe.org' OR email LIKE '%@techcorp.org';

-- Insert into auth.users first (super admin)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    confirmation_token,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'kawekwa@mindlyfe.org',
    crypt('K@wekwa2024!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"role": "admin", "first_name": "Douglas", "last_name": "Kawekwa"}',
    '',
    '',
    ''
);

-- Insert support team members
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    confirmation_token,
    email_change_token_new,
    recovery_token
) VALUES 
(
    '00000000-0000-0000-0000-000000000002',
    'support1@mindlyfe.org',
    crypt('Support123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"role": "admin", "first_name": "Sarah", "last_name": "Johnson"}',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000003',
    'support2@mindlyfe.org',
    crypt('Support456!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"role": "admin", "first_name": "Michael", "last_name": "Chen"}',
    '',
    '',
    ''
);

-- Insert demo organization admin
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    confirmation_token,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000004',
    'demo@techcorp.org',
    crypt('Demo123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"role": "org_admin", "first_name": "Emma", "last_name": "Wilson", "organization_name": "TechCorp Solutions", "registration_number": "TC001", "tax_id_number": "TX123456789", "representative_job_title": "HR Director", "representative_national_id": "NID001", "organization_type": "private_company", "num_employees": 250}',
    '',
    '',
    ''
);

-- Insert therapists
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    confirmation_token,
    email_change_token_new,
    recovery_token
) VALUES 
(
    '00000000-0000-0000-0000-000000000005',
    'dr.smith@mindlyfe.org',
    crypt('Therapist1!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"role": "therapist", "first_name": "Dr. Jennifer", "last_name": "Smith", "national_id_number": "NID002", "license_body": "Uganda Allied Health Board", "license_number": "LIC001", "insurance_provider": "Professional Indemnity Ltd", "insurance_policy_number": "PI001", "years_experience": 8, "specializations": "Anxiety,Depression,PTSD", "languages_spoken": "English,Luganda", "bio": "Experienced clinical psychologist specializing in trauma and anxiety disorders."}',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000006',
    'dr.brown@mindlyfe.org',
    crypt('Therapist2!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"role": "therapist", "first_name": "Dr. Robert", "last_name": "Brown", "national_id_number": "NID003", "license_body": "Uganda Allied Health Board", "license_number": "LIC002", "insurance_provider": "Professional Indemnity Ltd", "insurance_policy_number": "PI002", "years_experience": 12, "specializations": "Couples Therapy,Family Therapy,Relationship Issues", "languages_spoken": "English,Swahili", "bio": "Licensed marriage and family therapist with over a decade of experience."}',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000007',
    'dr.davis@mindlyfe.org',
    crypt('Therapist3!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"role": "therapist", "first_name": "Dr. Lisa", "last_name": "Davis", "national_id_number": "NID004", "license_body": "Uganda Allied Health Board", "license_number": "LIC003", "insurance_provider": "Professional Indemnity Ltd", "insurance_policy_number": "PI003", "years_experience": 6, "specializations": "Addiction,Substance Abuse,Recovery", "languages_spoken": "English,French", "bio": "Specialized addiction counselor helping clients overcome substance abuse and behavioral addictions."}',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000008',
    'dr.garcia@mindlyfe.org',
    crypt('Therapist4!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"role": "therapist", "first_name": "Dr. Maria", "last_name": "Garcia", "national_id_number": "NID005", "license_body": "Uganda Allied Health Board", "license_number": "LIC004", "insurance_provider": "Professional Indemnity Ltd", "insurance_policy_number": "PI004", "years_experience": 10, "specializations": "Child Psychology,Adolescent Therapy,Behavioral Issues", "languages_spoken": "English,Spanish,Luganda", "bio": "Child and adolescent psychologist specializing in developmental and behavioral challenges."}',
    '',
    '',
    ''
);

-- Create profiles for all users (profiles will be created by the trigger, but let's ensure they have the right data)
-- The handle_new_user trigger should create these automatically, but let's add some sample data

-- Wait for trigger to process, then create therapist availability
INSERT INTO public.therapist_availability (
    therapist_id,
    day_of_week,
    start_time,
    end_time,
    is_available,
    is_recurring,
    created_at,
    updated_at
) 
SELECT 
    p.id,
    days.day_num,
    '09:00:00'::time,
    '17:00:00'::time,
    true,
    true,
    now(),
    now()
FROM public.profiles p
CROSS JOIN (
    SELECT generate_series(1, 5) as day_num
) days
WHERE p.role = 'therapist' AND p.email LIKE 'dr.%@mindlyfe.org';

-- Create some sample therapy sessions for testing
INSERT INTO public.therapy_sessions (
    client_id,
    therapist_id,
    scheduled_at,
    duration_minutes,
    session_type,
    status,
    created_at,
    updated_at
) VALUES 
-- Upcoming sessions
(
    (SELECT id FROM public.profiles WHERE email = 'demo@techcorp.org'),
    (SELECT id FROM public.profiles WHERE email = 'dr.smith@mindlyfe.org'),
    now() + interval '2 days',
    60,
    'virtual',
    'scheduled',
    now(),
    now()
),
(
    (SELECT id FROM public.profiles WHERE email = 'demo@techcorp.org'),
    (SELECT id FROM public.profiles WHERE email = 'dr.brown@mindlyfe.org'),
    now() + interval '1 week',
    60,
    'virtual',
    'scheduled',
    now(),
    now()
),
-- Past completed sessions
(
    (SELECT id FROM public.profiles WHERE email = 'demo@techcorp.org'),
    (SELECT id FROM public.profiles WHERE email = 'dr.smith@mindlyfe.org'),
    now() - interval '1 week',
    60,
    'virtual',
    'completed',
    now(),
    now()
),
(
    (SELECT id FROM public.profiles WHERE email = 'demo@techcorp.org'),
    (SELECT id FROM public.profiles WHERE email = 'dr.davis@mindlyfe.org'),
    now() - interval '2 weeks',
    60,
    'virtual',
    'completed',
    now(),
    now()
);

-- Create sample notifications for testing
INSERT INTO public.notifications (
    profile_id,
    title,
    message,
    type,
    is_read,
    created_at
) VALUES 
(
    (SELECT id FROM public.profiles WHERE email = 'kawekwa@mindlyfe.org'),
    'Welcome to Mindlyfe',
    'Your super admin account has been created successfully.',
    'info',
    false,
    now()
),
(
    (SELECT id FROM public.profiles WHERE email = 'demo@techcorp.org'),
    'Organization Setup Complete',
    'Your organization profile has been set up. You can now invite team members.',
    'success',
    false,
    now()
),
(
    (SELECT id FROM public.profiles WHERE email = 'dr.smith@mindlyfe.org'),
    'Therapist Profile Approved',
    'Your therapist profile has been approved and is now active.',
    'success',
    false,
    now()
);

-- Create sample messages for testing
INSERT INTO public.messages (
    sender_id,
    recipient_id,
    conversation_id,
    content,
    message_type,
    is_read,
    created_at
) VALUES 
(
    (SELECT id FROM public.profiles WHERE email = 'demo@techcorp.org'),
    (SELECT id FROM public.profiles WHERE email = 'dr.smith@mindlyfe.org'),
    gen_random_uuid(),
    'Hello Dr. Smith, I wanted to confirm our upcoming session.',
    'text',
    false,
    now() - interval '1 hour'
),
(
    (SELECT id FROM public.profiles WHERE email = 'dr.smith@mindlyfe.org'),
    (SELECT id FROM public.profiles WHERE email = 'demo@techcorp.org'),
    gen_random_uuid(),
    'Hi Emma, yes our session is confirmed for Thursday at 2 PM. Looking forward to it!',
    'text',
    false,
    now() - interval '30 minutes'
);

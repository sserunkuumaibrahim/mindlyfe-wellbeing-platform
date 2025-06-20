
-- Add first_name and last_name columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Update existing records to split full_name into first_name and last_name
UPDATE public.profiles 
SET 
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE 
    WHEN POSITION(' ' IN full_name) > 0 
    THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL OR last_name IS NULL;

-- Make first_name required (not null) after updating existing data
ALTER TABLE public.profiles 
ALTER COLUMN first_name SET NOT NULL;

-- Update the handle_new_user function to use first_name and last_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value user_role;
    user_email TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
BEGIN
    -- Extract role from raw_user_meta_data, default to 'individual'
    user_role_value := COALESCE(NEW.raw_user_meta_data ->> 'role', 'individual')::user_role;
    user_email := COALESCE(NEW.email, NEW.raw_user_meta_data ->> 'email');
    user_first_name := COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'New');
    user_last_name := COALESCE(NEW.raw_user_meta_data ->> 'last_name', 'User');
    
    -- Insert into profiles table
    INSERT INTO public.profiles (
        auth_uid,
        role,
        first_name,
        last_name,
        full_name,
        email,
        phone_number,
        is_email_verified
    ) VALUES (
        NEW.id,
        user_role_value,
        user_first_name,
        user_last_name,
        CONCAT(user_first_name, ' ', user_last_name),
        user_email,
        NEW.phone,
        NEW.email_confirmed_at IS NOT NULL
    );
    
    -- Insert into role-specific table based on role
    IF user_role_value = 'individual' THEN
        INSERT INTO public.individual_profiles (id) VALUES (
            (SELECT id FROM public.profiles WHERE auth_uid = NEW.id)
        );
    ELSIF user_role_value = 'therapist' THEN
        INSERT INTO public.therapist_profiles (
            id,
            national_id_number,
            license_body,
            license_number,
            license_expiry_date,
            insurance_provider,
            insurance_policy_number,
            insurance_expiry_date,
            years_experience,
            specializations,
            languages_spoken
        ) VALUES (
            (SELECT id FROM public.profiles WHERE auth_uid = NEW.id),
            COALESCE(NEW.raw_user_meta_data ->> 'national_id_number', ''),
            COALESCE(NEW.raw_user_meta_data ->> 'license_body', ''),
            COALESCE(NEW.raw_user_meta_data ->> 'license_number', ''),
            COALESCE((NEW.raw_user_meta_data ->> 'license_expiry_date')::date, CURRENT_DATE + INTERVAL '1 year'),
            COALESCE(NEW.raw_user_meta_data ->> 'insurance_provider', ''),
            COALESCE(NEW.raw_user_meta_data ->> 'insurance_policy_number', ''),
            COALESCE((NEW.raw_user_meta_data ->> 'insurance_expiry_date')::date, CURRENT_DATE + INTERVAL '1 year'),
            COALESCE((NEW.raw_user_meta_data ->> 'years_experience')::integer, 0),
            COALESCE(string_to_array(NEW.raw_user_meta_data ->> 'specializations', ','), ARRAY['General']),
            COALESCE(string_to_array(NEW.raw_user_meta_data ->> 'languages_spoken', ','), ARRAY['English'])
        );
    ELSIF user_role_value = 'org_admin' THEN
        INSERT INTO public.organization_profiles (
            id,
            organization_name,
            organization_type,
            registration_number,
            date_of_establishment,
            tax_id_number,
            num_employees,
            representative_name,
            representative_job_title,
            representative_national_id
        ) VALUES (
            (SELECT id FROM public.profiles WHERE auth_uid = NEW.id),
            COALESCE(NEW.raw_user_meta_data ->> 'organization_name', ''),
            COALESCE((NEW.raw_user_meta_data ->> 'organization_type')::organization_type, 'private_company'),
            COALESCE(NEW.raw_user_meta_data ->> 'registration_number', ''),
            COALESCE((NEW.raw_user_meta_data ->> 'date_of_establishment')::date, CURRENT_DATE),
            COALESCE(NEW.raw_user_meta_data ->> 'tax_id_number', ''),
            COALESCE((NEW.raw_user_meta_data ->> 'num_employees')::integer, 1),
            CONCAT(user_first_name, ' ', user_last_name),
            COALESCE(NEW.raw_user_meta_data ->> 'representative_job_title', ''),
            COALESCE(NEW.raw_user_meta_data ->> 'representative_national_id', '')
        );
    END IF;
    
    -- Log the user creation
    INSERT INTO public.audit_logs (
        profile_id,
        action,
        resource_type,
        resource_id,
        details
    ) VALUES (
        (SELECT id FROM public.profiles WHERE auth_uid = NEW.id),
        'USER_CREATED',
        'profile',
        (SELECT id FROM public.profiles WHERE auth_uid = NEW.id),
        jsonb_build_object('role', user_role_value, 'email', user_email)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

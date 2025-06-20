
-- Update the gender enum to only include 'male' and 'female'
-- First, update any existing records that use 'other' or 'prefer_not_to_say' to NULL
UPDATE public.profiles 
SET gender = NULL 
WHERE gender NOT IN ('male', 'female');

UPDATE public.individual_profiles 
SET preferred_therapist_gender = NULL 
WHERE preferred_therapist_gender NOT IN ('male', 'female');

-- Create a new enum with only male and female
CREATE TYPE gender_type_new AS ENUM ('male', 'female');

-- Update the profiles table to use the new enum
ALTER TABLE public.profiles 
ALTER COLUMN gender TYPE gender_type_new USING 
  CASE 
    WHEN gender::text IN ('male', 'female') THEN gender::text::gender_type_new
    ELSE NULL
  END;

-- Update individual_profiles table to use the new enum
ALTER TABLE public.individual_profiles 
ALTER COLUMN preferred_therapist_gender TYPE gender_type_new USING 
  CASE 
    WHEN preferred_therapist_gender::text IN ('male', 'female') THEN preferred_therapist_gender::text::gender_type_new
    ELSE NULL
  END;

-- Drop the old enum and rename the new one
DROP TYPE gender_type;
ALTER TYPE gender_type_new RENAME TO gender_type;

-- Update the trigger function to only handle male and female
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value user_role;
    user_email TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
    profile_id UUID;
BEGIN
    -- Extract role from raw_user_meta_data, default to 'individual'
    user_role_value := COALESCE(NEW.raw_user_meta_data ->> 'role', 'individual')::user_role;
    user_email := COALESCE(NEW.email, NEW.raw_user_meta_data ->> 'email');
    user_first_name := COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'User');
    user_last_name := COALESCE(NEW.raw_user_meta_data ->> 'last_name', '');
    
    -- Insert into profiles table
    INSERT INTO public.profiles (
        auth_uid,
        role,
        first_name,
        last_name,
        full_name,
        email,
        phone_number,
        is_email_verified,
        gender
    ) VALUES (
        NEW.id,
        user_role_value,
        user_first_name,
        user_last_name,
        CONCAT(user_first_name, ' ', user_last_name),
        user_email,
        NEW.phone,
        NEW.email_confirmed_at IS NOT NULL,
        CASE 
            WHEN NEW.raw_user_meta_data ->> 'gender' IN ('male', 'female') 
            THEN (NEW.raw_user_meta_data ->> 'gender')::gender_type
            ELSE NULL
        END
    ) RETURNING id INTO profile_id;
    
    -- Insert into role-specific table based on role
    IF user_role_value = 'individual' THEN
        INSERT INTO public.individual_profiles (id) VALUES (profile_id);
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
            profile_id,
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
            profile_id,
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
        profile_id,
        'USER_CREATED',
        'profile',
        profile_id,
        jsonb_build_object('role', user_role_value, 'email', user_email)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

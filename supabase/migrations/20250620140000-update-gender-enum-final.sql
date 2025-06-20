-- Final migration to ensure gender_type enum only contains 'male' and 'female'
-- This migration will clean up any inconsistencies and ensure all tables use the correct enum

-- First, update any existing records that might have invalid gender values
UPDATE public.profiles 
SET gender = NULL 
WHERE gender IS NOT NULL AND gender::text NOT IN ('male', 'female');

UPDATE public.individual_profiles 
SET preferred_therapist_gender = NULL 
WHERE preferred_therapist_gender IS NOT NULL AND preferred_therapist_gender::text NOT IN ('male', 'female');

-- Drop and recreate the gender_type enum to ensure it only has 'male' and 'female'
DO $$ 
BEGIN
    -- Create a temporary enum with only male and female
    CREATE TYPE gender_type_final AS ENUM ('male', 'female');
    
    -- Update all tables that use gender_type
    ALTER TABLE public.profiles 
    ALTER COLUMN gender TYPE gender_type_final USING 
      CASE 
        WHEN gender::text = 'male' THEN 'male'::gender_type_final
        WHEN gender::text = 'female' THEN 'female'::gender_type_final
        ELSE NULL
      END;
    
    ALTER TABLE public.individual_profiles 
    ALTER COLUMN preferred_therapist_gender TYPE gender_type_final USING 
      CASE 
        WHEN preferred_therapist_gender::text = 'male' THEN 'male'::gender_type_final
        WHEN preferred_therapist_gender::text = 'female' THEN 'female'::gender_type_final
        ELSE NULL
      END;
    
    -- Drop the old enum and rename the new one
    DROP TYPE IF EXISTS gender_type CASCADE;
    ALTER TYPE gender_type_final RENAME TO gender_type;
    
EXCEPTION
    WHEN OTHERS THEN
        -- If there's an error, try to handle it gracefully
        RAISE NOTICE 'Error updating gender_type enum: %', SQLERRM;
END $$;

-- Ensure the enum is properly defined in the database
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('male', 'female');
    END IF;
END $$;

-- Add comments to document the change
COMMENT ON TYPE gender_type IS 'Gender type enum - only supports male and female values';
COMMENT ON COLUMN public.profiles.gender IS 'User gender - only male or female allowed';
COMMENT ON COLUMN public.individual_profiles.preferred_therapist_gender IS 'Preferred therapist gender - only male or female allowed';

-- Verify the changes
DO $$
DECLARE
    enum_values text[];
BEGIN
    SELECT array_agg(enumlabel ORDER BY enumsortorder) 
    INTO enum_values
    FROM pg_enum 
    WHERE enumtypid = 'gender_type'::regtype;
    
    IF array_length(enum_values, 1) = 2 AND 'male' = ANY(enum_values) AND 'female' = ANY(enum_values) THEN
        RAISE NOTICE 'Gender enum successfully updated to only include male and female';
    ELSE
        RAISE WARNING 'Gender enum update may not have completed correctly. Current values: %', enum_values;
    END IF;
END $$;
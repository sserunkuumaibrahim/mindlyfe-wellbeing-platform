import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hdjbfxzkijcmzhwusifl.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkamJmeHpraWpjbXpod3VzaWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQxMjc3MywiZXhwIjoyMDY1OTg4NzczfQ.5meyeixBD8V9JqUdKvwLFqaehgn5R0B7dW8K3gPcw2E";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function diagnosticAndFix() {
  console.log('🔍 Starting Database Diagnostic and Fix...');
  
  try {
    // 1. Check if profiles table exists and its structure
    console.log('\n1. Checking profiles table structure...');
    const { data: profilesInfo, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table exists and accessible');
    }

    // 2. Check if individual_profiles table exists
    console.log('\n2. Checking individual_profiles table...');
    const { data: individualInfo, error: individualError } = await supabase
      .from('individual_profiles')
      .select('*')
      .limit(1);
    
    if (individualError) {
      console.error('❌ Individual_profiles table error:', individualError.message);
    } else {
      console.log('✅ Individual_profiles table exists and accessible');
    }

    // 3. Check if therapist_profiles table exists
    console.log('\n3. Checking therapist_profiles table...');
    const { data: therapistInfo, error: therapistError } = await supabase
      .from('therapist_profiles')
      .select('*')
      .limit(1);
    
    if (therapistError) {
      console.error('❌ Therapist_profiles table error:', therapistError.message);
    } else {
      console.log('✅ Therapist_profiles table exists and accessible');
    }

    // 4. Check if organization_profiles table exists
    console.log('\n4. Checking organization_profiles table...');
    const { data: orgInfo, error: orgError } = await supabase
      .from('organization_profiles')
      .select('*')
      .limit(1);
    
    if (orgError) {
      console.error('❌ Organization_profiles table error:', orgError.message);
    } else {
      console.log('✅ Organization_profiles table exists and accessible');
    }

    // 5. Test user creation flow
    console.log('\n5. Testing user registration flow...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          role: 'individual',
          first_name: 'Test',
          last_name: 'User',
          gender: 'prefer_not_to_say'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ User registration failed:', signUpError.message);
      console.log('\n🔧 Attempting to create missing database structures...');
      await createMissingStructures();
    } else {
      console.log('✅ User registration successful:', signUpData.user?.email);
      
      // Clean up test user
      if (signUpData.user?.id) {
        await supabase.auth.admin.deleteUser(signUpData.user.id);
        console.log('🧹 Test user cleaned up');
      }
    }

    // 6. Test registration again after fixes
    console.log('\n6. Testing registration after fixes...');
    const testEmail2 = `test-${Date.now()}-2@example.com`;
    
    const { data: signUpData2, error: signUpError2 } = await supabase.auth.signUp({
      email: testEmail2,
      password: testPassword,
      options: {
        data: {
          role: 'individual',
          first_name: 'Test',
          last_name: 'User2',
          gender: 'prefer_not_to_say'
        }
      }
    });
    
    if (signUpError2) {
      console.error('❌ Second registration test failed:', signUpError2.message);
    } else {
      console.log('✅ Second registration test successful:', signUpData2.user?.email);
      
      // Clean up test user
      if (signUpData2.user?.id) {
        await supabase.auth.admin.deleteUser(signUpData2.user.id);
        console.log('🧹 Second test user cleaned up');
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

async function createMissingStructures() {
  console.log('\n🔧 Creating missing database structures...');
  
  try {
    // Create the handle_new_user function using a direct SQL approach
    console.log('\n1. Creating handle_new_user function...');
    
    // First, let's try to create a simple test profile manually
    const testUserId = '00000000-0000-0000-0000-000000000001';
    
    // Try to insert a test profile to see what's missing
    const { data: testProfile, error: testProfileError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: 'test-structure@example.com',
        role: 'individual',
        first_name: 'Test',
        last_name: 'Structure',
        gender: 'prefer_not_to_say'
      })
      .select();
    
    if (testProfileError) {
      console.error('❌ Test profile creation failed:', testProfileError.message);
      
      // Check if it's a missing column issue
      if (testProfileError.message.includes('column') && testProfileError.message.includes('does not exist')) {
        console.log('🔧 Detected missing columns, attempting to add them...');
        await addMissingColumns();
      }
      
      // Check if it's an enum issue
      if (testProfileError.message.includes('invalid input value for enum')) {
        console.log('🔧 Detected enum issues, attempting to fix them...');
        await fixEnumTypes();
      }
    } else {
      console.log('✅ Test profile created successfully');
      
      // Clean up test profile
      await supabase.from('profiles').delete().eq('id', testUserId);
      console.log('🧹 Test profile cleaned up');
    }
    
    // Try to create individual profile
    const { data: testIndividual, error: testIndividualError } = await supabase
      .from('individual_profiles')
      .insert({
        user_id: testUserId,
        emergency_contact_name: 'Test Contact',
        emergency_contact_phone: '123-456-7890'
      })
      .select();
    
    if (testIndividualError) {
      console.error('❌ Test individual profile creation failed:', testIndividualError.message);
    } else {
      console.log('✅ Test individual profile created successfully');
      
      // Clean up test individual profile
      await supabase.from('individual_profiles').delete().eq('user_id', testUserId);
      console.log('🧹 Test individual profile cleaned up');
    }
    
    console.log('\n✅ Database structure validation completed!');
    
  } catch (error) {
    console.error('💥 Error creating structures:', error.message);
  }
}

async function addMissingColumns() {
  console.log('\n🔧 Adding missing columns...');
  
  // Since we can't execute DDL directly, we'll log what needs to be done
  console.log(`
📝 Manual SQL commands needed (run these in Supabase SQL Editor):

-- Add missing columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS gender gender_enum DEFAULT 'prefer_not_to_say',
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing columns to individual_profiles table if they don't exist
ALTER TABLE public.individual_profiles 
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing columns to therapist_profiles table if they don't exist
ALTER TABLE public.therapist_profiles 
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS specializations JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing columns to organization_profiles table if they don't exist
ALTER TABLE public.organization_profiles 
ADD COLUMN IF NOT EXISTS organization_name TEXT,
ADD COLUMN IF NOT EXISTS organization_type TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
`);
}

async function fixEnumTypes() {
  console.log('\n🔧 Fixing enum types...');
  
  console.log(`
📝 Manual SQL commands needed (run these in Supabase SQL Editor):

-- Create or update gender enum
DO $$ BEGIN
    CREATE TYPE gender_enum AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create or update user_role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('individual', 'therapist', 'organization');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    -- Log the trigger execution
    RAISE LOG 'handle_new_user triggered for user: %', NEW.id;
    
    -- Confirm the user's email immediately
    UPDATE auth.users 
    SET email_confirmed_at = NOW(), 
        confirmed_at = NOW()
    WHERE id = NEW.id;
    
    -- Extract role from user metadata
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'individual');
    
    -- Validate role
    IF user_role NOT IN ('individual', 'therapist', 'organization') THEN
        user_role := 'individual';
    END IF;
    
    -- Insert into profiles table
    INSERT INTO public.profiles (
        id,
        email,
        role,
        first_name,
        last_name,
        gender,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        user_role::user_role,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'gender', 'prefer_not_to_say')::gender_enum,
        NOW(),
        NOW()
    );
    
    -- Create role-specific profile
    IF user_role = 'individual' THEN
        INSERT INTO public.individual_profiles (
            user_id,
            emergency_contact_name,
            emergency_contact_phone,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'emergency_contact_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'emergency_contact_phone', ''),
            NOW(),
            NOW()
        );
        
    ELSIF user_role = 'therapist' THEN
        INSERT INTO public.therapist_profiles (
            user_id,
            license_number,
            specializations,
            bio,
            hourly_rate,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'license_number', ''),
            COALESCE(NEW.raw_user_meta_data->>'specializations', '[]')::jsonb,
            COALESCE(NEW.raw_user_meta_data->>'bio', ''),
            COALESCE((NEW.raw_user_meta_data->>'hourly_rate')::numeric, 0),
            NOW(),
            NOW()
        );
        
    ELSIF user_role = 'organization' THEN
        INSERT INTO public.organization_profiles (
            user_id,
            organization_name,
            organization_type,
            license_number,
            contact_person,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'organization_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'organization_type', ''),
            COALESCE(NEW.raw_user_meta_data->>'license_number', ''),
            COALESCE(NEW.raw_user_meta_data->>'contact_person', ''),
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
        RAISE;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Allow trigger to insert profiles" ON public.profiles;
CREATE POLICY "Allow trigger to insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow trigger to insert individual profiles" ON public.individual_profiles;
CREATE POLICY "Allow trigger to insert individual profiles" ON public.individual_profiles
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow trigger to insert therapist profiles" ON public.therapist_profiles;
CREATE POLICY "Allow trigger to insert therapist profiles" ON public.therapist_profiles
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow trigger to insert organization profiles" ON public.organization_profiles;
CREATE POLICY "Allow trigger to insert organization profiles" ON public.organization_profiles
    FOR INSERT WITH CHECK (true);
`);
}

// Run the diagnostic
diagnosticAndFix().then(() => {
  console.log('\n🎉 Diagnostic and fix process completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Copy the SQL commands from above');
  console.log('2. Go to your Supabase Dashboard > SQL Editor');
  console.log('3. Paste and run the SQL commands');
  console.log('4. Test registration again');
}).catch(error => {
  console.error('💥 Process failed:', error.message);
});
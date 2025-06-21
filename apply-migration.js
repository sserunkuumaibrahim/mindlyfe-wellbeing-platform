import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hdjbfxzkijcmzhwusifl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkamJmeHpraWpjbXpod3VzaWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTI3NzMsImV4cCI6MjA2NTk4ODc3M30.8HWfSp19BamGIyzATn3FOmtaY7pqyLbm22inUWgV7wE";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testUserRegistration() {
  try {
    console.log('🧪 Testing user registration to identify the issue...');
    
    // Test 1: Check if user_role enum exists
    console.log('🔍 Checking if user_role enum exists...');
    try {
      const { data: enumData, error: enumError } = await supabase
        .from('pg_type')
        .select('typname')
        .eq('typname', 'user_role');
      
      if (enumError) {
        console.log('❌ Cannot check enum directly:', enumError.message);
      } else {
        console.log('✅ Enum check result:', enumData);
      }
    } catch (err) {
      console.log('❌ Enum check failed:', err.message);
    }
    
    // Test 2: Try to create a test user
    console.log('\n🧪 Testing user registration...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          role: 'individual'
        }
      }
    });
    
    if (signUpError) {
      console.log('❌ Registration failed:', signUpError.message);
      console.log('Error details:', signUpError);
    } else {
      console.log('✅ Registration successful:', signUpData.user?.email);
      
      // Clean up - delete the test user if created
      if (signUpData.user) {
        try {
          await supabase.auth.admin.deleteUser(signUpData.user.id);
          console.log('🧹 Test user cleaned up');
        } catch (cleanupErr) {
          console.log('⚠️ Could not clean up test user:', cleanupErr.message);
        }
      }
    }
    
    // Test 3: Check profiles table structure
    console.log('\n🔍 Checking profiles table structure...');
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profilesError) {
        console.log('❌ Cannot access profiles table:', profilesError.message);
      } else {
        console.log('✅ Profiles table accessible, sample data structure:', Object.keys(profilesData[0] || {}));
      }
    } catch (err) {
      console.log('❌ Profiles table check failed:', err.message);
    }
    
  } catch (err) {
    console.error('💥 Test failed:', err);
  }
}

testUserRegistration();
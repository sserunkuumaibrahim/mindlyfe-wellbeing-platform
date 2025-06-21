import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hdjbfxzkijcmzhwusifl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkamJmeHpraWpjbXpod3VzaWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTI3NzMsImV4cCI6MjA2NTk4ODc3M30.8HWfSp19BamGIyzATn3FOmtaY7pqyLbm22inUWgV7wE";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function applyEmailFix() {
  try {
    console.log('🔧 Applying email confirmation fix...');
    
    // Since we can't execute raw SQL with the anon key, let's try a different approach
    // Check if we can access auth.config table
    console.log('\n🔍 Checking current auth configuration...');
    
    try {
      const { data: authConfig, error: configError } = await supabase
        .from('auth.config')
        .select('*');
      
      if (configError) {
        console.log('❌ Cannot access auth.config directly:', configError.message);
        console.log('ℹ️  This is expected with anon key - auth.config requires service role key');
      } else {
        console.log('✅ Auth config accessible:', authConfig);
      }
    } catch (err) {
      console.log('❌ Auth config check failed:', err.message);
    }
    
    // Test current registration behavior
    console.log('\n🧪 Testing current registration behavior...');
    await testRegistrationWithEmailConfirmation(false);
    
    console.log('\n🧪 Testing registration without email confirmation...');
    await testRegistrationWithEmailConfirmation(true);
    
  } catch (err) {
    console.error('❌ Email fix failed:', err.message);
  }
}

async function testRegistrationWithEmailConfirmation(skipConfirmation) {
  try {
    const testEmail = `test-${Date.now()}-${skipConfirmation ? 'skip' : 'confirm'}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`\n📧 Testing with email confirmation ${skipConfirmation ? 'DISABLED' : 'ENABLED'}`);
    console.log(`📧 Test email: ${testEmail}`);
    
    const signUpOptions = {
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          role: 'individual',
          phone_number: '1234567890',
          country: 'Test Country'
        }
      }
    };
    
    if (skipConfirmation) {
      signUpOptions.options.emailConfirmation = false;
    }
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(signUpOptions);
    
    if (signUpError) {
      console.log(`❌ Registration failed: ${signUpError.message}`);
      console.log(`❌ Error code: ${signUpError.status}`);
      
      if (signUpError.message.includes('Error sending confirmation email')) {
        console.log('🔍 This confirms the email service is still broken');
        console.log('💡 We need to disable email confirmation at the Supabase project level');
      }
    } else {
      console.log(`✅ Registration successful!`);
      console.log(`✅ User ID: ${signUpData.user?.id}`);
      console.log(`✅ Email: ${signUpData.user?.email}`);
      console.log(`✅ Email confirmed: ${signUpData.user?.email_confirmed_at ? 'Yes' : 'No'}`);
      
      // Check if profile was created
      if (signUpData.user?.id) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signUpData.user.id)
            .single();
          
          if (profileError) {
            console.log(`❌ Profile not found: ${profileError.message}`);
          } else {
            console.log(`✅ Profile created successfully:`, profile);
          }
        } catch (profileErr) {
          console.log(`❌ Profile check failed: ${profileErr.message}`);
        }
      }
    }
    
  } catch (err) {
    console.error(`❌ Registration test error: ${err.message}`);
  }
}

// Run the email fix
applyEmailFix();
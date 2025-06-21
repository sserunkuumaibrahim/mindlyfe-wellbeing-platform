import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hdjbfxzkijcmzhwusifl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkamJmeHpraWpjbXpod3VzaWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTI3NzMsImV4cCI6MjA2NTk4ODc3M30.8HWfSp19BamGIyzATn3FOmtaY7pqyLbm22inUWgV7wE";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function debugProfileCreation() {
  console.log('🔍 Debugging profile creation issues...');
  
  try {
    // Check if trigger exists
    console.log('\n📋 Checking if handle_new_user trigger exists...');
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('*')
      .eq('trigger_name', 'on_auth_user_created');
    
    if (triggerError) {
      console.log('❌ Error checking triggers:', triggerError.message);
    } else {
      console.log('✅ Trigger check result:', triggers);
    }
    
    // Check existing profiles
    console.log('\n📊 Checking existing profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('auth_uid, email, first_name, last_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
    } else {
      console.log('✅ Recent profiles:', profiles);
    }
    
    // Check auth users without profiles
    console.log('\n🔍 Checking for auth users without profiles...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error fetching auth users:', authError.message);
    } else {
      console.log('✅ Total auth users:', authUsers.users.length);
      
      // Check which users don't have profiles
      for (const user of authUsers.users.slice(-5)) { // Check last 5 users
        const { data: userProfile, error: userProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_uid', user.id)
          .single();
        
        if (userProfileError && userProfileError.code === 'PGRST116') {
          console.log(`❌ User ${user.email} (${user.id}) has NO profile`);
          console.log(`   Created: ${user.created_at}`);
          console.log(`   Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
          console.log(`   Metadata:`, user.user_metadata);
        } else if (userProfileError) {
          console.log(`❌ Error checking profile for ${user.email}:`, userProfileError.message);
        } else {
          console.log(`✅ User ${user.email} has profile`);
        }
      }
    }
    
    // Test creating a profile manually
    console.log('\n🧪 Testing manual profile creation...');
    const testEmail = `manual-test-${Date.now()}@example.com`;
    
    // First create auth user
    const { data: newUser, error: createError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          first_name: 'Manual',
          last_name: 'Test',
          role: 'individual'
        }
      }
    });
    
    if (createError) {
      console.log('❌ Error creating test user:', createError.message);
    } else {
      console.log('✅ Test user created:', newUser.user?.email);
      
      // Wait a moment for trigger to fire
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if profile was created
      const { data: testProfile, error: testProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_uid', newUser.user?.id)
        .single();
      
      if (testProfileError) {
        console.log('❌ Profile NOT created automatically:', testProfileError.message);
        
        // Try creating profile manually
        console.log('🔧 Attempting manual profile creation...');
        const { data: manualProfile, error: manualError } = await supabase
          .from('profiles')
          .insert({
            auth_uid: newUser.user?.id,
            email: testEmail,
            first_name: 'Manual',
            last_name: 'Test',
            role: 'individual',
            is_email_verified: true
          })
          .select()
          .single();
        
        if (manualError) {
          console.log('❌ Manual profile creation failed:', manualError.message);
        } else {
          console.log('✅ Manual profile created successfully:', manualProfile);
        }
      } else {
        console.log('✅ Profile created automatically:', testProfile);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

debugProfileCreation();
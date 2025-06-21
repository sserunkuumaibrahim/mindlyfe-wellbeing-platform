import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hdjbfxzkijcmzhwusifl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkamJmeHpraWpjbXpod3VzaWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTI3NzMsImV4cCI6MjA2NTk4ODc3M30.8HWfSp19BamGIyzATn3FOmtaY7pqyLbm22inUWgV7wE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCompleteFlow() {
  console.log('🔍 Testing complete registration and profile creation flow...');
  
  try {
    // 1. Check if trigger exists
    console.log('\n📋 Checking trigger existence...');
    const { data: triggers, error: triggerError } = await supabase
      .from('pg_trigger')
      .select('tgname')
      .eq('tgname', 'on_auth_user_created');
    
    if (triggerError) {
      console.log('⚠️  Cannot check triggers directly:', triggerError.message);
    } else {
      console.log('✅ Trigger check:', triggers?.length > 0 ? 'EXISTS' : 'MISSING');
    }
    
    // 2. Check RLS policies on profiles table
    console.log('\n🔒 Checking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd')
      .eq('tablename', 'profiles');
    
    if (policyError) {
      console.log('⚠️  Cannot check policies directly:', policyError.message);
    } else {
      console.log('✅ Found', policies?.length || 0, 'policies on profiles table:');
      policies?.forEach(p => console.log(`  - ${p.policyname} (${p.cmd})`));
    }
    
    // 3. Test user creation with role metadata
    console.log('\n🧪 Testing user registration...');
    const testEmail = `test-flow-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          role: 'individual',
          first_name: 'Test',
          last_name: 'User'
        }
      }
    });
    
    if (authError) {
      console.log('❌ Auth registration failed:', authError.message);
      return;
    }
    
    console.log('✅ User created successfully:', authData.user?.id);
    console.log('📧 Email:', authData.user?.email);
    console.log('🔑 User metadata:', authData.user?.user_metadata);
    
    // 4. Wait for trigger to execute
    console.log('\n⏳ Waiting for trigger to execute...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 5. Check if profile was created
    console.log('\n🔍 Checking if profile was created...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_uid', authData.user.id);
    
    if (profileError) {
      console.log('❌ Error fetching profile:', profileError.message);
    } else if (!profile || profile.length === 0) {
      console.log('❌ Profile NOT created automatically');
      
      // Try manual creation to test INSERT policy
      console.log('\n🔧 Testing manual profile creation...');
      const { data: manualProfile, error: manualError } = await supabase
        .from('profiles')
        .insert({
          auth_uid: authData.user.id,
          email: testEmail,
          role: 'individual',
          first_name: 'Test',
          last_name: 'User'
        })
        .select()
        .single();
      
      if (manualError) {
        console.log('❌ Manual profile creation failed:', manualError.message);
      } else {
        console.log('✅ Manual profile creation successful:', manualProfile.id);
      }
    } else {
      console.log('✅ Profile created automatically!');
      console.log('📋 Profile details:', profile[0]);
      
      // Check for role-specific profile
      console.log('\n🔍 Checking for individual profile...');
      const { data: individualProfile, error: individualError } = await supabase
        .from('individual_profiles')
        .select('*')
        .eq('id', profile[0].id);
      
      if (individualError) {
        console.log('❌ Error fetching individual profile:', individualError.message);
      } else if (!individualProfile || individualProfile.length === 0) {
        console.log('❌ Individual profile NOT created');
      } else {
        console.log('✅ Individual profile created:', individualProfile[0].id);
      }
    }
    
    // 6. Test profile update
    if (profile && profile.length > 0) {
      console.log('\n🔧 Testing profile update...');
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ first_name: 'Updated' })
        .eq('id', profile[0].id)
        .select();
      
      if (updateError) {
        console.log('❌ Profile update failed:', updateError.message);
      } else {
        console.log('✅ Profile update successful');
      }
    }
    
    // 7. Cleanup
    console.log('\n🧹 Cleaning up test user...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
    
    if (deleteError) {
      console.log('⚠️  Cleanup warning:', deleteError.message);
    } else {
      console.log('✅ Test user cleaned up successfully');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the test
testCompleteFlow().then(() => {
  console.log('\n🏁 Test completed');
}).catch(error => {
  console.error('💥 Test failed:', error);
});
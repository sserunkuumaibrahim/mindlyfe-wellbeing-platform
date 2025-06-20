// Simple test to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hdjbfxzkijcmzhwusifl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkamJmeHpraWpjbXpod3VzaWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTI3NzMsImV4cCI6MjA2NTk4ODc3M30.8HWfSp19BamGIyzATn3FOmtaY7pqyLbm22inUWgV7wE";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Connection test failed:', error);
    } else {
      console.log('✅ Supabase connection successful');
    }
    
    // Test auth endpoint
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Auth test failed:', authError);
    } else {
      console.log('✅ Auth endpoint accessible');
    }
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testConnection();
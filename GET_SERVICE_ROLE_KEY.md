# How to Get Supabase Service Role Key

To run the test account creation script, you need to get the service role key from your Supabase dashboard.

## Steps:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Login to your account
   - Select your project: `hdjbfxzkijcmzhwusifl`

2. **Navigate to API Settings**
   - Go to Settings → API
   - Or visit: https://supabase.com/dashboard/project/hdjbfxzkijcmzhwusifl/settings/api

3. **Find Service Role Key**
   - Look for "service_role" key in the "Project API keys" section
   - It should start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Copy the entire key

4. **Update Configuration**
   - Open `test-accounts-config.js`
   - Replace `YOUR_SERVICE_ROLE_KEY_HERE` with the actual service role key
   - The key should look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkamJmeHpraWpjbXpod3VzaWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQxMjc3MywiZXhwIjoyMDY1OTg4NzczfQ.ACTUAL_SIGNATURE_HERE`
   
   **⚠️ CRITICAL**: The script will fail with 401 errors if you don't replace the placeholder with the real service role key!

5. **Run the Script**
   ```bash
   node create-test-accounts.js
   ```

## Security Note

⚠️ **IMPORTANT**: The service role key has full access to your database and bypasses Row Level Security (RLS). Never expose it in client-side code or commit it to version control.

## Alternative: Use Environment Variable

For better security, you can set the service role key as an environment variable:

```bash
export SUPABASE_SERVICE_ROLE_KEY="your_actual_service_role_key_here"
node create-test-accounts.js
```

Then update the script to read from environment variables.
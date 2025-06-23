# Registration Error Analysis - "Database error saving new user"

## 🚨 Critical Issue Identified

**Error**: `Database error saving new user`
**Location**: User registration flow
**Impact**: Complete registration failure for all user types

## 🔍 Root Cause Analysis

The error "Database error saving new user" typically indicates one of these issues:

### 1. Missing Database Tables/Columns
- The `handle_new_user()` trigger function is trying to insert into tables that don't exist
- Required columns are missing from existing tables
- Database schema is out of sync with the application code

### 2. Database Constraint Violations
- NOT NULL constraints on required fields
- UNIQUE constraint violations (duplicate emails, license numbers)
- FOREIGN KEY constraint violations
- CHECK constraint violations (invalid enum values)

### 3. Permission Issues
- Row Level Security (RLS) policies blocking inserts
- Missing grants for the trigger function
- Authentication context issues in triggers

### 4. Trigger Function Errors
- The `handle_new_user()` function is failing internally
- Invalid SQL in the trigger function
- Missing dependencies or functions

## 🛠️ Immediate Diagnostic Steps

### Step 1: Check Database Schema
```sql
-- Check if core tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'individual_profiles', 'therapist_profiles', 'organization_profiles');

-- Check if user_role enum exists
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role');
```

### Step 2: Check Trigger Function
```sql
-- Check if trigger function exists
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- Check if trigger is active
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Step 3: Test Manual Profile Creation
```sql
-- Test manual profile creation
INSERT INTO public.profiles (auth_uid, email, first_name, last_name, role) 
VALUES ('test-uuid', 'test@example.com', 'Test', 'User', 'individual');
```

## 🚀 Potential Solutions

### Solution 1: Reset Database Schema
```bash
# If using local Supabase (requires Docker)
supabase db reset

# If using remote Supabase
supabase db push --dry-run  # Check what would be applied
supabase db push            # Apply migrations
```

### Solution 2: Manual Migration Application
If migrations haven't been applied, the database might be missing essential tables:

1. **Check Migration Status**: Verify which migrations have been applied
2. **Apply Missing Migrations**: Run pending migrations in order
3. **Verify Schema**: Ensure all required tables and functions exist

### Solution 3: Fix Trigger Function
The `handle_new_user()` function might need updates:

```sql
-- Drop and recreate trigger function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate with the latest version from migration files
```

### Solution 4: Disable Trigger Temporarily
For immediate testing, you can disable the trigger:

```sql
-- Disable trigger temporarily
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Test registration
-- Then re-enable
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
```

## 🎯 Next Actions Required

1. **Access Supabase Dashboard**:
   - Go to https://supabase.com/dashboard
   - Navigate to your project: `hdjbfxzkijcmzhwusifl`
   - Check the SQL Editor and Database sections

2. **Run Diagnostic Queries**:
   - Execute the SQL queries above in the Supabase SQL Editor
   - Check for missing tables, functions, or constraints

3. **Check Migration Status**:
   - In Supabase Dashboard → Database → Migrations
   - Verify which migrations have been applied
   - Look for any failed migrations

4. **Review Error Logs**:
   - In Supabase Dashboard → Logs
   - Look for detailed error messages during registration attempts

## 🔧 Alternative Workaround

If the trigger is the issue, you can temporarily handle profile creation in the frontend:

```typescript
// In useAuthStore.ts, after successful auth.signUp
if (authData.user) {
  // Manually create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      auth_uid: authData.user.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role
    });
    
  if (profileError) {
    console.error('Profile creation error:', profileError);
  }
}
```

---

**Immediate Action**: Please access your Supabase dashboard and run the diagnostic queries to identify the exact cause of the "Database error saving new user" issue.
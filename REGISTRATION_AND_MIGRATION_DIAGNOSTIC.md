# Registration and Migration Issues - Diagnostic Report

## 🚨 Current Issues Identified

### 1. Migration Issues
**Problem**: Cannot run Supabase migrations manually
- **Root Cause**: Supabase project not linked + Docker not running
- **Error**: `Cannot find project ref. Have you run supabase link?`
- **Secondary Error**: `Cannot connect to the Docker daemon`

### 2. Registration Issues
**Problem**: User registration failing with various errors
- **Potential Causes**: Database constraint violations, trigger failures, RLS policy conflicts
- **Impact**: Users cannot create accounts successfully

## 🔧 Immediate Solutions

### Fix Migration Issues

#### Option 1: Link to Remote Supabase Project
```bash
# Link to your remote Supabase project
supabase link --project-ref hdjbfxzkijcmzhwusifl

# Then push migrations
supabase db push
```

#### Option 2: Use Local Development
```bash
# Start Docker Desktop first
# Then start local Supabase
supabase start

# Apply migrations locally
supabase db reset
```

### Fix Registration Issues

#### 1. Check Database Constraints
The latest migration (`20250623000000-comprehensive-missing-features.sql`) might have constraint conflicts. Key areas to check:

- **User Role Enum**: Ensure `user_role` enum includes all required values
- **Profile Creation**: Verify trigger function `handle_new_user()` is working
- **RLS Policies**: Check Row Level Security policies aren't blocking inserts

#### 2. Test Registration Flow
```bash
# Test the registration with a simple account
node test-complete-flow.js
```

#### 3. Check Supabase Auth Settings
In your Supabase dashboard:
- ✅ Ensure "Enable email confirmations" is disabled for testing
- ✅ Verify "Enable sign ups" is enabled
- ✅ Check if custom SMTP is configured correctly

## 🔍 Debugging Steps

### 1. Check Current Database State
```sql
-- Check if user_role enum exists and has correct values
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role');

-- Check if trigger function exists
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies WHERE tablename IN ('profiles', 'individual_profiles', 'therapist_profiles', 'organization_profiles');
```

### 2. Monitor Registration Logs
When testing registration, check:
- Browser console for frontend errors
- Supabase logs for backend errors
- Database logs for constraint violations

### 3. Test Each Registration Type
- ✅ Individual registration
- ✅ Therapist registration  
- ✅ Organization registration

## 🎯 Specific Error Patterns to Look For

### Database Errors
- `NOT NULL constraint violation`
- `duplicate key value violates unique constraint`
- `invalid input value for enum user_role`
- `permission denied for table`

### Auth Errors
- `User already registered`
- `Invalid API key`
- `Email confirmation required`
- `Signup is disabled`

### Trigger Errors
- `handle_new_user: CRITICAL - Failed to create profile`
- `handle_new_user: Failed to create [role] profile`
- `permission denied for function handle_new_user`

## 📋 Next Steps

1. **Start Docker Desktop** (required for local Supabase)
2. **Link Supabase project** or start local instance
3. **Apply pending migrations** safely
4. **Test registration flow** with each user type
5. **Monitor logs** for specific error messages
6. **Report specific errors** for targeted fixes

## 🚀 Quick Test Commands

```bash
# Check Docker status
docker --version

# Check Supabase CLI
supabase --version

# Test Supabase connection
supabase status

# Test registration flow
node test-complete-flow.js
```

---

**Next Action Required**: Please run the diagnostic commands above and share the specific error messages you encounter. This will help me provide targeted solutions for your exact issues.
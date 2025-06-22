# Test Account Creation Scripts

This directory contains scripts to create test accounts for the MindLyfe platform with complete profiles in the Supabase database.

## Files

- `create-test-accounts.js` - Main script that creates all test accounts
- `test-accounts-config.js` - Configuration file with account data and Supabase settings
- `GET_SERVICE_ROLE_KEY.md` - Instructions on how to get the Supabase service role key

## What Gets Created

The script creates the following test accounts:

### Super Admin (1 account)
- Email: `admin@mindlyfe.com`
- Role: `super_admin`
- Full admin access to the platform

### Support Team (2 accounts)
- Email: `support1@mindlyfe.com`, `support2@mindlyfe.com`
- Role: `support`
- Customer support access

### Demo Organization (1 account)
- Email: `demo@mindlyfe.com`
- Role: `organization`
- For testing organization features

### Therapists (4 accounts)
- Emails: `therapist1@mindlyfe.com` through `therapist4@mindlyfe.com`
- Role: `therapist`
- Complete therapist profiles with specializations
- Uses standard platform rates (no custom hourly rates)

### Individual Clients (4 accounts)
- Emails: `client1@mindlyfe.com` through `client4@mindlyfe.com`
- Role: `individual`
- Complete individual profiles

## How to Use

### Step 1: Get Service Role Key
1. Follow instructions in `GET_SERVICE_ROLE_KEY.md`
2. Get your service role key from Supabase Dashboard
3. Update `test-accounts-config.js` with the real key

### Step 2: Run the Script
```bash
node create-test-accounts.js
```

### Step 3: Save Credentials
- All accounts use the password: `MindLyfe2024!`
- Or random passwords if configured differently
- Save these credentials securely for testing

## Security Notes

⚠️ **IMPORTANT**:
- The service role key has full database access
- Never commit the real service role key to version control
- Use environment variables for production deployments
- These are test accounts - don't use in production with real data

## Troubleshooting

### 401 Authentication Errors
- Make sure you've replaced `YOUR_SERVICE_ROLE_KEY_HERE` with the actual service role key
- Verify the service role key is correct and hasn't expired
- Check that your Supabase project URL is correct

### Database Errors
- Ensure your database tables exist (`profiles`, `therapist_profiles`, `individual_profiles`, `organization_profiles`)
- Check that Row Level Security policies allow service role access
- Verify your database schema matches the script expectations

## Database Tables Used

- `auth.users` - Supabase authentication
- `public.profiles` - Base user profiles
- `public.therapist_profiles` - Therapist-specific data
- `public.individual_profiles` - Individual client data
- `public.organization_profiles` - Organization data

All accounts are created with proper relationships between these tables.
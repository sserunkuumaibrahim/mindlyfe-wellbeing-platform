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

## Current Working Test Accounts (as of 2025-07-22)

The following accounts are currently active and can be used for testing:

### Individual Users
- **Email**: `demo@mindlyfe.org` | **Password**: `MindLyfe2024!` | **Role**: `individual`
- **Email**: `client@mindlyfe.org` | **Password**: `MindLyfe2024!` | **Role**: `individual` 

### Therapists  
- **Email**: `dr.smith@mindlyfe.org` | **Password**: `MindLyfe2024!` | **Role**: `therapist`
- **Email**: `dr.brown@mindlyfe.org` | **Password**: `MindLyfe2024!` | **Role**: `therapist`
- **Email**: `dr.garcia@mindlyfe.org` | **Password**: `MindLyfe2024!` | **Role**: `therapist`
- **Email**: `dr.davis@mindlyfe.org` | **Password**: `MindLyfe2024!` | **Role**: `therapist`

### Organization Admin
- **Email**: `demo@techcorp.org` | **Password**: `MindLyfe2024!` | **Role**: `org_admin`

### System Admin
- **Email**: `michael.chen@mindlyfe.org` | **Password**: `MindLyfe2024!` | **Role**: `admin`

## Development Quick Login

When running in development mode (`NODE_ENV=development`), the login page displays test credentials for easy access:
- **Email**: demo@mindlyfe.org  
- **Password**: MindLyfe2024!

## Security Notes

⚠️ **IMPORTANT**:
- The service role key has full database access
- Never commit the real service role key to version control
- Use environment variables for production deployments
- These are test accounts - don't use in production with real data

## Troubleshooting

### 401 Authentication Errors
- Make sure you've replaced `YOUR_SERVICE_ROLE_KEY_HERE` with the actual service role key
- Verify you're using the correct password: `MindLyfe2024!` (case-sensitive)
- Check that the backend Docker container is running and healthy
- Verify the database connection is working

### Dashboard Loading Issues
- If dashboard gets stuck on loading, check the browser console for API errors
- Ensure the frontend API client is calling the correct endpoints (`/api/profiles` not `/api/user/profile`)
- Verify that authentication tokens are being stored correctly in localStorage as `access_token`
- Make sure all containers are restarted after code changes: `docker-compose restart`

### Common Solutions
1. **Backend API endpoints fixed**: Changed frontend to use `/api/profiles` instead of `/api/user/profile`
2. **Token storage corrected**: Frontend now uses `access_token` instead of `token` from localStorage  
3. **Infinite loop resolved**: Components use AuthContext user data instead of separate useProfile API calls
4. **Type errors fixed**: Updated component props to match available user data fields

### Quick Reset
If you encounter persistent issues:
```bash
# Clear browser localStorage
localStorage.clear()

# Restart all containers
docker-compose restart

# Check container status
docker ps
```
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
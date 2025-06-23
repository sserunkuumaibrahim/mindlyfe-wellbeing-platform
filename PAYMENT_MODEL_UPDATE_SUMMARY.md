# Payment Model Update - Mindlyfe Platform

## Overview
This document outlines the updated payment model for the Mindlyfe platform where Mindlyfe handles all payments centrally and pays therapists directly, rather than clients paying therapists individually.

## Key Changes Made

### 1. Removed Hourly Rate from Therapist Profiles
- **Removed Field**: `hourly_rate_ugx` from `therapist_profiles` table
- **Reason**: Mindlyfe uses standardized pricing across the platform
- **Impact**: Therapists no longer set individual rates

### 2. Simplified Availability Management
- **Removed Field**: `availability_schedule` from therapist profile creation
- **Reason**: Availability is managed through the dedicated `therapist_availability` table
- **Impact**: Cleaner separation of concerns between profile data and scheduling

### 3. Updated Database Schema

#### Therapist Profiles Table Structure
The `therapist_profiles` table now includes only essential profile information:
- `id` (UUID, references profiles.id)
- `license_number` (TEXT)
- `license_body` (TEXT)
- `national_id_number` (TEXT)
- `specializations` (TEXT[])
- `years_experience` (INTEGER)
- `education_background` (TEXT)
- `languages_spoken` (TEXT[])
- `bio` (TEXT)
- `status` (profile_status)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### Separate Availability Management
Therapist availability is managed through the `therapist_availability` table:
- `id` (UUID)
- `therapist_id` (UUID, references profiles.id)
- `day_of_week` (INTEGER)
- `start_time` (TIME)
- `end_time` (TIME)
- `is_available` (BOOLEAN)
- `is_recurring` (BOOLEAN)
- `specific_date` (DATE)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Payment Flow Architecture

### 1. Client Payment to Mindlyfe
- Clients pay Mindlyfe directly for therapy sessions
- All payments processed through DPO Pay integration
- Standardized pricing across the platform
- Transparent fee structure

### 2. Mindlyfe Payment to Therapists
- Mindlyfe pays therapists based on completed sessions
- Revenue tracking through session completion
- Automated payment processing
- Clear earnings dashboard for therapists

### 3. Revenue Tracking
Therapists can view their earnings through:
- Session completion reports
- Monthly revenue summaries
- Payment history
- Performance analytics

## Benefits of This Model

### For Clients
- **Consistent Pricing**: No variation in rates between therapists
- **Simplified Billing**: Single payment to Mindlyfe
- **Trust & Security**: Platform-backed payment processing
- **Refund Protection**: Centralized refund handling

### For Therapists
- **Guaranteed Payments**: Mindlyfe handles payment collection
- **Focus on Therapy**: No need to manage individual billing
- **Professional Support**: Platform handles payment disputes
- **Clear Earnings**: Transparent revenue tracking

### For Mindlyfe
- **Revenue Control**: Centralized payment processing
- **Quality Assurance**: Standardized service delivery
- **Scalability**: Easier to manage pricing and promotions
- **Data Insights**: Complete payment and usage analytics

## Technical Implementation

### Database Changes
1. **Migration File Updated**: `20250623000000-comprehensive-missing-features.sql`
   - Removed `hourly_rate_ugx` from therapist profile creation
   - Removed `availability_schedule` from profile creation
   - Simplified INSERT statement for therapist profiles

2. **Test Data Updated**: 
   - `create-test-accounts.js` no longer includes hourly rate fields
   - `test-accounts-config.js` uses standardized therapist data

### API Considerations
- Session booking APIs use platform-standard pricing
- Payment processing through DPO Pay integration
- Therapist earnings calculated from completed sessions
- Revenue reporting APIs for therapist dashboards

## Next Steps

### 1. Pricing Configuration
- Define standard session rates for the platform
- Configure pricing tiers (if applicable)
- Set up promotional pricing options

### 2. Payment Processing
- Implement DPO Pay integration for client payments
- Set up automated therapist payment system
- Configure payment schedules (weekly/monthly)

### 3. Revenue Tracking
- Build therapist earnings dashboard
- Implement session completion tracking
- Create payment history views

### 4. Testing
- Test payment flows end-to-end
- Verify therapist profile creation
- Validate earnings calculations

## Files Modified

1. **`supabase/migrations/20250623000000-comprehensive-missing-features.sql`**
   - Removed hourly_rate_ugx and availability_schedule from therapist profile creation
   - Updated INSERT statement to use correct column names

2. **`create-test-accounts.js`**
   - Removed hourly_rate_ugx and availability_schedule from user_metadata
   - Simplified therapist account creation

3. **`test-accounts-config.js`**
   - Already updated to follow new payment model
   - No hourly rates specified for test therapists

## Database Schema Alignment

The current schema in `types.ts` shows that the `therapist_profiles` table does not include `hourly_rate_ugx` or `availability_schedule` fields, confirming that the database structure already supports the centralized payment model. The migration updates ensure that the profile creation process aligns with this schema.

---

**Status**: ✅ Complete
**Last Updated**: January 2025
**Next Review**: After payment system implementation
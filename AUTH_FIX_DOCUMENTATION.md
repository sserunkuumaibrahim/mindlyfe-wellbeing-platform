# Authentication System Fix Documentation

## Overview
This document outlines the comprehensive fixes applied to resolve user registration failures in the MindLyfe application. The issues were primarily caused by database constraint violations and inadequate error handling.

## Issues Identified

### 1. Database Constraint Violations
- **Problem**: The `handle_new_user()` trigger function used `COALESCE` with empty strings as defaults for NOT NULL fields
- **Impact**: Empty strings violated NOT NULL constraints, causing registration failures
- **Affected Tables**: `therapist_profiles`, `organization_profiles`

### 2. Inadequate Frontend Validation
- **Problem**: Missing validation for required fields and data formats
- **Impact**: Invalid data was being sent to the database
- **Affected Forms**: Therapist registration form

### 3. Poor Error Handling
- **Problem**: Generic error messages that didn't help users understand what went wrong
- **Impact**: Users couldn't identify and fix registration issues

## Fixes Applied

### 1. Database Migration: `20250621000000-fix-auth-constraints.sql`

#### Key Changes:
- **Proper Validation**: Added explicit validation for required fields before database insertion
- **Better Error Messages**: Database function now throws specific error messages for missing required fields
- **NULLIF Usage**: Used `NULLIF()` instead of `COALESCE()` with empty strings for optional fields
- **Role-Specific Validation**: Different validation rules for individual, therapist, and org_admin roles

#### Therapist-Specific Validations:
```sql
-- Required fields validation
IF COALESCE(NEW.raw_user_meta_data ->> 'national_id_number', '') = '' THEN
    RAISE EXCEPTION 'National ID number is required for therapists';
END IF;

IF COALESCE(NEW.raw_user_meta_data ->> 'license_body', '') = '' THEN
    RAISE EXCEPTION 'License body is required for therapists';
END IF;

-- And similar validations for other required fields
```

### 2. Frontend Validation Improvements

#### Enhanced Zod Schema (`TherapistRegistrationForm.tsx`):
- **Password Strength**: Added regex validation for uppercase, lowercase, numbers, and special characters
- **Field Length Limits**: Added maximum length constraints to prevent database overflow
- **Date Validation**: Ensured expiry dates are in the future
- **Array Validation**: Limited number of specializations, languages, and certifications
- **Terms Acceptance**: Made terms and privacy policy acceptance mandatory

#### Example Validation:
```typescript
license_expiry_date: z.date({
  required_error: "License expiry date is required",
  invalid_type_error: "Please enter a valid date"
}).refine((date) => date > new Date(), {
  message: "License expiry date must be in the future"
}),
```

### 3. Enhanced Error Handling (`useAuthStore.ts`)

#### Specific Error Messages:
- **Duplicate Key Violations**: Specific messages for license numbers, emails, registration numbers
- **NOT NULL Constraints**: Field-specific error messages
- **Check Constraints**: Validation-specific error messages
- **Data Format Errors**: Clear guidance for date and number format issues

#### Example Error Handling:
```typescript
if (error.message.includes('duplicate key value violates unique constraint')) {
  if (error.message.includes('license_number')) {
    errorMessage = 'This license number is already registered. Please check your license number or contact support if you believe this is an error.';
  }
  // ... other specific cases
}
```

## Required Fields by Role

### Individual Users
- First name, last name, email (from base profile)
- All other fields are optional

### Therapist Users
**Required Fields:**
- First name, last name, email (from base profile)
- National ID number
- License body
- License number
- License expiry date
- Insurance provider
- Insurance policy number
- Insurance expiry date
- Years of experience
- At least one specialization
- At least one language spoken

**Optional Fields:**
- Education background
- Certifications
- Hourly rate
- Bio
- Phone number
- Date of birth
- Gender
- Country
- Preferred language

### Organization Admin Users
**Required Fields:**
- First name, last name, email (from base profile)
- Organization name
- Registration number
- Tax ID number

**Optional Fields:**
- Organization type (defaults to 'private_company')
- Date of establishment (defaults to current date)
- Number of employees (defaults to 1)
- Representative job title (defaults to 'Administrator')
- Official website
- Address details

## How to Apply the Fixes

### 1. Apply Database Migration
```bash
# If using Supabase CLI
supabase db reset

# Or apply the specific migration
supabase migration up
```

### 2. Frontend Changes
The frontend changes are already applied to:
- `/src/components/auth/TherapistRegistrationForm.tsx`
- `/src/stores/useAuthStore.ts`

### 3. Testing
1. **Start the development server**
2. **Test individual registration** - should work without issues
3. **Test therapist registration** - ensure all required fields are filled
4. **Test organization registration** - verify required organization fields
5. **Test error scenarios**:
   - Duplicate email addresses
   - Duplicate license numbers
   - Missing required fields
   - Invalid date formats
   - Invalid number formats

## Validation Rules Summary

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Field Length Limits
- Names: 50 characters max
- National ID: 50 characters max
- License number: 50 characters max
- License body: 100 characters max
- Insurance provider: 100 characters max
- Insurance policy number: 50 characters max
- Education background: 1000 characters max
- Bio: 2000 characters max

### Array Limits
- Specializations: 1-10 items
- Languages: 1-10 items
- Certifications: 0-20 items

### Numeric Limits
- Years of experience: 0-50
- Hourly rate: 0-10,000
- Number of employees: minimum 1

## Error Messages Reference

### Database Errors
- `"National ID number is required for therapists"`
- `"License body is required for therapists"`
- `"License number is required for therapists"`
- `"Insurance provider is required for therapists"`
- `"Insurance policy number is required for therapists"`
- `"Organization name is required for organization admins"`
- `"Registration number is required for organization admins"`
- `"Tax ID number is required for organization admins"`

### Frontend Validation Errors
- Field-specific validation messages based on Zod schema
- Password strength requirements
- Date validation (future dates for expiry)
- Array length validation
- Character limit validation

## Monitoring and Debugging

### Console Logging
The auth store now includes comprehensive console logging for registration errors:
```typescript
console.error('Registration error:', error);
```

### Database Logging
The `handle_new_user` function logs successful user creation in the `audit_logs` table.

### Error Tracking
All registration errors are now properly caught and displayed to users with actionable error messages.

## Future Improvements

1. **Email Verification**: Implement proper email verification flow
2. **File Uploads**: Add support for license and insurance document uploads
3. **Real-time Validation**: Implement real-time field validation
4. **Progressive Registration**: Consider breaking therapist registration into multiple steps
5. **Admin Review**: Implement admin review process for therapist applications

## Conclusion

These fixes address the core issues preventing user registration:
1. Database constraint violations are now properly handled
2. Frontend validation prevents invalid data submission
3. Error messages provide clear guidance to users
4. The system is more robust and user-friendly

The authentication system should now work reliably for all user types with proper error handling and validation.
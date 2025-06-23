import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { supabaseConfig, accountConfig, passwordConfig } from './test-accounts-config.js';

// Supabase configuration from config file
const supabaseUrl = supabaseConfig.url;
const supabaseServiceKey = supabaseConfig.serviceKey;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Generate random password
function generatePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Create user account with profile
async function createUserWithProfile(userData) {
  try {
    console.log(`Creating user: ${userData.email}`);
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          phone_number: userData.phone,
          date_of_birth: userData.date_of_birth,
          gender: userData.gender,
          license_number: userData.license_number,
          license_body: userData.license_body,
          national_id_number: userData.national_id_number,
          specializations: userData.specializations,
          years_experience: userData.years_experience,
          education_background: userData.education_background,
          languages_spoken: userData.languages_spoken,
          bio: userData.bio
        }
    });

    if (authError) {
      console.error(`Auth error for ${userData.email}:`, authError);
      return null;
    }

    const userId = authData.user.id;
    console.log(`Created auth user: ${userId}`);

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify profile was created by trigger
    const { data: profile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_uid', userId)
      .single();

    if (profileCheckError || !profile) {
      console.error(`Profile not created by trigger for ${userData.email}:`, profileCheckError);
      return null;
    }
    
    console.log(`Profile created by trigger for: ${userData.email}`);

    // Create role-specific profile
    if (userData.role === 'individual') {
      const { error: individualError } = await supabase
        .from('individual_profiles')
        .insert({
          profile_id: userId,
          emergency_contact_name: userData.emergency_contact_name || 'Emergency Contact',
          emergency_contact_phone: userData.emergency_contact_phone || '+256700000000',
          medical_history: userData.medical_history || 'No significant medical history',
          current_medications: userData.current_medications || 'None',
          therapy_goals: userData.therapy_goals || 'General wellness and mental health support'
        });

      if (individualError) {
        console.error(`Individual profile error for ${userData.email}:`, individualError);
      }
    }

    if (userData.role === 'therapist') {
      const { error: therapistError } = await supabase
        .from('therapist_profiles')
        .insert({
          profile_id: userId,
          license_number: userData.license_number || `LIC${Math.floor(Math.random() * 100000)}`,
          license_body: 'Uganda Medical and Dental Practitioners Council',
          national_id_number: `NID${Math.floor(Math.random() * 1000000)}`,
          specializations: userData.specializations || ['General Therapy', 'Anxiety', 'Depression'],
          years_experience: userData.years_of_experience || Math.floor(Math.random() * 15) + 2,
          education_background: userData.education || 'Masters in Clinical Psychology',
          bio: userData.bio || 'Experienced therapist dedicated to helping clients achieve their mental health goals.',
          languages_spoken: ['English', 'Luganda']
        });

      if (therapistError) {
        console.error(`Therapist profile error for ${userData.email}:`, therapistError);
      }
    }

    if (userData.role === 'org_admin') {
      const { error: orgError } = await supabase
        .from('organization_profiles')
        .insert({
          profile_id: userId,
          organization_name: userData.organization_name || 'Demo Organization',
          organization_type: userData.organization_type || 'private_company',
          registration_number: userData.registration_number || `REG${Math.floor(Math.random() * 100000)}`,
          tax_id_number: userData.tax_id_number || `TAX${Math.floor(Math.random() * 1000000)}`,
          representative_job_title: userData.representative_job_title || 'Administrator',
          representative_national_id: userData.representative_national_id || `NID${Math.floor(Math.random() * 1000000)}`,
          num_employees: userData.num_employees || 50
        });

      if (orgError) {
        console.error(`Organization profile error for ${userData.email}:`, orgError);
      }
    }

    console.log(`✅ Successfully created user: ${userData.email} (${userData.role})`);
    return {
      id: userId,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      name: `${userData.first_name} ${userData.last_name}`
    };

  } catch (error) {
    console.error(`Error creating user ${userData.email}:`, error);
    return null;
  }
}

// Main function to create all test accounts
async function createTestAccounts() {
  console.log('🚀 Starting test account creation...');
  
  const accounts = [];
  
  // 1. Super Admin Account
  const superAdminPassword = passwordConfig.useRandomPasswords ? generatePassword(16) : passwordConfig.defaultPassword;
  const superAdmin = await createUserWithProfile({
    email: accountConfig.superAdmin.email,
    password: superAdminPassword,
    first_name: accountConfig.superAdmin.firstName,
    last_name: accountConfig.superAdmin.lastName,
    role: 'admin',
    phone: accountConfig.superAdmin.phone,
    date_of_birth: accountConfig.superAdmin.dateOfBirth,
    gender: accountConfig.superAdmin.gender
  });
  if (superAdmin) accounts.push(superAdmin);

  // 2. Support Team Members
  for (const supportData of accountConfig.supportTeam) {
    const supportMember = await createUserWithProfile({
      email: supportData.email,
      password: passwordConfig.useRandomPasswords ? generatePassword() : passwordConfig.defaultPassword,
      first_name: supportData.firstName,
      last_name: supportData.lastName,
      role: 'admin',
      phone: supportData.phone,
      date_of_birth: supportData.dateOfBirth,
      gender: supportData.gender
    });
    if (supportMember) accounts.push(supportMember);
  }

  // 3. Demo Organization Account
  const demoOrg = await createUserWithProfile({
    email: accountConfig.demoOrganization.email,
    password: passwordConfig.useRandomPasswords ? generatePassword() : passwordConfig.defaultPassword,
    first_name: accountConfig.demoOrganization.firstName,
    last_name: accountConfig.demoOrganization.lastName,
    role: 'org_admin',
    phone: accountConfig.demoOrganization.phone,
    organization_name: accountConfig.demoOrganization.organizationName,
    organization_type: accountConfig.demoOrganization.organizationType,
    registration_number: accountConfig.demoOrganization.registrationNumber,
    tax_id_number: `TAX${Math.floor(Math.random() * 1000000)}`,
    representative_job_title: 'CEO',
    representative_national_id: `NID${Math.floor(Math.random() * 1000000)}`,
    num_employees: 100
  });
  if (demoOrg) accounts.push(demoOrg);

  // 4. Therapist Accounts
  for (const therapistData of accountConfig.therapists) {
    const therapist = await createUserWithProfile({
      email: therapistData.email,
      password: passwordConfig.useRandomPasswords ? generatePassword() : passwordConfig.defaultPassword,
      first_name: therapistData.firstName,
      last_name: therapistData.lastName,
      role: 'therapist',
      phone: therapistData.phone,
      date_of_birth: therapistData.dateOfBirth,
      gender: therapistData.gender,
      specializations: therapistData.specializations,
      years_of_experience: therapistData.yearsOfExperience,
      education: therapistData.education,
      bio: therapistData.bio,
      license_number: therapistData.licenseNumber
    });
    if (therapist) accounts.push(therapist);
  }

  // 5. Demo Individual Clients
  for (const clientData of accountConfig.demoClients) {
    const client = await createUserWithProfile({
      email: clientData.email,
      password: passwordConfig.useRandomPasswords ? generatePassword() : passwordConfig.defaultPassword,
      first_name: clientData.firstName,
      last_name: clientData.lastName,
      role: 'individual',
      phone: clientData.phone,
      date_of_birth: clientData.dateOfBirth,
      gender: clientData.gender,
      emergency_contact_name: clientData.emergencyContactName,
      emergency_contact_phone: clientData.emergencyContactPhone,
      therapy_goals: clientData.therapyGoals
    });
    if (client) accounts.push(client);
  }

  // Display results
  console.log('\n🎉 Test account creation completed!');
  console.log('\n📋 Created Accounts Summary:');
  console.log('=' .repeat(80));
  
  accounts.forEach(account => {
    console.log(`${account.role.toUpperCase().padEnd(12)} | ${account.email.padEnd(30)} | ${account.name.padEnd(20)} | ${account.password}`);
  });
  
  console.log('=' .repeat(80));
  console.log(`\nTotal accounts created: ${accounts.length}`);
  console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
  console.log('💡 Super Admin Password:', superAdminPassword);
  
  return accounts;
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestAccounts()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { createTestAccounts, createUserWithProfile };
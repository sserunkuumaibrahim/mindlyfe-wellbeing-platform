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
        role: userData.role
      }
    });

    if (authError) {
      console.error(`Auth error for ${userData.email}:`, authError);
      return null;
    }

    const userId = authData.user.id;
    console.log(`Created auth user: ${userId}`);

    // Create base profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone || null,
        date_of_birth: userData.date_of_birth || null,
        gender: userData.gender || null,
        is_active: true
      });

    if (profileError) {
      console.error(`Profile error for ${userData.email}:`, profileError);
      return null;
    }

    // Create role-specific profile
    if (userData.role === 'individual') {
      const { error: individualError } = await supabase
        .from('individual_profiles')
        .insert({
          id: userId,
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
          id: userId,
          license_number: userData.license_number || `LIC${Math.floor(Math.random() * 100000)}`,
          specializations: userData.specializations || ['General Therapy', 'Anxiety', 'Depression'],
          years_of_experience: userData.years_of_experience || Math.floor(Math.random() * 15) + 2,
          education: userData.education || 'Masters in Clinical Psychology',
          bio: userData.bio || 'Experienced therapist dedicated to helping clients achieve their mental health goals.',
          // hourly_rate removed - using standard platform rates
          is_verified: true,
          is_available: true
        });

      if (therapistError) {
        console.error(`Therapist profile error for ${userData.email}:`, therapistError);
      }
    }

    if (userData.role === 'organization') {
      const { error: orgError } = await supabase
        .from('organization_profiles')
        .insert({
          id: userId,
          organization_name: userData.organization_name || 'Demo Organization',
          organization_type: userData.organization_type || 'healthcare',
          registration_number: userData.registration_number || `REG${Math.floor(Math.random() * 100000)}`,
          address: userData.address || 'Kampala, Uganda',
          website: userData.website || 'https://demo-org.com',
          description: userData.description || 'Demo organization for testing purposes'
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
    role: 'organization',
    phone: accountConfig.demoOrganization.phone,
    organization_name: accountConfig.demoOrganization.organizationName,
    organization_type: accountConfig.demoOrganization.organizationType,
    registration_number: accountConfig.demoOrganization.registrationNumber,
    address: accountConfig.demoOrganization.address,
    website: accountConfig.demoOrganization.website,
    description: accountConfig.demoOrganization.description
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
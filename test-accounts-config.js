// Configuration for test account creation
// Copy this file and update with your actual Supabase credentials

export const supabaseConfig = {
  // Actual Supabase project URL from the project
  url: 'https://hdjbfxzkijcmzhwusifl.supabase.co',
  
  // Anon key for public operations
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkamJmeHpraWpjbXpod3VzaWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTI3NzMsImV4cCI6MjA2NTk4ODc3M30.8HWfSp19BamGIyzATn3FOmtaY7pqyLbm22inUWgV7wE',
  
  // Service role key for admin operations (get this from Supabase Dashboard > Settings > API)
  // See GET_SERVICE_ROLE_KEY.md for detailed instructions
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE'
};

// Test account configuration
export const accountConfig = {
  // Super Admin Configuration
  superAdmin: {
    email: 'kawekwa@mindlyfe.org',
    firstName: 'Douglas',
    lastName: 'Kawekwa',
    phone: '+256700123456',
    dateOfBirth: '1985-03-15',
    gender: 'male'
  },
  
  // Support Team Configuration
  supportTeam: [
    {
      email: 'support1@mindlyfe.org',
      firstName: 'Sarah',
      lastName: 'Nakato',
      phone: '+256700234567',
      dateOfBirth: '1990-07-22',
      gender: 'female'
    },
    {
      email: 'support2@mindlyfe.org',
      firstName: 'James',
      lastName: 'Okello',
      phone: '+256700345678',
      dateOfBirth: '1988-11-10',
      gender: 'male'
    }
  ],
  
  // Demo Organization Configuration
  demoOrganization: {
    email: 'demo@mindlyfe.org',
    firstName: 'Demo',
    lastName: 'Organization',
    phone: '+256700456789',
    organizationName: 'MindLyfe Demo Healthcare',
    organizationType: 'healthcare',
    registrationNumber: 'DEMO001',
    address: 'Plot 123, Kampala Road, Kampala, Uganda',
    website: 'https://demo.mindlyfe.org',
    description: 'Demo healthcare organization for platform testing and demonstrations'
  },
  
  // Therapist Configuration
  therapists: [
    {
      email: 'dr.amina@mindlyfe.org',
      firstName: 'Dr. Amina',
      lastName: 'Hassan',
      specializations: ['Anxiety Disorders', 'Depression', 'Trauma Therapy'],
      yearsOfExperience: 8,
      education: 'PhD in Clinical Psychology, Makerere University',
      bio: 'Specialized in cognitive behavioral therapy with extensive experience in treating anxiety and depression.',
      // Using standard platform rates
      licenseNumber: 'PSY001UG',
      phone: '+256700567890',
      dateOfBirth: '1985-04-12',
      gender: 'female'
    },
    {
      email: 'dr.robert@mindlyfe.org',
      firstName: 'Dr. Robert',
      lastName: 'Mugisha',
      specializations: ['Family Therapy', 'Relationship Counseling', 'Addiction Recovery'],
      yearsOfExperience: 12,
      education: 'Masters in Marriage and Family Therapy, Uganda Christian University',
      bio: 'Expert in family dynamics and relationship counseling with over a decade of experience.',
      // Using standard platform rates
      licenseNumber: 'MFT002UG',
      phone: '+256700678901',
      dateOfBirth: '1980-09-25',
      gender: 'male'
    },
    {
      email: 'dr.grace@mindlyfe.org',
      firstName: 'Dr. Grace',
      lastName: 'Nalwoga',
      specializations: ['Child Psychology', 'Adolescent Therapy', 'ADHD'],
      yearsOfExperience: 6,
      education: 'Masters in Child Psychology, Kyambogo University',
      bio: 'Passionate about helping children and adolescents navigate mental health challenges.',
      // Using standard platform rates
      licenseNumber: 'CP003UG',
      phone: '+256700789012',
      dateOfBirth: '1992-01-18',
      gender: 'female'
    },
    {
      email: 'dr.peter@mindlyfe.org',
      firstName: 'Dr. Peter',
      lastName: 'Ssemakula',
      specializations: ['PTSD', 'Grief Counseling', 'Stress Management'],
      yearsOfExperience: 10,
      education: 'PhD in Trauma Psychology, Mbarara University',
      bio: 'Specialized in trauma recovery and post-traumatic stress disorder treatment.',
      // Using standard platform rates
      licenseNumber: 'PTSD004UG',
      phone: '+256700890123',
      dateOfBirth: '1983-06-30',
      gender: 'male'
    }
  ],
  
  // Demo Client Configuration
  demoClients: [
    {
      email: 'client1@demo.mindlyfe.org',
      firstName: 'Mary',
      lastName: 'Achieng',
      phone: '+256700901234',
      dateOfBirth: '1995-03-20',
      gender: 'female',
      emergencyContactName: 'John Achieng',
      emergencyContactPhone: '+256700901235',
      therapyGoals: 'Managing work-related stress and anxiety'
    },
    {
      email: 'client2@demo.mindlyfe.org',
      firstName: 'David',
      lastName: 'Kato',
      phone: '+256700012345',
      dateOfBirth: '1988-11-15',
      gender: 'male',
      emergencyContactName: 'Susan Kato',
      emergencyContactPhone: '+256700012346',
      therapyGoals: 'Relationship counseling and communication skills'
    }
  ]
};

// Password generation settings
export const passwordConfig = {
  length: 12,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: true, // Exclude similar looking characters like 0, O, l, 1
  useRandomPasswords: false, // Set to true to generate random passwords
  defaultPassword: 'MindLyfe2024!' // Default password for all test accounts
};
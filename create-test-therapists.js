const { Client } = require('pg');

// Database connection
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'mindlyfe_db',
  user: 'mindlyfe_user',
  password: 'mindlyfe_password',
});

const testTherapists = [
  {
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@mindlyfe.com',
    specializations: ['Anxiety', 'Depression', 'Cognitive Behavioral Therapy'],
    languages_spoken: ['English', 'Spanish'],
    years_experience: 8,
    bio: 'Dr. Sarah Johnson is a licensed clinical psychologist specializing in anxiety and depression. She has over 8 years of experience helping individuals overcome mental health challenges.',
    license_number: 'PSY12345',
    license_body: 'California Board of Psychology',
    national_id_number: 'NID001',
    hourly_rate: 150.00
  },
  {
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen@mindlyfe.com',
    specializations: ['Trauma', 'PTSD', 'EMDR'],
    languages_spoken: ['English', 'Mandarin'],
    years_experience: 12,
    bio: 'Michael Chen is a trauma specialist with extensive experience in EMDR therapy. He has helped hundreds of clients recover from traumatic experiences.',
    license_number: 'PSY67890',
    license_body: 'New York State Board of Psychology',
    national_id_number: 'NID002',
    hourly_rate: 175.00
  },
  {
    first_name: 'Emily',
    last_name: 'Rodriguez',
    email: 'emily.rodriguez@mindlyfe.com',
    specializations: ['Couples Therapy', 'Family Therapy', 'Relationship Counseling'],
    languages_spoken: ['English', 'Spanish', 'Portuguese'],
    years_experience: 6,
    bio: 'Emily Rodriguez specializes in couples and family therapy. She uses evidence-based approaches to help families strengthen their relationships.',
    license_number: 'MFT11111',
    license_body: 'Texas State Board of Examiners of Marriage and Family Therapists',
    national_id_number: 'NID003',
    hourly_rate: 140.00
  },
  {
    first_name: 'David',
    last_name: 'Williams',
    email: 'david.williams@mindlyfe.com',
    specializations: ['Addiction Recovery', 'Substance Abuse', 'Group Therapy'],
    languages_spoken: ['English'],
    years_experience: 15,
    bio: 'David Williams is a licensed addiction counselor with 15 years of experience in substance abuse treatment and recovery programs.',
    license_number: 'CAC22222',
    license_body: 'Florida Certification Board',
    national_id_number: 'NID004',
    hourly_rate: 160.00
  },
  {
    first_name: 'Lisa',
    last_name: 'Thompson',
    email: 'lisa.thompson@mindlyfe.com',
    specializations: ['Child Psychology', 'Adolescent Therapy', 'Behavioral Issues'],
    languages_spoken: ['English', 'French'],
    years_experience: 10,
    bio: 'Lisa Thompson specializes in child and adolescent psychology. She has extensive experience working with young people facing behavioral and emotional challenges.',
    license_number: 'PSY33333',
    license_body: 'Illinois Department of Financial and Professional Regulation',
    national_id_number: 'NID005',
    hourly_rate: 130.00
  }
];

async function createTestTherapists() {
  try {
    await client.connect();
    console.log('Connected to database');

    for (const therapist of testTherapists) {
      console.log(`Creating therapist: ${therapist.first_name} ${therapist.last_name}`);
      
      // Insert into profiles table
      const profileResult = await client.query(`
        INSERT INTO profiles (
          role, first_name, last_name, email, is_active, is_email_verified
        ) VALUES (
          'therapist', $1, $2, $3, true, true
        ) RETURNING id
      `, [therapist.first_name, therapist.last_name, therapist.email]);

      const profileId = profileResult.rows[0].id;
      console.log(`Created profile with ID: ${profileId}`);

      // Insert into therapist_profiles table
      await client.query(`
        INSERT INTO therapist_profiles (
          id, national_id_number, license_body, license_number, years_experience,
          specializations, languages_spoken, bio, hourly_rate, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, 'approved'
        )
      `, [
        profileId,
        therapist.national_id_number,
        therapist.license_body,
        therapist.license_number,
        therapist.years_experience,
        therapist.specializations,
        therapist.languages_spoken,
        therapist.bio,
        therapist.hourly_rate
      ]);

      console.log(`Created therapist profile for ${therapist.first_name} ${therapist.last_name}`);
    }

    console.log('All test therapists created successfully!');
  } catch (error) {
    console.error('Error creating test therapists:', error);
  } finally {
    await client.end();
  }
}

createTestTherapists();

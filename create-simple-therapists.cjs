const { Client } = require('pg');

// Database connection
const client = new Client({
  host: 'postgres',
  port: 5432,
  database: 'mindlyfe',
  user: 'postgres',
  password: 'postgres',
});

const simpleTherapists = [
  {
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson.therapist@mindlyfe.com'
  },
  {
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen.therapist@mindlyfe.com'
  },
  {
    first_name: 'Emily',
    last_name: 'Rodriguez',
    email: 'emily.rodriguez.therapist@mindlyfe.com'
  },
  {
    first_name: 'David',
    last_name: 'Williams',
    email: 'david.williams.therapist@mindlyfe.com'
  },
  {
    first_name: 'Lisa',
    last_name: 'Thompson',
    email: 'lisa.thompson.therapist@mindlyfe.com'
  }
];

async function createSimpleTherapists() {
  try {
    await client.connect();
    console.log('Connected to database');

    // First, disable the trigger temporarily
    await client.query('ALTER TABLE therapist_profiles DISABLE TRIGGER ALL');
    console.log('Disabled triggers');

    for (const therapist of simpleTherapists) {
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

      // Insert minimal data into therapist_profiles table
      await client.query(`
        INSERT INTO therapist_profiles (
          id, national_id_number, license_body, license_number, years_experience,
          specializations, languages_spoken, bio, hourly_rate, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, 'approved'
        )
      `, [
        profileId,
        'NID' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        'State Psychology Board',
        'PSY' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        5 + Math.floor(Math.random() * 10), // 5-15 years experience
        ['General Therapy', 'Anxiety', 'Depression'],
        ['English'],
        `${therapist.first_name} ${therapist.last_name} is a licensed therapist specializing in mental health counseling.`,
        150.00,
      ]);

      console.log(`Created therapist profile for ${therapist.first_name} ${therapist.last_name}`);
    }

    // Re-enable triggers
    await client.query('ALTER TABLE therapist_profiles ENABLE TRIGGER ALL');
    console.log('Re-enabled triggers');

    console.log('All simple therapists created successfully!');
  } catch (error) {
    console.error('Error creating simple therapists:', error);
  } finally {
    await client.end();
  }
}

createSimpleTherapists();

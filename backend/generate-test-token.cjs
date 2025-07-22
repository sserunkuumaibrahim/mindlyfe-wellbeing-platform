const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const pool = new Pool({
  connectionString: 'postgresql://postgres.pksajrjudpdsmwfxvxmk:Mindlyfe123@aws-0-ca-central-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function createTestToken() {
  try {
    // Get a test user
    const client = await pool.connect();
    
    const userResult = await client.query(
      "SELECT id, email, role FROM profiles WHERE role = 'individual' LIMIT 1"
    );
    
    if (userResult.rows.length === 0) {
      console.log('No individual users found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('Found user:', user);
    
    // Create or update a session for this user
    await client.query(
      `INSERT INTO user_sessions (profile_id, expires_at, is_active) 
       VALUES ($1, NOW() + INTERVAL '1 hour', true)
       ON CONFLICT (profile_id) 
       DO UPDATE SET expires_at = NOW() + INTERVAL '1 hour', is_active = true`,
      [user.id]
    );
    
    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        type: 'access' 
      }, 
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Generated test token:', token);
    console.log('\nTest curl command:');
    console.log(`curl -X POST http://localhost:3001/api/sessions/book \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '{"therapistId": "1", "scheduledAt": "2024-01-15T10:00:00Z"}'`);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestToken();

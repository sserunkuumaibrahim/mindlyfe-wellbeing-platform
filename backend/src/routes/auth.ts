// Authentication Routes for PostgreSQL Backend
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Helper function to generate tokens
function generateTokens(userId: string, email: string) {
  const accessToken = jwt.sign(
    { userId, email, type: 'access' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, email, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

// Sign up endpoint - Only allows individual, therapist, and organization roles
router.post('/signup', async (req: express.Request, res: express.Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { 
      email, 
      password, 
      role = 'individual',
      first_name,
      last_name,
      phone_number,
      date_of_birth,
      gender,
      country,
      preferred_language,
      metadata = {},
      documents = {} // New field for document handling
    } = req.body;
    
    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      res.status(400).json({ 
        message: 'Email, password, first name, and last name are required',
        code: 'VALIDATION_ERROR',
        details: {
          fields: ['email', 'password', 'first_name', 'last_name']
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ 
        message: 'Please enter a valid email address',
        code: 'VALIDATION_ERROR',
        details: {
          fields: ['email']
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      res.status(400).json({ 
        message: 'Password must be at least 8 characters long',
        code: 'VALIDATION_ERROR',
        details: {
          fields: ['password']
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Validate role - only allow specific roles for registration
    const allowedRoles = ['individual', 'therapist', 'org_admin'];
    if (!allowedRoles.includes(role)) {
      res.status(400).json({ 
        message: 'Invalid role. Only individual, therapist, and org_admin roles can register.',
        code: 'VALIDATION_ERROR',
        details: {
          fields: ['role']
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM public.profiles WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      res.status(409).json({ 
        message: 'User already exists',
        code: 'DUPLICATE_ENTRY',
        details: {
          fields: ['email']
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Start transaction
    await client.query('BEGIN');
    
    // Create user profile with password hash directly in the profile
    const userId = uuidv4();
    const profileResult = await client.query(
      `INSERT INTO public.profiles (
        id, role, first_name, last_name, email, phone_number, 
        date_of_birth, gender, country, preferred_language,
        is_active, is_email_verified, password_changed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, false, NOW()) 
      RETURNING *`,
      [userId, role, first_name, last_name, email, phone_number, 
       date_of_birth, gender, country, preferred_language || 'en']
    );
    
    const profile = profileResult.rows[0];
    
    // Store password hash in password_history table for history tracking
    await client.query(
      `INSERT INTO public.password_history (profile_id, password_hash, changed_at) 
       VALUES ($1, $2, NOW())`,
      [userId, hashedPassword]
    );
    
    // Create role-specific profile
    if (role === 'individual') {
      const {
        mental_health_history,
        therapy_goals,
        communication_pref = 'email',
        opt_in_newsletter = false,
        opt_in_sms = false,
        emergency_contact_name,
        emergency_contact_phone,
        preferred_therapist_gender,
        preferred_session_type = 'virtual',
        medical_history,
        current_medications,
        session_preferences = {}
      } = metadata;

      // Convert therapy_goals to array if it's a string
      let parsedTherapyGoals = therapy_goals;
      if (typeof therapy_goals === 'string') {
        try {
          parsedTherapyGoals = JSON.parse(therapy_goals);
        } catch (e) {
          parsedTherapyGoals = therapy_goals ? [therapy_goals] : [];
        }
      }

      await client.query(
        `INSERT INTO public.individual_profiles (
          id, mental_health_history, therapy_goals, communication_pref, 
          opt_in_newsletter, opt_in_sms, emergency_contact_name, 
          emergency_contact_phone, preferred_therapist_gender, preferred_session_type,
          medical_history, current_medications, session_preferences
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [userId, mental_health_history, parsedTherapyGoals, communication_pref, 
         opt_in_newsletter, opt_in_sms, emergency_contact_name, 
         emergency_contact_phone, preferred_therapist_gender, preferred_session_type,
         medical_history, current_medications, session_preferences]
      );
    } else if (role === 'therapist') {
      const { 
        license_number, 
        national_id_number, 
        license_body,
        license_expiry_date,
        insurance_provider,
        insurance_policy_number,
        insurance_expiry_date,
        years_experience = 0,
        specializations = ['General'],
        languages_spoken = ['English'],
        education_background,
        certifications,
        bio,
        hourly_rate,
        currency = 'USD',
        availability = {}
      } = metadata;
      
      // Validate required therapist fields
      if (!license_number || !national_id_number || !license_body) {
        await client.query('ROLLBACK');
        res.status(400).json({ 
          message: 'Therapist registration requires license_number, national_id_number, and license_body',
          code: 'VALIDATION_ERROR',
          details: {
            fields: ['license_number', 'national_id_number', 'license_body']
          },
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      // Process document URLs from the documents object
      const {
        license_document_url = null,
        insurance_document_url = null,
        id_document_url = null,
        other_documents_urls = null
      } = documents;
      
      // Convert specializations and certifications to arrays if they're strings
      let parsedSpecializations = specializations;
      if (typeof specializations === 'string') {
        try {
          parsedSpecializations = JSON.parse(specializations);
        } catch (e) {
          parsedSpecializations = specializations ? [specializations] : ['General'];
        }
      }
      
      let parsedLanguages = languages_spoken;
      if (typeof languages_spoken === 'string') {
        try {
          parsedLanguages = JSON.parse(languages_spoken);
        } catch (e) {
          parsedLanguages = languages_spoken ? [languages_spoken] : ['English'];
        }
      }
      
      let parsedCertifications = certifications;
      if (typeof certifications === 'string') {
        try {
          parsedCertifications = JSON.parse(certifications);
        } catch (e) {
          parsedCertifications = certifications ? [certifications] : null;
        }
      }
      
      // Create a JSONB object for uploaded documents
      const uploadedDocuments = {
        license: license_document_url ? true : false,
        insurance: insurance_document_url ? true : false,
        id: id_document_url ? true : false,
        other: other_documents_urls ? true : false
      };
      
      await client.query(
        `INSERT INTO public.therapist_profiles (
          id, national_id_number, license_body, license_number, license_expiry_date,
          insurance_provider, insurance_policy_number, insurance_expiry_date,
          years_experience, specializations, languages_spoken, education_background,
          certifications, bio, hourly_rate, currency, status, availability,
          license_document_url, insurance_document_url, id_document_url, 
          other_documents_urls, uploaded_documents
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 
                 'pending_review', $17, $18, $19, $20, $21, $22)`,
        [userId, national_id_number, license_body, license_number, license_expiry_date,
         insurance_provider, insurance_policy_number, insurance_expiry_date,
         years_experience, parsedSpecializations, parsedLanguages, education_background,
         parsedCertifications, bio, hourly_rate, currency, availability,
         license_document_url, insurance_document_url, id_document_url, 
         other_documents_urls, JSON.stringify(uploadedDocuments)]
      );
      
      // Create document entries for each uploaded document
      if (license_document_url) {
        await client.query(
          `INSERT INTO public.documents (
            id, profile_id, file_name, file_path, mime_type, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending_review')`,
          [uuidv4(), userId, 'License Document', license_document_url, 'application/pdf']
        );
      }
      
      if (insurance_document_url) {
        await client.query(
          `INSERT INTO public.documents (
            id, profile_id, file_name, file_path, mime_type, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending_review')`,
          [uuidv4(), userId, 'Insurance Document', insurance_document_url, 'application/pdf']
        );
      }
      
      if (id_document_url) {
        await client.query(
          `INSERT INTO public.documents (
            id, profile_id, file_name, file_path, mime_type, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending_review')`,
          [uuidv4(), userId, 'ID Document', id_document_url, 'application/pdf']
        );
      }
    } else if (role === 'org_admin') {
      const { 
        organization_name, 
        organization_type = 'private_company',
        registration_number, 
        date_of_establishment,
        tax_id_number,
        num_employees = 1,
        official_website,
        address,
        city,
        state,
        postal_code,
        representative_name,
        representative_job_title,
        representative_national_id,
        billing_contact_email,
        billing_contact_phone,
        service_requirements = {}
      } = metadata;
      
      // Validate required organization fields
      if (!organization_name || !registration_number || !tax_id_number || 
          !representative_name || !representative_job_title || !representative_national_id) {
        await client.query('ROLLBACK');
        res.status(400).json({ 
          message: 'Organization registration requires organization details and representative information',
          code: 'VALIDATION_ERROR',
          details: {
            fields: ['organization_name', 'registration_number', 'tax_id_number', 
                    'representative_name', 'representative_job_title', 'representative_national_id']
          },
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      // Process document URLs from the documents object
      const {
        proof_registration_url = null,
        auth_letter_url = null,
        tax_certificate_url = null,
        org_structure_url = null
      } = documents;
      
      // Create a JSONB object for uploaded documents
      const uploadedDocuments = {
        registration: proof_registration_url ? true : false,
        authorization: auth_letter_url ? true : false,
        tax: tax_certificate_url ? true : false,
        structure: org_structure_url ? true : false
      };
      
      await client.query(
        `INSERT INTO public.organization_profiles (
          id, organization_name, organization_type, registration_number, date_of_establishment,
          tax_id_number, num_employees, official_website, address, city, state, postal_code,
          representative_name, representative_job_title, representative_national_id,
          billing_contact_email, billing_contact_phone, status, service_requirements,
          proof_registration_url, auth_letter_url, tax_certificate_url, org_structure_url,
          uploaded_documents
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 
                 'pending_review', $18, $19, $20, $21, $22, $23)`,
        [userId, organization_name, organization_type, registration_number, date_of_establishment,
         tax_id_number, num_employees, official_website, address, city, state, postal_code,
         representative_name, representative_job_title, representative_national_id,
         billing_contact_email || email, billing_contact_phone || phone_number, service_requirements,
         proof_registration_url, auth_letter_url, tax_certificate_url, org_structure_url,
         JSON.stringify(uploadedDocuments)]
      );
      
      // Create document entries for each uploaded document
      if (proof_registration_url) {
        await client.query(
          `INSERT INTO public.documents (
            id, profile_id, file_name, file_path, mime_type, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending_review')`,
          [uuidv4(), userId, 'Proof of Registration', proof_registration_url, 'application/pdf']
        );
      }
      
      if (auth_letter_url) {
        await client.query(
          `INSERT INTO public.documents (
            id, profile_id, file_name, file_path, mime_type, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending_review')`,
          [uuidv4(), userId, 'Authorization Letter', auth_letter_url, 'application/pdf']
        );
      }
      
      if (tax_certificate_url) {
        await client.query(
          `INSERT INTO public.documents (
            id, profile_id, file_name, file_path, mime_type, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending_review')`,
          [uuidv4(), userId, 'Tax Certificate', tax_certificate_url, 'application/pdf']
        );
      }
      
      if (org_structure_url) {
        await client.query(
          `INSERT INTO public.documents (
            id, profile_id, file_name, file_path, mime_type, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending_review')`,
          [uuidv4(), userId, 'Organization Structure', org_structure_url, 'application/pdf']
        );
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(userId, email);
    
    // Create user session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + (15 * 60 * 1000)); // 15 minutes from now
    await client.query(
      `INSERT INTO public.user_sessions (id, profile_id, session_token, refresh_token, expires_at, last_activity_at) 
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [sessionId, userId, accessToken, refreshToken, expiresAt]
    );
    
    res.status(201).json({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: Date.now() + (15 * 60 * 1000), // 15 minutes from now
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email_confirmed: profile.is_email_verified,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }
    });
    
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    console.error('Signup error:', error);
    
    // Provide more detailed error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        res.status(409).json({ 
          message: 'A record with this information already exists',
          code: 'DUPLICATE_ENTRY',
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      if (error.message.includes('violates foreign key constraint')) {
        res.status(400).json({ 
          message: 'Referenced record does not exist',
          code: 'FOREIGN_KEY_VIOLATION',
          timestamp: new Date().toISOString()
        });
        return;
      }
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
});

// Sign in endpoint
router.post('/signin', async (req: express.Request, res: express.Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ 
        message: 'Email and password are required',
        code: 'VALIDATION_ERROR',
        details: {
          fields: ['email', 'password']
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Get user profile
    const profileResult = await client.query(
      'SELECT * FROM public.profiles WHERE email = $1 AND is_active = true',
      [email]
    );
    
    if (profileResult.rows.length === 0) {
      res.status(401).json({ 
        message: 'Invalid credentials',
        code: 'AUTHENTICATION_ERROR',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    const profile = profileResult.rows[0];
    
    // Get password hash from password_history (latest entry)
    const passwordResult = await client.query(
      `SELECT password_hash FROM public.password_history 
       WHERE profile_id = $1 
       ORDER BY changed_at DESC 
       LIMIT 1`,
      [profile.id]
    );
    
    if (passwordResult.rows.length === 0) {
      res.status(401).json({ 
        message: 'Invalid credentials',
        code: 'AUTHENTICATION_ERROR',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    const { password_hash } = passwordResult.rows[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, password_hash);
    
    if (!isValidPassword) {
      // Increment failed login attempts
      await client.query(
        'UPDATE public.profiles SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1',
        [profile.id]
      );
      
      res.status(401).json({ 
        message: 'Invalid credentials',
        code: 'AUTHENTICATION_ERROR',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Check if account needs verification based on role
    if ((profile.role === 'therapist' || profile.role === 'org_admin') && !profile.is_email_verified) {
      res.status(403).json({ 
        message: 'Account pending verification. Please check your email for verification instructions.',
        code: 'VERIFICATION_REQUIRED',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(profile.id, profile.email);
    
    // Delete any existing sessions for this user
    await client.query(
      'DELETE FROM public.user_sessions WHERE profile_id = $1',
      [profile.id]
    );
    
    // Create new session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + (15 * 60 * 1000)); // 15 minutes from now
    await client.query(
      `INSERT INTO public.user_sessions (id, profile_id, session_token, refresh_token, expires_at, last_activity_at, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)`,
      [
        sessionId, 
        profile.id, 
        accessToken, 
        refreshToken, 
        expiresAt,
        req.ip || null,
        req.headers['user-agent'] || null
      ]
    );
    
    // Reset failed login attempts and update last login
    await client.query(
      'UPDATE public.profiles SET last_login_at = NOW(), failed_login_attempts = 0 WHERE id = $1',
      [profile.id]
    );
    
    // Get role-specific profile data
    let roleSpecificData = {};
    
    if (profile.role === 'individual') {
      const individualResult = await client.query(
        'SELECT * FROM public.individual_profiles WHERE id = $1',
        [profile.id]
      );
      
      if (individualResult.rows.length > 0) {
        const individual = individualResult.rows[0];
        roleSpecificData = {
          preferred_session_type: individual.preferred_session_type,
          preferred_therapist_gender: individual.preferred_therapist_gender,
          communication_pref: individual.communication_pref
        };
      }
    } else if (profile.role === 'therapist') {
      const therapistResult = await client.query(
        'SELECT status, specializations, languages_spoken, hourly_rate, currency FROM public.therapist_profiles WHERE id = $1',
        [profile.id]
      );
      
      if (therapistResult.rows.length > 0) {
        const therapist = therapistResult.rows[0];
        roleSpecificData = {
          status: therapist.status,
          specializations: therapist.specializations,
          languages_spoken: therapist.languages_spoken,
          hourly_rate: therapist.hourly_rate,
          currency: therapist.currency
        };
      }
    } else if (profile.role === 'org_admin') {
      const orgResult = await client.query(
        'SELECT organization_name, status FROM public.organization_profiles WHERE id = $1',
        [profile.id]
      );
      
      if (orgResult.rows.length > 0) {
        const org = orgResult.rows[0];
        roleSpecificData = {
          organization_name: org.organization_name,
          status: org.status
        };
      }
    }
    
    // Log successful login
    await client.query(
      `INSERT INTO public.audit_logs (profile_id, action, resource_type, resource_id, ip_address, user_agent, details)
       VALUES ($1, 'login', 'session', $2, $3, $4, $5)`,
      [
        profile.id,
        sessionId,
        req.ip || null,
        req.headers['user-agent'] || null,
        JSON.stringify({ method: 'password' })
      ]
    );
    
    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: Date.now() + (15 * 60 * 1000), // 15 minutes from now
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email_confirmed: profile.is_email_verified,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        last_login_at: profile.last_login_at,
        ...roleSpecificData
      }
    });
    
  } catch (error: unknown) {
    console.error('Signin error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
});

// Sign out endpoint
router.post('/signout', async (req: express.Request, res: express.Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      
      // Delete user session
      await client.query(
        'DELETE FROM public.user_sessions WHERE profile_id = $1',
        [decoded.userId]
      );
      
      res.json({ message: 'Signed out successfully' });
      
    } catch (jwtError: unknown) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    
  } catch (error: unknown) {
    console.error('Signout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Refresh token endpoint
router.post('/refresh', async (req: express.Request, res: express.Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      res.status(400).json({ message: 'Refresh token is required' });
      return;
    }
    
    // Verify refresh token and get session
    const sessionResult = await client.query(
      `SELECT us.profile_id, p.email, p.first_name, p.last_name, p.role 
       FROM public.user_sessions us
       JOIN public.profiles p ON us.profile_id = p.id
       WHERE us.refresh_token = $1 AND p.is_active = true`,
      [refresh_token]
    );
    
    if (sessionResult.rows.length === 0) {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
      return;
    }
    
    const session = sessionResult.rows[0];
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(session.profile_id, session.email);
    
    // Update session with new tokens
    const expiresAt = new Date(Date.now() + (15 * 60 * 1000)); // 15 minutes from now
    await client.query(
      `UPDATE public.user_sessions 
       SET session_token = $1, refresh_token = $2, expires_at = $3, last_activity_at = NOW() 
       WHERE profile_id = $4`,
      [accessToken, newRefreshToken, expiresAt, session.profile_id]
    );
    
    res.json({
      access_token: accessToken,
      refresh_token: newRefreshToken,
      expires_at: Date.now() + (15 * 60 * 1000),
      user: {
        id: session.profile_id,
        email: session.email,
        role: session.role,
        first_name: session.first_name,
        last_name: session.last_name
      }
    });
    
  } catch (error: unknown) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Reset password endpoint
router.post('/reset-password', async (req: express.Request, res: express.Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }
    
    // Check if user exists
    const userResult = await client.query(
      'SELECT id FROM public.profiles WHERE email = $1 AND is_active = true',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      // Don't reveal if user exists or not
      res.json({ message: 'If the email exists, a reset link has been sent' });
      return;
    }
    
    const userId = userResult.rows[0].id;
    
    // Generate reset token
    const resetToken = uuidv4();
    
    // Store reset token in verification_codes table
    await client.query(
      `INSERT INTO public.verification_codes (profile_id, code, purpose, expires_at) 
       VALUES ($1, $2, 'password_reset', NOW() + INTERVAL '1 hour')`,
      [userId, resetToken]
    );
    
    // TODO: Send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    res.json({ message: 'If the email exists, a reset link has been sent' });
    
  } catch (error: unknown) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Confirm email endpoint
router.post('/confirm-email', async (req: express.Request, res: express.Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400).json({ message: 'Token is required' });
      return;
    }
    
    // Find and validate the verification token
    const tokenResult = await client.query(
      `SELECT profile_id FROM public.verification_codes 
       WHERE code = $1 AND purpose = 'email_verification' 
       AND expires_at > NOW() AND is_used = false`,
      [token]
    );
    
    if (tokenResult.rows.length === 0) {
      res.status(400).json({ message: 'Invalid or expired token' });
      return;
    }
    
    const profileId = tokenResult.rows[0].profile_id;
    
    // Start transaction
    await client.query('BEGIN');
    
    // Mark email as verified
    await client.query(
      'UPDATE public.profiles SET is_email_verified = true WHERE id = $1',
      [profileId]
    );
    
    // Mark token as used
    await client.query(
      'UPDATE public.verification_codes SET is_used = true, used_at = NOW() WHERE code = $1',
      [token]
    );
    
    // Commit transaction
    await client.query('COMMIT');
    
    res.json({ message: 'Email confirmed successfully' });
    
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    console.error('Confirm email error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Complete password reset endpoint
router.post('/reset-password-complete', async (req: express.Request, res: express.Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { token, new_password } = req.body;
    
    if (!token || !new_password) {
      res.status(400).json({ message: 'Token and new password are required' });
      return;
    }
    
    // Validate password strength
    if (new_password.length < 8) {
      res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
      return;
    }
    
    // Find and validate the reset token
    const tokenResult = await client.query(
      `SELECT profile_id FROM public.verification_codes 
       WHERE code = $1 AND purpose = 'password_reset' 
       AND expires_at > NOW() AND is_used = false`,
      [token]
    );
    
    if (tokenResult.rows.length === 0) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }
    
    const profileId = tokenResult.rows[0].profile_id;
    
    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);
    
    // Start transaction
    await client.query('BEGIN');
    
    // Update password in password_history
    await client.query(
      `INSERT INTO public.password_history (profile_id, password_hash, changed_at) 
       VALUES ($1, $2, NOW())`,
      [profileId, hashedPassword]
    );
    
    // Update password_changed_at in profiles
    await client.query(
      'UPDATE public.profiles SET password_changed_at = NOW() WHERE id = $1',
      [profileId]
    );
    
    // Mark token as used
    await client.query(
      'UPDATE public.verification_codes SET is_used = true, used_at = NOW() WHERE code = $1',
      [token]
    );
    
    // Invalidate all existing sessions for this user
    await client.query(
      'UPDATE public.user_sessions SET is_active = false WHERE profile_id = $1',
      [profileId]
    );
    
    // Commit transaction
    await client.query('COMMIT');
    
    res.json({ message: 'Password reset successfully' });
    
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    console.error('Reset password complete error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;
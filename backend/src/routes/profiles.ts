// Profile Management Routes for PostgreSQL Backend
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../database';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get user profile endpoint
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    if (!req.user) {
      res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTHENTICATION_ERROR',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Get base profile data
    const profileResult = await client.query(
      'SELECT * FROM public.profiles WHERE id = $1',
      [req.user.userId]
    );
    
    if (profileResult.rows.length === 0) {
      res.status(404).json({ 
        message: 'Profile not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    const profile = profileResult.rows[0];
    
    // Get role-specific profile data
    let roleSpecificData = {};
    
    if (profile.role === 'individual') {
      const individualResult = await client.query(
        'SELECT * FROM public.individual_profiles WHERE id = $1',
        [req.user.userId]
      );
      
      if (individualResult.rows.length > 0) {
        roleSpecificData = individualResult.rows[0];
      }
    } else if (profile.role === 'therapist') {
      const therapistResult = await client.query(
        'SELECT * FROM public.therapist_profiles WHERE id = $1',
        [req.user.userId]
      );
      
      if (therapistResult.rows.length > 0) {
        roleSpecificData = therapistResult.rows[0];
      }
    } else if (profile.role === 'org_admin') {
      const orgResult = await client.query(
        'SELECT * FROM public.organization_profiles WHERE id = $1',
        [req.user.userId]
      );
      
      if (orgResult.rows.length > 0) {
        roleSpecificData = orgResult.rows[0];
      }
    }
    
    // Get documents
    const documentsResult = await client.query(
      'SELECT id, file_name, file_path, mime_type, status, created_at FROM public.documents WHERE profile_id = $1',
      [req.user.userId]
    );
    
    const documents = documentsResult.rows;
    
    res.json({
      ...profile,
      role_data: roleSpecificData,
      documents
    });
    
  } catch (error: unknown) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
});

// Update user profile endpoint
router.patch('/', authenticateToken, async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    if (!req.user) {
      res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTHENTICATION_ERROR',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    const { 
      base_profile = {}, 
      role_data = {} 
    } = req.body;
    
    // Start transaction
    await client.query('BEGIN');
    
    // Get current profile to determine role
    const profileResult = await client.query(
      'SELECT role FROM public.profiles WHERE id = $1',
      [req.user.userId]
    );
    
    if (profileResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ 
        message: 'Profile not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    const { role } = profileResult.rows[0];
    
    // Update base profile if provided
    if (Object.keys(base_profile).length > 0) {
      // Filter out fields that shouldn't be updated
      const allowedFields = [
        'first_name', 'last_name', 'phone_number', 'date_of_birth',
        'gender', 'country', 'preferred_language', 'profile_photo_url'
      ];
      
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;
      
      Object.entries(base_profile).forEach(([key, value]) => {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = $${paramIndex}`);
          updateValues.push(value);
          paramIndex++;
        }
      });
      
      if (updateFields.length > 0) {
        updateFields.push(`updated_at = NOW()`);
        
        const updateQuery = `
          UPDATE public.profiles 
          SET ${updateFields.join(', ')} 
          WHERE id = $${paramIndex} 
          RETURNING *
        `;
        
        updateValues.push(req.user.userId);
        
        await client.query(updateQuery, updateValues);
      }
    }
    
    // Update role-specific profile if provided
    if (Object.keys(role_data).length > 0) {
      if (role === 'individual') {
        const allowedFields = [
          'mental_health_history', 'therapy_goals', 'communication_pref',
          'opt_in_newsletter', 'opt_in_sms', 'emergency_contact_name',
          'emergency_contact_phone', 'preferred_therapist_gender',
          'preferred_session_type', 'medical_history', 'current_medications',
          'session_preferences'
        ];
        
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramIndex = 1;
        
        Object.entries(role_data).forEach(([key, value]) => {
          if (allowedFields.includes(key)) {
            updateFields.push(`${key} = $${paramIndex}`);
            updateValues.push(value);
            paramIndex++;
          }
        });
        
        if (updateFields.length > 0) {
          updateFields.push(`updated_at = NOW()`);
          
          const updateQuery = `
            UPDATE public.individual_profiles 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramIndex} 
            RETURNING *
          `;
          
          updateValues.push(req.user.userId);
          
          await client.query(updateQuery, updateValues);
        }
      } else if (role === 'therapist') {
        const allowedFields = [
          'license_expiry_date', 'insurance_provider', 'insurance_policy_number',
          'insurance_expiry_date', 'years_experience', 'specializations',
          'languages_spoken', 'education_background', 'certifications',
          'hourly_rate', 'currency', 'bio', 'availability'
        ];
        
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramIndex = 1;
        
        Object.entries(role_data).forEach(([key, value]) => {
          if (allowedFields.includes(key)) {
            updateFields.push(`${key} = $${paramIndex}`);
            updateValues.push(value);
            paramIndex++;
          }
        });
        
        if (updateFields.length > 0) {
          updateFields.push(`updated_at = NOW()`);
          
          const updateQuery = `
            UPDATE public.therapist_profiles 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramIndex} 
            RETURNING *
          `;
          
          updateValues.push(req.user.userId);
          
          await client.query(updateQuery, updateValues);
        }
      } else if (role === 'org_admin') {
        const allowedFields = [
          'num_employees', 'official_website', 'address', 'city',
          'state', 'postal_code', 'billing_contact_email',
          'billing_contact_phone', 'service_requirements'
        ];
        
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramIndex = 1;
        
        Object.entries(role_data).forEach(([key, value]) => {
          if (allowedFields.includes(key)) {
            updateFields.push(`${key} = $${paramIndex}`);
            updateValues.push(value);
            paramIndex++;
          }
        });
        
        if (updateFields.length > 0) {
          updateFields.push(`updated_at = NOW()`);
          
          const updateQuery = `
            UPDATE public.organization_profiles 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramIndex} 
            RETURNING *
          `;
          
          updateValues.push(req.user.userId);
          
          await client.query(updateQuery, updateValues);
        }
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Get updated profile data
    const updatedProfileResult = await client.query(
      'SELECT * FROM public.profiles WHERE id = $1',
      [req.user.userId]
    );
    
    let updatedRoleData = {};
    
    if (role === 'individual') {
      const individualResult = await client.query(
        'SELECT * FROM public.individual_profiles WHERE id = $1',
        [req.user.userId]
      );
      
      if (individualResult.rows.length > 0) {
        updatedRoleData = individualResult.rows[0];
      }
    } else if (role === 'therapist') {
      const therapistResult = await client.query(
        'SELECT * FROM public.therapist_profiles WHERE id = $1',
        [req.user.userId]
      );
      
      if (therapistResult.rows.length > 0) {
        updatedRoleData = therapistResult.rows[0];
      }
    } else if (role === 'org_admin') {
      const orgResult = await client.query(
        'SELECT * FROM public.organization_profiles WHERE id = $1',
        [req.user.userId]
      );
      
      if (orgResult.rows.length > 0) {
        updatedRoleData = orgResult.rows[0];
      }
    }
    
    res.json({
      ...updatedProfileResult.rows[0],
      role_data: updatedRoleData
    });
    
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    console.error('Update profile error:', error);
    
    res.status(500).json({ 
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
});

// Complete profile endpoint - for finishing registration
router.post('/complete', authenticateToken, async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    if (!req.user) {
      res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTHENTICATION_ERROR',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    const { 
      role_data = {},
      documents = {}
    } = req.body;
    
    // Start transaction
    await client.query('BEGIN');
    
    // Get current profile to determine role
    const profileResult = await client.query(
      'SELECT role FROM public.profiles WHERE id = $1',
      [req.user.userId]
    );
    
    if (profileResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ 
        message: 'Profile not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    const { role } = profileResult.rows[0];
    
    // Process role-specific completion data
    if (role === 'therapist') {
      // Check if required fields are provided
      const requiredFields = ['license_number', 'national_id_number', 'license_body'];
      const missingFields = requiredFields.filter(field => !role_data[field]);
      
      if (missingFields.length > 0) {
        await client.query('ROLLBACK');
        res.status(400).json({ 
          message: 'Missing required fields for therapist profile completion',
          code: 'VALIDATION_ERROR',
          details: {
            missing_fields: missingFields
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
      
      // Create a JSONB object for uploaded documents
      const uploadedDocuments = {
        license: license_document_url ? true : false,
        insurance: insurance_document_url ? true : false,
        id: id_document_url ? true : false,
        other: other_documents_urls ? true : false
      };
      
      // Update therapist profile
      await client.query(
        `UPDATE public.therapist_profiles 
         SET 
           license_number = $1,
           national_id_number = $2,
           license_body = $3,
           license_expiry_date = $4,
           insurance_provider = $5,
           insurance_policy_number = $6,
           insurance_expiry_date = $7,
           years_experience = $8,
           specializations = $9,
           languages_spoken = $10,
           education_background = $11,
           certifications = $12,
           bio = $13,
           hourly_rate = $14,
           currency = $15,
           license_document_url = $16,
           insurance_document_url = $17,
           id_document_url = $18,
           other_documents_urls = $19,
           uploaded_documents = $20,
           updated_at = NOW()
         WHERE id = $21`,
        [
          role_data.license_number,
          role_data.national_id_number,
          role_data.license_body,
          role_data.license_expiry_date,
          role_data.insurance_provider,
          role_data.insurance_policy_number,
          role_data.insurance_expiry_date,
          role_data.years_experience || 0,
          role_data.specializations || ['General'],
          role_data.languages_spoken || ['English'],
          role_data.education_background,
          role_data.certifications,
          role_data.bio,
          role_data.hourly_rate,
          role_data.currency || 'USD',
          license_document_url,
          insurance_document_url,
          id_document_url,
          other_documents_urls,
          JSON.stringify(uploadedDocuments),
          req.user.userId
        ]
      );
      
      // Create document entries for each uploaded document
      if (license_document_url) {
        await client.query(
          `INSERT INTO public.documents (
            id, profile_id, file_name, file_path, mime_type, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending_review')`,
          [uuidv4(), req.user.userId, 'License Document', license_document_url, 'application/pdf']
        );
      }
      
      if (insurance_document_url) {
        await client.query(
          `INSERT INTO public.documents (
            id, profile_id, file_name, file_path, mime_type, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending_review')`,
          [uuidv4(), req.user.userId, 'Insurance Document', insurance_document_url, 'application/pdf']
        );
      }
      
      if (id_document_url) {
        await client.query(
          `INSERT INTO public.documents (
            id, profile_id, file_name, file_path, mime_type, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending_review')`,
          [uuidv4(), req.user.userId, 'ID Document', id_document_url, 'application/pdf']
        );
      }
    } else if (role === 'org_admin') {
      // Check if required fields are provided
      const requiredFields = [
        'organization_name', 'registration_number', 'tax_id_number',
        'representative_name', 'representative_job_title', 'representative_national_id'
      ];
      
      const missingFields = requiredFields.filter(field => !role_data[field]);
      
      if (missingFields.length > 0) {
        await client.query('ROLLBACK');
        res.status(400).json({ 
          message: 'Missing required fields for organization profile completion',
          code: 'VALIDATION_ERROR',
          details: {
            missing_fields: missingFields
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
      
      // Update organization profile
      await client.query(
        `UPDATE public.organization_profiles 
         SET 
           organization_name = $1,
           organization_type = $2,
           registration_number = $3,
           date_of_establishment = $4,
           tax_id_number = $5,
           num_employees = $6,
           official_website = $7,
           address = $8,
           city = $9,
           state = $10,
           postal_code = $11,
           representative_name = $12,
           representative_job_title = $13,
           representative_national_id = $14,
           billing_contact_email = $15,
           billing_contact_phone = $16,
           service_requirements = $17,
           proof_registration_url = $18,
           auth_letter_url = $19,
           tax_certificate_url = $20,
           org_structure_url = $21,
           uploaded_documents = $22,
           updated_at = NOW()
         WHERE id = $23`,
        [
          role_data.organization_name,
          role_data.organization_type || 'private_company',
          role_data.registration_number,
          role_data.date_of_establishment,
          role_data.tax_id_number,
          role_data.num_employees || 1,
          role_data.official_website,
          role_data.address,
          role_data.city,
          role_data.state,
          role_data.postal_code,
          role_data.representative_name,
          role_data.representative_job_title,
          role_data.representative_national_id,
          role_data.billing_contact_email,
          role_data.billing_contact_phone,
          role_data.service_requirements || {},
          proof_registration_url,
          auth_letter_url,
          tax_certificate_url,
          org_structure_url,
          JSON.stringify(uploadedDocuments),
          req.user.userId
        ]
      );
      
      // Create document entries for each uploaded document
      if (proof_registration_url) {
        await client.query(
          `INSERT INTO public.documents (
            id, profile_id, file_name, file_path, mime_type, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending_review')`,
          [uuidv4(), req.user.userId, 'Proof of Registration', proof_registration_url, 'application/pdf']
        );
      }
      
      if (auth_letter_url) {
        await client.query(
          `INSERT INTO public.documents (
            id, profile_id, file_name, file_path, mime_type, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending_review')`,
          [uuidv4(), req.user.userId, 'Authorization Letter', auth_letter_url, 'application/pdf']
        );
      }
      
      if (tax_certificate_url) {
        await client.query(
          `INSERT INTO public.documents (
            id, profile_id, file_name, file_path, mime_type, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending_review')`,
          [uuidv4(), req.user.userId, 'Tax Certificate', tax_certificate_url, 'application/pdf']
        );
      }
      
      if (org_structure_url) {
        await client.query(
          `INSERT INTO public.documents (
            id, profile_id, file_name, file_path, mime_type, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending_review')`,
          [uuidv4(), req.user.userId, 'Organization Structure', org_structure_url, 'application/pdf']
        );
      }
    } else if (role === 'individual') {
      // Update individual profile with additional information
      await client.query(
        `UPDATE public.individual_profiles 
         SET 
           mental_health_history = $1,
           therapy_goals = $2,
           communication_pref = $3,
           opt_in_newsletter = $4,
           opt_in_sms = $5,
           emergency_contact_name = $6,
           emergency_contact_phone = $7,
           preferred_therapist_gender = $8,
           preferred_session_type = $9,
           medical_history = $10,
           current_medications = $11,
           session_preferences = $12,
           updated_at = NOW()
         WHERE id = $13`,
        [
          role_data.mental_health_history,
          role_data.therapy_goals || [],
          role_data.communication_pref || 'email',
          role_data.opt_in_newsletter || false,
          role_data.opt_in_sms || false,
          role_data.emergency_contact_name,
          role_data.emergency_contact_phone,
          role_data.preferred_therapist_gender,
          role_data.preferred_session_type || 'virtual',
          role_data.medical_history,
          role_data.current_medications,
          role_data.session_preferences || {},
          req.user.userId
        ]
      );
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    res.json({
      message: 'Profile completed successfully',
      profile_id: req.user.userId,
      role
    });
    
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    console.error('Complete profile error:', error);
    
    res.status(500).json({ 
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
});

export default router;
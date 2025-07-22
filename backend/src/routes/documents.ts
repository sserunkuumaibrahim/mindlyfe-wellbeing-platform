// Document Upload Routes for PostgreSQL Backend
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../database';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Upload document endpoint
router.post('/upload', authenticateToken, async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { 
      document_type, 
      file_name, 
      file_path, 
      mime_type = 'application/pdf',
      category = 'verification'
    } = req.body;
    
    if (!req.user) {
      res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTHENTICATION_ERROR',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    if (!document_type || !file_name || !file_path) {
      res.status(400).json({ 
        message: 'Document type, file name, and file path are required',
        code: 'VALIDATION_ERROR',
        details: {
          fields: ['document_type', 'file_name', 'file_path']
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    // Create document record
    const documentId = uuidv4();
    const documentResult = await client.query(
      `INSERT INTO public.documents (
        id, profile_id, file_name, file_path, mime_type, status
      ) VALUES ($1, $2, $3, $4, $5, 'pending_review')
      RETURNING *`,
      [documentId, req.user.userId, file_name, file_path, mime_type]
    );
    
    const document = documentResult.rows[0];
    
    // Update profile-specific document fields based on user role and document type
    const profileResult = await client.query(
      'SELECT role FROM public.profiles WHERE id = $1',
      [req.user.userId]
    );
    
    if (profileResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ 
        message: 'User profile not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    const { role } = profileResult.rows[0];
    
    if (role === 'therapist') {
      // Update therapist profile with document URL
      if (document_type === 'license') {
        await client.query(
          'UPDATE public.therapist_profiles SET license_document_url = $1 WHERE id = $2',
          [file_path, req.user.userId]
        );
      } else if (document_type === 'insurance') {
        await client.query(
          'UPDATE public.therapist_profiles SET insurance_document_url = $1 WHERE id = $2',
          [file_path, req.user.userId]
        );
      } else if (document_type === 'id') {
        await client.query(
          'UPDATE public.therapist_profiles SET id_document_url = $1 WHERE id = $2',
          [file_path, req.user.userId]
        );
      } else if (document_type === 'other') {
        await client.query(
          'UPDATE public.therapist_profiles SET other_documents_urls = $1 WHERE id = $2',
          [file_path, req.user.userId]
        );
      }
      
      // Update uploaded_documents JSONB field
      await client.query(
        `UPDATE public.therapist_profiles 
         SET uploaded_documents = uploaded_documents || jsonb_build_object($1, true) 
         WHERE id = $2`,
        [document_type, req.user.userId]
      );
    } else if (role === 'org_admin') {
      // Update organization profile with document URL
      if (document_type === 'registration') {
        await client.query(
          'UPDATE public.organization_profiles SET proof_registration_url = $1 WHERE id = $2',
          [file_path, req.user.userId]
        );
      } else if (document_type === 'authorization') {
        await client.query(
          'UPDATE public.organization_profiles SET auth_letter_url = $1 WHERE id = $2',
          [file_path, req.user.userId]
        );
      } else if (document_type === 'tax') {
        await client.query(
          'UPDATE public.organization_profiles SET tax_certificate_url = $1 WHERE id = $2',
          [file_path, req.user.userId]
        );
      } else if (document_type === 'structure') {
        await client.query(
          'UPDATE public.organization_profiles SET org_structure_url = $1 WHERE id = $2',
          [file_path, req.user.userId]
        );
      }
      
      // Update uploaded_documents JSONB field
      await client.query(
        `UPDATE public.organization_profiles 
         SET uploaded_documents = uploaded_documents || jsonb_build_object($1, true) 
         WHERE id = $2`,
        [document_type, req.user.userId]
      );
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        file_name: document.file_name,
        file_path: document.file_path,
        status: document.status,
        created_at: document.created_at
      }
    });
    
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    console.error('Document upload error:', error);
    
    res.status(500).json({ 
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
});

// Get user documents endpoint
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
    
    const documentsResult = await client.query(
      'SELECT * FROM public.documents WHERE profile_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    
    res.json(documentsResult.rows);
    
  } catch (error: unknown) {
    console.error('Get documents error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
});

// Delete document endpoint
router.delete('/:documentId', authenticateToken, async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { documentId } = req.params;
    
    if (!req.user) {
      res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTHENTICATION_ERROR',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Check if document exists and belongs to the user
    const documentResult = await client.query(
      'SELECT * FROM public.documents WHERE id = $1 AND profile_id = $2',
      [documentId, req.user.userId]
    );
    
    if (documentResult.rows.length === 0) {
      res.status(404).json({ 
        message: 'Document not found or access denied',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    const document = documentResult.rows[0];
    
    // Start transaction
    await client.query('BEGIN');
    
    // Delete document record
    await client.query(
      'DELETE FROM public.documents WHERE id = $1',
      [documentId]
    );
    
    // Update profile-specific document fields based on user role and document path
    const profileResult = await client.query(
      'SELECT role FROM public.profiles WHERE id = $1',
      [req.user.userId]
    );
    
    const { role } = profileResult.rows[0];
    const filePath = document.file_path;
    
    if (role === 'therapist') {
      // Check which document field matches the file path
      const therapistResult = await client.query(
        `SELECT 
          CASE 
            WHEN license_document_url = $1 THEN 'license'
            WHEN insurance_document_url = $1 THEN 'insurance'
            WHEN id_document_url = $1 THEN 'id'
            WHEN other_documents_urls = $1 THEN 'other'
            ELSE NULL
          END as document_type
        FROM public.therapist_profiles WHERE id = $2`,
        [filePath, req.user.userId]
      );
      
      if (therapistResult.rows.length > 0 && therapistResult.rows[0].document_type) {
        const documentType = therapistResult.rows[0].document_type;
        
        // Clear the specific document URL
        const updateField = `${documentType}_document_url`;
        await client.query(
          `UPDATE public.therapist_profiles SET ${updateField} = NULL WHERE id = $1`,
          [req.user.userId]
        );
        
        // Update uploaded_documents JSONB field
        await client.query(
          `UPDATE public.therapist_profiles 
           SET uploaded_documents = uploaded_documents - $1
           WHERE id = $2`,
          [documentType, req.user.userId]
        );
      }
    } else if (role === 'org_admin') {
      // Check which document field matches the file path
      const orgResult = await client.query(
        `SELECT 
          CASE 
            WHEN proof_registration_url = $1 THEN 'registration'
            WHEN auth_letter_url = $1 THEN 'authorization'
            WHEN tax_certificate_url = $1 THEN 'tax'
            WHEN org_structure_url = $1 THEN 'structure'
            ELSE NULL
          END as document_type
        FROM public.organization_profiles WHERE id = $2`,
        [filePath, req.user.userId]
      );
      
      if (orgResult.rows.length > 0 && orgResult.rows[0].document_type) {
        const documentType = orgResult.rows[0].document_type;
        
        // Clear the specific document URL
        let updateField = '';
        if (documentType === 'registration') updateField = 'proof_registration_url';
        else if (documentType === 'authorization') updateField = 'auth_letter_url';
        else if (documentType === 'tax') updateField = 'tax_certificate_url';
        else if (documentType === 'structure') updateField = 'org_structure_url';
        
        await client.query(
          `UPDATE public.organization_profiles SET ${updateField} = NULL WHERE id = $1`,
          [req.user.userId]
        );
        
        // Update uploaded_documents JSONB field
        await client.query(
          `UPDATE public.organization_profiles 
           SET uploaded_documents = uploaded_documents - $1
           WHERE id = $2`,
          [documentType, req.user.userId]
        );
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    res.json({
      message: 'Document deleted successfully'
    });
    
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    console.error('Delete document error:', error);
    
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
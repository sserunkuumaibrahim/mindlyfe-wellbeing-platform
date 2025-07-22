import { Request, Response } from 'express';
import { db } from '../database';
import { sendError } from '../utils/error';

export const getAllTherapists = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.first_name,
        p.last_name,
        p.profile_photo_url,
        tp.specializations,
        tp.languages_spoken,
        tp.years_experience,
        tp.bio,
        tp.license_number,
        tp.license_body
      FROM profiles p
      INNER JOIN therapist_profiles tp ON p.id = tp.id
      WHERE p.role = 'therapist' AND p.is_active = true
      LIMIT 50
    `;

    const result = await db.query(query);
    const therapists = result.rows.map(row => ({
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      profile_photo_url: row.profile_photo_url,
      specializations: Array.isArray(row.specializations) ? row.specializations : [],
      languages_spoken: Array.isArray(row.languages_spoken) ? row.languages_spoken : [],
      years_experience: row.years_experience || 0,
      bio: row.bio,
      license_number: row.license_number || '',
      license_body: row.license_body || ''
    }));

    res.json(therapists);
  } catch (error) {
    console.error('Error fetching therapists:', error);
    sendError(res, 'Error fetching therapists', 'THERAPIST_FETCH_FAILED');
  }
};

export const searchTherapists = async (req: Request, res: Response) => {
  const { specialization, language, availability } = req.query;

  try {
    let query = 'SELECT * FROM therapist_profiles WHERE 1=1';
    const params: string[] = [];
    let paramCount = 0;

    if (specialization && typeof specialization === 'string') {
      paramCount++;
      query += ` AND specializations LIKE $${paramCount}`;
      params.push(`%${specialization}%`);
    }

    if (language && typeof language === 'string') {
      paramCount++;
      query += ` AND languages_spoken LIKE $${paramCount}`;
      params.push(`%${language}%`);
    }

    const therapists = await db.query(query, params);

    res.json(therapists.rows);
  } catch (error) {
    console.error(error);
    sendError(res, 'Error searching therapists', 'THERAPIST_SEARCH_FAILED');
  }
};
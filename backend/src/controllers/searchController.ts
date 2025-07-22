import { Request, Response } from 'express';
import { db } from '../database';
import { sendError } from '../utils/error';

export const searchTherapists = async (req: Request, res: Response) => {
  const { specialization, language, availability } = req.body;

  try {
    let query = 'SELECT * FROM therapist_profiles WHERE 1=1';
    const params: string[] = [];
    let paramCount = 0;

    if (specialization) {
      paramCount++;
      query += ` AND specializations LIKE $${paramCount}`;
      params.push(`%${specialization}%`);
    }

    if (language) {
      paramCount++;
      query += ` AND languages_spoken LIKE $${paramCount}`;
      params.push(`%${language}%`);
    }

    // Availability filtering would be more complex and require joining with an availability table.
    // This is a simplified example.

    const therapists = await db.query(query, params);

    res.json(therapists.rows);
  } catch (error) {
    console.error(error);
    sendError(res, 'Error searching therapists', 'THERAPIST_SEARCH_FAILED');
  }
};
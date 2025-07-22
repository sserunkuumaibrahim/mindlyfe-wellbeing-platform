import { Request, Response } from 'express';
import { db } from '../database';
import { sendError } from '../utils/error';

export const searchTherapists = async (req: Request, res: Response) => {
  const { specialization, language, availability } = req.query;

  try {
    let query = 'SELECT * FROM therapist_profiles WHERE 1=1';
    const params = [];

    if (specialization) {
      query += ' AND specializations LIKE ?';
      params.push(`%${specialization}%`);
    }

    if (language) {
      query += ' AND languages_spoken LIKE ?';
      params.push(`%${language}%`);
    }

    const [therapists] = await db.query(query, params);

    res.json(therapists);
  } catch (error) {
    console.error(error);
    sendError(res, 'Error searching therapists', 'THERAPIST_SEARCH_FAILED');
  }
};
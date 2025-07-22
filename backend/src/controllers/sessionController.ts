import { Response } from 'express';
import { db } from '../database';
import { sendError } from '../utils/error';
import { AuthenticatedRequest } from '../types';

export const getSessions = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 'AUTH_REQUIRED', 401);
  }
  
  const { userId, role } = req.user;
  const { status } = req.query;

  try {
    let query = `
      SELECT s.*, 
             cp.first_name as client_first_name, cp.last_name as client_last_name, cp.profile_photo_url as client_photo,
             tp.first_name as therapist_first_name, tp.last_name as therapist_last_name, tp.profile_photo_url as therapist_photo
      FROM therapy_sessions s
      LEFT JOIN profiles cp ON s.client_id = cp.id
      LEFT JOIN profiles tp ON s.therapist_id = tp.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 0;

    // Filter by user role
    if (role === 'individual') {
      query += ` AND s.client_id = $${++paramCount}`;
      params.push(userId);
    } else if (role === 'therapist') {
      query += ` AND s.therapist_id = $${++paramCount}`;
      params.push(userId);
    } else {
      // For admin, show all sessions
    }

    // Filter by status if provided
    if (status && typeof status === 'string') {
      query += ` AND s.status = $${++paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY s.scheduled_at ASC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    sendError(res, 'Error fetching sessions', 'SESSIONS_FETCH_FAILED');
  }
};

export const bookSession = async (req: AuthenticatedRequest, res: Response) => {
  const { therapistId, scheduledAt } = req.body;
  
  if (!req.user) {
    return sendError(res, 'Authentication required', 'AUTH_REQUIRED', 401);
  }
  
  const { userId } = req.user;

  try {
    // Check for booking conflicts
    const existingSessions = await db.query(
      'SELECT * FROM therapy_sessions WHERE therapist_id = $1 AND scheduled_at = $2',
      [therapistId, scheduledAt]
    );

    if (existingSessions.rows.length > 0) {
      return sendError(res, 'Therapist is not available at this time', 'BOOKING_CONFLICT', 409);
    }

    // Create the session
    const result = await db.query(
      'INSERT INTO therapy_sessions (client_id, therapist_id, scheduled_at, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId, therapistId, scheduledAt, 'scheduled']
    );

    res.status(201).json({ 
      message: 'Session booked successfully', 
      sessionId: result.rows[0].id 
    });
  } catch (error) {
    console.error(error);
    sendError(res, 'Error booking session', 'BOOKING_FAILED');
  }
};
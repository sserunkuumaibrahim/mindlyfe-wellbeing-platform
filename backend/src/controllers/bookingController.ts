import { Response } from 'express';
import { db } from '../database';
import { sendError } from '../utils/error';
import { AuthenticatedRequest } from '../types';

export const bookSession = async (req: AuthenticatedRequest, res: Response) => {
  const { therapistId, sessionTime } = req.body;
  
  if (!req.user) {
    return sendError(res, 'Authentication required', 'AUTH_REQUIRED', 401);
  }
  
  const { userId } = req.user;

  try {
    // Check for booking conflicts
    const existingSessions = await db.query(
      'SELECT * FROM therapy_sessions WHERE therapist_id = $1 AND session_time = $2',
      [therapistId, sessionTime]
    );

    if (existingSessions.rows.length > 0) {
      return sendError(res, 'Therapist is not available at this time', 'BOOKING_CONFLICT', 409);
    }

    // Create the session
    await db.query(
      'INSERT INTO therapy_sessions (user_id, therapist_id, session_time) VALUES ($1, $2, $3)',
      [userId, therapistId, sessionTime]
    );

    res.status(201).json({ message: 'Session booked successfully' });
  } catch (error) {
    console.error(error);
    sendError(res, 'Error booking session', 'SESSION_BOOKING_FAILED');
  }
};
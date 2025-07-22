import { Request, Response } from 'express';
import { db } from '../database';
import { sendError } from '../utils/error';

export const bookSession = async (req: Request, res: Response) => {
  const { therapistId, scheduledAt } = req.body;
  const { userId } = req.user;

  try {
    // Check for booking conflicts
    const [existingSessions] = await db.query(
      'SELECT * FROM therapy_sessions WHERE therapist_id = ? AND scheduled_at = ?',
      [therapistId, scheduledAt]
    );

    if (existingSessions.length > 0) {
      return sendError(res, 'Therapist is not available at this time', 'BOOKING_CONFLICT', 409);
    }

    // Create the session
    const [result] = await db.query(
      'INSERT INTO therapy_sessions (user_id, therapist_id, scheduled_at, status) VALUES (?, ?, ?, ?)',
      [userId, therapistId, scheduledAt, 'scheduled']
    );

    res.status(201).json({ message: 'Session booked successfully', sessionId: result.insertId });
  } catch (error) {
    console.error(error);
    sendError(res, 'Error booking session', 'BOOKING_FAILED');
  }
};
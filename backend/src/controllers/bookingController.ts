import { Response } from 'express';
import { db } from '../database';
import { sendError } from '../utils/error';
import { AuthenticatedRequest } from '../types';

export const bookSession = async (req: AuthenticatedRequest, res: Response) => {
  const { 
    therapistId, 
    scheduledAt, 
    sessionType = 'virtual',
    location,
    notes,
    durationMinutes = 60,
    preferredMeetingType = 'video_call'
  } = req.body;
  
  if (!req.user) {
    return sendError(res, 'Authentication required', 'AUTH_REQUIRED', 401);
  }
  
  const { userId } = req.user;

  // Validation
  if (!therapistId || !scheduledAt) {
    return sendError(res, 'Therapist ID and scheduled time are required', 'VALIDATION_ERROR', 400);
  }

  try {
    // Check for booking conflicts
    const existingSessions = await db.query(
      'SELECT * FROM therapy_sessions WHERE therapist_id = $1 AND scheduled_at = $2',
      [therapistId, scheduledAt]
    );

    if (existingSessions.rows.length > 0) {
      return sendError(res, 'Therapist is not available at this time', 'BOOKING_CONFLICT', 409);
    }

    // Create the session with enhanced fields
    const result = await db.query(
      `INSERT INTO therapy_sessions 
       (client_id, therapist_id, scheduled_at, session_type, duration_minutes, status, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id`,
      [userId, therapistId, scheduledAt, sessionType, durationMinutes, 'scheduled', notes]
    );

    // If location is provided and session type is in-person, we could store it in a separate table or notes
    let sessionData: any = {
      message: 'Session booked successfully',
      sessionId: result.rows[0].id,
      scheduledAt,
      sessionType,
      durationMinutes
    };

    if (location && sessionType === 'in_person') {
      sessionData.location = location;
    }

    res.status(201).json(sessionData);
  } catch (error) {
    console.error(error);
    sendError(res, 'Error booking session', 'SESSION_BOOKING_FAILED');
  }
};
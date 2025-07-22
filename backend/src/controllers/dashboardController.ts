import { Response } from 'express';
import { db } from '../database';
import { sendError } from '../utils/error';
import { AuthenticatedRequest } from '../types';

export const getDashboardData = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  
  if (!req.user) {
    return sendError(res, 'Authentication required', 'AUTH_REQUIRED', 401);
  }
  
  const { role } = req.user;

  try {
    let dashboardData = {};

    if (role === 'individual') {
      // Get sessions for individual clients
      const sessions = await db.query('SELECT * FROM therapy_sessions WHERE client_id = $1', [userId]);
      const profile = await db.query('SELECT * FROM profiles WHERE id = $1', [userId]);
      const notifications = await db.query('SELECT * FROM notifications WHERE profile_id = $1', [userId]);
      dashboardData = { 
        sessions: sessions.rows, 
        profile: profile.rows[0], 
        notifications: notifications.rows 
      };
    } else if (role === 'therapist') {
      // Get sessions for therapists
      const sessions = await db.query('SELECT * FROM therapy_sessions WHERE therapist_id = $1', [userId]);
      const profile = await db.query('SELECT * FROM profiles WHERE id = $1', [userId]);
      const notifications = await db.query('SELECT * FROM notifications WHERE profile_id = $1', [userId]);
      dashboardData = { 
        sessions: sessions.rows, 
        profile: profile.rows[0], 
        notifications: notifications.rows 
      };
    } else if (role === 'org_admin') {
        // Get organization data for admins
        const organization = await db.query('SELECT * FROM organization_profiles WHERE admin_id = $1', [userId]);
        const notifications = await db.query('SELECT * FROM notifications WHERE profile_id = $1', [userId]);
        dashboardData = { 
          organization: organization.rows[0], 
          notifications: notifications.rows 
        };
    }

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    sendError(res, 'Error fetching dashboard data', 'DASHBOARD_FETCH_FAILED');
  }
};
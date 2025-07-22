import { Request, Response } from 'express';
import { db } from '../database';
import { sendError } from '../utils/error';

export const getDashboardData = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.user;

  try {
    let dashboardData = {};

    if (role === 'individual') {
      const [sessions] = await db.query('SELECT * FROM therapy_sessions WHERE user_id = ?', [userId]);
      const [profile] = await db.query('SELECT * FROM individual_profiles WHERE user_id = ?', [userId]);
      dashboardData = { sessions, profile };
    } else if (role === 'therapist') {
      const [sessions] = await db.query('SELECT * FROM therapy_sessions WHERE therapist_id = ?', [userId]);
      const [profile] = await db.query('SELECT * FROM therapist_profiles WHERE user_id = ?', [userId]);
      dashboardData = { sessions, profile };
    } else if (role === 'org_admin') {
        const [organization] = await db.query('SELECT * FROM organization_profiles WHERE admin_id = ?', [userId]);
        dashboardData = { organization };
    }

    res.json(dashboardData);
  } catch (error) {
    console.error(error);
    sendError(res, 'Error fetching dashboard data', 'DASHBOARD_FETCH_FAILED');
  }
};
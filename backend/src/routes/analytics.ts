// Analytics Routes for PostgreSQL Backend
import express from 'express';
import { pool } from '../database';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Track analytics event
router.post('/track', optionalAuth, async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { event_name, properties = {}, timestamp } = req.body;
    
    if (!event_name) {
      res.status(400).json({ message: 'Event name is required' });
      return;
    }
    
    const userId = req.user?.userId || null;
    const eventTimestamp = timestamp || new Date().toISOString();
    const ipAddress = req.ip || req.connection.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;
    
    // Check if analytics_events table exists, if not create it
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.analytics_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        session_id TEXT,
        event_name TEXT NOT NULL,
        properties JSONB DEFAULT '{}',
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    
    await client.query(
      `INSERT INTO public.analytics_events (
        user_id, event_name, properties, timestamp, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, event_name, JSON.stringify(properties), eventTimestamp, ipAddress, userAgent]
    );
    
    res.status(201).json({ message: 'Event tracked successfully' });
    
  } catch (error: unknown) {
    console.error('Analytics tracking error:', error);
    // If analytics fails, don't break the user experience
    res.status(200).json({ message: 'Event tracking skipped' });
  } finally {
    client.release();
  }
});

// Get analytics events
router.get('/events', authenticateToken, async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { days_back = 30 } = req.query;
    const daysBackNum = parseInt(days_back as string) || 30;
    
    // Only allow users to see their own analytics or admins to see all
    let query = `
      SELECT id, user_id, event_name, properties, timestamp, created_at
      FROM public.analytics_events 
      WHERE created_at >= NOW() - INTERVAL '${daysBackNum} days'
    `;
    
    const params: any[] = [];
    
    if (req.user?.role !== 'admin') {
      query += ' AND user_id = $1';
      params.push(req.user?.userId);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 1000';
    
    const result = await client.query(query, params);
    
    res.json(result.rows);
    
  } catch (error: unknown) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  } finally {
    client.release();
  }
});

// Get analytics summary
router.get('/summary', authenticateToken, async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { days_back = 30 } = req.query;
    const daysBackNum = parseInt(days_back as string) || 30;
    
    let whereClause = `WHERE created_at >= NOW() - INTERVAL '${daysBackNum} days'`;
    const params: any[] = [];
    
    if (req.user?.role !== 'admin') {
      whereClause += ' AND user_id = $1';
      params.push(req.user?.userId);
    }
    
    // Get event counts by type
    const eventCountsResult = await client.query(
      `SELECT event_name, COUNT(*) as count
       FROM public.analytics_events 
       ${whereClause}
       GROUP BY event_name
       ORDER BY count DESC`,
      params
    );
    
    // Get daily activity
    const dailyActivityResult = await client.query(
      `SELECT DATE(created_at) as date, COUNT(*) as events
       FROM public.analytics_events 
       ${whereClause}
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      params
    );
    
    // Get unique users (only for admins)
    let uniqueUsers = 0;
    if (req.user?.role === 'admin') {
      const uniqueUsersResult = await client.query(
        `SELECT COUNT(DISTINCT user_id) as unique_users
         FROM public.analytics_events 
         WHERE created_at >= NOW() - INTERVAL '${daysBackNum} days'
         AND user_id IS NOT NULL`
      );
      uniqueUsers = parseInt(uniqueUsersResult.rows[0]?.unique_users || '0');
    }
    
    res.json({
      eventCounts: eventCountsResult.rows,
      dailyActivity: dailyActivityResult.rows,
      uniqueUsers,
      period: `${daysBackNum} days`
    });
    
  } catch (error: unknown) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics summary' });
  } finally {
    client.release();
  }
});

export default router;
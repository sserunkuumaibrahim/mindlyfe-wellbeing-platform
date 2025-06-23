-- Analytics Database Functions for MindLyfe Platform
-- Run this in Supabase SQL Editor to create analytics functions

-- Create analytics_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Enable RLS on analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can insert their own analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own analytics events" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Admin policy for viewing all analytics (adjust as needed)
CREATE POLICY "Admins can view all analytics events" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Function to insert analytics events (batch insert)
CREATE OR REPLACE FUNCTION insert_analytics_event(events JSONB)
RETURNS VOID AS $$
BEGIN
  INSERT INTO analytics_events (
    event_name,
    user_id,
    session_id,
    properties,
    timestamp,
    page_url
  )
  SELECT 
    (event->>'event_name')::TEXT,
    CASE 
      WHEN event->>'user_id' IS NOT NULL AND event->>'user_id' != '' 
      THEN (event->>'user_id')::UUID 
      ELSE NULL 
    END,
    (event->>'session_id')::TEXT,
    COALESCE((event->'properties')::JSONB, '{}'::JSONB),
    (event->>'timestamp')::TIMESTAMPTZ,
    event->>'page_url'
  FROM jsonb_array_elements(events) AS event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get analytics events with date filtering
CREATE OR REPLACE FUNCTION get_analytics_events(
  days_back INTEGER DEFAULT 30,
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  event_name TEXT,
  user_id UUID,
  session_id TEXT,
  properties JSONB,
  timestamp TIMESTAMPTZ,
  page_url TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ae.id,
    ae.event_name,
    ae.user_id,
    ae.session_id,
    ae.properties,
    ae.timestamp,
    ae.page_url,
    ae.created_at
  FROM analytics_events ae
  WHERE 
    CASE 
      WHEN start_date IS NOT NULL AND end_date IS NOT NULL THEN
        ae.timestamp >= start_date AND ae.timestamp <= end_date
      ELSE
        ae.timestamp >= (NOW() - INTERVAL '1 day' * days_back)
    END
  ORDER BY ae.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user analytics summary
CREATE OR REPLACE FUNCTION get_user_analytics_summary(
  target_user_id UUID DEFAULT NULL,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_events BIGINT,
  unique_sessions BIGINT,
  page_views BIGINT,
  user_actions BIGINT,
  errors BIGINT,
  first_event TIMESTAMPTZ,
  last_event TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_events,
    COUNT(DISTINCT ae.session_id) as unique_sessions,
    COUNT(*) FILTER (WHERE ae.event_name = 'page_view') as page_views,
    COUNT(*) FILTER (WHERE ae.event_name = 'user_action') as user_actions,
    COUNT(*) FILTER (WHERE ae.event_name = 'error') as errors,
    MIN(ae.timestamp) as first_event,
    MAX(ae.timestamp) as last_event
  FROM analytics_events ae
  WHERE 
    (target_user_id IS NULL OR ae.user_id = target_user_id)
    AND ae.timestamp >= (NOW() - INTERVAL '1 day' * days_back);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get popular pages
CREATE OR REPLACE FUNCTION get_popular_pages(
  days_back INTEGER DEFAULT 30,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  page_url TEXT,
  view_count BIGINT,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ae.page_url, 'Unknown') as page_url,
    COUNT(*) as view_count,
    COUNT(DISTINCT ae.user_id) as unique_users
  FROM analytics_events ae
  WHERE 
    ae.event_name = 'page_view'
    AND ae.timestamp >= (NOW() - INTERVAL '1 day' * days_back)
  GROUP BY ae.page_url
  ORDER BY view_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user actions summary
CREATE OR REPLACE FUNCTION get_user_actions_summary(
  days_back INTEGER DEFAULT 30,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  action_name TEXT,
  action_count BIGINT,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ae.properties->>'action', 'Unknown') as action_name,
    COUNT(*) as action_count,
    COUNT(DISTINCT ae.user_id) as unique_users
  FROM analytics_events ae
  WHERE 
    ae.event_name = 'user_action'
    AND ae.timestamp >= (NOW() - INTERVAL '1 day' * days_back)
  GROUP BY ae.properties->>'action'
  ORDER BY action_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily analytics stats
CREATE OR REPLACE FUNCTION get_daily_analytics_stats(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  date_day DATE,
  total_events BIGINT,
  unique_users BIGINT,
  unique_sessions BIGINT,
  page_views BIGINT,
  user_actions BIGINT,
  errors BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ae.timestamp::DATE as date_day,
    COUNT(*) as total_events,
    COUNT(DISTINCT ae.user_id) as unique_users,
    COUNT(DISTINCT ae.session_id) as unique_sessions,
    COUNT(*) FILTER (WHERE ae.event_name = 'page_view') as page_views,
    COUNT(*) FILTER (WHERE ae.event_name = 'user_action') as user_actions,
    COUNT(*) FILTER (WHERE ae.event_name = 'error') as errors
  FROM analytics_events ae
  WHERE ae.timestamp >= (NOW() - INTERVAL '1 day' * days_back)
  GROUP BY ae.timestamp::DATE
  ORDER BY date_day DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION insert_analytics_event(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_analytics_events(INTEGER, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_analytics_summary(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_popular_pages(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_actions_summary(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_analytics_stats(INTEGER) TO authenticated;

-- Create a view for easier analytics querying
CREATE OR REPLACE VIEW analytics_dashboard_view AS
SELECT 
  ae.id,
  ae.event_name,
  ae.user_id,
  ae.session_id,
  ae.properties,
  ae.timestamp,
  ae.page_url,
  ae.created_at,
  p.user_type,
  p.full_name
FROM analytics_events ae
LEFT JOIN profiles p ON ae.user_id = p.user_id
WHERE ae.timestamp >= (NOW() - INTERVAL '90 days');

-- Grant access to the view
GRANT SELECT ON analytics_dashboard_view TO authenticated;

-- Create a function to clean up old analytics data (optional)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events(
  days_to_keep INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM analytics_events 
  WHERE created_at < (NOW() - INTERVAL '1 day' * days_to_keep);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission for cleanup function (typically for admins only)
GRANT EXECUTE ON FUNCTION cleanup_old_analytics_events(INTEGER) TO authenticated;

COMMIT;
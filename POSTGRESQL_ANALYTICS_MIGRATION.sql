-- PostgreSQL Analytics Migration Script
-- This script creates the analytics system for PostgreSQL

-- Analytics events table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    page_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_page_url ON analytics_events(page_url);

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
                ae.timestamp >= NOW() - (days_back || ' days')::INTERVAL
        END
    ORDER BY ae.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user analytics summary
CREATE OR REPLACE FUNCTION get_user_analytics_summary(
    target_user_id UUID,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_events BIGINT,
    unique_sessions BIGINT,
    first_event TIMESTAMPTZ,
    last_event TIMESTAMPTZ,
    top_events JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH user_events AS (
        SELECT *
        FROM analytics_events
        WHERE user_id = target_user_id
        AND timestamp >= NOW() - (days_back || ' days')::INTERVAL
    ),
    event_counts AS (
        SELECT event_name, COUNT(*) as count
        FROM user_events
        GROUP BY event_name
        ORDER BY count DESC
        LIMIT 10
    )
    SELECT 
        (SELECT COUNT(*) FROM user_events)::BIGINT,
        (SELECT COUNT(DISTINCT session_id) FROM user_events)::BIGINT,
        (SELECT MIN(timestamp) FROM user_events),
        (SELECT MAX(timestamp) FROM user_events),
        (SELECT jsonb_agg(jsonb_build_object('event_name', event_name, 'count', count)) FROM event_counts);
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
        ae.page_url,
        COUNT(*)::BIGINT as view_count,
        COUNT(DISTINCT ae.user_id)::BIGINT as unique_users
    FROM analytics_events ae
    WHERE ae.page_url IS NOT NULL
    AND ae.timestamp >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY ae.page_url
    ORDER BY view_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user actions summary
CREATE OR REPLACE FUNCTION get_user_actions_summary(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    event_name TEXT,
    total_count BIGINT,
    unique_users BIGINT,
    avg_per_user NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ae.event_name,
        COUNT(*)::BIGINT as total_count,
        COUNT(DISTINCT ae.user_id)::BIGINT as unique_users,
        ROUND(COUNT(*)::NUMERIC / NULLIF(COUNT(DISTINCT ae.user_id), 0), 2) as avg_per_user
    FROM analytics_events ae
    WHERE ae.timestamp >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY ae.event_name
    ORDER BY total_count DESC;
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
    unique_sessions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ae.timestamp::DATE as date_day,
        COUNT(*)::BIGINT as total_events,
        COUNT(DISTINCT ae.user_id)::BIGINT as unique_users,
        COUNT(DISTINCT ae.session_id)::BIGINT as unique_sessions
    FROM analytics_events ae
    WHERE ae.timestamp >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY ae.timestamp::DATE
    ORDER BY date_day DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old analytics events
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events(
    retention_days INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analytics_events
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create analytics dashboard view
CREATE OR REPLACE VIEW analytics_dashboard_view AS
WITH recent_events AS (
    SELECT *
    FROM analytics_events
    WHERE timestamp >= NOW() - INTERVAL '30 days'
),
daily_stats AS (
    SELECT 
        timestamp::DATE as date_day,
        COUNT(*) as events_count,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT session_id) as unique_sessions
    FROM recent_events
    GROUP BY timestamp::DATE
),
top_events AS (
    SELECT 
        event_name,
        COUNT(*) as count
    FROM recent_events
    GROUP BY event_name
    ORDER BY count DESC
    LIMIT 10
),
top_pages AS (
    SELECT 
        page_url,
        COUNT(*) as views,
        COUNT(DISTINCT user_id) as unique_visitors
    FROM recent_events
    WHERE page_url IS NOT NULL
    GROUP BY page_url
    ORDER BY views DESC
    LIMIT 10
)
SELECT 
    'summary' as metric_type,
    jsonb_build_object(
        'total_events', (SELECT COUNT(*) FROM recent_events),
        'unique_users', (SELECT COUNT(DISTINCT user_id) FROM recent_events),
        'unique_sessions', (SELECT COUNT(DISTINCT session_id) FROM recent_events),
        'avg_events_per_user', (SELECT ROUND(COUNT(*)::NUMERIC / NULLIF(COUNT(DISTINCT user_id), 0), 2) FROM recent_events),
        'daily_stats', (SELECT jsonb_agg(row_to_json(daily_stats)) FROM daily_stats ORDER BY date_day DESC LIMIT 7),
        'top_events', (SELECT jsonb_agg(row_to_json(top_events)) FROM top_events),
        'top_pages', (SELECT jsonb_agg(row_to_json(top_pages)) FROM top_pages)
    ) as data;

-- Create materialized view for performance (refresh periodically)
CREATE MATERIALIZED VIEW analytics_summary_mv AS
SELECT 
    NOW() as last_updated,
    COUNT(*) as total_events_30d,
    COUNT(DISTINCT user_id) as unique_users_30d,
    COUNT(DISTINCT session_id) as unique_sessions_30d,
    COUNT(DISTINCT timestamp::DATE) as active_days_30d
FROM analytics_events
WHERE timestamp >= NOW() - INTERVAL '30 days';

-- Create index on materialized view
CREATE UNIQUE INDEX idx_analytics_summary_mv_last_updated ON analytics_summary_mv(last_updated);

-- Function to refresh analytics summary
CREATE OR REPLACE FUNCTION refresh_analytics_summary()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW analytics_summary_mv;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User behavior tracking tables
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    duration_seconds INTEGER,
    page_views INTEGER DEFAULT 0,
    events_count INTEGER DEFAULT 0,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_start_time ON user_sessions(start_time);

-- Page views tracking
CREATE TABLE page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT NOT NULL,
    page_url TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    time_on_page INTEGER, -- seconds
    scroll_depth NUMERIC, -- percentage
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_page_views_user_id ON page_views(user_id);
CREATE INDEX idx_page_views_session_id ON page_views(session_id);
CREATE INDEX idx_page_views_page_url ON page_views(page_url);
CREATE INDEX idx_page_views_timestamp ON page_views(timestamp);

-- Conversion events tracking
CREATE TABLE conversion_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT NOT NULL,
    conversion_type TEXT NOT NULL, -- 'registration', 'booking', 'subscription', etc.
    conversion_value NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    properties JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversion_events_user_id ON conversion_events(user_id);
CREATE INDEX idx_conversion_events_conversion_type ON conversion_events(conversion_type);
CREATE INDEX idx_conversion_events_timestamp ON conversion_events(timestamp);

-- A/B test tracking
CREATE TABLE ab_test_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    test_name TEXT NOT NULL,
    variant TEXT NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, test_name)
);

CREATE INDEX idx_ab_test_assignments_user_id ON ab_test_assignments(user_id);
CREATE INDEX idx_ab_test_assignments_test_name ON ab_test_assignments(test_name);

-- Error tracking
CREATE TABLE error_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    error_type TEXT NOT NULL,
    error_message TEXT,
    stack_trace TEXT,
    page_url TEXT,
    user_agent TEXT,
    properties JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_error_events_user_id ON error_events(user_id);
CREATE INDEX idx_error_events_error_type ON error_events(error_type);
CREATE INDEX idx_error_events_timestamp ON error_events(timestamp);

-- Performance metrics
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    page_url TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_performance_metrics_metric_name ON performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp);

COMMIT;
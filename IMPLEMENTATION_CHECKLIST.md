# ✅ MindLyfe Implementation Checklist

*Immediate action items to enhance code quality and implement data-driven features*

## 🚀 Quick Wins (Start Today)

### 1. Analytics Foundation
```bash
# Install analytics dependencies
npm install @supabase/supabase-js uuid
npm install --save-dev @types/uuid
```

**Create these files:**
- [ ] `src/services/analytics/analyticsService.ts`
- [ ] `src/hooks/useAnalytics.tsx`
- [ ] `src/types/analytics.ts`

### 2. Error Handling Setup
```bash
# Install error handling dependencies
npm install react-error-boundary
```

**Create these files:**
- [ ] `src/utils/errorHandler.ts`
- [ ] `src/components/ErrorBoundary.tsx`
- [ ] `src/hooks/useErrorHandler.tsx`

### 3. Testing Infrastructure
```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
npm install --save-dev @testing-library/user-event
```

**Create these files:**
- [ ] `vitest.config.ts`
- [ ] `src/test-utils.tsx`
- [ ] `src/components/__tests__/` directory

## 📊 Data Analytics Implementation

### Step 1: Create Analytics Service
```typescript
// src/services/analytics/analyticsService.ts
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  session_id: string;
  properties: Record<string, any>;
  timestamp: string;
  page_url: string;
}

class AnalyticsService {
  private sessionId: string;
  
  constructor() {
    this.sessionId = crypto.randomUUID();
  }
  
  async track(eventName: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      event_name: eventName,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      session_id: this.sessionId,
      properties,
      timestamp: new Date().toISOString(),
      page_url: window.location.href
    };
    
    // Store in Supabase
    await supabase.from('analytics_events').insert(event);
    
    // Also log for development
    console.log('Analytics Event:', event);
  }
  
  trackPageView(page: string) {
    this.track('page_view', { page });
  }
  
  trackUserAction(action: string, context: Record<string, any> = {}) {
    this.track('user_action', { action, ...context });
  }
}

export const analytics = new AnalyticsService();
```

### Step 2: Create Analytics Hook
```typescript
// src/hooks/useAnalytics.tsx
import { useEffect } from 'react';
import { analytics } from '@/services/analytics/analyticsService';

export function useAnalytics() {
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    analytics.track(eventName, properties);
  };
  
  const trackPageView = (page: string) => {
    analytics.trackPageView(page);
  };
  
  const trackUserAction = (action: string, context?: Record<string, any>) => {
    analytics.trackUserAction(action, context);
  };
  
  return {
    trackEvent,
    trackPageView,
    trackUserAction
  };
}

// Page tracking hook
export function usePageTracking(pageName: string) {
  const { trackPageView } = useAnalytics();
  
  useEffect(() => {
    trackPageView(pageName);
  }, [pageName, trackPageView]);
}
```

### Step 3: Add Analytics to Components
```typescript
// Example: src/components/auth/LoginForm.tsx
import { useAnalytics } from '@/hooks/useAnalytics';

export function LoginForm() {
  const { trackUserAction } = useAnalytics();
  
  const handleLogin = async (email: string, password: string) => {
    trackUserAction('login_attempt', { email });
    
    try {
      // Login logic
      trackUserAction('login_success', { email });
    } catch (error) {
      trackUserAction('login_failed', { email, error: error.message });
    }
  };
  
  // Component JSX
}
```

## 🧪 Testing Implementation

### Step 1: Configure Vitest
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Step 2: Create Test Setup
```typescript
// src/test-setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));
```

### Step 3: Create Test Utilities
```typescript
// src/test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

## 🔧 Error Handling Implementation

### Step 1: Create Error Handler
```typescript
// src/utils/errorHandler.ts
import { analytics } from '@/services/analytics/analyticsService';

export class ErrorHandler {
  static logError(error: Error, context: string, userId?: string) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      userId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', errorData);
    }
    
    // Track error for analytics
    analytics.track('error_occurred', errorData);
    
    // Send to error monitoring service (implement as needed)
    // this.sendToErrorService(errorData);
  }
  
  static async handleAsyncError<T>(
    promise: Promise<T>, 
    context: string
  ): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      this.logError(error as Error, context);
      throw error;
    }
  }
  
  static createErrorBoundary(fallback: React.ComponentType<any>) {
    return fallback;
  }
}
```

### Step 2: Create Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ErrorHandler } from '@/utils/errorHandler';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
          <p className="mt-2 text-sm text-gray-500">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          <div className="mt-4">
            <button
              onClick={resetErrorBoundary}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        ErrorHandler.logError(error, 'React Error Boundary', undefined);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
```

## 📊 Database Analytics Table

### Create Analytics Table in Supabase
```sql
-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can insert their own analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create policy for service role to read all events
CREATE POLICY "Service role can read all analytics events" ON public.analytics_events
  FOR SELECT USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);
```

## 🎯 Priority Implementation Order

### Week 1: Foundation
- [ ] Set up analytics service and database table
- [ ] Implement error handling and logging
- [ ] Add error boundary to main App component
- [ ] Create basic testing setup

### Week 2: Core Features
- [ ] Add analytics tracking to authentication flow
- [ ] Implement page view tracking
- [ ] Add user action tracking for key features
- [ ] Write tests for critical components

### Week 3: Enhancement
- [ ] Add performance monitoring
- [ ] Implement input validation
- [ ] Create analytics dashboard queries
- [ ] Add comprehensive error handling

### Week 4: Optimization
- [ ] Optimize database queries
- [ ] Add caching strategies
- [ ] Implement A/B testing framework
- [ ] Performance optimization

## 📈 Key Metrics to Track Immediately

### User Engagement
- [ ] Page views and session duration
- [ ] Feature usage (booking, messaging, profile updates)
- [ ] User flow through registration process
- [ ] Search and filter usage

### Business Metrics
- [ ] Registration completion rates
- [ ] Therapist booking conversion
- [ ] Session completion rates
- [ ] User retention (daily, weekly, monthly)

### Technical Metrics
- [ ] Error rates and types
- [ ] API response times
- [ ] Page load performance
- [ ] Database query performance

## 🔧 Development Workflow

### Daily Tasks
- [ ] Review analytics dashboard
- [ ] Check error logs
- [ ] Run test suite
- [ ] Monitor performance metrics

### Weekly Tasks
- [ ] Analyze user behavior patterns
- [ ] Review and optimize slow queries
- [ ] Update test coverage
- [ ] Performance optimization review

### Monthly Tasks
- [ ] Comprehensive analytics review
- [ ] A/B test results analysis
- [ ] Code quality assessment
- [ ] Security audit

---

*Start with the analytics foundation and error handling - these will provide immediate insights into user behavior and system health while building a solid foundation for future enhancements.*
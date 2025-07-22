# Design Document

## Overview

This design document outlines the comprehensive debugging and fixing approach for the MindLyfe mental health platform. The solution addresses critical issues in authentication, registration, dashboard access, and therapist matching through systematic debugging, code fixes, and improved error handling.

## Architecture

### Current System Analysis

The MindLyfe platform consists of:

- **Frontend**: React/TypeScript application with Vite build system
- **Backend**: Node.js/Express API with PostgreSQL database
- **Authentication**: Custom JWT-based authentication system
- **Database**: PostgreSQL with comprehensive schema for multi-role users

### Identified Issues

Based on code analysis, the following critical issues have been identified:

1. **Authentication Flow Disconnects**: Frontend and backend authentication implementations have mismatched interfaces
2. **Database Connection Issues**: Backend routes may have connection pool management problems
3. **Registration Data Validation**: Incomplete validation between frontend forms and backend processing
4. **Dashboard Data Loading**: Missing or incorrect API endpoints for dashboard data
5. **Therapist Matching Logic**: Incomplete implementation of search and filtering functionality

## Components and Interfaces

### 1. Authentication System Fixes

#### Backend Authentication Routes (`/backend/src/routes/auth.ts`)

- **Issue**: Password storage and retrieval logic inconsistency
- **Fix**: Implement proper password hashing storage in profiles table
- **Enhancement**: Add proper session management and token refresh

#### Frontend Authentication Client (`/src/integrations/postgresql/client.ts`)

- **Issue**: API response handling doesn't match backend response format
- **Fix**: Align response parsing with actual backend responses
- **Enhancement**: Improve error handling and token management

#### Authentication Context (`/src/contexts/AuthContext.tsx`)

- **Issue**: User role assignment and session persistence problems
- **Fix**: Proper role extraction from backend responses
- **Enhancement**: Better loading state management

### 2. Registration System Improvements

#### Registration Forms

- **Individual Registration**: Fix form validation and data submission format
- **Therapist Registration**: Implement proper file upload handling and document management
- **Organization Registration**: Complete organization-specific field validation

#### Backend Registration Processing

- **Database Transactions**: Ensure atomic operations for profile creation
- **Role-Specific Data**: Proper creation of role-specific profile tables
- **Document Handling**: Implement file upload and storage for therapist documents

### 3. Dashboard System Fixes

#### Dashboard Data API

- **New Endpoint**: `/api/users/:userId/dashboard` for consolidated dashboard data
- **Data Aggregation**: Combine sessions, messages, stats, and notifications
- **Role-Based Data**: Return appropriate data based on user role

#### Dashboard Components

- **Loading States**: Implement proper skeleton loading for all dashboard widgets
- **Error Handling**: Add retry mechanisms and error boundaries
- **Data Refresh**: Implement automatic data refresh and manual refresh options

### 4. Therapist Matching System

#### Search and Filter API

- **Therapist Search Endpoint**: `/api/therapists/search` with filtering capabilities
- **Availability Integration**: Real-time availability checking
- **Matching Algorithm**: Implement preference-based therapist recommendations

#### Frontend Search Interface

- **Search Components**: Advanced filtering by specialization, language, availability
- **Results Display**: Comprehensive therapist profile cards with booking options
- **Booking Integration**: Direct booking from search results

## Data Models

### Enhanced Profile Management

```typescript
interface ProfileData {
  id: string;
  role: "individual" | "therapist" | "org_admin" | "admin";
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: ProfileData;
}
```

### Dashboard Data Structure

```typescript
interface DashboardData {
  stats: {
    upcomingSessions: number;
    unreadMessages: number;
    completedSessions: number;
    earnings?: number; // For therapists
    clients?: number; // For therapists
    workshops?: number; // For individuals
  };
  upcomingSessions: TherapySession[];
  recentActivity: RecentActivity[];
  notifications: Notification[];
}
```

### Therapist Search Data

```typescript
interface TherapistSearchResult {
  id: string;
  profile: ProfileData;
  specializations: string[];
  languages_spoken: string[];
  years_experience: number;
  hourly_rate?: number;
  bio?: string;
  availability: AvailabilitySlot[];
  rating?: number;
  is_verified: boolean;
}
```

## Error Handling

### Frontend Error Management

1. **Network Errors**: Implement retry logic with exponential backoff
2. **Validation Errors**: Field-specific error display with clear messaging
3. **Authentication Errors**: Automatic token refresh or redirect to login
4. **Loading States**: Skeleton components for all data-dependent UI elements

### Backend Error Responses

1. **Standardized Error Format**:

```typescript
interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
}
```

2. **Error Categories**:
   - `VALIDATION_ERROR`: Input validation failures
   - `AUTHENTICATION_ERROR`: Auth-related issues
   - `AUTHORIZATION_ERROR`: Permission-related issues
   - `DATABASE_ERROR`: Database operation failures
   - `INTERNAL_ERROR`: Unexpected server errors

### Database Error Handling

1. **Connection Pool Management**: Proper connection acquisition and release
2. **Transaction Management**: Rollback on errors, commit on success
3. **Query Error Logging**: Detailed logging for debugging without exposing sensitive data
4. **Constraint Violation Handling**: User-friendly messages for database constraint errors

## Testing Strategy

### Unit Testing

- **Authentication Functions**: Test token generation, validation, and refresh
- **Registration Logic**: Test profile creation for all user roles
- **Dashboard Data Aggregation**: Test data compilation and formatting
- **Search and Filter Logic**: Test therapist matching algorithms

### Integration Testing

- **API Endpoint Testing**: Test all authentication and data endpoints
- **Database Transaction Testing**: Test multi-table operations
- **File Upload Testing**: Test document upload and storage
- **Session Management Testing**: Test user session lifecycle

### End-to-End Testing

- **Registration Flow**: Complete user registration for all roles
- **Login and Dashboard Access**: Full authentication and dashboard loading
- **Therapist Search and Booking**: Complete therapist discovery and session booking
- **Error Scenarios**: Test error handling and recovery mechanisms

## Security Considerations

### Authentication Security

- **Password Hashing**: Use bcrypt with appropriate salt rounds (12+)
- **JWT Security**: Proper token signing and validation
- **Session Management**: Secure session storage and cleanup
- **Rate Limiting**: Implement rate limiting on authentication endpoints

### Data Protection

- **Input Validation**: Comprehensive validation on all user inputs
- **SQL Injection Prevention**: Use parameterized queries exclusively
- **File Upload Security**: Validate file types and sizes for document uploads
- **Role-Based Access**: Strict enforcement of role-based permissions

### Privacy Protection

- **Data Minimization**: Only collect and store necessary user data
- **Audit Logging**: Log all sensitive operations for compliance
- **Data Encryption**: Encrypt sensitive data at rest and in transit
- **GDPR Compliance**: Implement data deletion and export capabilities

## Performance Optimization

### Database Performance

- **Connection Pooling**: Optimize connection pool size and timeout settings
- **Query Optimization**: Add appropriate indexes for common queries
- **Caching Strategy**: Implement Redis caching for frequently accessed data
- **Database Monitoring**: Add query performance monitoring and alerting

### Frontend Performance

- **Code Splitting**: Implement route-based code splitting
- **Lazy Loading**: Lazy load dashboard components and heavy features
- **Caching**: Implement proper HTTP caching for API responses
- **Bundle Optimization**: Optimize build output and asset loading

### API Performance

- **Response Compression**: Enable gzip compression for API responses
- **Pagination**: Implement pagination for large data sets
- **Batch Operations**: Combine multiple operations where possible
- **Monitoring**: Add API performance monitoring and alerting

## Deployment Considerations

### Environment Configuration

- **Environment Variables**: Proper configuration management for different environments
- **Database Migrations**: Implement proper database migration system
- **Health Checks**: Add comprehensive health check endpoints
- **Logging**: Structured logging with appropriate log levels

### Monitoring and Alerting

- **Application Monitoring**: Monitor application performance and errors
- **Database Monitoring**: Monitor database performance and connection health
- **User Experience Monitoring**: Track user journey completion rates
- **Alert Configuration**: Set up alerts for critical system failures

This design provides a comprehensive approach to debugging and fixing the MindLyfe platform issues while establishing a robust foundation for future development.

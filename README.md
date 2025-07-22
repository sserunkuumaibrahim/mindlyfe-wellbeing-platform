# Mindlyfe - Mental Health Platform

A comprehensive mental health platform built with React Native (Web), TypeScript, and PostgreSQL, designed for deployment on AWS EC2.

## 🚀 Features

- **Multi-role Authentication**: Support for individuals, therapists, and organizations
- **Secure Authentication**: JWT-based authentication with PostgreSQL backend
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui components
- **Real-time Analytics**: Dashboard with insights and metrics
- **Cross-platform**: Built with React Native for web, easily extensible to mobile
- **Production Ready**: Optimized for AWS EC2 deployment

## 🏗️ Architecture

```
mindlyfe/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # External service integrations
│   └── lib/               # Utility functions
├── backend/               # Node.js/Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── database/      # Database configuration
│   └── migrations/        # SQL migration files
├── public/                # Static assets
└── dist/                  # Built frontend (generated)
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Hook Form** for form handling
- **Zustand** for state management
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** for database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Deployment
- **AWS EC2** for hosting
- **PM2** for process management
- **Nginx** for reverse proxy (optional)
- **Let's Encrypt** for SSL (optional)

## Overview

MindLyfe is a comprehensive mental health therapy platform that connects individuals and organizations with qualified therapists. The platform facilitates therapy sessions, progress tracking, educational content, and secure communication between clients and mental health professionals.

## Key Features

### User Management

- **Multi-role Support**: Individual clients, therapists, organization admins, and system administrators
- **Profile Management**: Detailed profiles for individuals, therapists, and organizations
- **Authentication**: Secure login, registration, and password management
- **Authorization**: Role-based access control with Row Level Security (RLS) policies

### Session Management

- **Booking System**: Schedule individual, couple, and group therapy sessions
- **Calendar Integration**: Manage therapist availability and client appointments
- **Video Calls**: Integrated video call interface for remote therapy sessions
- **Session Types**: Support for individual, couple, and group therapy formats

### Communication

- **Messaging System**: Secure chat between clients and therapists
- **Notification Center**: Real-time alerts for appointments, messages, and system updates
- **Unread Message Tracking**: Dashboard indicators for unread communications

### Billing and Payments

- **Subscription Management**: Various pricing plans with different features
- **Invoice Generation**: Automated billing for sessions and subscriptions
- **Payment Processing**: Secure payment handling and verification

### Analytics and Progress Tracking

- **Therapist Dashboard**: Session statistics, client metrics, and earnings tracking
- **Client Progress**: Goal achievement tracking and wellbeing assessments
- **Administrative Reports**: User statistics, revenue tracking, and system usage metrics

### Educational Content

- **Workshops**: Educational sessions and group therapy workshops
- **Resource Library**: Mental health resources and educational materials
- **Skills Training**: Specialized workshops for developing coping mechanisms

### Organization Features

- **Member Management**: Add and manage organization members
- **Group Sessions**: Organize therapy sessions for organization members
- **Billing Management**: Centralized billing for organizational accounts

### Mobile Responsiveness

- **Adaptive UI**: Responsive design that works across devices
- **Mobile Dashboard**: Optimized interface for smartphone and tablet users
- **Breakpoint Detection**: Automatic layout adjustment based on screen size

## Technical Implementation

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn-ui components
- **Backend**: Supabase for database, authentication, and serverless functions
- **Security**: Row Level Security (RLS) policies, audit logging, and secure data access
- **API Services**: RESTful API endpoints for all platform functionalities
- **State Management**: Custom React hooks for optimized data handling

## Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd mindlyfe

# Install dependencies
npm i

# Start the development server
npm run dev
```

## Development Guidelines

- Follow the established component structure and naming conventions
- Use the UI component library for consistent styling
- Implement proper error handling and loading states
- Ensure mobile responsiveness for all new features
- Write comprehensive tests for critical functionality

## Deployment

The application can be deployed to any modern hosting platform that supports React applications:

1. Build the production version:
   ```sh
   npm run build
   ```

2. Deploy the contents of the `dist` directory to your hosting provider

3. Ensure all environment variables are properly configured in your hosting environment

## CI/CD Integration

The project supports continuous integration and deployment through:

- Automated testing before deployment
- Environment-specific configuration management
- Database migration handling during deployment

## Security Considerations

- All API keys and secrets should be stored as environment variables
- Regular security audits are recommended
- User data is protected through Row Level Security policies
- Audit logging tracks all sensitive operations

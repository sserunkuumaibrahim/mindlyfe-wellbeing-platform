# PostgreSQL Migration Guide

This guide provides a complete migration path from Supabase to a standalone PostgreSQL database for the MindLyfe platform.

## Overview

The migration involves:
1. Setting up PostgreSQL database
2. Migrating schema and data
3. Updating authentication system
4. Modifying client configuration
5. Testing and validation

## Prerequisites

- PostgreSQL 14+ installed
- Node.js backend server
- Access to current Supabase data

## Migration Steps

### 1. Database Setup

#### Install PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE mindlyfe_db;
CREATE USER mindlyfe_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mindlyfe_db TO mindlyfe_user;
\q
```

### 2. Schema Migration

Run the provided migration scripts in order:
1. `POSTGRESQL_SCHEMA_MIGRATION.sql` - Core schema
2. `POSTGRESQL_AUTH_MIGRATION.sql` - Authentication tables
3. `POSTGRESQL_ANALYTICS_MIGRATION.sql` - Analytics tables

### 3. Data Migration

Use the provided data export/import scripts:
1. Export data from Supabase
2. Transform data format
3. Import to PostgreSQL

### 4. Application Updates

#### Backend Configuration
Update `backend/.env`:
```env
DB_USER=mindlyfe_user
DB_HOST=localhost
DB_NAME=mindlyfe_db
DB_PASSWORD=your_secure_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
BCRYPT_ROUNDS=12
```

#### Frontend Configuration
Replace Supabase client with PostgreSQL API client.

### 5. Authentication Migration

Implement custom JWT-based authentication to replace Supabase Auth.

### 6. Testing

1. Run migration validation scripts
2. Test all API endpoints
3. Verify data integrity
4. Performance testing

## Post-Migration

- Set up database backups
- Configure monitoring
- Update deployment scripts
- Document new architecture

## Rollback Plan

In case of issues:
1. Keep Supabase instance active during migration
2. Use feature flags to switch between systems
3. Have data sync scripts ready

## Support

For issues during migration, refer to:
- PostgreSQL documentation
- Migration troubleshooting guide
- Team lead @Ibrah for technical decisions
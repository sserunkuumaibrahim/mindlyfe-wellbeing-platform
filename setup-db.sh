#!/bin/bash

# Database Setup Script for Mindlyfe
echo "🚀 Setting up Mindlyfe database..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo "Please start PostgreSQL service first:"
    echo "  macOS: brew services start postgresql"
    echo "  Linux: sudo systemctl start postgresql"
    echo "  Windows: Start PostgreSQL from Services"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database if it doesn't exist
echo "📁 Creating database 'mindlyfe'..."
createdb mindlyfe -U postgres 2>/dev/null || echo "ℹ️  Database 'mindlyfe' already exists"

# Check if we can connect to the database
if psql -h localhost -p 5432 -U postgres -d mindlyfe -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Successfully connected to mindlyfe database"
else
    echo "❌ Failed to connect to mindlyfe database"
    echo "Please check your PostgreSQL credentials in backend/.env"
    exit 1
fi

# Run migrations if schema.sql exists
if [ -f "backend/schema.sql" ]; then
    echo "🔄 Running database schema..."
    psql -h localhost -p 5432 -U postgres -d mindlyfe -f backend/schema.sql
    echo "✅ Database schema applied"
else
    echo "⚠️  No schema.sql found, skipping database setup"
fi

echo "🎉 Database setup complete!"
echo "You can now run: npm run dev"

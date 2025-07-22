# Mindlyfe - Mental Health Platform

A comprehensive mental health platform built with React (frontend) and Node.js/PostgreSQL (backend) in a Docker-based monorepo structure.

## 🚀 Quick Start

### Prerequisites

1. **Docker** and **Docker Compose** (Docker Desktop recommended)
2. **Git** for cloning the repository

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd mindlyfe-wellbeing-platform
   ```

2. **Start the application:**
   ```bash
   npm start
   ```
   or
   ```bash
   docker-compose up --build
   ```

This will start:
- **PostgreSQL Database** (automatically configured)
- **Frontend** at http://localhost:5173
- **Backend API** at http://localhost:3001

**That's it!** 🎉 The entire application stack is now running with a single command.

## 📁 Project Structure

```
mindlyfe-wellbeing-platform/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── types/             # TypeScript types
│   └── integrations/      # API integrations
├── backend/               # Backend Node.js application
│   ├── src/               # Backend source code
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── controllers/   # Route controllers
│   │   └── utils/         # Utility functions
│   ├── migrations/        # Database migrations
│   ├── schema.sql         # Database schema
│   └── Dockerfile         # Backend Docker configuration
├── public/                # Static assets
├── docker-compose.yml     # Docker services configuration
├── Dockerfile.frontend    # Frontend Docker configuration
└── package.json           # Root package.json (monorepo)
```

## 🛠 Available Scripts

### Docker Commands (Recommended)

- `npm start` or `npm run dev` - Start the entire application stack
- `npm run dev:detached` - Start in background mode
- `npm run docker:down` - Stop all services
- `npm run docker:logs` - View logs from all services
- `npm run docker:clean` - Stop and remove all containers/volumes

### Development Commands

- `docker-compose up --build` - Start with fresh builds
- `docker-compose down` - Stop all services
- `docker-compose logs -f [service]` - Follow logs for specific service
- `docker-compose exec backend sh` - Access backend container shell
- `docker-compose exec postgres psql -U postgres -d mindlyfe` - Access database

## 🗄️ Database

The PostgreSQL database is automatically set up and configured when you start the application. No manual database setup required!

### Database Access

```bash
# Access database directly
docker-compose exec postgres psql -U postgres -d mindlyfe

# View database logs
docker-compose logs postgres

# Reset database (this will delete all data!)
docker-compose down -v
docker-compose up --build
```

## 🔧 Configuration

### Environment Variables

The application uses Docker environment variables defined in `docker-compose.yml`. For custom configurations:

#### Frontend Environment
- `VITE_API_URL` - Backend API URL (default: http://localhost:3001/api)
- `VITE_APP_NAME` - Application name

#### Backend Environment
- `DB_HOST` - Database host (managed by Docker)
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret

### Local Development Override

If you need to override environment variables for local development:

1. Create `.env.local` (gitignored)
2. Add your custom variables
3. Restart the containers

## 🏗️ Architecture

### Containerized Services

1. **PostgreSQL Container** 
   - Postgres 15 Alpine
   - Automatic database initialization
   - Persistent data storage

2. **Backend Container**
   - Node.js 18 Alpine
   - Express.js API server
   - Hot reload for development

3. **Frontend Container**
   - Node.js 18 Alpine
   - Vite development server
   - Hot module replacement

### Technology Stack

#### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for form management

#### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **JWT** authentication
- **bcrypt** for password hashing
- **CORS** enabled

### Authentication
- JWT-based authentication
- Role-based access control (individual, therapist, org_admin)
- Secure password hashing
- Session management

## 📊 User Roles

1. **Individual** - End users seeking mental health services
2. **Therapist** - Mental health professionals
3. **Organization Admin** - Administrators for organizational accounts

## 🚀 Deployment

### Development
```bash
npm start
# or
docker-compose up --build
```

### Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build

# Or build and deploy to your cloud provider
docker build -t mindlyfe-frontend -f Dockerfile.frontend --target production .
docker build -t mindlyfe-backend ./backend
```

## 🧪 Testing

### Quick Health Check
```bash
# Check if all services are running
curl http://localhost:3001/api/health

# Check frontend
curl http://localhost:5173
```

### Test Authentication
```bash
# Test individual registration
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "first_name": "Test",
    "last_name": "User",
    "role": "individual"
  }'

# Test login
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### Test with Sample Data
```bash
# Access the backend container to run scripts
docker-compose exec backend npm run test-accounts
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Stop any existing containers
   docker-compose down
   
   # Clean up everything
   npm run docker:clean
   ```

2. **Database Connection Issues**
   ```bash
   # Check database container status
   docker-compose logs postgres
   
   # Restart database
   docker-compose restart postgres
   ```

3. **Frontend/Backend Build Failures**
   ```bash
   # Rebuild containers from scratch
   docker-compose build --no-cache
   docker-compose up
   ```

4. **Permission Issues (Linux/Mac)**
   ```bash
   # Fix Docker permissions
   sudo chown -R $USER:$USER .
   ```

### Viewing Logs

```bash
# All services
npm run docker:logs

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Container Management

```bash
# Stop all services
docker-compose down

# Remove containers and volumes (reset everything)
docker-compose down -v --remove-orphans

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh

# Run commands in containers
docker-compose exec backend npm install new-package
docker-compose exec frontend npm install new-package
```

### Logs

- Frontend: Check browser console
- Backend: Check terminal output
- Database: Check PostgreSQL logs

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

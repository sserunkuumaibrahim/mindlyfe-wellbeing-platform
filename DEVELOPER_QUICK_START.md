# MindLyfe Development Status & Quick Start Guide

## 🚀 Current Status (2025-07-22)

✅ **WORKING**:
- Backend TypeScript migration completed
- Docker containers running successfully
- Database schema and migrations applied
- Authentication/registration endpoints functional
- Test accounts created and verified
- Frontend-backend communication established
- Error handling and type safety implemented
- **Dashboard infinite loop RESOLVED**
- **AuthContext circular dependency fixed**
- API endpoint routing fixed (`/api/profiles` vs `/api/user/profile`)
- Token storage corrected (`access_token` vs `token`)
- React rendering optimization completed

## 🛠️ Quick Start

### 1. Start All Services
```bash
docker-compose up -d
```

### 2. Verify Services are Running
```bash
docker ps
# Should show 3 containers: frontend, backend, postgres
```

### 3. Test Backend Health
```bash
curl http://localhost:3001/health
# Should return healthy status
```

### 4. Access Frontend
- Open: http://localhost:5173
- Login with test credentials (shown on dev login page)

## 🔐 Test Credentials

All test accounts use password: `MindLyfe2024!`

### Quick Login Options:
- **Individual**: demo@mindlyfe.org
- **Client**: client@mindlyfe.org  
- **Therapist**: dr.smith@mindlyfe.org
- **Admin**: michael.chen@mindlyfe.org

## 🔧 Development Tools

### React DevTools
Install browser extension from: https://reactjs.org/link/react-devtools

### Backend Logs
```bash
docker logs mindlyfe-backend -f
```

### Database Access
```bash
docker exec -it mindlyfe-postgres psql -U postgres -d mindlyfe
```

## 📁 Project Structure

```
/
├── backend/                 # TypeScript backend (Express + PostgreSQL)
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── middleware/     # Auth & validation middleware
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Helper utilities
│   └── migrations/         # Database migrations
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React contexts (Auth, etc.)
│   └── integrations/      # API client
└── docker-compose.yml     # Multi-container setup
```

## 🔄 Common Commands

### Restart Backend
```bash
docker-compose restart backend
```

### Rebuild Backend
```bash
docker-compose build backend
docker-compose up -d backend
```

### View All Logs
```bash
docker-compose logs -f
```

### Check Database Users
```bash
docker exec -it mindlyfe-postgres psql -U postgres -d mindlyfe -c "SELECT email, role FROM profiles ORDER BY created_at DESC LIMIT 10;"
```

## 🐛 Troubleshooting

### 401 Authentication Errors
1. Verify correct password: `MindLyfe2024!`
2. Check backend health: `curl http://localhost:3001/health`
3. Check backend logs: `docker logs mindlyfe-backend`

### Dashboard Loading Issues / Infinite Loops ✅ RESOLVED
- **ROOT CAUSE**: AuthContext was making unnecessary API calls during initialization
- **SOLUTION**: Use session data directly instead of additional profile API calls
- **FIX**: Removed circular dependencies in useEffect dependency arrays
- Clear browser localStorage if issues persist: `localStorage.clear()`

### Authentication Flow Optimization ✅ IMPLEMENTED
1. **Sign-in response provides complete user data** - no additional API calls needed
2. **AuthContext initializes from stored session** - eliminates redundant profile fetches  
3. **useProfile hook only for explicit updates** - not for displaying current user data
4. **Components use AuthContext user data** - instead of separate API calls

### Database Connection Issues
1. Verify postgres container: `docker ps | grep postgres`
2. Check database logs: `docker logs mindlyfe-postgres`
3. Test connection: `docker exec -it mindlyfe-postgres psql -U postgres -d mindlyfe -c "SELECT 1;"`

### Frontend Issues
1. Check if frontend container is running: `docker ps | grep frontend`
2. Access logs: `docker logs mindlyfe-frontend`
3. Clear browser cache and localStorage

## 📊 Key API Endpoints

- **Health**: `GET /health`
- **Sign Up**: `POST /api/auth/signup`  
- **Sign In**: `POST /api/auth/signin`
- **Sign Out**: `POST /api/auth/signout`
- **Profile**: `GET /api/profiles/me`
- **Refresh Token**: `POST /api/auth/refresh`

## 🔒 Security Features Implemented

- Password hashing with bcrypt (12 rounds)
- JWT access tokens (15min expiry)
- JWT refresh tokens (7 days)
- Session management in database
- Failed login attempt tracking
- Role-based access control
- Input validation and sanitization
- SQL injection prevention (parameterized queries)

## 📈 Next Steps

- [ ] Complete frontend auth flow testing
- [ ] Implement React DevTools for debugging  
- [ ] Add end-to-end testing
- [ ] Performance optimization
- [ ] Production deployment configuration

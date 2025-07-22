# Test Credentials for Development

The application is now running in Docker with the following test accounts available:

## Working Test Accounts

### Individual Clients
1. **Email**: `test@example.com`  
   **Password**: `TestPassword123!`  
   **Role**: Individual Client

2. **Email**: `demo@mindlyfe.org`  
   **Password**: `MindLyfe2024!`  
   **Role**: Individual Client

3. **Email**: `client@mindlyfe.org`  
   **Password**: `MindLyfe2024!`  
   **Role**: Individual Client

## Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## API Endpoints

- **Sign Up**: `POST /api/auth/signup`
- **Sign In**: `POST /api/auth/signin`
- **Sign Out**: `POST /api/auth/signout`
- **Refresh Token**: `POST /api/auth/refresh`

## Notes

- All accounts are set up with proper password entries in the database
- The existing test accounts in the database (kawekwa@mindlyfe.org, etc.) don't have password entries and cannot be used for login
- You can create new accounts via the signup endpoint or the frontend registration form
- Use the credentials above for testing the login functionality

## Docker Status

All containers should be running:
- `mindlyfe-backend` - Backend API (Port 3001)
- `mindlyfe-frontend` - Frontend App (Port 5173) 
- `mindlyfe-postgres` - Database (Port 5432)

Check status with: `docker ps`

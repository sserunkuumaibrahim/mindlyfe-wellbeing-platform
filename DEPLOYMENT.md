# Mindlyfe Deployment Guide - AWS EC2

This guide covers deploying the Mindlyfe application on a single AWS EC2 instance that serves both the frontend and backend.

## Prerequisites

- AWS EC2 instance (Ubuntu 20.04+ recommended)
- Node.js 18+ installed
- PostgreSQL 14+ installed
- Domain name (optional, for production)
- SSL certificate (optional, for HTTPS)

## EC2 Instance Setup

### 1. Launch EC2 Instance

```bash
# Recommended instance type: t3.medium or larger
# Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 8080 (Frontend), 3001 (Backend)
```

### 2. Connect to Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### 3. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 4. Install Node.js

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 5. Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

```sql
-- In PostgreSQL shell
CREATE DATABASE mindlyfe_prod;
CREATE USER mindlyfe_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mindlyfe_prod TO mindlyfe_user;
\q
```

### 6. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

## Application Deployment

### 1. Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/your-username/mindlyfe.git
cd mindlyfe
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend and backend)
npm run install:all
```

### 3. Configure Environment

```bash
# Copy and edit production environment file
cp .env.production .env
nano .env
```

Update the following variables in `.env`:

```env
# Database Configuration
DATABASE_URL=postgresql://mindlyfe_user:your_secure_password@localhost:5432/mindlyfe_prod
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mindlyfe_prod
DB_USER=mindlyfe_user
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend Configuration
VITE_API_URL=http://your-ec2-public-ip:3001/api
# Or use domain: VITE_API_URL=https://api.yourdomain.com/api

# Security
CORS_ORIGIN=http://your-ec2-public-ip:8080
# Or use domain: CORS_ORIGIN=https://yourdomain.com
```

### 4. Setup Database Schema

```bash
# Run database migrations
cd backend
psql -h localhost -U mindlyfe_user -d mindlyfe_prod -f migrations/001_initial_schema.sql
psql -h localhost -U mindlyfe_user -d mindlyfe_prod -f migrations/002_add_profiles.sql
cd ..
```

### 5. Build Applications

```bash
# Build both frontend and backend
npm run build:all
```

### 6. Start with PM2

```bash
# Make start script executable
chmod +x start-production.js

# Start with PM2
pm2 start start-production.js --name "mindlyfe-app"

# Save PM2 configuration
pm2 save
pm2 startup
```

## Production Optimizations

### 1. Nginx Reverse Proxy (Recommended)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/mindlyfe
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mindlyfe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. Firewall Configuration

```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Monitoring and Maintenance

### PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs mindlyfe-app

# Restart application
pm2 restart mindlyfe-app

# Stop application
pm2 stop mindlyfe-app

# Monitor resources
pm2 monit
```

### Database Backup

```bash
# Create backup script
cat > /home/ubuntu/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +"%Y%m%d_%H%M%S")
pg_dump -h localhost -U mindlyfe_user mindlyfe_prod > /home/ubuntu/backups/mindlyfe_backup_$DATE.sql
# Keep only last 7 days of backups
find /home/ubuntu/backups -name "mindlyfe_backup_*.sql" -mtime +7 -delete
EOF

# Make executable
chmod +x /home/ubuntu/backup-db.sh

# Create backups directory
mkdir -p /home/ubuntu/backups

# Add to crontab (daily backup at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup-db.sh") | crontab -
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 8080 and 3001 are available
2. **Database connection**: Check PostgreSQL is running and credentials are correct
3. **Environment variables**: Verify all required variables are set in `.env`
4. **File permissions**: Ensure proper permissions for application files

### Logs

```bash
# Application logs
pm2 logs mindlyfe-app

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## Security Checklist

- [ ] Change default database passwords
- [ ] Set strong JWT secrets
- [ ] Configure firewall rules
- [ ] Enable SSL/HTTPS
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor application logs
- [ ] Use environment variables for secrets

## Performance Optimization

- Use Nginx for static file serving
- Enable gzip compression
- Configure database connection pooling
- Monitor resource usage with PM2
- Set up log rotation
- Use CDN for static assets (optional)

## Scaling Considerations

For high-traffic applications, consider:

- Load balancer with multiple EC2 instances
- Separate database server (RDS)
- Redis for session storage
- CloudFront CDN
- Auto Scaling Groups
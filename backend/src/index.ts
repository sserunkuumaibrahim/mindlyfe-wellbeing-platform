import express from 'express';
import cors from 'cors';
import { pool } from './database';
import authRoutes from './routes/auth';
import tablesRoutes from './routes/tables';
import analyticsRoutes from './routes/analytics';
import documentsRoutes from './routes/documents';
import profilesRoutes from './routes/profiles';
import dashboardRoutes from './routes/dashboard';
import therapistRoutes from './routes/therapists';
import sessionRoutes from './routes/sessions';
import messagingRoutes from './routes/messaging';
import userRoutes from './routes/user';
import searchRoutes from './routes/search';
import bookingRoutes from './routes/booking';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/users', dashboardRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api', userRoutes);
app.use('/api', searchRoutes);
app.use('/api', bookingRoutes);

// Health check endpoint with comprehensive database health check
app.get('/health', async (req, res) => {
  try {
    const { checkDatabaseHealth } = await import('./database');
    const healthCheck = await checkDatabaseHealth();
    
    if (healthCheck.healthy) {
      res.json({ 
        status: 'healthy', 
        database: 'connected',
        ...healthCheck.stats
      });
    } else {
      res.status(503).json({ 
        status: 'unhealthy', 
        database: 'disconnected',
        error: healthCheck.error 
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'error',
      error: errorMessage 
    });
  }
});

// Database connection test with detailed information
app.get('/api/test-db', async (req, res) => {
  try {
    const { checkDatabaseHealth } = await import('./database');
    const healthCheck = await checkDatabaseHealth();
    
    if (healthCheck.healthy) {
      res.json({ 
        status: 'connected', 
        healthy: true,
        ...healthCheck.stats,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        status: 'connection_failed',
        healthy: false,
        error: healthCheck.error,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      status: 'connection_failed',
      healthy: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

import { sendError } from './utils/error';

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500, process.env.NODE_ENV === 'development' ? { details: err.message } : undefined);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📋 Tables API: http://localhost:${PORT}/api/tables`);
  console.log(`📈 Analytics API: http://localhost:${PORT}/api/analytics`);
  console.log(`📄 Documents API: http://localhost:${PORT}/api/documents`);
  console.log(`👤 Profiles API: http://localhost:${PORT}/api/profiles`);
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      const { closeDatabasePool } = await import('./database');
      await closeDatabasePool();
      console.log('Database pool closed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      const { closeDatabasePool } = await import('./database');
      await closeDatabasePool();
      console.log('Database pool closed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

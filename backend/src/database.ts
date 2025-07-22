import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database connection configuration with proper pool settings
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  
  // Connection pool configuration
  max: parseInt(process.env.DB_POOL_MAX || '20'), // Maximum number of clients in the pool
  min: parseInt(process.env.DB_POOL_MIN || '2'),  // Minimum number of clients in the pool
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // Close idle clients after 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'), // Return error after 10 seconds if connection could not be established
  acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'), // Return error after 60 seconds if a client could not be checked out
  
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Application name for monitoring
  application_name: 'mindlyfe-backend',
});

// Pool error handling
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit the process, just log the error
});

pool.on('connect', (client: PoolClient) => {
  console.log('New client connected to database');
});

pool.on('acquire', (client: PoolClient) => {
  console.log('Client acquired from pool');
});

pool.on('remove', (client: PoolClient) => {
  console.log('Client removed from pool');
});

// Database health check function
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; error?: string; stats?: any }> {
  try {
    const client = await pool.connect();
    try {
      // Test basic connectivity
      const result = await client.query('SELECT NOW() as timestamp, version() as version');
      
      // Get pool statistics
      const stats = {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
        timestamp: result.rows[0].timestamp,
        version: result.rows[0].version
      };
      
      return { healthy: true, stats };
    } finally {
      client.release();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    console.error('Database health check failed:', errorMessage);
    return { healthy: false, error: errorMessage };
  }
}

// Graceful shutdown function
export async function closeDatabasePool(): Promise<void> {
  try {
    await pool.end();
    console.log('Database pool closed gracefully');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
}

// Enhanced query function with retry logic
export async function executeQuery<T = any>(
  text: string, 
  params?: any[], 
  retries: number = 3
): Promise<{ rows: T[]; rowCount: number }> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(text, params);
        return { rows: result.rows, rowCount: result.rowCount || 0 };
      } finally {
        client.release();
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown query error');
      console.error(`Query attempt ${attempt} failed:`, lastError.message);
      
      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Enhanced transaction function
export async function executeTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
  retries: number = 2
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      lastError = error instanceof Error ? error : new Error('Unknown transaction error');
      console.error(`Transaction attempt ${attempt} failed:`, lastError.message);
      
      if (attempt < retries) {
        // Wait before retrying
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } finally {
      client.release();
    }
  }
  
  throw lastError!;
}

export { pool };

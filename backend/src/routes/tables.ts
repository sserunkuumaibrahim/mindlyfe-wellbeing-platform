// Database Table Routes for PostgreSQL Backend
import express from 'express';
import { pool, executeQuery, executeTransaction } from '../database';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth';
import { AuthenticatedRequest, ApiError, User, QueryValue, WhereCondition, OrderByClause } from '../types';

const router = express.Router();

// Helper function to create standardized error responses
function createErrorResponse(message: string, code: string, details?: Record<string, any>): ApiError {
  return {
    message,
    code,
    details: details || {},
    timestamp: new Date().toISOString()
  };
}

// Helper function to handle database errors
function handleDatabaseError(error: any): ApiError {
  console.error('Database error:', error);
  
  // PostgreSQL specific error codes
  if (error.code) {
    switch (error.code) {
      case '23505': // unique_violation
        return createErrorResponse('Duplicate entry found', 'DUPLICATE_ENTRY', { 
          constraint: error.constraint,
          detail: error.detail 
        });
      case '23503': // foreign_key_violation
        return createErrorResponse('Referenced record not found', 'FOREIGN_KEY_VIOLATION', { 
          constraint: error.constraint,
          detail: error.detail 
        });
      case '23502': // not_null_violation
        return createErrorResponse('Required field is missing', 'NOT_NULL_VIOLATION', { 
          column: error.column,
          table: error.table 
        });
      case '42P01': // undefined_table
        return createErrorResponse('Table not found', 'TABLE_NOT_FOUND', { 
          table: error.table 
        });
      case '42703': // undefined_column
        return createErrorResponse('Column not found', 'COLUMN_NOT_FOUND', { 
          column: error.column 
        });
      default:
        return createErrorResponse('Database operation failed', 'DATABASE_ERROR', { 
          code: error.code,
          detail: error.detail 
        });
    }
  }
  
  return createErrorResponse('Internal database error', 'INTERNAL_ERROR');
}

// Helper function to build WHERE clause
function buildWhereClause(whereConditions: WhereCondition[]): { clause: string; values: QueryValue[] } {
  if (!whereConditions || whereConditions.length === 0) {
    return { clause: '', values: [] };
  }

  const conditions: string[] = [];
  const values: QueryValue[] = [];
  let paramIndex = 1;

  whereConditions.forEach((condition) => {
    const { column, operator, value } = condition;
    
    switch (operator) {
      case 'eq':
        conditions.push(`${column} = $${paramIndex}`);
        if (!Array.isArray(value)) values.push(value);
        paramIndex++;
        break;
      case 'neq':
        conditions.push(`${column} != $${paramIndex}`);
        if (!Array.isArray(value)) values.push(value);
        paramIndex++;
        break;
      case 'gt':
        conditions.push(`${column} > $${paramIndex}`);
        if (!Array.isArray(value)) values.push(value);
        paramIndex++;
        break;
      case 'gte':
        conditions.push(`${column} >= $${paramIndex}`);
        if (!Array.isArray(value)) values.push(value);
        paramIndex++;
        break;
      case 'lt':
        conditions.push(`${column} < $${paramIndex}`);
        if (!Array.isArray(value)) values.push(value);
        paramIndex++;
        break;
      case 'lte':
        conditions.push(`${column} <= $${paramIndex}`);
        if (!Array.isArray(value)) values.push(value);
        paramIndex++;
        break;
      case 'like':
        conditions.push(`${column} ILIKE $${paramIndex}`);
        if (!Array.isArray(value)) values.push(`%${value}%`);
        paramIndex++;
        break;
      case 'in':
        if (Array.isArray(value) && value.length > 0) {
          const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
          conditions.push(`${column} IN (${placeholders})`);
          values.push(...value);
        }
        break;
    }
  });

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values
  };
}

// Helper function to build ORDER BY clause
function buildOrderClause(orderFields: string[]): string {
  if (!orderFields || orderFields.length === 0) {
    return '';
  }

  const orderClauses = orderFields.map(field => {
    const [column, direction] = field.split(':');
    return `${column} ${direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
  });

  return `ORDER BY ${orderClauses.join(', ')}`;
}

// Helper function to check table access permissions
function checkTableAccess(tableName: string, user: User | undefined, operation: 'read' | 'write'): boolean {
  // Public read access for certain tables
  const publicReadTables = ['workshops', 'therapist_profiles'];
  if (operation === 'read' && publicReadTables.includes(tableName)) {
    return true;
  }

  // Admin has access to all tables
  if (user?.role === 'admin') {
    return true;
  }

  // Authenticated users can read their own data
  if (operation === 'read' && user) {
    return true;
  }

  // Authenticated users can write to certain tables
  const userWriteTables = [
    'profiles', 'individual_profiles', 'therapist_profiles', 'organization_profiles',
    'sessions', 'messages', 'notifications', 'documents', 'workshop_participants'
  ];
  if (operation === 'write' && user && userWriteTables.includes(tableName)) {
    return true;
  }

  return false;
}

// GET /tables/:tableName - Query table data
router.get('/:tableName', optionalAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { tableName } = req.params;
    const { select, order, limit, offset } = req.query;
    
    if (!tableName) {
      res.status(400).json({ message: 'Table name is required' });
      return;
    }
    
    // Check access permissions
    if (!checkTableAccess(tableName, req.user, 'read')) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Parse WHERE conditions
    const whereConditions: WhereCondition[] = [];
    Object.keys(req.query).forEach(key => {
      if (key.startsWith('where[')) {
        try {
          const condition = JSON.parse(req.query[key] as string);
          whereConditions.push(condition);
        } catch (e) {
          // Ignore invalid JSON
        }
      }
    });

    // Add user filtering for non-admin users
    if (req.user && req.user.role !== 'admin') {
      // Define table-specific user column mappings
      const tableUserColumnMap: Record<string, string> = {
        'profiles': 'id',  // profiles table uses 'id' column for user filtering
        'individual_profiles': 'id', 
        'therapist_profiles': 'id', 
        'organization_profiles': 'id',
        'sessions': 'user_id',
        'notifications': 'profile_id',
        'payments': 'user_id',
        'subscriptions': 'profile_id',
        'billing_history': 'user_id',
        'documents': 'profile_id',
        'workshop_participants': 'profile_id',
        'therapy_sessions': 'client_id',
        'user_sessions': 'profile_id'
      };
      
      const userColumn = tableUserColumnMap[tableName];
      if (userColumn) {
        whereConditions.push({ column: userColumn, operator: 'eq', value: req.user.userId });
      }
    }

    // Build query
    const selectFields = select ? (select as string).split(',').join(', ') : '*';
    const { clause: whereClause, values } = buildWhereClause(whereConditions);
    const orderClause = buildOrderClause(order ? (order as string).split(',') : []);
    
    let query = `SELECT ${selectFields} FROM ${tableName} ${whereClause} ${orderClause}`;
    
    // Add pagination
    if (limit) {
      query += ` LIMIT ${parseInt(limit as string)}`;
    }
    if (offset) {
      query += ` OFFSET ${parseInt(offset as string)}`;
    }

    const result = await client.query(query, values);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Table query error:', error);
    res.status(500).json({ message: 'Database query failed' });
  } finally {
    client.release();
  }
});

// POST /tables/:tableName - Insert data
router.post('/:tableName', authenticateToken, async (req: AuthenticatedRequest, res): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { tableName } = req.params;
    const data = Array.isArray(req.body) ? req.body : [req.body];
    
    if (!tableName) {
      res.status(400).json({ message: 'Table name is required' });
      return;
    }
    
    // Check access permissions
    if (!checkTableAccess(tableName, req.user, 'write')) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const results = [];
    
    for (const item of data) {
      // Add user_id for user-specific tables
      const userSpecificTables = [
        'profiles', 'individual_profiles', 'therapist_profiles', 'organization_profiles',
        'sessions', 'notifications', 'payments', 'subscriptions', 'billing_history',
        'documents', 'workshop_participants'
      ];
      
      if (userSpecificTables.includes(tableName) && !item.user_id) {
        item.user_id = req.user!.userId;
      }

      // Build insert query
      const columns = Object.keys(item);
      const values = Object.values(item);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      
      const query = `
        INSERT INTO ${tableName} (${columns.join(', ')}) 
        VALUES (${placeholders}) 
        RETURNING *
      `;
      
      const result = await client.query(query, values);
      results.push(result.rows[0]);
    }
    
    res.status(201).json(Array.isArray(req.body) ? results : results[0]);
    
  } catch (error) {
    console.error('Table insert error:', error);
    res.status(500).json({ message: 'Database insert failed' });
  } finally {
    client.release();
  }
});

// PATCH /tables/:tableName - Update data
router.patch('/:tableName', authenticateToken, async (req: AuthenticatedRequest, res): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { tableName } = req.params;
    const updateData = req.body;
    
    if (!tableName) {
      res.status(400).json({ message: 'Table name is required' });
      return;
    }
    
    // Check access permissions
    if (!checkTableAccess(tableName, req.user, 'write')) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Parse WHERE conditions
    const whereConditions: WhereCondition[] = [];
    Object.keys(req.query).forEach(key => {
      if (key.startsWith('where[')) {
        try {
          const condition = JSON.parse(req.query[key] as string);
          whereConditions.push(condition);
        } catch (e) {
          // Ignore invalid JSON
        }
      }
    });

    // Add user filtering for non-admin users
    if (req.user && req.user.role !== 'admin') {
      const userSpecificTables = [
        'profiles', 'individual_profiles', 'therapist_profiles', 'organization_profiles',
        'sessions', 'notifications', 'payments', 'subscriptions', 'billing_history',
        'documents', 'workshop_participants'
      ];
      
      if (userSpecificTables.includes(tableName)) {
        whereConditions.push({ column: 'user_id', operator: 'eq', value: req.user.userId });
      }
    }

    if (whereConditions.length === 0) {
      res.status(400).json({ message: 'WHERE conditions required for update' });
      return;
    }

    // Build update query
    const updateColumns = Object.keys(updateData);
    const updateValues = Object.values(updateData);
    
    const setClause = updateColumns.map((col, index) => `${col} = $${index + 1}`).join(', ');
    const { clause: whereClause, values: whereValues } = buildWhereClause(whereConditions);
    
    const query = `
      UPDATE ${tableName} 
      SET ${setClause}, updated_at = NOW() 
      ${whereClause} 
      RETURNING *
    `;
    
    const allValues = [...updateValues, ...whereValues];
    const result = await client.query(query, allValues);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Table update error:', error);
    res.status(500).json({ message: 'Database update failed' });
  } finally {
    client.release();
  }
});

// DELETE /tables/:tableName - Delete data
router.delete('/:tableName', authenticateToken, async (req: AuthenticatedRequest, res): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { tableName } = req.params;
    
    if (!tableName) {
      res.status(400).json({ message: 'Table name is required' });
      return;
    }
    
    // Check access permissions
    if (!checkTableAccess(tableName, req.user, 'write')) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Parse WHERE conditions
    const whereConditions: WhereCondition[] = [];
    Object.keys(req.query).forEach(key => {
      if (key.startsWith('where[')) {
        try {
          const condition = JSON.parse(req.query[key] as string);
          whereConditions.push(condition);
        } catch (e) {
          // Ignore invalid JSON
        }
      }
    });

    // Add user filtering for non-admin users
    if (req.user && req.user.role !== 'admin') {
      const userSpecificTables = [
        'profiles', 'individual_profiles', 'therapist_profiles', 'organization_profiles',
        'sessions', 'notifications', 'payments', 'subscriptions', 'billing_history',
        'documents', 'workshop_participants'
      ];
      
      if (userSpecificTables.includes(tableName)) {
        whereConditions.push({ column: 'user_id', operator: 'eq', value: req.user.userId });
      }
    }

    if (whereConditions.length === 0) {
      res.status(400).json({ message: 'WHERE conditions required for delete' });
      return;
    }

    // Build delete query
    const { clause: whereClause, values } = buildWhereClause(whereConditions);
    
    const query = `DELETE FROM ${tableName} ${whereClause} RETURNING *`;
    
    const result = await client.query(query, values);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Table delete error:', error);
    res.status(500).json({ message: 'Database delete failed' });
  } finally {
    client.release();
  }
});

export default router;
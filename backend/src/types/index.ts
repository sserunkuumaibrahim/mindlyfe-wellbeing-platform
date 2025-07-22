// Type definitions for the Mindlyfe backend
import { Request } from 'express';

// User interface
export interface User {
  userId: string;
  email: string;
  role: string;
}

// JWT Payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  type: string;
  iat?: number;
  exp?: number;
}

// Extended Request interface with user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// API Error interface
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Database query parameter types
export type QueryValue = string | number | boolean;

// Where condition for dynamic queries
export interface WhereCondition {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: QueryValue | QueryValue[];
}

// Order by clause
export interface OrderByClause {
  field: string;
  direction: 'ASC' | 'DESC';
}

// Query result wrapper to handle PostgreSQL responses
export interface DatabaseResult<T = any> {
  rows: T[];
  rowCount: number;
}

import { Response } from 'express';
import { ApiError } from '../types';

export const sendError = (res: Response, message: string, code: string, statusCode: number = 500, details?: Record<string, any>) => {
  const error: ApiError = {
    message,
    code,
    details: details || {},
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(error);
};
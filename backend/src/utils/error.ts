import { Response } from 'express';

interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
}

export const sendError = (res: Response, message: string, code: string, statusCode: number = 500, details?: Record<string, any>) => {
  const error: ApiError = {
    message,
    code,
    details,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(error);
};
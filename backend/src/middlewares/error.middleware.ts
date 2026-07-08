import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: { message: 'Route not found' } });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { message: error.message } });
    return;
  }
  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? `File is too large. Maximum size is ${env.maxFileSizeMb} MB.`
        : error.message;
    res.status(413).json({ error: { message } });
    return;
  }
  console.error('Unhandled error:', error);
  res.status(500).json({ error: { message: 'Something went wrong on the server.' } });
}

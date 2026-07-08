import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { importRouter } from './routes/import.routes.js';

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.allowedOrigin === '*' ? true : env.allowedOrigin.split(',') }));
  app.use(
    '/api/leads',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: env.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: { message: 'Too many imports from this IP, please try again later.' } },
    }),
  );

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/leads', importRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

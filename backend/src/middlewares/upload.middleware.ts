import multer from 'multer';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';

const CSV_MIME_TYPES = ['text/csv', 'application/csv', 'application/vnd.ms-excel'];

export const uploadCsv = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const isCsv =
      file.originalname.toLowerCase().endsWith('.csv') || CSV_MIME_TYPES.includes(file.mimetype);
    if (isCsv) {
      callback(null, true);
    } else {
      callback(new HttpError(415, 'Only .csv files are supported.'));
    }
  },
}).single('file');

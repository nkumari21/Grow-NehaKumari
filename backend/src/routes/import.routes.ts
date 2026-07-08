import { Router } from 'express';
import { importLeads } from '../controllers/import.controller.js';
import { uploadCsv } from '../middlewares/upload.middleware.js';

export const importRouter = Router();

importRouter.post('/import', uploadCsv, importLeads);

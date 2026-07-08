import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { parseCsvBuffer } from '../services/csv.service.js';
import { runImport } from '../services/import.service.js';
import { HttpError } from '../utils/http-error.js';
import type { StreamEvent } from '../types/lead.types.js';

export async function importLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      throw new HttpError(400, 'No file uploaded. Send a CSV file in the "file" form field.');
    }

    const rows = parseCsvBuffer(req.file.buffer);
    if (rows.length === 0) {
      throw new HttpError(400, 'The CSV file contains no data rows.');
    }
    if (rows.length > env.maxRows) {
      throw new HttpError(413, `The CSV has ${rows.length} rows; the maximum supported is ${env.maxRows}.`);
    }

    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.flushHeaders();

    let clientGone = false;
    const abort = new AbortController();
    res.on('close', () => {
      if (!res.writableEnded) {
        clientGone = true;
        abort.abort();
      }
    });
    const send = (event: StreamEvent) => {
      if (!clientGone) res.write(`${JSON.stringify(event)}\n`);
    };

    send({
      type: 'start',
      totalRows: rows.length,
      totalBatches: Math.ceil(rows.length / env.batchSize),
    });

    const result = await runImport(
      rows,
      (progress) => send({ type: 'progress', ...progress }),
      () => clientGone,
      abort.signal,
    );
    send({ type: 'done', result });
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      next(error);
      return;
    }
    if (res.writable && !res.destroyed) {
      const message = error instanceof Error ? error.message : 'Import failed unexpectedly';
      res.write(`${JSON.stringify({ type: 'error', message } satisfies StreamEvent)}\n`);
    }
    res.end();
  }
}

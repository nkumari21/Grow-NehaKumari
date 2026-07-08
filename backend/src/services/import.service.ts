import { env } from '../config/env.js';
import { chunk, mapWithConcurrency, withRetry } from '../utils/async.js';
import { flagDuplicates } from '../utils/duplicates.js';
import { validateRecord } from '../validators/lead.validator.js';
import { extractBatch } from './ai.service.js';
import type {
  BatchProgress,
  CsvRow,
  ImportedLead,
  ImportResult,
  SkippedRecord,
} from '../types/lead.types.js';

export async function runImport(
  rows: CsvRow[],
  onProgress?: (progress: BatchProgress) => void,
  shouldStop?: () => boolean,
  signal?: AbortSignal,
): Promise<ImportResult> {
  const batches = chunk(rows, env.batchSize);
  const leads: ImportedLead[] = [];
  const skipped: SkippedRecord[] = [];
  const mappingBySource = new Map<string, string>();
  let processedRows = 0;
  let completedBatches = 0;
  let failedBatches = 0;

  await mapWithConcurrency(batches, env.batchConcurrency, async (batch, batchIndex) => {
    if (shouldStop?.()) {
      throw new Error('Import cancelled by the client');
    }

    const offset = batchIndex * env.batchSize;
    try {
      const { records, mapping } = await withRetry(() => extractBatch(batch, offset, signal), {
        attempts: env.aiMaxAttempts,
        baseDelayMs: 1000,
        stop: shouldStop,
        onRetry: (attempt, error) =>
          console.warn(
            `Batch ${batchIndex + 1}/${batches.length} attempt ${attempt} failed, retrying:`,
            error instanceof Error ? error.message : error,
          ),
      });

      for (const { source, target } of mapping) {
        if (target && !mappingBySource.has(source)) mappingBySource.set(source, target);
      }
      for (const record of records) {
        const result = validateRecord(record);
        if (result.ok) {
          leads.push({ row: record.row, ...result.lead });
        } else {
          skipped.push({ row: record.row, reason: result.reason, data: rows[record.row] });
        }
      }
    } catch (error) {
      failedBatches += 1;
      const detail = error instanceof Error ? error.message : 'unknown error';
      const reason = `AI extraction failed after ${env.aiMaxAttempts} attempts: ${detail}`;
      batch.forEach((data, i) => skipped.push({ row: offset + i, reason, data }));
    }

    processedRows += batch.length;
    completedBatches += 1;
    onProgress?.({
      processedRows,
      totalRows: rows.length,
      completedBatches,
      totalBatches: batches.length,
      imported: leads.length,
      skipped: skipped.length,
    });
  });

  leads.sort((a, b) => a.row - b.row);
  skipped.sort((a, b) => a.row - b.row);
  const duplicates = flagDuplicates(leads);
  const headers = [...new Set([...Object.keys(rows[0] ?? {}), ...mappingBySource.keys()])];

  return {
    summary: {
      totalRows: rows.length,
      imported: leads.length,
      skipped: skipped.length,
      duplicates,
      totalBatches: batches.length,
      failedBatches,
    },
    leads,
    skipped,
    mapping: headers.map((source) => ({ source, target: mappingBySource.get(source) ?? '' })),
  };
}

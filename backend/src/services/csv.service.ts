import { parse } from 'csv-parse/sync';
import { HttpError } from '../utils/http-error.js';
import type { CsvRow } from '../types/lead.types.js';

function normalizeHeaders(headers: string[]): string[] {
  const used = new Set<string>();
  return headers.map((raw, i) => {
    const base = raw?.trim() || `column_${i + 1}`;
    let name = base;
    for (let suffix = 2; used.has(name); suffix++) {
      name = `${base}_${suffix}`;
    }
    used.add(name);
    return name;
  });
}

export function parseCsvBuffer(buffer: Buffer): CsvRow[] {
  let rows: CsvRow[];
  try {
    rows = parse(buffer, {
      columns: normalizeHeaders,
      bom: true,
      trim: true,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown parse error';
    throw new HttpError(400, `Could not parse the CSV file: ${detail}`);
  }
  return rows.filter((row) => Object.values(row).some((value) => value !== ''));
}

import Papa from 'papaparse';
import type { CsvRow } from '@/types/lead';

export interface ParsedCsv {
  headers: string[];
  rows: CsvRow[];
}

export function normalizeHeaders(rawHeaders: string[]): string[] {
  const used = new Set<string>();
  return rawHeaders.map((raw, i) => {
    const base = raw?.trim() || `column_${i + 1}`;
    let name = base;
    for (let suffix = 2; used.has(name); suffix++) {
      name = `${base}_${suffix}`;
    }
    used.add(name);
    return name;
  });
}

export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      skipEmptyLines: 'greedy',
      complete: ({ data }) => {
        const [rawHeaders, ...records] = data;
        if (!rawHeaders?.length) {
          reject(new Error('No header row found in this CSV.'));
          return;
        }
        const headers = normalizeHeaders(rawHeaders);
        const rows = records
          .map(
            (cells) =>
              Object.fromEntries(
                headers.map((header, i) => [header, cells[i]?.trim() ?? '']),
              ) as CsvRow,
          )
          .filter((row) => Object.values(row).some(Boolean));
        resolve({ headers, rows });
      },
      error: (error) => reject(new Error(`Could not read the file: ${error.message}`)),
    });
  });
}

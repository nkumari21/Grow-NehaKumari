import { CRM_FIELDS, type CrmLead, type ImportedLead, type SkippedRecord } from '@/types/lead';

const escapeCell = (value: string): string =>
  /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

function downloadFile(fileName: string, header: string[], lines: string[][]): void {
  const content = [header, ...lines].map((cells) => cells.map(escapeCell).join(',')).join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadCsv(fileName: string, rows: Partial<CrmLead>[]): void {
  downloadFile(
    fileName,
    [...CRM_FIELDS],
    rows.map((row) => CRM_FIELDS.map((field) => row[field] ?? '')),
  );
}

export function downloadSkippedCsv(skipped: SkippedRecord[]): void {
  const columns = [...new Set(skipped.flatMap((record) => Object.keys(record.data)))];
  downloadFile(
    'groweasy_skipped_rows.csv',
    ['csv_row', 'skip_reason', ...columns],
    skipped.map((record) => [
      String(record.row + 2),
      record.reason,
      ...columns.map((column) => record.data[column] ?? ''),
    ]),
  );
}

export function downloadLeadsCsv(leads: ImportedLead[]): void {
  downloadCsv('groweasy_crm_leads.csv', leads);
}

export function downloadTemplateCsv(): void {
  downloadCsv('groweasy_sample_template.csv', [
    {
      created_at: '2026-05-13 14:20:48',
      name: 'John Doe',
      email: 'john.doe@example.com',
      country_code: '+91',
      mobile_without_country_code: '9876543210',
      company: 'GrowEasy',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      lead_owner: 'test@gmail.com',
      crm_status: 'GOOD_LEAD_FOLLOW_UP',
      crm_note: 'Client is asking to reschedule demo',
    },
  ]);
}

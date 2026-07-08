export const CRM_FIELDS = [
  'created_at',
  'name',
  'email',
  'country_code',
  'mobile_without_country_code',
  'company',
  'city',
  'state',
  'country',
  'lead_owner',
  'crm_status',
  'crm_note',
  'data_source',
  'possession_time',
  'description',
] as const;

export type CrmField = (typeof CRM_FIELDS)[number];
export type CrmLead = Record<CrmField, string>;
export type CsvRow = Record<string, string>;

export const CRM_STATUSES = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
] as const;

export const CRM_FIELD_LABELS: Record<CrmField, string> = {
  created_at: 'Created At',
  name: 'Name',
  email: 'Email',
  country_code: 'Code',
  mobile_without_country_code: 'Mobile',
  company: 'Company',
  city: 'City',
  state: 'State',
  country: 'Country',
  lead_owner: 'Lead Owner',
  crm_status: 'Status',
  crm_note: 'Note',
  data_source: 'Source',
  possession_time: 'Possession',
  description: 'Description',
};

export interface ImportedLead extends CrmLead {
  row: number;
  duplicateOf?: number;
}

export interface ColumnMapping {
  source: string;
  target: string;
}

export interface SkippedRecord {
  row: number;
  reason: string;
  data: CsvRow;
}

export interface ImportSummary {
  totalRows: number;
  imported: number;
  skipped: number;
  duplicates: number;
  totalBatches: number;
  failedBatches: number;
}

export interface ImportResult {
  summary: ImportSummary;
  leads: ImportedLead[];
  skipped: SkippedRecord[];
  mapping: ColumnMapping[];
}

export interface BatchProgress {
  processedRows: number;
  totalRows: number;
  completedBatches: number;
  totalBatches: number;
  imported: number;
  skipped: number;
}

export type StreamEvent =
  | { type: 'start'; totalRows: number; totalBatches: number }
  | ({ type: 'progress' } & BatchProgress)
  | { type: 'done'; result: ImportResult }
  | { type: 'error'; message: string };

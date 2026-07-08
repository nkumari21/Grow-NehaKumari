import {
  CRM_FIELDS,
  CRM_STATUSES,
  DATA_SOURCES,
  type CrmLead,
  type ExtractedRecord,
} from '../types/lead.types.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidationResult = { ok: true; lead: CrmLead } | { ok: false; reason: string };

const singleLine = (value: unknown): string =>
  typeof value === 'string' ? value.replace(/\r?\n/g, '\\n').trim() : '';

const coerceEnum = (value: string, allowed: readonly string[]): string =>
  allowed.includes(value) ? value : '';

const normalizeEmail = (value: string): string => {
  const email = value.toLowerCase();
  return EMAIL_PATTERN.test(email) ? email : '';
};

const normalizeCountryCode = (code: string, mobile: string): string => {
  if (!mobile) return '';
  const digits = code.replace(/\D/g, '');
  return digits ? `+${digits}` : '';
};

export function validateRecord(record: ExtractedRecord): ValidationResult {
  if (record.skip) {
    return { ok: false, reason: record.skip_reason || 'Skipped by AI' };
  }

  const lead = Object.fromEntries(
    CRM_FIELDS.map((field) => [field, singleLine(record.lead?.[field])]),
  ) as CrmLead;

  lead.crm_status = coerceEnum(lead.crm_status.toUpperCase(), CRM_STATUSES);
  lead.data_source = coerceEnum(lead.data_source.toLowerCase(), DATA_SOURCES);
  lead.email = normalizeEmail(lead.email);
  lead.mobile_without_country_code = lead.mobile_without_country_code.replace(/\D/g, '');
  lead.country_code = normalizeCountryCode(lead.country_code, lead.mobile_without_country_code);
  if (lead.created_at && Number.isNaN(new Date(lead.created_at).getTime())) {
    lead.created_at = '';
  }

  if (!lead.email && !lead.mobile_without_country_code) {
    return { ok: false, reason: 'No valid email or mobile number found' };
  }
  return { ok: true, lead };
}

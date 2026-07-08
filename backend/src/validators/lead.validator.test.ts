import { describe, expect, it } from 'vitest';
import { validateRecord } from './lead.validator.js';
import type { ExtractedRecord } from '../types/lead.types.js';

const record = (lead: ExtractedRecord['lead']): ExtractedRecord => ({ row: 0, skip: false, lead });

describe('validateRecord', () => {
  it('accepts a lead with a valid email', () => {
    const result = validateRecord(record({ name: 'John Doe', email: 'John@Example.com' }));
    expect(result).toMatchObject({ ok: true, lead: { email: 'john@example.com' } });
  });

  it('skips records the AI marked as skipped', () => {
    const result = validateRecord({ row: 0, skip: true, skip_reason: 'No contact info' });
    expect(result).toEqual({ ok: false, reason: 'No contact info' });
  });

  it('skips records with neither email nor mobile', () => {
    const result = validateRecord(record({ name: 'Ghost Lead', email: 'not-an-email' }));
    expect(result).toEqual({ ok: false, reason: 'No valid email or mobile number found' });
  });

  it('coerces invalid enum values to empty strings', () => {
    const result = validateRecord(
      record({ email: 'a@b.co', crm_status: 'HOT_LEAD', data_source: 'facebook' }),
    );
    expect(result).toMatchObject({ ok: true, lead: { crm_status: '', data_source: '' } });
  });

  it('keeps valid enum values regardless of casing', () => {
    const result = validateRecord(
      record({ email: 'a@b.co', crm_status: 'sale_done', data_source: 'EDEN_PARK' }),
    );
    expect(result).toMatchObject({
      ok: true,
      lead: { crm_status: 'SALE_DONE', data_source: 'eden_park' },
    });
  });

  it('strips non-digits from mobile and prefixes country code with +', () => {
    const result = validateRecord(
      record({ mobile_without_country_code: '98765-43210', country_code: '91' }),
    );
    expect(result).toMatchObject({
      ok: true,
      lead: { mobile_without_country_code: '9876543210', country_code: '+91' },
    });
  });

  it('blanks created_at when it cannot be parsed by new Date()', () => {
    const result = validateRecord(record({ email: 'a@b.co', created_at: 'yesterday-ish' }));
    expect(result).toMatchObject({ ok: true, lead: { created_at: '' } });
  });

  it('escapes line breaks so each record stays a single CSV row', () => {
    const result = validateRecord(record({ email: 'a@b.co', crm_note: 'line one\nline two' }));
    expect(result).toMatchObject({ ok: true, lead: { crm_note: 'line one\\nline two' } });
  });
});

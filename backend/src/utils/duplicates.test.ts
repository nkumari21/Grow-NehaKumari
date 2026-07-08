import { describe, expect, it } from 'vitest';
import { flagDuplicates } from './duplicates.js';
import type { ImportedLead } from '../types/lead.types.js';

const lead = (row: number, email = '', mobile = ''): ImportedLead =>
  ({ row, email, mobile_without_country_code: mobile }) as ImportedLead;

describe('flagDuplicates', () => {
  it('flags a repeated email and points to the first occurrence', () => {
    const leads = [lead(0, 'a@b.co'), lead(1, 'x@y.co'), lead(2, 'a@b.co')];
    expect(flagDuplicates(leads)).toBe(1);
    expect(leads[2].duplicateOf).toBe(0);
    expect(leads[0].duplicateOf).toBeUndefined();
  });

  it('flags a repeated mobile even when emails differ', () => {
    const leads = [lead(0, 'a@b.co', '9876543210'), lead(1, 'c@d.co', '9876543210')];
    expect(flagDuplicates(leads)).toBe(1);
    expect(leads[1].duplicateOf).toBe(0);
  });

  it('does not treat empty contact fields as duplicates of each other', () => {
    const leads = [lead(0, 'a@b.co'), lead(1, '', '9876543210')];
    expect(flagDuplicates(leads)).toBe(0);
  });

  it('flags chains through an already-flagged duplicate, pointing at the cluster original', () => {
    const leads = [
      lead(0, 'a@b.co', '1111111111'),
      lead(1, 'a@b.co', '2222222222'),
      lead(2, 'c@d.co', '2222222222'),
    ];
    expect(flagDuplicates(leads)).toBe(2);
    expect(leads[1].duplicateOf).toBe(0);
    expect(leads[2].duplicateOf).toBe(0);
  });
});

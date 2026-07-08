import { describe, expect, it } from 'vitest';
import { normalizeHeaders } from './csv';

describe('normalizeHeaders', () => {
  it('trims headers and names blank ones by position', () => {
    expect(normalizeHeaders([' Name ', '', 'Email'])).toEqual(['Name', 'column_2', 'Email']);
  });

  it('suffixes duplicate headers instead of letting them collide', () => {
    expect(normalizeHeaders(['Phone', 'Phone', 'Phone'])).toEqual(['Phone', 'Phone_2', 'Phone_3']);
  });

  it('never produces colliding names even when a real header matches a generated suffix', () => {
    const headers = normalizeHeaders(['Phone', 'Phone', 'Phone_2']);
    expect(new Set(headers).size).toBe(headers.length);
  });
});

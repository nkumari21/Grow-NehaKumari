import { describe, expect, it } from 'vitest';
import { formatBytes, getApiErrorMessage } from './format';

describe('formatBytes', () => {
  it('picks sensible units per size', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.00 MB');
  });
});

describe('getApiErrorMessage', () => {
  it('extracts the message from API error objects', () => {
    expect(getApiErrorMessage({ message: 'boom' })).toBe('boom');
  });

  it('falls back for unknown error shapes', () => {
    expect(getApiErrorMessage(undefined)).toBe('Something went wrong. Please try again.');
    expect(getApiErrorMessage({ message: 42 })).toBe('Something went wrong. Please try again.');
  });

  it('maps aborted mutations to a friendly cancelled message', () => {
    expect(getApiErrorMessage({ name: 'AbortError', message: 'Aborted' })).toBe('Import cancelled.');
  });
});

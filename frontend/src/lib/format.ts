export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const { name, message } = error as { name?: unknown; message?: unknown };
    if (name === 'AbortError' || message === 'Aborted') return 'Import cancelled.';
    if (typeof message === 'string' && message) return message;
  }
  return 'Something went wrong. Please try again.';
}

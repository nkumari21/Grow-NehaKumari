import 'dotenv/config';

const num = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  port: num(process.env.PORT, 4000),
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  batchSize: num(process.env.BATCH_SIZE, 20),
  batchConcurrency: num(process.env.BATCH_CONCURRENCY, 3),
  aiMaxAttempts: num(process.env.AI_MAX_ATTEMPTS, 3),
  maxFileSizeMb: num(process.env.MAX_FILE_SIZE_MB, 5),
  maxRows: num(process.env.MAX_ROWS, 2000),
  allowedOrigin: process.env.ALLOWED_ORIGIN ?? '*',
  rateLimitMax: num(process.env.RATE_LIMIT_MAX, 30),
};

export function assertEnv(): void {
  if (!env.geminiApiKey) {
    throw new Error(
      'GEMINI_API_KEY is missing. Copy backend/.env.example to backend/.env and set your key.',
    );
  }
}

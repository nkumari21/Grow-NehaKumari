import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { buildBatchPrompt, RESPONSE_SCHEMA, SYSTEM_PROMPT } from '../prompts/extraction.prompt.js';
import type { ColumnMapping, CsvRow, ExtractedBatch, ExtractedRecord } from '../types/lead.types.js';

let client: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => (client ??= new GoogleGenAI({ apiKey: env.geminiApiKey }));

export async function extractBatch(
  rows: CsvRow[],
  offset: number,
  signal?: AbortSignal,
): Promise<ExtractedBatch> {
  const response = await getClient().models.generateContent({
    model: env.geminiModel,
    contents: buildBatchPrompt(rows, offset),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0,
      abortSignal: signal,
    },
  });

  const { records, mapping } = parseResponse(response.text ?? '');
  return { records: reconcile(records, rows.length, offset), mapping };
}

function parseResponse(text: string): ExtractedBatch {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('AI returned a response that is not valid JSON');
  }
  const { records, mapping } = parsed as { records?: unknown; mapping?: unknown };
  if (!Array.isArray(records)) {
    throw new Error('AI response is missing the "records" array');
  }
  return {
    records: records as ExtractedRecord[],
    mapping: Array.isArray(mapping) ? (mapping as ColumnMapping[]) : [],
  };
}

function reconcile(records: ExtractedRecord[], batchLength: number, offset: number): ExtractedRecord[] {
  const byRow = new Map(records.map((record) => [record.row, record]));
  return Array.from({ length: batchLength }, (_, i) => {
    const row = offset + i;
    return byRow.get(row) ?? { row, skip: true, skip_reason: 'Record missing from AI response' };
  });
}

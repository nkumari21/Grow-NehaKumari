import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/lib/constants';
import { ndjsonEvents } from '@/lib/stream';
import { importStarted, progressUpdated } from '@/store/slices/import-slice';
import type { ImportResult, StreamEvent } from '@/types/lead';

interface ApiError {
  message: string;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    return body.error?.message ?? `Import failed with status ${response.status}.`;
  } catch {
    return `Import failed with status ${response.status}.`;
  }
}

export const importApi = createApi({
  reducerPath: 'importApi',
  baseQuery: fakeBaseQuery<ApiError>(),
  endpoints: (build) => ({
    importLeads: build.mutation<ImportResult, File>({
      async queryFn(file, { dispatch, signal }) {
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(`${API_BASE_URL}/api/leads/import`, {
            method: 'POST',
            body: formData,
            signal,
          });
          if (!response.ok) {
            return { error: { message: await readErrorMessage(response) } };
          }
          if (!response.body) {
            return { error: { message: 'The server returned an empty response.' } };
          }

          let result: ImportResult | null = null;
          for await (const event of ndjsonEvents<StreamEvent>(response.body)) {
            switch (event.type) {
              case 'start':
                dispatch(importStarted(event));
                break;
              case 'progress':
                dispatch(progressUpdated(event));
                break;
              case 'error':
                return { error: { message: event.message } };
              case 'done':
                result = event.result;
                break;
            }
          }

          if (!result) {
            return { error: { message: 'The connection dropped before the import finished.' } };
          }
          return { data: result };
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return { error: { message: 'Import cancelled.' } };
          }
          const message =
            error instanceof Error ? error.message : 'Network error while importing the file.';
          return { error: { message: `Could not reach the import API: ${message}` } };
        }
      },
    }),
  }),
});

export const { useImportLeadsMutation } = importApi;

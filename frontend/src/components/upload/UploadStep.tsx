'use client';

import { useState } from 'react';
import { MAX_FILE_SIZE_MB } from '@/lib/constants';
import { parseCsvFile } from '@/lib/csv';
import { downloadTemplateCsv } from '@/lib/export-csv';
import { useAppDispatch } from '@/store/hooks';
import { filePrepared } from '@/store/slices/import-slice';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { FileDropzone } from './FileDropzone';

export function UploadStep({ onFileReady }: { onFileReady: (file: File) => void }) {
  const dispatch = useAppDispatch();
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only .csv files are supported.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File is too large — the maximum size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setParsing(true);
    try {
      const { headers, rows } = await parseCsvFile(file);
      if (rows.length === 0) {
        throw new Error('This CSV has a header but no data rows.');
      }
      onFileReady(file);
      dispatch(filePrepared({ fileName: file.name, fileSize: file.size, headers, rows }));
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : 'Could not parse this CSV file.');
    } finally {
      setParsing(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Import Leads via CSV</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Upload a CSV from any source — Facebook, Google Ads, other CRMs or hand-made sheets. AI
          maps it into GrowEasy CRM format automatically.
        </p>
      </div>
      {error && <ErrorBanner message={error} />}
      <FileDropzone onFile={handleFile} parsing={parsing} />
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Prefer a ready-made format?{' '}
        <button
          onClick={downloadTemplateCsv}
          className="font-medium text-orange-600 underline-offset-2 hover:underline dark:text-orange-400"
        >
          Download the sample CSV template
        </button>
      </p>
    </section>
  );
}

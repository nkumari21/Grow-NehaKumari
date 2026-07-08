'use client';

import { useMemo, useRef } from 'react';
import { IMPORT_CACHE_KEY } from '@/lib/constants';
import { formatBytes, getApiErrorMessage } from '@/lib/format';
import { useImportLeadsMutation } from '@/store/api/import-api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { importFinished } from '@/store/slices/import-slice';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { ImportProgress } from './ImportProgress';

interface PreviewStepProps {
  file: File;
  onCancel: () => void;
}

export function PreviewStep({ file, onCancel }: PreviewStepProps) {
  const dispatch = useAppDispatch();
  const preview = useAppSelector((state) => state.importFlow.preview);
  const [importLeads, { isLoading, error, reset }] = useImportLeadsMutation({
    fixedCacheKey: IMPORT_CACHE_KEY,
  });
  const activeImport = useRef<{ abort: () => void } | null>(null);

  const tableRows = useMemo(
    () => preview?.rows.map((row) => preview.headers.map((header) => row[header] ?? '')) ?? [],
    [preview],
  );

  if (!preview) return null;

  const confirm = async () => {
    const request = importLeads(file);
    activeImport.current = request;
    try {
      await request.unwrap();
      dispatch(importFinished());
    } catch {
      // the error is rendered from the mutation state below
    } finally {
      activeImport.current = null;
    }
  };

  const cancel = () => {
    if (isLoading) {
      activeImport.current?.abort();
    } else {
      reset();
      onCancel();
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Preview: {preview.fileName}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {formatBytes(preview.fileSize)} · {preview.rows.length.toLocaleString()} rows ·{' '}
            {preview.headers.length} columns · no AI has run yet
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={cancel}>
            {isLoading ? 'Cancel Import' : 'Cancel'}
          </Button>
          <Button onClick={confirm} loading={isLoading}>
            {isLoading ? 'Importing…' : 'Confirm Import'}
          </Button>
        </div>
      </div>

      {error && !isLoading && <ErrorBanner message={getApiErrorMessage(error)} onRetry={confirm} />}
      {isLoading && <ImportProgress />}

      <DataTable headers={preview.headers} rows={tableRows} />
    </section>
  );
}

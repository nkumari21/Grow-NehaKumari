'use client';

import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { useAppSelector } from '@/store/hooks';
import type { BatchProgress } from '@/types/lead';

const TICK_MS = 200;

function realPercent(progress: BatchProgress | null): number {
  if (!progress || progress.totalRows === 0) return 0;
  return (progress.processedRows / progress.totalRows) * 100;
}

function ceilingPercent(progress: BatchProgress | null): number {
  if (!progress || progress.totalBatches === 0) return 12;
  const perBatch = 100 / progress.totalBatches;
  return Math.min(realPercent(progress) + perBatch * 2, 99);
}

function useAnimatedPercent(real: number, ceiling: number): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue((current) => Math.max(current, real));
  }, [real]);

  useEffect(() => {
    const id = setInterval(() => {
      setValue((current) => {
        if (current >= ceiling) return current;
        return Math.min(current + Math.max(0.15, (ceiling - current) * 0.04), ceiling);
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [ceiling]);

  return value;
}

export function ImportProgress() {
  const progress = useAppSelector((state) => state.importFlow.progress);
  const animated = useAnimatedPercent(realPercent(progress), ceilingPercent(progress));
  const animatedRows = progress ? Math.round((animated / 100) * progress.totalRows) : 0;

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/40">
      <div className="flex items-center gap-3">
        <Spinner className="h-5 w-5 text-orange-500" />
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {progress
              ? `AI is extracting leads — batch ${Math.min(progress.completedBatches + 1, progress.totalBatches)} of ${progress.totalBatches}`
              : 'Uploading file and preparing batches…'}
          </p>
          {progress && (
            <p className="text-xs text-slate-600 dark:text-slate-300">
              ~{animatedRows} of {progress.totalRows} rows processed · {progress.imported} imported
              · {progress.skipped} skipped
            </p>
          )}
        </div>
        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
          {Math.round(animated)}%
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-200/70 dark:bg-orange-900">
        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-300"
          style={{ width: `${Math.max(animated, 3)}%` }}
        />
      </div>
    </div>
  );
}

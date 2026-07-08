'use client';

import { useRef, useState, type DragEvent } from 'react';
import { MAX_FILE_SIZE_MB } from '@/lib/constants';
import { Spinner } from '@/components/ui/Spinner';

interface FileDropzoneProps {
  onFile: (file: File) => void;
  parsing: boolean;
}

export function FileDropzone({ onFile, parsing }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (event: DragEvent, active: boolean) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(active);
  };

  const handleDrop = (event: DragEvent) => {
    handleDrag(event, false);
    const file = event.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <button
      type="button"
      disabled={parsing}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => handleDrag(event, true)}
      onDragOver={(event) => handleDrag(event, true)}
      onDragLeave={(event) => handleDrag(event, false)}
      onDrop={handleDrop}
      className={`flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors sm:p-16 ${
        dragActive
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
          : 'border-slate-300 bg-white hover:border-orange-400 hover:bg-orange-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-orange-500 dark:hover:bg-slate-800'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = '';
        }}
      />
      {parsing ? (
        <>
          <Spinner className="h-10 w-10 text-orange-500" />
          <p className="font-semibold">Reading your file…</p>
        </>
      ) : (
        <>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl dark:bg-orange-950">
            📄
          </span>
          <div>
            <p className="text-lg font-semibold">Drop your CSV file here</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              or click to browse files
            </p>
          </div>
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Supported: .csv · max {MAX_FILE_SIZE_MB} MB · any column layout
          </p>
        </>
      )}
    </button>
  );
}

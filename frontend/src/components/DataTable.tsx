'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

const ROW_HEIGHT = 40;
const OVERSCAN = 10;

interface DataTableProps {
  headers: string[];
  rows: string[][];
  renderCell?: (value: string, columnIndex: number, rowIndex: number) => ReactNode;
}

export function DataTable({ headers, rows, renderCell }: DataTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState({ start: 0, end: 50 });

  const updateRange = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const start = Math.max(0, Math.floor(el.scrollTop / ROW_HEIGHT) - OVERSCAN);
    const end = Math.min(rows.length, Math.ceil((el.scrollTop + el.clientHeight) / ROW_HEIGHT) + OVERSCAN);
    setRange({ start, end });
  }, [rows.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = 0;
    setRange({ start: 0, end: 50 });
  }, [rows]);

  const visible = useMemo(() => rows.slice(range.start, range.end), [rows, range]);
  const topPad = range.start * ROW_HEIGHT;
  const bottomPad = Math.max(0, (rows.length - range.end) * ROW_HEIGHT);

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div ref={containerRef} onScroll={updateRange} className="max-h-[55vh] overflow-auto rounded-xl">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-100 text-left dark:bg-slate-800">
              {headers.map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topPad > 0 && <tr style={{ height: topPad }} aria-hidden />}
            {visible.map((row, rowIndex) => (
              <tr
                key={range.start + rowIndex}
                style={{ height: ROW_HEIGHT }}
                className="border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
              >
                {headers.map((_, columnIndex) => {
                  const value = row[columnIndex] ?? '';
                  return (
                    <td
                      key={columnIndex}
                      title={value}
                      className="max-w-64 overflow-hidden text-ellipsis whitespace-nowrap px-3 text-slate-700 dark:text-slate-300"
                    >
                      {renderCell?.(value, columnIndex, range.start + rowIndex) ??
                        (value || <span className="text-slate-400">—</span>)}
                    </td>
                  );
                })}
              </tr>
            ))}
            {bottomPad > 0 && <tr style={{ height: bottomPad }} aria-hidden />}
          </tbody>
        </table>
      </div>
      <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        {rows.length.toLocaleString()} row{rows.length === 1 ? '' : 's'} × {headers.length} columns
      </p>
    </div>
  );
}

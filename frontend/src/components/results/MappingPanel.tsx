import { CRM_FIELD_LABELS, type ColumnMapping, type CrmField } from '@/types/lead';

const targetLabel = (target: string): string =>
  CRM_FIELD_LABELS[target as CrmField] ?? target;

export function MappingPanel({ mapping }: { mapping: ColumnMapping[] }) {
  const mapped = mapping.filter((entry) => entry.target);
  const ignored = mapping.filter((entry) => !entry.target);
  if (mapping.length === 0) return null;

  return (
    <details className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">
        How AI mapped your columns — {mapped.length} of {mapping.length} used
      </summary>
      <div className="mt-3 flex flex-wrap gap-2">
        {mapped.map((entry) => (
          <span
            key={entry.source}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs dark:bg-slate-800"
          >
            <span className="font-medium text-slate-600 dark:text-slate-300">{entry.source}</span>
            <span className="text-orange-500">→</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {targetLabel(entry.target)}
            </span>
          </span>
        ))}
      </div>
      {ignored.length > 0 && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Ignored columns: {ignored.map((entry) => entry.source).join(', ')}
        </p>
      )}
    </details>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { IMPORT_CACHE_KEY } from '@/lib/constants';
import { downloadLeadsCsv, downloadSkippedCsv } from '@/lib/export-csv';
import { useImportLeadsMutation } from '@/store/api/import-api';
import { useAppDispatch } from '@/store/hooks';
import { flowReset } from '@/store/slices/import-slice';
import { CRM_FIELD_LABELS, CRM_FIELDS, CRM_STATUSES, type ImportedLead } from '@/types/lead';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MappingPanel } from './MappingPanel';

const NAME_COLUMN = CRM_FIELDS.indexOf('name');
const STATUS_COLUMN = CRM_FIELDS.indexOf('crm_status');
const SKIPPED_HEADERS = ['CSV Row', 'Reason', 'Original Data'];
const SEARCH_FIELDS = ['name', 'email', 'mobile_without_country_code', 'company', 'city'] as const;
const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  ...CRM_STATUSES.map((status) => ({ value: status, label: status })),
  { value: '', label: 'No status' },
];

type Tab = 'imported' | 'skipped';

export function ResultsStep({ onReset }: { onReset: () => void }) {
  const dispatch = useAppDispatch();
  const [, { data, reset }] = useImportLeadsMutation({ fixedCacheKey: IMPORT_CACHE_KEY });
  const [tab, setTab] = useState<Tab>('imported');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredLeads = useMemo(() => {
    const leads = data?.leads ?? [];
    const needle = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter !== 'ALL' && lead.crm_status !== statusFilter) return false;
      if (!needle) return true;
      return SEARCH_FIELDS.some((field) => lead[field].toLowerCase().includes(needle));
    });
  }, [data, query, statusFilter]);

  const importedRows = useMemo(
    () => filteredLeads.map((lead) => CRM_FIELDS.map((field) => lead[field])),
    [filteredLeads],
  );
  const skippedRows = useMemo(
    () =>
      data?.skipped.map((record) => [
        String(record.row + 2),
        record.reason,
        Object.entries(record.data)
          .filter(([, value]) => value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(' · '),
      ]) ?? [],
    [data],
  );

  if (!data) return null;
  const { summary } = data;

  const startOver = () => {
    reset();
    dispatch(flowReset());
    onReset();
  };

  const renderImportedCell = (value: string, columnIndex: number, rowIndex: number) => {
    if (columnIndex === STATUS_COLUMN) return <StatusBadge status={value} />;
    if (columnIndex === NAME_COLUMN) {
      const lead: ImportedLead | undefined = filteredLeads[rowIndex];
      if (lead?.duplicateOf !== undefined) {
        return (
          <span className="inline-flex items-center gap-1.5">
            {value || <span className="text-slate-400">—</span>}
            <span
              title={`Same contact as CSV row ${lead.duplicateOf + 2}`}
              className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            >
              DUP
            </span>
          </span>
        );
      }
    }
    return undefined;
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Import Complete</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            AI extracted and validated your leads in {summary.totalBatches} batch
            {summary.totalBatches === 1 ? '' : 'es'}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => downloadLeadsCsv(data.leads)}
            disabled={data.leads.length === 0}
          >
            Download CRM CSV
          </Button>
          <Button onClick={startOver}>Import Another File</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Rows" value={summary.totalRows} />
        <StatCard
          label="Imported"
          value={summary.imported}
          tone="success"
          hint={summary.duplicates > 0 ? `${summary.duplicates} possible duplicates flagged` : undefined}
        />
        <StatCard label="Skipped" value={summary.skipped} tone="warning" />
        <StatCard
          label="AI Batches"
          value={summary.totalBatches}
          hint={summary.failedBatches > 0 ? `${summary.failedBatches} failed after retries` : 'all succeeded'}
        />
      </div>

      <MappingPanel mapping={data.mapping} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 sm:w-fit">
          {(['imported', 'skipped'] as const).map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors sm:flex-none ${
                tab === id
                  ? 'bg-white shadow-sm dark:bg-slate-900'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {id} ({id === 'imported' ? summary.imported : summary.skipped})
            </button>
          ))}
        </div>

        {tab === 'imported' ? (
          <div className="flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, phone…"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-orange-500 sm:w-56 dark:border-slate-700 dark:bg-slate-900"
            />
            <Select
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={setStatusFilter}
              className="w-44 shrink-0"
            />
          </div>
        ) : (
          data.skipped.length > 0 && (
            <Button variant="secondary" onClick={() => downloadSkippedCsv(data.skipped)}>
              Download Skipped CSV
            </Button>
          )
        )}
      </div>

      {tab === 'imported' ? (
        importedRows.length > 0 ? (
          <DataTable
            headers={CRM_FIELDS.map((field) => CRM_FIELD_LABELS[field])}
            rows={importedRows}
            renderCell={renderImportedCell}
          />
        ) : (
          <EmptyState
            message={
              data.leads.length > 0
                ? 'No leads match your search or filter.'
                : 'No records could be imported from this file.'
            }
          />
        )
      ) : skippedRows.length > 0 ? (
        <DataTable headers={SKIPPED_HEADERS} rows={skippedRows} />
      ) : (
        <EmptyState message="Nothing was skipped — every row was imported. 🎉" />
      )}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {message}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  DID_NOT_CONNECT: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  BAD_LEAD: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  SALE_DONE: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
};

export function StatusBadge({ status }: { status: string }) {
  if (!status) return <span className="text-slate-400">—</span>;
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.DID_NOT_CONNECT;
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

type Tone = 'neutral' | 'success' | 'warning';

const TONES: Record<Tone, string> = {
  neutral: 'text-slate-900 dark:text-slate-100',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
};

interface StatCardProps {
  label: string;
  value: string | number;
  tone?: Tone;
  hint?: string;
}

export function StatCard({ label, value, tone = 'neutral', hint }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${TONES[tone]}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

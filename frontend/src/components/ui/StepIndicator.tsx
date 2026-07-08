import type { Step } from '@/store/slices/import-slice';

const STEPS: { id: Step; label: string }[] = [
  { id: 'upload', label: 'Upload CSV' },
  { id: 'preview', label: 'Preview & Confirm' },
  { id: 'results', label: 'Results' },
];

export function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <ol className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step.id} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {isDone ? '✓' : index + 1}
              </span>
              <span
                className={`hidden text-sm sm:inline ${
                  isCurrent
                    ? 'font-semibold text-slate-900 dark:text-slate-100'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <span
                className={`h-px w-8 sm:w-14 ${
                  isDone ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

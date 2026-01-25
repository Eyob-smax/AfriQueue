interface ProgressBarProps {
  step: number;
  total: number;
}

export function ProgressBar({ step, total }: ProgressBarProps) {
  const percentage = (step / total) * 100;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-[#0d1b1a] dark:text-gray-200">
            Onboarding Progress
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary font-bold">Step {step}</span>
            <span className="text-gray-400">of {total}</span>
          </div>
        </div>

        <div className="h-2 rounded-full bg-[#cfe7e5] dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

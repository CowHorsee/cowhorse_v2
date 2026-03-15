type StatusProgressIndicatorProps = {
  title?: string;
  stages: readonly string[];
  currentStatus: string;
};

export default function StatusProgressIndicator({
  title = 'Status Progress',
  stages,
  currentStatus,
}: StatusProgressIndicatorProps) {
  const currentStatusIndex = stages.findIndex(
    (stage) => stage === currentStatus
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </p>
      <div className="mt-3 flex items-center gap-2">
        {stages.map((stage, index) => {
          const isActive = index === currentStatusIndex;
          const isCompleted =
            currentStatusIndex > -1 &&
            index < currentStatusIndex &&
            currentStatus !== 'Rejected';

          return (
            <div key={stage} className="flex items-center gap-2">
              <span
                className={`h-3.5 w-3.5 rounded-full border ${
                  isActive
                    ? 'border-brand-red bg-brand-red'
                    : isCompleted
                    ? 'border-brand-blue bg-brand-blue'
                    : 'border-slate-300 bg-white'
                }`}
              />
              {index < stages.length - 1 ? (
                <span className="h-[2px] w-4 bg-slate-300" />
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm font-semibold text-brand-blue">
        {currentStatus}
      </p>
    </div>
  );
}

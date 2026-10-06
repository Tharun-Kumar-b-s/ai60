export function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex justify-between text-sm">
          <span className="font-medium">{label}</span>
          <span className="text-ink/60">{Math.min(value, max)}/{max}</span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-ink/10" role="progressbar"
           aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className="h-full rounded-full bg-cobalt transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

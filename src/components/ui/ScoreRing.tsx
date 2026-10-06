/** AI Readiness dial: 60 ticks, one per minute of the workshop. Score 0-100 fills round(score * 0.6) ticks. */
export function ScoreRing({ score, size = 220 }: { score: number; size?: number }) {
  const safe = Math.max(0, Math.min(100, Math.round(score)));
  const on = Math.round(safe * 0.6);
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}
         role="img" aria-label={`AI readiness score ${safe} out of 100`}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {Array.from({ length: 60 }, (_, i) => (
          <line key={i} x1="60" y1="5" x2="60" y2={i % 5 === 0 ? 18 : 14}
                strokeWidth={i % 5 === 0 ? 2.6 : 1.8} strokeLinecap="round"
                transform={`rotate(${i * 6} 60 60)`}
                className={i < on ? 'tick-on' : 'tick-off'}
                style={i < on ? { animationDelay: `${i * 22}ms` } : undefined} />
        ))}
      </svg>
      <div className="text-center">
        <div className="font-display text-5xl font-extrabold leading-none">{safe}</div>
        <div className="mt-1 text-sm text-ink/60">out of 100</div>
      </div>
    </div>
  );
}

import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'cobalt' | 'highlight' | 'mint' | 'coral' | 'demo';
const tones: Record<Tone, string> = {
  neutral: 'bg-ink/5 text-ink',
  cobalt: 'bg-cobalt/10 text-cobalt-dark',
  highlight: 'bg-highlight text-ink',
  mint: 'bg-mint/10 text-mint',
  coral: 'bg-coral/10 text-coral',
  demo: 'border border-dashed border-ink/40 text-ink/70',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold', tones[tone])}>
      {children}
    </span>
  );
}

/** Use on every metric or row that comes from seeded data. Never show simulated numbers without it. */
export function DemoBadge() {
  return <Badge tone="demo">Demo data</Badge>;
}

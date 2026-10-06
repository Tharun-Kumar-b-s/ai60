import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScoreRing } from '@/components/ui/ScoreRing';

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="highlight">Free</Badge>
            <Badge tone="cobalt">60 minutes</Badge>
            <Badge>Date to be announced</Badge>
          </div>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            Build Your First AI Project in 60 Minutes
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink/70">
            Stop watching AI tutorials. Build something you can actually show.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="/challenge" size="lg">Check My AI Readiness</Button>
            <Button href="#how" variant="secondary" size="lg">How It Works</Button>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <ScoreRing score={64} size={260} />
          <p className="mt-3 text-sm text-ink/60">Sample result. Your score is calculated from 6 quick taps.</p>
        </div>
      </div>
      <p id="how" className="mt-16 rounded-xl border border-dashed border-ink/30 p-4 text-sm text-ink/70">
        Phase 1 shell. The full landing page, the challenge and the result screen ship in Phase 2.
        Component preview: <a className="font-semibold text-cobalt underline" href="/styleguide">/styleguide</a>
      </p>
    </div>
  );
}

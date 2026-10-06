import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge, DemoBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScoreRing } from '@/components/ui/ScoreRing';

export const metadata = { title: 'Styleguide | AI60', robots: { index: false } };

export default function Styleguide() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold">Styleguide</h1>

      <Card>
        <h2 className="text-lg font-bold">Buttons</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button>Register free</Button>
          <Button variant="highlight">Claim reward</Button>
          <Button variant="secondary">Copy referral link</Button>
          <Button variant="ghost">Skip</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Badges</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>Neutral</Badge><Badge tone="cobalt">AI Learner</Badge><Badge tone="highlight">Top 10</Badge>
          <Badge tone="mint">Registered</Badge><Badge tone="coral">Needs work</Badge><DemoBadge />
        </div>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold">Reward progress</h2>
          <div className="mt-4 space-y-4">
            <ProgressBar label="AI Project Prompt Pack" value={3} max={3} />
            <ProgressBar label="AI Project Evaluation" value={3} max={5} />
            <ProgressBar label="Priority Q&A" value={3} max={10} />
          </div>
        </Card>
        <Card className="flex flex-col items-center">
          <h2 className="self-start text-lg font-bold">Score dial (one tick per minute)</h2>
          <div className="mt-4"><ScoreRing score={82} size={240} /></div>
        </Card>
      </div>
    </div>
  );
}

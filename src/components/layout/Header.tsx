import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function Logo() {
  return (
    <Link href="/" className="font-display text-xl font-extrabold tracking-tight" aria-label="AI60 home">
      AI<span className="ml-0.5 rounded bg-highlight px-1">60</span>
    </Link>
  );
}

const links = [
  { href: '/challenge', label: 'Readiness challenge' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/ambassador', label: 'Ambassadors' },
  { href: '/submit', label: 'Submit project' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5 hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <Button href="/challenge" size="md" className="hidden sm:inline-flex">Check my AI readiness</Button>
        <Button href="/challenge" size="md" className="px-3 text-sm sm:hidden">Start</Button>
      </div>
    </header>
  );
}

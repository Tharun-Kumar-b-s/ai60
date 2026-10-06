'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const items = [
  { href: '/', label: 'Home' },
  { href: '/challenge', label: 'Challenge' },
  { href: '/leaderboard', label: 'Ranks' },
  { href: '/ambassador', label: 'Ambassador' },
];

export function MobileNav() {
  const path = usePathname();
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 backdrop-blur md:hidden"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="grid grid-cols-4">
        {items.map((it) => {
          const active = it.href === '/' ? path === '/' : path.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link href={it.href} aria-current={active ? 'page' : undefined}
                    className={cn('relative flex min-h-[56px] items-center justify-center text-[13px] font-semibold',
                                  active ? 'text-cobalt' : 'text-ink/60')}>
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-cobalt" />}
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

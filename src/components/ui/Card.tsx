import { cn } from '@/lib/cn';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-2xl border border-ink/10 bg-white p-5 sm:p-6', className)}>{children}</div>;
}

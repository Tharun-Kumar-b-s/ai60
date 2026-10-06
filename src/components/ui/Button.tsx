import Link from 'next/link';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'highlight';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors ' +
  'disabled:cursor-not-allowed disabled:opacity-50 select-none';
const variants: Record<Variant, string> = {
  primary: 'bg-cobalt text-white hover:bg-cobalt-dark',
  highlight: 'bg-highlight text-ink hover:brightness-95',
  secondary: 'border border-ink/15 bg-white text-ink hover:border-ink/40',
  ghost: 'text-ink hover:bg-ink/5',
};
const sizes = { md: 'min-h-[44px] px-4 text-[15px]', lg: 'min-h-[52px] px-6 text-base' };

type Props = {
  variant?: Variant;
  size?: keyof typeof sizes;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = 'primary', size = 'md', href, className, children, ...rest }: Props) {
  const cls = cn(base, variants[variant], sizes[size], className);
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button className={cls} {...rest}>{children}</button>;
}

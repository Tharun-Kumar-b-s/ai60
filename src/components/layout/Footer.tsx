import { Logo } from './Header';

export function Footer() {
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-ink/60 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Logo />
        <p className="max-w-md">
          A growth-challenge simulation. Workshop date and details are placeholders. Leaderboard and analytics
          numbers are labelled when they come from demo data.
        </p>
      </div>
    </footer>
  );
}

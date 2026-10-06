import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">This page isn&apos;t built yet</h1>
      <p className="mt-3 text-ink/70">It ships in a later phase of the build. Head back to the start.</p>
      <Button href="/" className="mt-6">Back to home</Button>
    </div>
  );
}

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';

export const metadata: Metadata = {
  title: 'AI60: Build Your First AI Project in 60 Minutes',
  description: 'A free 60-minute workshop. Find your AI readiness score, then build a project you can put on GitHub.',
  openGraph: {
    title: 'Build Your First AI Project in 60 Minutes',
    description: 'Free workshop for final-year engineering students. Check your AI readiness score.',
    type: 'website',
  },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#F6F7FB' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col pb-[72px] md:pb-0">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}

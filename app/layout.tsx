/* ═══════════════════════════════════════════════════════════════
   Velora — Root Layout
   App shell with full SEO metadata and skip navigation.
   ═══════════════════════════════════════════════════════════════ */

import type { Metadata } from 'next';
import './globals.css';
import { UsageWidget } from '@/components/ui/UsageWidget';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const metadata: Metadata = {
  title: 'Velora — AI Event Planning Assistant | Celebrate Beautifully',
  description:
    'Plan weddings, birthdays, and community events with AI-powered budgets, timelines, vendor checklists, and personalized ideas. Celebrate beautifully with Velora.',
  keywords: [
    'event planning',
    'wedding planner',
    'birthday party',
    'AI assistant',
    'budget planning',
    'vendor checklist',
    'event timeline',
  ],
  authors: [{ name: 'Velora Team' }],
  openGraph: {
    title: 'Velora — Celebrate Beautifully',
    description:
      'AI-powered event planning for weddings, birthdays, and community events.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Velora',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Navigation Header */}
        <header className="header" role="banner">
          <div className="header-inner">
            <a href="/" className="logo" aria-label="Velora — Home">
              Velora
            </a>
            <nav aria-label="Main navigation">
              <ul className="nav-links">
                <li>
                  <a href="/" className="nav-link">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/planner" className="nav-link">
                    Plan Event
                  </a>
                </li>
                <li>
                  <a href="/chat" className="nav-link">
                    AI Chat
                  </a>
                </li>
              </ul>
            </nav>

          </div>
          <ThemeToggle />
        </header>
        <UsageWidget />

        <main id="main-content">{children}</main>

        {/* Footer */}
        <footer className="footer" role="contentinfo">
          <div className="container">
            <p className="footer-text">
              Powered by{' '}
              <span className="footer-brand">Velora AI</span>
              {' '}— Celebrate beautifully.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

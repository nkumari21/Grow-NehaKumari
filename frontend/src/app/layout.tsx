import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'GrowEasy — AI CSV Lead Importer',
  description: 'Import leads from any CSV format into GrowEasy CRM using AI field mapping.',
};

const themeScript = `(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-lg font-bold text-white">
                  G
                </span>
                <div>
                  <p className="text-sm font-bold leading-tight">GrowEasy</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">AI CSV Lead Importer</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
          <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Built for the GrowEasy Software Developer assignment
          </footer>
        </Providers>
      </body>
    </html>
  );
}

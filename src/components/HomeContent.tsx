'use client';

import { SearchForm, FavoritesList, LanguageToggle } from '@/components';
import { useTranslation } from '@/lib/i18n';

// ============================================
// COMPONENT
// ============================================

export function HomeContent() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Ambient Background Glow - Ultra Subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-cyan-950/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-radial from-emerald-950/10 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="relative z-10 flex items-center justify-end p-4 md:px-8">
        <LanguageToggle />
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 pt-0 md:p-8 md:pt-0">
        <div className="w-full max-w-2xl mx-auto text-center mb-10">
          {/* Logo / Icon - Premium gradient with glow */}
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-4 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/20">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl tracking-tight mb-4">
            <span className="text-white font-light tracking-wide">Clubs</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-bold">
              Tracker
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-slate-400 max-w-md mx-auto">
            {t.search.subtitle}
          </p>
        </div>

        {/* Search Form */}
        <SearchForm />

        {/* Favorites List */}
        <FavoritesList />
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-slate-600 text-sm border-t border-slate-800/50">
        <p>{t.search.apiData}</p>
      </footer>
    </main>
  );
}

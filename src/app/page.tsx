import Link from 'next/link';
import { SearchForm, FavoritesList } from '@/components';

// ============================================
// PAGE COMPONENT
// ============================================

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">
      {/* Navigation Bar */}
      <nav className="w-full px-4 py-3 border-b border-gray-800/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-lg">
            Clubs Tracker
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-300 text-sm font-semibold hover:from-amber-500/30 hover:to-yellow-500/30 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <span className="hidden sm:inline">Ranking Global</span>
            <span className="sm:hidden">Ranking</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl mx-auto text-center mb-10">
          {/* Logo / Icon */}
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30">
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
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Clubs{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Tracker
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            Acompanhe as estatísticas do seu clube no EA Sports FC Clubs.
            Busque qualquer time e veja jogadores, partidas e muito mais.
          </p>
        </div>

        {/* Search Form */}
        <SearchForm />

        {/* Favorites List */}
        <FavoritesList />
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-600 text-sm border-t border-gray-800/50">
        <p>
          Dados fornecidos pela API do EA Sports FC Clubs
        </p>
      </footer>
    </main>
  );
}

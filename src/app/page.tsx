import { SearchForm, FavoritesList } from '@/components';

// ============================================
// PAGE COMPONENT
// ============================================

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">
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
            Pro Clubs{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Tracker
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            Acompanhe as estatísticas do seu clube no EA Sports FC Pro Clubs.
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
          Dados fornecidos pela API do EA Sports FC Pro Clubs
        </p>
      </footer>
    </main>
  );
}

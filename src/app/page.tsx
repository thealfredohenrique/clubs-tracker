import { searchClubByName } from '@/lib/api-client';
import { ClubHeader } from '@/components';
import type { Platform } from '@/types/clubs-api';

// ============================================
// CONFIGURAÇÕES
// Altere estes valores para buscar diferentes clubes
// ============================================

const PLATFORM: Platform = 'common-gen5';
const CLUB_NAME = 'Fera Enjaulada';

// ============================================
// PAGE COMPONENT
// ============================================

export default async function Home() {
  const result = await searchClubByName(PLATFORM, CLUB_NAME);

  return (
    <main className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Pro Clubs Tracker
          </h1>
          <p className="text-gray-400">
            Estatísticas do EA Sports FC Pro Clubs
          </p>
        </header>

        {/* Club Header Component */}
        {result.success && result.data.length > 0 ? (
          <ClubHeader club={result.data[0]} />
        ) : (
          <div className="p-8 bg-red-900/30 border border-red-500/50 rounded-2xl text-center">
            <p className="text-red-300 text-lg font-medium">
              {result.success
                ? 'Nenhum clube encontrado com esse nome.'
                : `Erro: ${result.error.message}`}
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Dados fornecidos pela API do EA Sports FC Pro Clubs
          </p>
        </footer>
      </div>
    </main>
  );
}

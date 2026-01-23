import { searchClubByName, getMembersStats, getClubMatches } from '@/lib/api-client';
import { ClubHeader, ClubRoster, MatchHistory } from '@/components';
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

  // Buscar membros se o clube foi encontrado
  const club = result.success && result.data.length > 0 ? result.data[0] : null;
  const membersResult = club
    ? await getMembersStats(PLATFORM, club.clubId)
    : null;

  // Buscar partidas recentes (liga)
  const matchesResult = club
    ? await getClubMatches(PLATFORM, club.clubId, 'leagueMatch')
    : null;

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
        {club ? (
          <>
            <ClubHeader club={club} />

            {/* Club Roster Component */}
            <div className="mt-6">
              {membersResult?.success && membersResult.data.members.length > 0 ? (
                <ClubRoster members={membersResult.data.members} />
              ) : (
                <div className="p-6 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-center">
                  <p className="text-gray-400">
                    {membersResult?.success
                      ? 'Nenhum membro encontrado.'
                      : `Erro ao carregar membros: ${membersResult?.error.message}`}
                  </p>
                </div>
              )}
            </div>

            {/* Match History Component */}
            <div className="mt-6">
              {matchesResult?.success && matchesResult.data.length > 0 ? (
                <MatchHistory matches={matchesResult.data} clubId={club.clubId} />
              ) : (
                <div className="p-6 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-center">
                  <p className="text-gray-400">
                    {matchesResult?.success
                      ? 'Nenhuma partida encontrada.'
                      : `Erro ao carregar partidas: ${matchesResult?.error.message}`}
                  </p>
                </div>
              )}
            </div>
          </>
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

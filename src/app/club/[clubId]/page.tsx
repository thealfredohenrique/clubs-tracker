import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  searchClubByName,
  getMembersStats,
  getClubMatches,
  getClubsInfo,
} from '@/lib/api-client';
import { ClubHeader, ClubRoster, MatchHistory } from '@/components';
import type { Platform, ClubSearchResult } from '@/types/clubs-api';

// ============================================
// TYPES
// ============================================

interface ClubPageProps {
  params: Promise<{
    clubId: string;
  }>;
  searchParams: Promise<{
    platform?: string;
    name?: string;
  }>;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function isValidPlatform(platform: string | undefined): platform is Platform {
  return platform === 'common-gen5' || platform === 'common-gen4' || platform === 'nx';
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function ClubPage({ params, searchParams }: ClubPageProps) {
  const { clubId } = await params;
  const { platform: platformParam, name } = await searchParams;

  // Validar plataforma (default: common-gen5)
  const platform: Platform = isValidPlatform(platformParam)
    ? platformParam
    : 'common-gen5';

  // Estratégia: Buscar info do clube por ID ou buscar por nome se fornecido
  let club: ClubSearchResult | null = null;

  // Se temos o nome do clube, buscamos por nome para obter dados completos
  if (name) {
    const searchResult = await searchClubByName(platform, decodeURIComponent(name));
    if (searchResult.success && searchResult.data.length > 0) {
      // Encontrar o clube com o ID correspondente
      club = searchResult.data.find((c) => c.clubId === clubId) || searchResult.data[0];
    }
  }

  // Fallback: buscar info do clube diretamente se não encontrou por nome
  if (!club) {
    const infoResult = await getClubsInfo(platform, clubId);
    if (infoResult.success && infoResult.data[clubId]) {
      // Criar um objeto ClubSearchResult parcial com os dados disponíveis
      const clubInfo = infoResult.data[clubId];

      // Buscar stats adicionais
      const searchByName = await searchClubByName(platform, clubInfo.name);
      if (searchByName.success && searchByName.data.length > 0) {
        club = searchByName.data.find((c) => c.clubId === clubId) || searchByName.data[0];
      }
    }
  }

  // Se não encontrou o clube, retornar 404
  if (!club) {
    notFound();
  }

  // Buscar dados adicionais em paralelo
  const [membersResult, matchesResult] = await Promise.all([
    getMembersStats(platform, clubId),
    getClubMatches(platform, clubId, 'leagueMatch'),
  ]);

  return (
    <main className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <nav className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Voltar para busca</span>
          </Link>
        </nav>

        {/* Club Header */}
        <ClubHeader club={club} />

        {/* Club Roster */}
        <div className="mt-6">
          {membersResult.success && membersResult.data.members.length > 0 ? (
            <ClubRoster members={membersResult.data.members} />
          ) : (
            <div className="p-6 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-center">
              <p className="text-gray-400">
                {membersResult.success
                  ? 'Nenhum membro encontrado.'
                  : `Erro ao carregar membros: ${membersResult.error.message}`}
              </p>
            </div>
          )}
        </div>

        {/* Match History */}
        <div className="mt-6">
          {matchesResult.success && matchesResult.data.length > 0 ? (
            <MatchHistory matches={matchesResult.data} clubId={clubId} />
          ) : (
            <div className="p-6 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-center">
              <p className="text-gray-400">
                {matchesResult.success
                  ? 'Nenhuma partida encontrada.'
                  : `Erro ao carregar partidas: ${matchesResult.error.message}`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Dados fornecidos pela API do EA Sports FC Pro Clubs</p>
        </footer>
      </div>
    </main>
  );
}

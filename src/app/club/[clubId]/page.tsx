'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  searchClubByName,
  getMembersStats,
  getAllClubMatches,
  getClubsInfo,
  getClubOverallStats,
} from '@/lib/api-client';
import { ClubHeader, ClubRoster, MatchHistory } from '@/components';
import type {
  Platform,
  ClubSearchResult,
  MembersStatsResponse,
  MatchesResponse,
  ClubOverallStats,
} from '@/types/clubs-api';

// ============================================
// HELPER FUNCTIONS
// ============================================

function isValidPlatform(platform: string | null): platform is Platform {
  return platform === 'common-gen5' || platform === 'common-gen4' || platform === 'nx';
}

// ============================================
// LOADING COMPONENT
// ============================================

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin w-10 h-10 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-gray-400">Carregando dados do clube...</p>
      </div>
    </div>
  );
}

// ============================================
// ERROR COMPONENT
// ============================================

function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-8 bg-red-900/30 border border-red-500/50 rounded-2xl text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
        <svg
          className="w-8 h-8 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-red-300 mb-2">Ops! Algo deu errado</h2>
      <p className="text-red-300/80 mb-6">{message}</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold hover:bg-emerald-500/30 transition-all"
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        Voltar para a Busca
      </Link>
    </div>
  );
}

// ============================================
// PAGE COMPONENT
// ============================================

export default function ClubPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const clubId = params.clubId as string;
  const platformParam = searchParams.get('platform');
  const name = searchParams.get('name');

  // Validar plataforma (default: common-gen5)
  const platform: Platform = isValidPlatform(platformParam)
    ? platformParam
    : 'common-gen5';

  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [club, setClub] = useState<ClubSearchResult | null>(null);
  const [overallStats, setOverallStats] = useState<ClubOverallStats | null>(null);
  const [membersData, setMembersData] = useState<MembersStatsResponse | null>(null);
  const [matchesData, setMatchesData] = useState<MatchesResponse | null>(null);

  // Atualizar título da página quando o clube é carregado (SEO dinâmico)
  useEffect(() => {
    if (club) {
      document.title = `${club.clubName} | Clubs Tracker`;
    }
  }, [club]);

  // Buscar dados ao carregar a página
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        let foundClub: ClubSearchResult | null = null;

        // Se temos o nome do clube, buscamos por nome para obter dados completos
        if (name) {
          const searchResult = await searchClubByName(platform, decodeURIComponent(name));
          if (searchResult.success && searchResult.data.length > 0) {
            foundClub = searchResult.data.find((c) => c.clubId === clubId) || searchResult.data[0];
          }
        }

        // Fallback: buscar info do clube diretamente se não encontrou por nome
        if (!foundClub) {
          const infoResult = await getClubsInfo(platform, clubId);
          if (infoResult.success && infoResult.data[clubId]) {
            const clubInfo = infoResult.data[clubId];
            const searchByName = await searchClubByName(platform, clubInfo.name);
            if (searchByName.success && searchByName.data.length > 0) {
              foundClub = searchByName.data.find((c) => c.clubId === clubId) || searchByName.data[0];
            }
          }
        }

        if (!foundClub) {
          setError('Clube não encontrado.');
          setIsLoading(false);
          return;
        }

        setClub(foundClub);

        // Buscar dados adicionais em paralelo
        const [membersResult, matchesResult, overallResult] = await Promise.all([
          getMembersStats(platform, clubId),
          getAllClubMatches(platform, clubId),
          getClubOverallStats(platform, clubId),
        ]);

        if (membersResult.success) {
          setMembersData(membersResult.data);
        }

        if (matchesResult.success) {
          setMatchesData(matchesResult.data);
        }

        if (overallResult.success && overallResult.data.length > 0) {
          setOverallStats(overallResult.data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [clubId, platform, name]);

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

        {/* Loading State */}
        {isLoading && <LoadingSpinner />}

        {/* Error State */}
        {!isLoading && error && <ErrorState message={error} />}

        {/* Club Content */}
        {!isLoading && !error && club && (
          <>
            {/* Club Header */}
            <ClubHeader club={club} recentMatches={matchesData || undefined} overallStats={overallStats || undefined} />

            {/* Club Roster */}
            <div className="mt-6">
              {membersData && membersData.members.length > 0 ? (
                <>
                  <ClubRoster members={membersData.members} />

                  {/* Compare Link */}
                  {membersData.members.length >= 2 && (
                    <div className="mt-4 flex justify-center">
                      <Link
                        href={`/compare?clubId=${clubId}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 font-semibold hover:from-amber-500/30 hover:to-orange-500/30 hover:border-amber-500/50 transition-all"
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
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        Comparar Jogadores (X1)
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-center">
                  <p className="text-gray-400">Nenhum membro encontrado.</p>
                </div>
              )}
            </div>

            {/* Match History */}
            <div className="mt-6">
              {matchesData && matchesData.length > 0 ? (
                <MatchHistory matches={matchesData} clubId={clubId} />
              ) : (
                <div className="p-6 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-center">
                  <p className="text-gray-400">Nenhuma partida encontrada.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Dados fornecidos pela API do EA Sports FC Clubs</p>
        </footer>
      </div>
    </main>
  );
}

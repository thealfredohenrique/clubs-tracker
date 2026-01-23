'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  searchClubByName,
  getMembersStats,
  getClubMatches,
  getClubsInfo,
} from '@/lib/api-client';
import { ClubHeader, ClubRoster, MatchHistory } from '@/components';
import type {
  Platform,
  ClubSearchResult,
  MembersStatsResponse,
  MatchesResponse,
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
  const [membersData, setMembersData] = useState<MembersStatsResponse | null>(null);
  const [matchesData, setMatchesData] = useState<MatchesResponse | null>(null);

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
        const [membersResult, matchesResult] = await Promise.all([
          getMembersStats(platform, clubId),
          getClubMatches(platform, clubId, 'leagueMatch'),
        ]);

        if (membersResult.success) {
          setMembersData(membersResult.data);
        }

        if (matchesResult.success) {
          setMatchesData(matchesResult.data);
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
        {!isLoading && error && (
          <div className="p-8 bg-red-900/30 border border-red-500/50 rounded-2xl text-center">
            <p className="text-red-300 text-lg font-medium">{error}</p>
            <Link
              href="/"
              className="mt-4 inline-block text-emerald-400 hover:text-emerald-300"
            >
              Voltar para a busca
            </Link>
          </div>
        )}

        {/* Club Content */}
        {!isLoading && !error && club && (
          <>
            {/* Club Header */}
            <ClubHeader club={club} />

            {/* Club Roster */}
            <div className="mt-6">
              {membersData && membersData.members.length > 0 ? (
                <ClubRoster members={membersData.members} />
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
          <p>Dados fornecidos pela API do EA Sports FC Pro Clubs</p>
        </footer>
      </div>
    </main>
  );
}

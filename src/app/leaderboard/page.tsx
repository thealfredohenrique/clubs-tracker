'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGlobalLeaderboard } from '@/lib/api-client';
import type { Platform, ClubSearchResult } from '@/types/clubs-api';

// ============================================
// CONSTANTS
// ============================================

const CREST_BASE_URL =
  'https://eafc24.content.easports.com/fifa/fltOnlineAssets/24B23FDE-7835-41C2-87A2-F453DFDB2E82/2024/fcweb/crests/256x256/l';

const PLATFORMS: { value: Platform; label: string; shortLabel: string }[] = [
  { value: 'common-gen5', label: 'PS5 / Xbox Series / PC', shortLabel: 'Gen5' },
  { value: 'common-gen4', label: 'PS4 / Xbox One', shortLabel: 'Gen4' },
  { value: 'nx', label: 'Nintendo Switch', shortLabel: 'Switch' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getCrestUrl(crestAssetId: string | undefined): string | null {
  if (!crestAssetId) return null;
  return `${CREST_BASE_URL}${crestAssetId}.png`;
}

function getRankStyle(rank: number): {
  icon: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (rank) {
    case 1:
      return {
        icon: '🏆',
        bgClass: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
        textClass: 'text-yellow-400',
        borderClass: 'border-yellow-500/50',
      };
    case 2:
      return {
        icon: '🥈',
        bgClass: 'bg-gradient-to-r from-gray-300/20 to-slate-400/20',
        textClass: 'text-gray-300',
        borderClass: 'border-gray-400/50',
      };
    case 3:
      return {
        icon: '🥉',
        bgClass: 'bg-gradient-to-r from-orange-600/20 to-amber-700/20',
        textClass: 'text-orange-400',
        borderClass: 'border-orange-500/50',
      };
    default:
      return {
        icon: '',
        bgClass: 'bg-gray-800/50 hover:bg-gray-800/80',
        textClass: 'text-gray-400',
        borderClass: 'border-gray-700/50',
      };
  }
}

// ============================================
// LOADING COMPONENT
// ============================================

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
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
        <p className="text-gray-400">Carregando ranking...</p>
      </div>
    </div>
  );
}

// ============================================
// ERROR COMPONENT
// ============================================

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
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
      <h2 className="text-xl font-bold text-red-300 mb-2">Erro ao carregar ranking</h2>
      <p className="text-red-300/80 mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white font-semibold hover:bg-gray-700 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Tentar Novamente
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold hover:bg-emerald-500/30 transition-all"
        >
          Voltar para a Busca
        </Link>
      </div>
    </div>
  );
}

// ============================================
// LEADERBOARD ROW COMPONENT
// ============================================

interface LeaderboardRowProps {
  club: ClubSearchResult;
  rank: number;
  platform: Platform;
}

function LeaderboardRow({ club, rank, platform }: LeaderboardRowProps) {
  const rankStyle = getRankStyle(rank);
  const crestUrl = getCrestUrl(club.clubInfo.customKit?.crestAssetId);

  const wins = parseInt(club.wins, 10) || 0;
  const ties = parseInt(club.ties, 10) || 0;
  const losses = parseInt(club.losses, 10) || 0;
  const skillRating = parseInt(club.points, 10) || 0;
  const division = parseInt(club.currentDivision, 10) || parseInt(club.bestDivision, 10) || 0;

  return (
    <Link
      href={`/club/${club.clubId}?platform=${platform}&name=${encodeURIComponent(club.clubName)}`}
      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all ${rankStyle.bgClass} ${rankStyle.borderClass} ${rank > 3 ? 'hover:scale-[1.01] hover:border-emerald-500/30' : ''}`}
    >
      {/* Rank */}
      <div className={`flex-shrink-0 w-10 sm:w-14 text-center font-black text-lg sm:text-2xl ${rankStyle.textClass}`}>
        {rank <= 3 ? (
          <span className="text-2xl sm:text-3xl">{rankStyle.icon}</span>
        ) : (
          <span>#{rank}</span>
        )}
      </div>

      {/* Club Crest & Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-700/50 flex items-center justify-center overflow-hidden">
          {crestUrl ? (
            <Image
              src={crestUrl}
              alt={club.clubName}
              width={48}
              height={48}
              className="object-contain"
              unoptimized
            />
          ) : (
            <span className="text-lg font-bold text-gray-500">
              {club.clubName.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-white text-sm sm:text-base truncate">
            {club.clubName}
          </h3>
          <p className="text-xs text-gray-500 sm:hidden">
            {wins}V - {ties}E - {losses}D
          </p>
        </div>
      </div>

      {/* Skill Rating / Points */}
      <div className="flex-shrink-0 text-right">
        <div className="text-lg sm:text-xl font-black text-emerald-400">
          {skillRating.toLocaleString('pt-BR')}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">
          Pontos
        </div>
      </div>

      {/* Record - Hidden on mobile */}
      <div className="hidden sm:flex flex-shrink-0 items-center gap-1 text-sm font-semibold">
        <span className="text-emerald-400">{wins}</span>
        <span className="text-gray-600">-</span>
        <span className="text-gray-400">{ties}</span>
        <span className="text-gray-600">-</span>
        <span className="text-red-400">{losses}</span>
      </div>

      {/* Division - Hidden on mobile */}
      <div className="hidden md:flex flex-shrink-0 w-16 justify-center">
        {division > 0 ? (
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-sm">
            {division}
          </span>
        ) : (
          <span className="text-gray-600">-</span>
        )}
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0 text-gray-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

// ============================================
// PAGE COMPONENT
// ============================================

export default function LeaderboardPage() {
  const [platform, setPlatform] = useState<Platform>('common-gen5');
  const [clubs, setClubs] = useState<ClubSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async (selectedPlatform: Platform) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getGlobalLeaderboard(selectedPlatform);
      if (result.success) {
        // Limitar a 100 clubes
        setClubs(result.data.slice(0, 100));
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ranking');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(platform);
  }, [platform]);

  const handlePlatformChange = (newPlatform: Platform) => {
    setPlatform(newPlatform);
  };

  return (
    <main className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <nav className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
            Ranking{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">
              Global
            </span>
          </h1>
          <p className="text-gray-400">Top 100 clubes do EA Sports FC Pro Clubs</p>
        </div>

        {/* Platform Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl bg-gray-800/50 border border-gray-700/50 p-1">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePlatformChange(p.value)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${platform === p.value
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                <span className="hidden sm:inline">{p.label}</span>
                <span className="sm:hidden">{p.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table Header - Desktop */}
        <div className="hidden sm:flex items-center gap-4 px-4 py-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="w-14 text-center">Pos</div>
          <div className="flex-1">Clube</div>
          <div className="w-20 text-right">Pontos</div>
          <div className="w-24 text-center">Recorde</div>
          <div className="hidden md:block w-16 text-center">Div</div>
          <div className="w-5"></div>
        </div>

        {/* Loading State */}
        {isLoading && <LoadingSpinner />}

        {/* Error State */}
        {!isLoading && error && (
          <ErrorState message={error} onRetry={() => fetchLeaderboard(platform)} />
        )}

        {/* Leaderboard List */}
        {!isLoading && !error && clubs.length > 0 && (
          <div className="space-y-2">
            {clubs.map((club, index) => (
              <LeaderboardRow
                key={club.clubId}
                club={club}
                rank={index + 1}
                platform={platform}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && clubs.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-6">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum clube encontrado</h3>
            <p className="text-gray-400">
              Não foi possível carregar o ranking para esta plataforma.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Dados fornecidos pela API do EA Sports FC Clubs</p>
        </footer>
      </div>
    </main>
  );
}

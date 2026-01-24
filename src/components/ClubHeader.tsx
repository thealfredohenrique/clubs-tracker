'use client';

import Image from 'next/image';
import type { ClubSearchResult, Match, ClubOverallStats } from '@/types/clubs-api';
import { FavoriteButton } from './FavoriteButton';
import type { FavoriteClub } from '@/hooks';

// ============================================
// TYPES
// ============================================

interface ClubHeaderProps {
  club: ClubSearchResult;
  recentMatches?: Match[];
  overallStats?: ClubOverallStats;
}

type MatchResult = 'win' | 'draw' | 'loss';

// ============================================
// CONSTANTS
// ============================================

const CREST_BASE_URL =
  'https://eafc24.content.easports.com/fifa/fltOnlineAssets/24B23FDE-7835-41C2-87A2-F453DFDB2E82/2024/fcweb/crests/256x256/l';

const DIVISION_CREST_BASE_URL =
  'https://media.contentapi.ea.com/content/dam/eacom/fc/pro-clubs/divisioncrest';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Gera a URL do escudo do clube
 */
function getCrestUrl(crestAssetId: string): string {
  return `${CREST_BASE_URL}${crestAssetId}.png`;
}

/**
 * Gera a URL do brasão oficial da divisão
 * Retorna null se a divisão for inválida (0, null, ou não numérica)
 */
function getDivisionCrestUrl(division: string | null | undefined): string | null {
  if (!division) return null;
  const divNum = parseInt(division, 10);
  if (isNaN(divNum) || divNum <= 0) return null;
  return `${DIVISION_CREST_BASE_URL}${divNum}.png`;
}

/**
 * Calcula a taxa de vitória em porcentagem
 */
function getWinRate(wins: number, gamesPlayed: number): number {
  if (gamesPlayed === 0) return 0;
  return Math.round((wins / gamesPlayed) * 100);
}

/**
 * Retorna o nome da divisão formatado
 */
function getDivisionName(division: string): string {
  const divNum = parseInt(division, 10);
  if (isNaN(divNum)) return `Divisão ${division}`;
  return `Divisão ${divNum}`;
}

/**
 * Determina o resultado de uma partida para um clube específico
 */
function getMatchResult(match: Match, clubId: string): MatchResult {
  const clubData = match.clubs[clubId];
  const opponentId = Object.keys(match.clubs).find((id) => id !== clubId);
  const opponentData = opponentId ? match.clubs[opponentId] : null;

  const ourGoals = parseInt(clubData?.goals || '0', 10);
  const theirGoals = parseInt(opponentData?.goals || '0', 10);

  if (ourGoals > theirGoals) return 'win';
  if (ourGoals < theirGoals) return 'loss';
  return 'draw';
}

/**
 * Retorna informações de exibição para a bolinha de forma
 */
function getFormDotInfo(
  match: Match,
  clubId: string
): { result: MatchResult; tooltip: string; ourGoals: number; theirGoals: number; opponentName: string } {
  const clubData = match.clubs[clubId];
  const opponentId = Object.keys(match.clubs).find((id) => id !== clubId);
  const opponentData = opponentId ? match.clubs[opponentId] : null;

  const ourGoals = parseInt(clubData?.goals || '0', 10);
  const theirGoals = parseInt(opponentData?.goals || '0', 10);
  const opponentName = opponentData?.details?.name || 'Adversário';
  const result = getMatchResult(match, clubId);

  return {
    result,
    tooltip: `${ourGoals}-${theirGoals} vs ${opponentName}`,
    ourGoals,
    theirGoals,
    opponentName,
  };
}

// ============================================
// COMPONENT
// ============================================

export function ClubHeader({ club, recentMatches, overallStats }: ClubHeaderProps) {
  // Usar dados de overallStats quando disponíveis (mais precisos), senão usar dados do clube
  const wins = parseInt(overallStats?.wins || club.wins, 10);
  const losses = parseInt(overallStats?.losses || club.losses, 10);
  const ties = parseInt(overallStats?.ties || club.ties, 10);
  const gamesPlayed = parseInt(overallStats?.gamesPlayed || club.gamesPlayed, 10);
  const goals = parseInt(overallStats?.goals || club.goals, 10);
  const goalsAgainst = parseInt(overallStats?.goalsAgainst || club.goalsAgainst, 10);

  // Estes dados só existem no club (ClubSearchResult)
  const points = parseInt(club.points, 10);
  const cleanSheets = parseInt(club.cleanSheets, 10);

  const winRate = getWinRate(wins, gamesPlayed);
  const goalDifference = goals - goalsAgainst;
  const crestUrl = club.clubInfo.customKit?.crestAssetId
    ? getCrestUrl(club.clubInfo.customKit.crestAssetId)
    : null;

  // Pegar as últimas 5 partidas (ordenadas da mais antiga para mais recente para leitura L->R)
  const formMatches = recentMatches
    ? [...recentMatches]
      .sort((a, b) => a.timestamp - b.timestamp) // Mais antiga primeiro
      .slice(-5) // Pegar as últimas 5
    : [];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 shadow-2xl">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8">
        {/* Top Section: Logo + Club Name + Division */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          {/* Club Crest */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full blur-xl opacity-30" />
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-gray-800/80 border-2 border-gray-600/50 p-2 flex items-center justify-center">
              {crestUrl ? (
                <Image
                  src={crestUrl}
                  alt={`${club.clubName} crest`}
                  width={120}
                  height={120}
                  className="object-contain drop-shadow-lg"
                  unoptimized
                />
              ) : (
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-500">
                    {club.clubName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Club Info */}
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {club.clubName}
              </h1>
              <FavoriteButton
                club={{
                  id: club.clubId,
                  name: club.clubName,
                  platform: club.platform,
                  crestUrl: club.clubInfo.customKit?.crestAssetId || null,
                } satisfies FavoriteClub}
                size="lg"
              />
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {/* Division Crest */}
              {getDivisionCrestUrl(club.bestDivision) && (
                <div className="inline-flex items-center" title={getDivisionName(club.bestDivision)}>
                  <img
                    src={getDivisionCrestUrl(club.bestDivision)!}
                    alt={`Divisão ${club.bestDivision}`}
                    className="h-10 w-auto object-contain drop-shadow-lg"
                    onError={(e) => {
                      // Esconde a imagem se falhar o carregamento
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Points Badge */}
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                <span className="font-bold text-emerald-300">{points} pts</span>
              </span>

              {/* Platform Badge */}
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-700/50 border border-gray-600/50">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {club.platform === 'common-gen5'
                    ? 'PS5 / Xbox X|S / PC'
                    : club.platform === 'common-gen4'
                      ? 'PS4 / Xbox One'
                      : 'Switch'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Games Played */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
            <p className="text-gray-400 text-sm font-medium mb-1">Partidas</p>
            <p className="text-2xl md:text-3xl font-black text-white">
              {gamesPlayed}
            </p>
          </div>

          {/* Goals */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
            <p className="text-gray-400 text-sm font-medium mb-1">Gols</p>
            <p className="text-2xl md:text-3xl font-black text-white">{goals}</p>
          </div>

          {/* Goal Difference */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
            <p className="text-gray-400 text-sm font-medium mb-1">Saldo de Gols</p>
            <p
              className={`text-2xl md:text-3xl font-black ${goalDifference > 0
                ? 'text-emerald-400'
                : goalDifference < 0
                  ? 'text-red-400'
                  : 'text-gray-300'
                }`}
            >
              {goalDifference > 0 ? '+' : ''}
              {goalDifference}
            </p>
          </div>

          {/* Clean Sheets */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
            <p className="text-gray-400 text-sm font-medium mb-1">Clean Sheets</p>
            <p className="text-2xl md:text-3xl font-black text-cyan-400">
              {cleanSheets}
            </p>
          </div>
        </div>

        {/* Match History Section */}
        <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/50">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Histórico de Partidas
          </h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Win/Draw/Loss Badges */}
            <div className="flex items-center justify-center gap-3 flex-1">
              {/* Wins */}
              <div className="flex-1 bg-emerald-500/20 rounded-lg p-3 border border-emerald-500/30 text-center">
                <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
                  Vitórias
                </p>
                <p className="text-3xl font-black text-emerald-400">{wins}</p>
              </div>

              {/* Draws */}
              <div className="flex-1 bg-gray-500/20 rounded-lg p-3 border border-gray-500/30 text-center">
                <p className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-1">
                  Empates
                </p>
                <p className="text-3xl font-black text-gray-300">{ties}</p>
              </div>

              {/* Losses */}
              <div className="flex-1 bg-red-500/20 rounded-lg p-3 border border-red-500/30 text-center">
                <p className="text-red-300 text-xs font-semibold uppercase tracking-wider mb-1">
                  Derrotas
                </p>
                <p className="text-3xl font-black text-red-400">{losses}</p>
              </div>
            </div>

            {/* Win Rate Circle */}
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24">
                {/* Background Circle */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${winRate * 2.51} 251`}
                    strokeLinecap="round"
                    className="text-emerald-500"
                  />
                </svg>
                {/* Percentage Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-white">{winRate}%</span>
                  <span className="text-xs text-gray-400">Win Rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Guide - Últimos 5 jogos */}
          {formMatches.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium mr-2">
                  Forma Recente
                </span>
                <div className="flex items-center gap-1.5">
                  {formMatches.map((match, index) => {
                    const { result, tooltip } = getFormDotInfo(match, club.clubId);
                    const isLatest = index === formMatches.length - 1;

                    return (
                      <div
                        key={match.matchId}
                        title={tooltip}
                        className={`
                          w-4 h-4 rounded-full cursor-help transition-all
                          ${result === 'win' ? 'bg-emerald-500' : result === 'loss' ? 'bg-red-500' : 'bg-gray-400'}
                          ${isLatest ? 'ring-2 ring-white/30 ring-offset-1 ring-offset-gray-900 scale-110' : 'opacity-80 hover:opacity-100'}
                        `}
                      />
                    );
                  })}
                </div>
                <span className="text-xs text-gray-600 ml-2">→</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

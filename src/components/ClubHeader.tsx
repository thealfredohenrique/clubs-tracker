'use client';

import Image from 'next/image';
import { BarChart3 } from 'lucide-react';
import type { ClubSearchResult, Match, ClubOverallStats, PlayoffAchievement } from '@/types/clubs-api';
import { FavoriteButton } from './FavoriteButton';
import { TrophyBadge } from './TrophyRoom';
import { useTranslation } from '@/lib/i18n';
import { getClubLogoUrl, getDivisionCrestUrl, getReputationTierUrl } from '@/lib/ea-assets';
import type { FavoriteClub } from '@/hooks';

// ============================================
// TYPES
// ============================================

interface ClubHeaderProps {
  club: ClubSearchResult;
  recentMatches?: Match[];
  overallStats?: ClubOverallStats;
  achievements?: PlayoffAchievement[];
}

type MatchResult = 'win' | 'draw' | 'loss';

// ============================================
// HELPER FUNCTIONS
// ============================================

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
  clubId: string,
  unknownOpponentLabel: string
): { result: MatchResult; tooltip: string; ourGoals: number; theirGoals: number; opponentName: string } {
  const clubData = match.clubs[clubId];
  const opponentId = Object.keys(match.clubs).find((id) => id !== clubId);
  const opponentData = opponentId ? match.clubs[opponentId] : null;

  const ourGoals = parseInt(clubData?.goals || '0', 10);
  const theirGoals = parseInt(opponentData?.goals || '0', 10);
  const opponentName = opponentData?.details?.name || unknownOpponentLabel;
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

export function ClubHeader({ club, recentMatches, overallStats, achievements }: ClubHeaderProps) {
  const { t } = useTranslation();

  // Usar dados de overallStats quando disponíveis (mais precisos), senão usar dados do clube
  const wins = parseInt(overallStats?.wins || club.wins, 10);
  const losses = parseInt(overallStats?.losses || club.losses, 10);
  const ties = parseInt(overallStats?.ties || club.ties, 10);
  const gamesPlayed = parseInt(overallStats?.gamesPlayed || club.gamesPlayed, 10);
  const goals = parseInt(overallStats?.goals || club.goals, 10);
  const goalsAgainst = parseInt(overallStats?.goalsAgainst || club.goalsAgainst, 10);

  // Estes dados só existem no club (ClubSearchResult)
  const points = parseInt(club.points, 10);

  // Reputation tier - prioriza overallStats
  const reputationTier = overallStats?.reputationtier || club.reputationtier;

  const winRate = getWinRate(wins, gamesPlayed);
  const goalDifference = goals - goalsAgainst;
  const crestUrl = getClubLogoUrl(club.clubInfo);

  // Pegar as últimas 5 partidas (ordenadas da mais antiga para mais recente para leitura L->R)
  const formMatches = recentMatches
    ? [...recentMatches]
      .sort((a, b) => a.timestamp - b.timestamp) // Mais antiga primeiro
      .slice(-5) // Pegar as últimas 5
    : [];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/20">
      {/* Premium top border glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8">
        {/* Top Section: Logo + Club Name + Division */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          {/* Club Crest */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl blur-xl opacity-20" />
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl bg-slate-800 ring-2 ring-white/10 shadow-xl shadow-black/30 p-2 flex items-center justify-center">
              {crestUrl ? (
                <Image
                  src={crestUrl}
                  alt={`${club.clubName} crest`}
                  width={100}
                  height={100}
                  className="object-contain drop-shadow-lg"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-slate-700 rounded-lg flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-500">
                    {club.clubName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Club Info */}
          <div className="text-center md:text-left flex-1 min-w-0">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight truncate max-w-full">
                {club.clubName}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <FavoriteButton
                  club={{
                    id: club.clubId,
                    name: club.clubName,
                    platform: club.platform,
                    crestUrl: club.clubInfo.customKit?.crestAssetId || null,
                    teamId: club.clubInfo.teamId,
                    selectedKitType: club.clubInfo.customKit?.selectedKitType,
                  } satisfies FavoriteClub}
                  size="lg"
                />
                {achievements && achievements.length > 0 && (
                  <TrophyBadge achievements={achievements} />
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
              {/* Division Crest */}
              {getDivisionCrestUrl(club.bestDivision) && (
                <div className="inline-flex items-center" title={getDivisionName(club.bestDivision)}>
                  <Image
                    src={getDivisionCrestUrl(club.bestDivision)!}
                    alt={`Divisão ${club.bestDivision}`}
                    width={40}
                    height={40}
                    className="h-10 w-auto object-contain drop-shadow-lg"
                    unoptimized
                  />
                </div>
              )}

              {/* Reputation Tier Badge */}
              {getReputationTierUrl(reputationTier) ? (
                <div className="inline-flex items-center" title={`Reputation Tier ${reputationTier}`}>
                  <Image
                    src={getReputationTierUrl(reputationTier)!}
                    alt={`Reputation Tier ${reputationTier}`}
                    width={40}
                    height={40}
                    className="h-10 w-auto object-contain drop-shadow-lg"
                    unoptimized
                  />
                </div>
              ) : (
                // Fallback: mostra pontos se não tiver reputation tier
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                  <span className="font-bold text-emerald-300">{points} pts</span>
                </span>
              )}

              {/* Platform Badge */}
              <span className="text-slate-500 text-xs">
                {club.platform === 'common-gen5'
                  ? t.platforms.ps5
                  : club.platform === 'common-gen4'
                    ? t.platforms.ps4
                    : t.platforms.switch}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
          {/* Games Played */}
          <div className="relative group p-4 md:p-5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/5 hover:border-white/10 hover:bg-slate-900/80 transition-all duration-300 text-center">
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-medium">{t.header.matches}</p>
            <p className="text-2xl md:text-3xl font-bold text-white mt-1">
              {gamesPlayed}
            </p>
          </div>

          {/* Goals */}
          <div className="relative group p-4 md:p-5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/5 hover:border-white/10 hover:bg-slate-900/80 transition-all duration-300 text-center">
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-medium">{t.header.goals}</p>
            <p className="text-2xl md:text-3xl font-bold text-white mt-1">{goals}</p>
          </div>

          {/* Goal Difference */}
          <div className="relative group p-4 md:p-5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/5 hover:border-white/10 hover:bg-slate-900/80 transition-all duration-300 text-center">
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-medium">{t.header.goalDiff}</p>
            <p
              className={`text-2xl md:text-3xl font-bold mt-1 ${goalDifference > 0
                ? 'text-emerald-400'
                : goalDifference < 0
                  ? 'text-red-400'
                  : 'text-slate-300'
                }`}
            >
              {goalDifference > 0 ? '+' : ''}
              {goalDifference}
            </p>
          </div>

          {/* Skill Rating */}
          <div className="relative group p-4 md:p-5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/5 hover:border-white/10 hover:bg-slate-900/80 transition-all duration-300 text-center">
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-medium">{t.header.skillRating}</p>
            <p className="text-2xl md:text-3xl font-bold mt-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              {overallStats?.skillRating || '-'}
            </p>
          </div>
        </div>

        {/* Match History Section */}
        <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/5 mt-8">
          <h2 className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-slate-400" />
            <span className="text-lg font-semibold text-white">{t.header.matchHistory}</span>
          </h2>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 items-center">
            {/* Wins */}
            <div className="p-4 rounded-xl text-center bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-[10px] uppercase tracking-widest text-emerald-400/80 font-semibold">
                {t.header.wins}
              </p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{wins}</p>
            </div>

            {/* Draws */}
            <div className="p-4 rounded-xl text-center bg-slate-500/10 border border-slate-500/20">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                {t.header.draws}
              </p>
              <p className="text-3xl font-bold text-slate-300 mt-1">{ties}</p>
            </div>

            {/* Losses */}
            <div className="p-4 rounded-xl text-center bg-red-500/10 border border-red-500/20">
              <p className="text-[10px] uppercase tracking-widest text-red-400/80 font-semibold">
                {t.header.losses}
              </p>
              <p className="text-3xl font-bold text-red-400 mt-1">{losses}</p>
            </div>

            {/* Win Rate Circle */}
            <div className="hidden md:flex flex-col items-center justify-center">
              <div className="relative w-20 h-20">
                {/* Background Circle */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-700"
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
                  <span className="text-xl font-bold text-white">{winRate}%</span>
                  <span className="text-[10px] uppercase text-slate-500">{t.header.winRate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Win Rate Circle - Mobile */}
          <div className="flex md:hidden justify-center mt-4">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-slate-700"
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
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">{winRate}%</span>
                <span className="text-[10px] uppercase text-slate-500">{t.header.winRate}</span>
              </div>
            </div>
          </div>

          {/* Form Guide - Últimos 5 jogos */}
          {formMatches.length > 0 && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
              <span className="text-xs uppercase tracking-widest text-slate-500 font-medium">
                {t.header.recentForm}
              </span>
              <div className="flex items-center gap-1.5">
                {formMatches.map((match, index) => {
                  const { result, tooltip } = getFormDotInfo(match, club.clubId, t.matches.unknownOpponent);
                  const isLatest = index === formMatches.length - 1;

                  return (
                    <div
                      key={match.matchId}
                      title={tooltip}
                      className={`
                        w-3 h-3 rounded-full cursor-help transition-all
                        ${result === 'win' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : result === 'loss' ? 'bg-red-500 shadow-sm shadow-red-500/50' : 'bg-slate-500'}
                        ${isLatest ? 'ring-2 ring-white/30 ring-offset-1 ring-offset-slate-900 scale-110' : 'opacity-80 hover:opacity-100'}
                      `}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

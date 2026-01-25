'use client';

import { useState } from 'react';
import { Clock, Home, Trophy, Swords, ChevronRight, CalendarX, ArrowRight } from 'lucide-react';
import type { Match, MatchPlayerData, MatchCategory } from '@/types/clubs-api';
import { MatchDetailsModal } from './MatchDetailsModal';
import { useTranslation, formatTimeAgo as formatTimeAgoI18n, type Translations } from '@/lib/i18n';

// ============================================
// TYPES
// ============================================

interface MatchHistoryProps {
  matches: Match[];
  clubId: string;
}

type MatchResult = 'win' | 'draw' | 'loss';

type FilterType = 'ALL' | 'LEAGUE' | 'PLAYOFF' | 'FRIENDLY';

interface ProcessedMatch {
  matchId: string;
  timestamp: number;
  timeAgo: string;
  result: MatchResult;
  ourGoals: number;
  theirGoals: number;
  opponentName: string;
  opponentId: string;
  scorers: string[];
  assisters: string[];
  category: MatchCategory;
  originalMatch: Match;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Determina o resultado da partida para o clube especificado
 */
function getMatchResult(ourGoals: number, theirGoals: number): MatchResult {
  if (ourGoals > theirGoals) return 'win';
  if (ourGoals < theirGoals) return 'loss';
  return 'draw';
}

/**
 * Retorna estilos baseados no resultado
 */
function getResultStyles(
  result: MatchResult,
  labels: { win: string; draw: string; loss: string }
): {
  bgColor: string;
  borderColor: string;
  textColor: string;
  label: string;
  icon: string;
} {
  const styles: Record<MatchResult, ReturnType<typeof getResultStyles>> = {
    win: {
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      label: labels.win,
      icon: 'V',
    },
    draw: {
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/30',
      textColor: 'text-gray-400',
      label: labels.draw,
      icon: 'E',
    },
    loss: {
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      label: labels.loss,
      icon: 'D',
    },
  };

  return styles[result];
}

/**
 * Retorna estilos e informações do badge de categoria
 */
function getCategoryBadge(
  category: MatchCategory,
  labels: { league: string; playoff: string; friendly: string }
): {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ReactNode;
} {
  switch (category) {
    case 'playoff':
      return {
        label: labels.playoff,
        bgColor: 'bg-amber-500/15',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/20',
        icon: <Trophy className="w-3 h-3" />,
      };
    case 'friendly':
      return {
        label: labels.friendly,
        bgColor: 'bg-purple-500/15',
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500/20',
        icon: <Swords className="w-3 h-3" />,
      };
    case 'league':
    default:
      return {
        label: labels.league,
        bgColor: 'bg-blue-500/15',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/20',
        icon: <Home className="w-3 h-3" />,
      };
  }
}

/**
 * Extrai os goleadores do nosso time
 */
function getScorers(players: Record<string, MatchPlayerData>): string[] {
  const scorers: string[] = [];

  Object.values(players).forEach((player) => {
    const goals = parseInt(player.goals, 10) || 0;
    if (goals > 0) {
      const goalText = goals > 1 ? `${player.playername} (${goals})` : player.playername;
      scorers.push(goalText);
    }
  });

  return scorers;
}

/**
 * Extrai os assistentes do nosso time
 */
function getAssisters(players: Record<string, MatchPlayerData>): string[] {
  const assisters: string[] = [];

  Object.values(players).forEach((player) => {
    const assists = parseInt(player.assists, 10) || 0;
    if (assists > 0) {
      const assistText = assists > 1 ? `${player.playername} (${assists})` : player.playername;
      assisters.push(assistText);
    }
  });

  return assisters;
}

/**
 * Processa os dados da partida para exibição
 */
function processMatches(
  matches: Match[],
  clubId: string,
  t: Translations
): ProcessedMatch[] {
  return matches.map((match) => {
    const clubIds = Object.keys(match.clubs);
    const opponentId = clubIds.find((id) => id !== clubId) || clubIds[0];

    const ourClubData = match.clubs[clubId];
    const opponentClubData = match.clubs[opponentId];

    const ourGoals = parseInt(ourClubData?.goals || '0', 10);
    const theirGoals = parseInt(opponentClubData?.goals || '0', 10);

    const ourPlayers = match.players[clubId] || {};

    return {
      matchId: match.matchId,
      timestamp: match.timestamp,
      timeAgo: formatTimeAgoI18n(match.timeAgo.number, match.timeAgo.unit, t),
      result: getMatchResult(ourGoals, theirGoals),
      ourGoals,
      theirGoals,
      opponentName: opponentClubData?.details?.name || t.matches.unknownOpponent,
      opponentId,
      scorers: getScorers(ourPlayers),
      assisters: getAssisters(ourPlayers),
      category: match.matchCategory || 'league',
      originalMatch: match,
    };
  });
}

// ============================================
// COMPONENT
// ============================================

export function MatchHistory({ matches, clubId }: MatchHistoryProps) {
  const { t } = useTranslation();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  const processedMatches = processMatches(matches, clubId, t);

  // Filtrar partidas com base no filtro ativo
  const filteredMatches = processedMatches.filter((match) => {
    switch (activeFilter) {
      case 'LEAGUE':
        return match.category === 'league';
      case 'PLAYOFF':
        return match.category === 'playoff';
      case 'FRIENDLY':
        return match.category === 'friendly';
      case 'ALL':
      default:
        return true;
    }
  });

  if (processedMatches.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-white/5 p-8 text-center">
        <CalendarX className="w-12 h-12 mx-auto text-slate-700" />
        <p className="text-sm text-slate-500 mt-3">{t.matches.noMatches}</p>
      </div>
    );
  }

  // Helper para estilo do botão de filtro
  const getFilterButtonClass = (filter: FilterType) => {
    const isActive = activeFilter === filter;
    return `px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${isActive
      ? 'bg-emerald-500/20 text-emerald-400'
      : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`;
  };

  return (
    <div className="rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-white/5 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 pt-5 pb-4 border-b border-white/5 gap-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-white">
            {t.matches.recentMatches}
          </h2>
          <span className="text-xs text-slate-500 font-normal">
            {filteredMatches.length} {t.matches.matchesCount}
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="inline-flex bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={getFilterButtonClass('ALL')}
          >
            {t.matches.all}
          </button>
          <button
            onClick={() => setActiveFilter('LEAGUE')}
            className={getFilterButtonClass('LEAGUE')}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.matches.league}</span>
          </button>
          <button
            onClick={() => setActiveFilter('PLAYOFF')}
            className={getFilterButtonClass('PLAYOFF')}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.matches.playoff}</span>
          </button>
          <button
            onClick={() => setActiveFilter('FRIENDLY')}
            className={getFilterButtonClass('FRIENDLY')}
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.matches.friendly}</span>
          </button>
        </div>
      </div>

      {/* Match List */}
      {filteredMatches.length === 0 ? (
        <div className="py-12 text-center">
          <CalendarX className="w-12 h-12 mx-auto text-slate-700" />
          <p className="text-sm text-slate-500 mt-3">{t.matches.noFilterResults}</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {filteredMatches.map((match) => {
            const resultStyles = getResultStyles(match.result, t.matches);
            const categoryBadge = getCategoryBadge(match.category, t.matches);

            return (
              <div
                key={match.matchId}
                onClick={() => setSelectedMatch(match.originalMatch)}
                className="group px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors duration-150"
              >
                <div className="flex items-center gap-4">
                  {/* Result Badge */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl ${resultStyles.bgColor} border ${resultStyles.borderColor} flex items-center justify-center`}
                  >
                    <span className={`text-sm font-bold ${resultStyles.textColor}`}>
                      {resultStyles.icon}
                    </span>
                  </div>

                  {/* Match Info */}
                  <div className="flex-1 min-w-0">
                    {/* Line 1: Score + Opponent + Badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Score */}
                      <div className="flex items-center gap-1">
                        <span className={`text-xl font-bold ${resultStyles.textColor}`}>
                          {match.ourGoals}
                        </span>
                        <span className="text-slate-600 text-lg font-light">-</span>
                        <span className="text-xl font-bold text-slate-400">
                          {match.theirGoals}
                        </span>
                      </div>

                      {/* VS Opponent */}
                      <span className="text-xs text-slate-600 uppercase tracking-wide mx-1">vs</span>
                      <span className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate max-w-[150px] sm:max-w-[200px]">
                        {match.opponentName}
                      </span>

                      {/* Category Badge */}
                      <span
                        className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${categoryBadge.bgColor} ${categoryBadge.textColor} ${categoryBadge.borderColor}`}
                        title={categoryBadge.label}
                      >
                        {categoryBadge.icon}
                        <span className="hidden sm:inline">{categoryBadge.label}</span>
                      </span>
                    </div>

                    {/* Line 2: Scorers & Assists */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
                      {/* Scorers */}
                      {match.scorers.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0" />
                          <span className="text-slate-600">{t.matches.goals}:</span>
                          <span className="text-slate-400">{match.scorers.join(', ')}</span>
                        </div>
                      )}

                      {/* Assisters */}
                      {match.assisters.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                          <span className="text-slate-600">{t.matches.assistsLabel}:</span>
                          <span className="text-slate-400">{match.assisters.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Meta Info: Time + Chevron */}
                  <div className="ml-auto flex items-center gap-3 flex-shrink-0">
                    <span className="text-[10px] sm:text-xs text-slate-600">
                      {match.timeAgo}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-5 py-4 border-t border-white/5 bg-slate-900/30">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[10px] uppercase tracking-wide text-slate-500">{t.matches.win}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span className="text-[10px] uppercase tracking-wide text-slate-500">{t.matches.draw}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span className="text-[10px] uppercase tracking-wide text-slate-500">{t.matches.loss}</span>
          </span>
        </div>
        <span className="hidden sm:block w-px h-4 bg-slate-700"></span>
        <div className="hidden sm:flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="text-[10px] uppercase tracking-wide text-slate-500">{t.matches.league}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-[10px] uppercase tracking-wide text-slate-500">{t.matches.playoff}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span className="text-[10px] uppercase tracking-wide text-slate-500">{t.matches.friendly}</span>
          </span>
        </div>
      </div>

      {/* Match Details Modal */}
      <MatchDetailsModal
        isOpen={selectedMatch !== null}
        onClose={() => setSelectedMatch(null)}
        match={selectedMatch}
        clubId={clubId}
      />
    </div>
  );
}

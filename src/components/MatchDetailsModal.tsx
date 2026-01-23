'use client';

import { useEffect } from 'react';
import type { Match, MatchCategory, MatchAggregateData } from '@/types/clubs-api';

// ============================================
// CONSTANTS
// ============================================

const CREST_BASE_URL =
  'https://eafc24.content.easports.com/fifa/fltOnlineAssets/24B23FDE-7835-41C2-87A2-F453DFDB2E82/2024/fcweb/crests/256x256/l';

/**
 * Retorna a URL do escudo do clube
 */
function getCrestUrl(crestAssetId: string | undefined): string | null {
  if (!crestAssetId) return null;
  return `${CREST_BASE_URL}${crestAssetId}.png`;
}

// ============================================
// TYPES
// ============================================

interface MatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  clubId: string;
}

interface TeamStats {
  name: string;
  clubId: string;
  goals: number;
  shots: number;
  passAttempts: number;
  passesMade: number;
  passAccuracy: number;
  tackleAttempts: number;
  tacklesMade: number;
  tackleAccuracy: number;
  redCards: number;
  rating: number;
  playerCount: number;
  crestUrl: string | null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Formata o tempo decorrido de forma amigável
 */
function formatTimeAgo(timeAgo: { number: number; unit: string }): string {
  const { number, unit } = timeAgo;
  const unitMap: Record<string, { singular: string; plural: string }> = {
    seconds: { singular: 'segundo', plural: 'segundos' },
    minutes: { singular: 'minuto', plural: 'minutos' },
    hours: { singular: 'hora', plural: 'horas' },
    days: { singular: 'dia', plural: 'dias' },
    weeks: { singular: 'semana', plural: 'semanas' },
    months: { singular: 'mês', plural: 'meses' },
    years: { singular: 'ano', plural: 'anos' },
  };
  const unitText = unitMap[unit] || { singular: unit, plural: unit };
  const label = number === 1 ? unitText.singular : unitText.plural;
  return `Há ${number} ${label}`;
}

/**
 * Retorna estilos e informações do badge de categoria
 */
function getCategoryInfo(category: MatchCategory): {
  label: string;
  bgColor: string;
  textColor: string;
} {
  switch (category) {
    case 'playoff':
      return { label: 'Playoff', bgColor: 'bg-orange-500/20', textColor: 'text-orange-400' };
    case 'friendly':
      return { label: 'Amistoso', bgColor: 'bg-gray-500/20', textColor: 'text-gray-400' };
    case 'league':
    default:
      return { label: 'Liga', bgColor: 'bg-cyan-500/20', textColor: 'text-cyan-400' };
  }
}

/**
 * Extrai estatísticas agregadas de um time
 */
function getTeamStats(
  match: Match,
  teamClubId: string
): TeamStats {
  const clubData = match.clubs[teamClubId];
  const aggregate = match.aggregate[teamClubId] as MatchAggregateData | undefined;
  const players = match.players[teamClubId] || {};

  const goals = parseInt(clubData?.goals || '0', 10);
  const name = clubData?.details?.name || 'Time Desconhecido';

  // Usar dados agregados se disponíveis
  const shots = aggregate?.shots || 0;
  const passAttempts = aggregate?.passattempts || 0;
  const passesMade = aggregate?.passesmade || 0;
  const tackleAttempts = aggregate?.tackleattempts || 0;
  const tacklesMade = aggregate?.tacklesmade || 0;
  const redCards = aggregate?.redcards || 0;
  const rating = aggregate?.rating || 0;

  // Calcular percentuais
  const passAccuracy = passAttempts > 0 ? Math.round((passesMade / passAttempts) * 100) : 0;
  const tackleAccuracy = tackleAttempts > 0 ? Math.round((tacklesMade / tackleAttempts) * 100) : 0;

  // Contar jogadores para média de rating
  const playerCount = Object.keys(players).length;

  // URL do escudo
  const crestUrl = getCrestUrl(clubData?.details?.customKit?.crestAssetId);

  return {
    name,
    clubId: teamClubId,
    goals,
    shots,
    passAttempts,
    passesMade,
    passAccuracy,
    tackleAttempts,
    tacklesMade,
    tackleAccuracy,
    redCards,
    rating: playerCount > 0 ? rating / playerCount : 0,
    playerCount,
    crestUrl,
  };
}

// ============================================
// STAT COMPARISON ROW COMPONENT
// ============================================

interface StatRowProps {
  label: string;
  valueA: number;
  valueB: number;
  format?: 'number' | 'percent' | 'decimal';
  higherIsBetter?: boolean;
}

function StatComparisonRow({
  label,
  valueA,
  valueB,
  format = 'number',
  higherIsBetter = true,
}: StatRowProps) {
  const total = valueA + valueB;
  const percentA = total > 0 ? (valueA / total) * 100 : 50;
  const percentB = total > 0 ? (valueB / total) * 100 : 50;

  // Determinar vencedor
  const aWins = higherIsBetter ? valueA > valueB : valueA < valueB;
  const bWins = higherIsBetter ? valueB > valueA : valueB < valueA;
  const isDraw = valueA === valueB;

  // Formatar valores
  const formatValue = (value: number): string => {
    switch (format) {
      case 'decimal':
        return value.toFixed(1);
      case 'percent':
        return `${Math.round(value)}%`;
      default:
        return Math.round(value).toString();
    }
  };

  return (
    <div className="py-3">
      {/* Values and Label Row */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-lg font-bold w-16 text-left ${isDraw ? 'text-gray-300' : aWins ? 'text-emerald-400' : 'text-gray-500'
            }`}
        >
          {formatValue(valueA)}
        </span>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center flex-1">
          {label}
        </span>
        <span
          className={`text-lg font-bold w-16 text-right ${isDraw ? 'text-gray-300' : bWins ? 'text-cyan-400' : 'text-gray-500'
            }`}
        >
          {formatValue(valueB)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
        <div
          className={`h-full transition-all duration-500 ${isDraw ? 'bg-gray-500' : aWins ? 'bg-emerald-500' : 'bg-gray-600'
            }`}
          style={{ width: `${percentA}%` }}
        />
        <div
          className={`h-full transition-all duration-500 ${isDraw ? 'bg-gray-500' : bWins ? 'bg-cyan-500' : 'bg-gray-600'
            }`}
          style={{ width: `${percentB}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// TEAM HEADER COMPONENT
// ============================================

interface TeamHeaderProps {
  name: string;
  goals: number;
  isWinner: boolean;
  isLoser: boolean;
  side: 'left' | 'right';
  crestUrl: string | null;
}

function TeamHeader({ name, goals, isWinner, isLoser, side, crestUrl }: TeamHeaderProps) {
  const textAlign = side === 'left' ? 'text-left' : 'text-right';
  const flexDir = side === 'left' ? 'flex-row' : 'flex-row-reverse';

  return (
    <div className={`flex ${flexDir} items-center gap-3`}>
      {/* Team Crest */}
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center border overflow-hidden ${isWinner
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : isLoser
            ? 'bg-red-500/5 border-red-500/20'
            : 'bg-gray-700/30 border-gray-600/30'
          }`}
      >
        {crestUrl ? (
          <img
            src={crestUrl}
            alt={`${name} crest`}
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
            onError={(e) => {
              // Fallback para sigla se imagem falhar
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `<span class="text-xl font-black ${isWinner ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-gray-300'}">${name.substring(0, 2).toUpperCase()}</span>`;
            }}
          />
        ) : (
          <span
            className={`text-xl font-black ${isWinner ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-gray-300'}`}
          >
            {name.substring(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {/* Team Name and Goals */}
      <div className={`${textAlign} min-w-0 flex-1`}>
        <p className="font-bold text-white text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px]">
          {name}
        </p>
        <p
          className={`text-3xl sm:text-4xl font-black ${isWinner ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-gray-300'}`}
        >
          {goals}
        </p>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function MatchDetailsModal({ isOpen, onClose, match, clubId }: MatchDetailsModalProps) {
  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !match) return null;

  // Identificar times
  const clubIds = Object.keys(match.clubs);
  const opponentId = clubIds.find((id) => id !== clubId) || clubIds[0];

  // Extrair estatísticas
  const ourStats = getTeamStats(match, clubId);
  const theirStats = getTeamStats(match, opponentId);

  // Determinar resultado
  const isWin = ourStats.goals > theirStats.goals;
  const isLoss = ourStats.goals < theirStats.goals;
  const isDraw = ourStats.goals === theirStats.goals;

  // Categoria
  const category = getCategoryInfo(match.matchCategory || 'league');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div
          className={`relative p-6 ${isWin
            ? 'bg-gradient-to-br from-emerald-500/20 to-transparent'
            : isLoss
              ? 'bg-gradient-to-br from-red-500/20 to-transparent'
              : 'bg-gradient-to-br from-gray-500/20 to-transparent'
            }`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white/80 hover:text-white transition-colors z-10"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Category Badge & Time */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${category.bgColor} ${category.textColor}`}
            >
              {category.label}
            </span>
            <span className="text-sm text-gray-400">{formatTimeAgo(match.timeAgo)}</span>
          </div>

          {/* Score Header */}
          <div className="flex items-center justify-between gap-2">
            <TeamHeader
              name={ourStats.name}
              goals={ourStats.goals}
              isWinner={isWin}
              isLoser={isLoss}
              side="left"
              crestUrl={ourStats.crestUrl}
            />

            {/* VS Divider */}
            <div className="flex flex-col items-center px-2 sm:px-4 flex-shrink-0">
              <span className="text-gray-600 text-xs font-bold uppercase tracking-widest">VS</span>
              <div
                className={`mt-1 px-2 sm:px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${isWin
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isLoss
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-gray-500/20 text-gray-400'
                  }`}
              >
                {isWin ? 'VITÓRIA' : isLoss ? 'DERROTA' : 'EMPATE'}
              </div>
            </div>

            <TeamHeader
              name={theirStats.name}
              goals={theirStats.goals}
              isWinner={isLoss}
              isLoser={isWin}
              side="right"
              crestUrl={theirStats.crestUrl}
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="p-6 pt-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Estatísticas do Confronto
          </h3>

          <div className="space-y-1 divide-y divide-gray-700/30">
            <StatComparisonRow label="Chutes" valueA={ourStats.shots} valueB={theirStats.shots} />
            <StatComparisonRow
              label="Passes Tentados"
              valueA={ourStats.passAttempts}
              valueB={theirStats.passAttempts}
            />
            <StatComparisonRow
              label="Passes Certos"
              valueA={ourStats.passesMade}
              valueB={theirStats.passesMade}
            />
            <StatComparisonRow
              label="% Passes"
              valueA={ourStats.passAccuracy}
              valueB={theirStats.passAccuracy}
              format="percent"
            />
            <StatComparisonRow
              label="Desarmes Tentados"
              valueA={ourStats.tackleAttempts}
              valueB={theirStats.tackleAttempts}
            />
            <StatComparisonRow
              label="Desarmes Certos"
              valueA={ourStats.tacklesMade}
              valueB={theirStats.tacklesMade}
            />
            <StatComparisonRow
              label="% Desarmes"
              valueA={ourStats.tackleAccuracy}
              valueB={theirStats.tackleAccuracy}
              format="percent"
            />
            <StatComparisonRow
              label="Cartões Vermelhos"
              valueA={ourStats.redCards}
              valueB={theirStats.redCards}
              higherIsBetter={false}
            />
            <StatComparisonRow
              label="Rating Médio"
              valueA={ourStats.rating}
              valueB={theirStats.rating}
              format="decimal"
            />
          </div>
        </div>

        {/* Players Summary */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{ourStats.playerCount} jogadores</span>
            <span>{theirStats.playerCount} jogadores</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700/30 bg-gray-800/30">
          <p className="text-xs text-gray-500 text-center">
            Pressione <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 font-mono">ESC</kbd> ou
            clique fora para fechar
          </p>
        </div>
      </div>
    </div>
  );
}

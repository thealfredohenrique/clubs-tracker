'use client';

import { useEffect, useState } from 'react';
import type { Match, MatchCategory, MatchAggregateData, MatchPlayerData } from '@/types/clubs-api';

// ============================================
// TYPES
// ============================================

type TabType = 'RESUMO' | 'JOGADORES';
type TeamViewType = 'OUR' | 'OPPONENT';

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
// TAB BUTTON COMPONENT
// ============================================

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, icon, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold transition-all ${isActive
          ? 'text-white bg-gray-700/50 border-b-2 border-cyan-500'
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30 border-b-2 border-transparent'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ============================================
// TEAM TOGGLE COMPONENT
// ============================================

interface TeamToggleProps {
  selectedTeam: TeamViewType;
  onToggle: (team: TeamViewType) => void;
  ourTeamName: string;
  opponentTeamName: string;
}

function TeamToggle({ selectedTeam, onToggle, ourTeamName, opponentTeamName }: TeamToggleProps) {
  return (
    <div className="flex bg-gray-800/50 rounded-lg p-1 mb-4">
      <button
        onClick={() => onToggle('OUR')}
        className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all truncate ${selectedTeam === 'OUR'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'text-gray-400 hover:text-gray-200'
          }`}
      >
        {ourTeamName}
      </button>
      <button
        onClick={() => onToggle('OPPONENT')}
        className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all truncate ${selectedTeam === 'OPPONENT'
            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            : 'text-gray-400 hover:text-gray-200'
          }`}
      >
        {opponentTeamName}
      </button>
    </div>
  );
}

// ============================================
// PLAYER ACCORDION COMPONENT
// ============================================

interface PlayerAccordionProps {
  player: MatchPlayerData;
  playerId: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function getRatingColor(rating: number): string {
  if (rating >= 8.0) return 'text-emerald-400 bg-emerald-500/20';
  if (rating >= 7.0) return 'text-yellow-400 bg-yellow-500/20';
  if (rating >= 6.0) return 'text-orange-400 bg-orange-500/20';
  return 'text-red-400 bg-red-500/20';
}

function getPositionInfo(pos: string): { label: string; color: string } {
  const posMap: Record<string, { label: string; color: string }> = {
    goalkeeper: { label: 'GOL', color: 'bg-amber-500/20 text-amber-400' },
    defender: { label: 'DEF', color: 'bg-blue-500/20 text-blue-400' },
    midfielder: { label: 'MEI', color: 'bg-green-500/20 text-green-400' },
    forward: { label: 'ATA', color: 'bg-red-500/20 text-red-400' },
  };
  return posMap[pos] || { label: pos.substring(0, 3).toUpperCase(), color: 'bg-gray-500/20 text-gray-400' };
}

function PlayerAccordion({ player, playerId, isExpanded, onToggle }: PlayerAccordionProps) {
  const rating = parseFloat(player.rating) || 0;
  const goals = parseInt(player.goals, 10) || 0;
  const assists = parseInt(player.assists, 10) || 0;
  const isMom = player.mom === '1';
  const posInfo = getPositionInfo(player.pos);

  const shots = parseInt(player.shots, 10) || 0;
  const passAttempts = parseInt(player.passattempts, 10) || 0;
  const passesMade = parseInt(player.passesmade, 10) || 0;
  const tackleAttempts = parseInt(player.tackleattempts, 10) || 0;
  const tacklesMade = parseInt(player.tacklesmade, 10) || 0;
  const redCards = parseInt(player.redcards, 10) || 0;

  const passAccuracy = passAttempts > 0 ? Math.round((passesMade / passAttempts) * 100) : 0;
  const tackleAccuracy = tackleAttempts > 0 ? Math.round((tacklesMade / tackleAttempts) * 100) : 0;

  return (
    <div className="border border-gray-700/30 rounded-lg overflow-hidden bg-gray-800/30">
      {/* Header Row (sempre visível) */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 hover:bg-gray-700/30 transition-colors"
      >
        {/* Position Badge */}
        <span className={`px-2 py-1 rounded text-xs font-bold ${posInfo.color}`}>
          {posInfo.label}
        </span>

        {/* Player Name */}
        <span className="flex-1 text-left font-medium text-white text-sm truncate flex items-center gap-2">
          {player.playername}
          {isMom && (
            <span className="text-yellow-400" title="Man of the Match">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
          )}
        </span>

        {/* Goals & Assists Icons */}
        <div className="flex items-center gap-2">
          {goals > 0 && (
            <span className="flex items-center gap-0.5 text-emerald-400 text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75z" clipRule="evenodd" />
              </svg>
              {goals}
            </span>
          )}
          {assists > 0 && (
            <span className="flex items-center gap-0.5 text-cyan-400 text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
              {assists}
            </span>
          )}
          {redCards > 0 && (
            <span className="flex items-center gap-0.5 text-red-500 text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <span className={`px-2 py-1 rounded text-xs font-bold ${getRatingColor(rating)}`}>
          {rating.toFixed(1)}
        </span>

        {/* Expand Icon */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-700/30 bg-gray-900/30">
          <div className="grid grid-cols-2 gap-3 pt-3">
            {/* Chutes */}
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Chutes</p>
              <p className="text-lg font-bold text-white">{shots}</p>
            </div>

            {/* Passes */}
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Passes</p>
              <p className="text-lg font-bold text-white">
                {passesMade}/{passAttempts}
                <span className="text-xs text-gray-400 ml-1">({passAccuracy}%)</span>
              </p>
            </div>

            {/* Desarmes */}
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Desarmes</p>
              <p className="text-lg font-bold text-white">
                {tacklesMade}/{tackleAttempts}
                <span className="text-xs text-gray-400 ml-1">({tackleAccuracy}%)</span>
              </p>
            </div>

            {/* Posição */}
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Posição</p>
              <p className={`text-lg font-bold ${posInfo.color.split(' ')[1]}`}>{posInfo.label}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// PLAYERS TAB CONTENT
// ============================================

interface PlayersTabProps {
  match: Match;
  clubId: string;
  opponentId: string;
  ourTeamName: string;
  opponentTeamName: string;
}

function PlayersTab({ match, clubId, opponentId, ourTeamName, opponentTeamName }: PlayersTabProps) {
  const [selectedTeam, setSelectedTeam] = useState<TeamViewType>('OUR');
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  const currentClubId = selectedTeam === 'OUR' ? clubId : opponentId;
  const players = match.players[currentClubId] || {};

  // Ordenar jogadores por rating (decrescente)
  const sortedPlayers = Object.entries(players).sort(([, a], [, b]) => {
    const ratingA = parseFloat(a.rating) || 0;
    const ratingB = parseFloat(b.rating) || 0;
    return ratingB - ratingA;
  });

  const handleTogglePlayer = (playerId: string) => {
    setExpandedPlayerId((prev) => (prev === playerId ? null : playerId));
  };

  return (
    <div className="p-4">
      <TeamToggle
        selectedTeam={selectedTeam}
        onToggle={setSelectedTeam}
        ourTeamName={ourTeamName}
        opponentTeamName={opponentTeamName}
      />

      {sortedPlayers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <p className="text-sm">Nenhum jogador encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedPlayers.map(([playerId, player]) => (
            <PlayerAccordion
              key={playerId}
              player={player}
              playerId={playerId}
              isExpanded={expandedPlayerId === playerId}
              onToggle={() => handleTogglePlayer(playerId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function MatchDetailsModal({ isOpen, onClose, match, clubId }: MatchDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('RESUMO');

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

  // Reset tab quando modal abre
  useEffect(() => {
    if (isOpen) {
      setActiveTab('RESUMO');
    }
  }, [isOpen]);

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

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-700/50">
          <TabButton
            label="Resumo"
            isActive={activeTab === 'RESUMO'}
            onClick={() => setActiveTab('RESUMO')}
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            }
          />
          <TabButton
            label="Jogadores"
            isActive={activeTab === 'JOGADORES'}
            onClick={() => setActiveTab('JOGADORES')}
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            }
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'RESUMO' ? (
          <>
            {/* Stats Section */}
            <div className="p-6 pt-4">
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
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{ourStats.playerCount} jogadores</span>
                <span>{theirStats.playerCount} jogadores</span>
              </div>
            </div>
          </>
        ) : (
          <PlayersTab
            match={match}
            clubId={clubId}
            opponentId={opponentId}
            ourTeamName={ourStats.name}
            opponentTeamName={theirStats.name}
          />
        )}

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

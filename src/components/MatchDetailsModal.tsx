'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, BarChart3, Users, ChevronDown, Star, Circle, ArrowRight } from 'lucide-react';

import type { Match, MatchCategory, MatchAggregateData, MatchPlayerData } from '@/types/clubs-api';
import { useTranslation, type Translations } from '@/lib/i18n';
import { getClubLogoUrl } from '@/lib/ea-assets';

// ============================================
// TYPES
// ============================================

type TabType = 'RESUMO' | 'JOGADORES';
type TeamViewType = 'OUR' | 'OPPONENT';

interface TimeAgo {
  number: number;
  unit: string;
}

// ============================================
// HELPER FUNCTIONS
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
function formatTimeAgo(timeAgo: TimeAgo, t: Translations): string {
  const { number, unit } = timeAgo;
  const unitMap: Record<string, string> = {
    seconds: t.time.seconds,
    minutes: t.time.minutes,
    hours: t.time.hours,
    days: t.time.days,
    weeks: t.time.weeks,
    months: t.time.months,
    years: t.time.years,
  };
  const label = unitMap[unit] || unit;
  return `${number} ${label} ${t.matches.ago}`;
}

/**
 * Retorna estilos e informações do badge de categoria
 */
function getCategoryInfo(category: MatchCategory, t: Translations): {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
} {
  switch (category) {
    case 'playoff':
      return { label: t.matches.playoff, bgColor: 'bg-amber-500/15', textColor: 'text-amber-400', borderColor: 'border-amber-500/20' };
    case 'friendly':
      return { label: t.matches.friendly, bgColor: 'bg-purple-500/15', textColor: 'text-purple-400', borderColor: 'border-purple-500/20' };
    case 'league':
    default:
      return { label: t.matches.league, bgColor: 'bg-blue-500/15', textColor: 'text-blue-400', borderColor: 'border-blue-500/20' };
  }
}

/**
 * Extrai estatísticas agregadas de um time
 */
function getTeamStats(
  match: Match,
  teamClubId: string,
  t: Translations
): TeamStats {
  const clubData = match.clubs[teamClubId];
  const aggregate = match.aggregate[teamClubId] as MatchAggregateData | undefined;
  const players = match.players[teamClubId] || {};

  const goals = parseInt(clubData?.goals || '0', 10);
  const name = clubData?.details?.name || t.matchDetails.unknownTeam;

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

  // URL do escudo - usa ClubInfo completo para lógica de selectedKitType
  const crestUrl = getClubLogoUrl(clubData?.details);

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
    <div className="space-y-2">
      {/* Values and Label Row */}
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-bold tabular-nums ${isDraw ? 'text-slate-400' : aWins ? 'text-emerald-400' : 'text-slate-400'}`}
        >
          {formatValue(valueA)}
        </span>
        <span className="text-xs uppercase tracking-wide text-slate-500 text-center flex-1">
          {label}
        </span>
        <span
          className={`text-sm font-bold tabular-nums ${isDraw ? 'text-slate-400' : bWins ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          {formatValue(valueB)}
        </span>
      </div>

      {/* Comparison Bars */}
      <div className="flex items-center gap-1 h-2">
        {/* Left bar (our team) */}
        <div className="flex-1 flex justify-end">
          <div className="w-full h-full bg-slate-700/50 rounded-l-full overflow-hidden flex justify-end">
            <div
              className={`h-full rounded-l-full transition-all duration-500 ${isDraw ? 'bg-slate-500' : aWins ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-slate-600'}`}
              style={{ width: `${percentA}%` }}
            />
          </div>
        </div>
        {/* Right bar (opponent) */}
        <div className="flex-1">
          <div className="w-full h-full bg-slate-700/50 rounded-r-full overflow-hidden">
            <div
              className={`h-full rounded-r-full transition-all duration-500 ${isDraw ? 'bg-slate-500' : bWins ? 'bg-gradient-to-r from-cyan-400 to-cyan-600' : 'bg-slate-600'}`}
              style={{ width: `${percentB}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TEAM HEADER COMPONENT (Responsive)
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
  const alignItems = side === 'left' ? 'items-center' : 'items-center';
  const flexDir = side === 'left' ? 'flex-col' : 'flex-col';

  return (
    <div className={`flex ${flexDir} ${alignItems} gap-2 flex-1 min-w-0`}>
      {/* Team Crest */}
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 shadow-lg ${isWinner
          ? 'bg-emerald-500/10 ring-emerald-500/30'
          : isLoser
            ? 'bg-red-500/5 ring-red-500/20'
            : 'bg-slate-700/30 ring-white/10'
          }`}
      >
        {crestUrl ? (
          <img
            src={crestUrl}
            alt={`${name} crest`}
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `<span class="text-base sm:text-lg font-black ${isWinner ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-slate-300'}">${name.substring(0, 2).toUpperCase()}</span>`;
            }}
          />
        ) : (
          <span
            className={`text-base sm:text-lg font-black ${isWinner ? 'text-emerald-400' : isLoser ? 'text-red-400' : 'text-slate-300'}`}
          >
            {name.substring(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {/* Team Name */}
      <p className="font-medium text-white text-xs sm:text-sm truncate max-w-[100px] text-center">
        {name}
      </p>
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
      className={`flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${isActive
        ? 'bg-slate-700 text-white'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
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
    <div className="grid grid-cols-2 gap-2 mb-4">
      <button
        onClick={() => onToggle('OUR')}
        className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 text-center truncate cursor-pointer ${selectedTeam === 'OUR'
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
      >
        {ourTeamName}
      </button>
      <button
        onClick={() => onToggle('OPPONENT')}
        className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 text-center truncate cursor-pointer ${selectedTeam === 'OPPONENT'
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
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
  isExpanded: boolean;
  onToggle: () => void;
  t: Translations;
}

function getRatingColor(rating: number): string {
  if (rating >= 8.0) return 'text-emerald-400 bg-emerald-500/20';
  if (rating >= 7.5) return 'text-green-400 bg-green-500/20';
  if (rating >= 7.0) return 'text-yellow-400 bg-yellow-500/20';
  if (rating >= 6.5) return 'text-orange-400 bg-orange-500/20';
  return 'text-red-400 bg-red-500/20';
}

function getPositionInfo(pos: string, t: Translations): { label: string; color: string } {
  const posMap: Record<string, { label: string; color: string }> = {
    goalkeeper: { label: t.positions.gol, color: 'bg-amber-500/20 text-amber-400' },
    defender: { label: t.positions.def, color: 'bg-blue-500/20 text-blue-400' },
    midfielder: { label: t.positions.mid, color: 'bg-green-500/20 text-green-400' },
    forward: { label: t.positions.att, color: 'bg-red-500/20 text-red-400' },
  };
  return posMap[pos] || { label: pos.substring(0, 3).toUpperCase(), color: 'bg-gray-500/20 text-gray-400' };
}

function PlayerAccordion({ player, isExpanded, onToggle, t }: PlayerAccordionProps) {
  const rating = parseFloat(player.rating) || 0;
  const goals = parseInt(player.goals, 10) || 0;
  const assists = parseInt(player.assists, 10) || 0;
  const isMom = player.mom === '1';
  const posInfo = getPositionInfo(player.pos, t);

  const shots = parseInt(player.shots, 10) || 0;
  const passAttempts = parseInt(player.passattempts, 10) || 0;
  const passesMade = parseInt(player.passesmade, 10) || 0;
  const tackleAttempts = parseInt(player.tackleattempts, 10) || 0;
  const tacklesMade = parseInt(player.tacklesmade, 10) || 0;
  const redCards = parseInt(player.redcards, 10) || 0;

  const passAccuracy = passAttempts > 0 ? Math.round((passesMade / passAttempts) * 100) : 0;
  const tackleAccuracy = tackleAttempts > 0 ? Math.round((tacklesMade / tackleAttempts) * 100) : 0;

  return (
    <div className={`rounded-xl overflow-hidden border transition-colors ${isExpanded
      ? 'bg-slate-800/50 border-emerald-500/20'
      : 'bg-slate-800/30 border-white/5 hover:border-white/10'
      }`}>
      {/* Header Row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 transition-colors cursor-pointer"
      >
        {/* Red Card Indicator */}
        {redCards > 0 && (
          <div className="w-3 h-4 rounded-sm bg-red-500" />
        )}

        {/* Position Badge */}
        <span className={`w-10 h-6 flex items-center justify-center rounded text-[10px] font-bold ${posInfo.color}`}>
          {posInfo.label}
        </span>

        {/* Player Name */}
        <span className="flex-1 text-left font-medium text-white text-sm truncate flex items-center gap-2">
          {player.playername}
        </span>

        {/* Goals, Assists, MOM badges */}
        <div className="flex items-center gap-2">
          {goals > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20">
              <Circle className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">{goals}</span>
            </span>
          )}
          {assists > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/20">
              <ArrowRight className="w-2.5 h-2.5 text-blue-400" />
              <span className="text-xs font-bold text-blue-400">{assists}</span>
            </span>
          )}
          {isMom && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <span className={`w-10 h-7 flex items-center justify-center rounded-lg text-sm font-bold ${getRatingColor(rating)}`}>
          {rating.toFixed(1)}
        </span>

        {/* Chevron */}
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-2 border-t border-white/5 mt-0">
          <div className="grid grid-cols-2 gap-3">
            {/* Chutes */}
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{t.matchDetails.shots}</p>
              <p className="text-base font-bold text-white mt-0.5">{shots}</p>
            </div>

            {/* Passes */}
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{t.matchDetails.passes}</p>
              <p className="text-base font-bold text-white mt-0.5">
                {passesMade}/{passAttempts}
                <span className="text-xs text-slate-400 font-normal ml-1">({passAccuracy}%)</span>
              </p>
            </div>

            {/* Desarmes */}
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{t.matchDetails.tacklesMade}</p>
              <p className="text-base font-bold text-white mt-0.5">
                {tacklesMade}/{tackleAttempts}
                <span className="text-xs text-slate-400 font-normal ml-1">({tackleAccuracy}%)</span>
              </p>
            </div>

            {/* Posição */}
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{t.matchDetails.position}</p>
              <p className={`text-base font-bold mt-0.5 ${posInfo.color.split(' ')[1]}`}>{posInfo.label}</p>
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
  t: Translations;
}

function PlayersTab({ match, clubId, opponentId, ourTeamName, opponentTeamName, t }: PlayersTabProps) {
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
    <div className="p-5">
      <TeamToggle
        selectedTeam={selectedTeam}
        onToggle={setSelectedTeam}
        ourTeamName={ourTeamName}
        opponentTeamName={opponentTeamName}
      />

      {sortedPlayers.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t.matchDetails.noPlayersFound}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedPlayers.map(([playerId, player]) => (
            <PlayerAccordion
              key={playerId}
              player={player}
              isExpanded={expandedPlayerId === playerId}
              onToggle={() => handleTogglePlayer(playerId)}
              t={t}
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
  const { t } = useTranslation();

  // Fechar com ESC e gerenciar scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    // Reset tab when modal opens (inside effect to avoid cascading renders warning)
    const rafId = requestAnimationFrame(() => {
      setActiveTab('RESUMO');
    });

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
      cancelAnimationFrame(rafId);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !match) return null;

  // Identificar times
  const clubIds = Object.keys(match.clubs);
  const opponentId = clubIds.find((id) => id !== clubId) || clubIds[0];

  // Extrair estatísticas
  const ourStats = getTeamStats(match, clubId, t);
  const theirStats = getTeamStats(match, opponentId, t);

  // Determinar resultado
  const isWin = ourStats.goals > theirStats.goals;
  const isLoss = ourStats.goals < theirStats.goals;

  // Categoria
  const category = getCategoryInfo(match.matchCategory || 'league', t);

  // Only render portal on client side
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl mx-4 max-h-[90vh] flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Sticky) */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm p-5 border-b border-white/5">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors z-10 group"
            aria-label={t.common.close}
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </button>

          {/* Category Badge & Time */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${category.bgColor} ${category.textColor} ${category.borderColor}`}
            >
              {category.label}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              <span>{formatTimeAgo(match.timeAgo, t)}</span>
            </div>
          </div>

          {/* Score Header */}
          <div className="flex items-center justify-center gap-4">
            <TeamHeader
              name={ourStats.name}
              goals={ourStats.goals}
              isWinner={isWin}
              isLoser={isLoss}
              side="left"
              crestUrl={ourStats.crestUrl}
            />

            {/* Score Central */}
            <div className="flex flex-col items-center gap-2">
              {/* Result Badge */}
              <div
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${isWin
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : isLoss
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                  }`}
              >
                {isWin ? t.matchDetails.victory : isLoss ? t.matchDetails.defeat : t.matchDetails.drawResult}
              </div>

              {/* Score */}
              <div className="flex items-center gap-2">
                <span className={`text-3xl sm:text-4xl font-black tabular-nums ${isWin ? 'text-emerald-400' : isLoss ? 'text-slate-400' : 'text-slate-300'}`}>
                  {ourStats.goals}
                </span>
                <span className="text-2xl text-slate-600 font-light">-</span>
                <span className={`text-3xl sm:text-4xl font-black tabular-nums ${isLoss ? 'text-slate-300' : isWin ? 'text-slate-400' : 'text-slate-300'}`}>
                  {theirStats.goals}
                </span>
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

          {/* Tabs Navigation */}
          <div className="flex justify-center mt-4">
            <div className="bg-slate-800/50 rounded-lg p-1 inline-flex">
              <TabButton
                label={t.matchDetails.summary}
                isActive={activeTab === 'RESUMO'}
                onClick={() => setActiveTab('RESUMO')}
                icon={<BarChart3 className="w-4 h-4" />}
              />
              <TabButton
                label={t.matchDetails.players}
                isActive={activeTab === 'JOGADORES'}
                onClick={() => setActiveTab('JOGADORES')}
                icon={<Users className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Tab Content */}
          {activeTab === 'RESUMO' ? (
            <>
              {/* Stats Section */}
              <div className="p-5">
                <div className="flex flex-col gap-4">
                  <StatComparisonRow label={t.matchDetails.shots} valueA={ourStats.shots} valueB={theirStats.shots} />

                  {/* Separator - Posse */}
                  <div className="my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <StatComparisonRow
                    label={t.matchDetails.passesAttempted}
                    valueA={ourStats.passAttempts}
                    valueB={theirStats.passAttempts}
                  />
                  <StatComparisonRow
                    label={t.matchDetails.passesCompleted}
                    valueA={ourStats.passesMade}
                    valueB={theirStats.passesMade}
                  />
                  <StatComparisonRow
                    label={t.matchDetails.passAccuracy}
                    valueA={ourStats.passAccuracy}
                    valueB={theirStats.passAccuracy}
                    format="percent"
                  />

                  {/* Separator - Defesa */}
                  <div className="my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <StatComparisonRow
                    label={t.matchDetails.tacklesAttempted}
                    valueA={ourStats.tackleAttempts}
                    valueB={theirStats.tackleAttempts}
                  />
                  <StatComparisonRow
                    label={t.matchDetails.tacklesCompleted}
                    valueA={ourStats.tacklesMade}
                    valueB={theirStats.tacklesMade}
                  />
                  <StatComparisonRow
                    label={t.matchDetails.tackleAccuracy}
                    valueA={ourStats.tackleAccuracy}
                    valueB={theirStats.tackleAccuracy}
                    format="percent"
                  />

                  {/* Separator - Disciplina/Rating */}
                  <div className="my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <StatComparisonRow
                    label={t.matchDetails.redCards}
                    valueA={ourStats.redCards}
                    valueB={theirStats.redCards}
                    higherIsBetter={false}
                  />
                  <StatComparisonRow
                    label={t.matchDetails.avgRating}
                    valueA={ourStats.rating}
                    valueB={theirStats.rating}
                    format="decimal"
                  />
                </div>
              </div>

              {/* Players Summary */}
              <div className="px-5 pb-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{ourStats.playerCount} {t.matchDetails.playersCount}</span>
                  <span>{theirStats.playerCount} {t.matchDetails.playersCount}</span>
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
              t={t}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/5 bg-slate-950/95 backdrop-blur-sm">
          <p className="text-xs text-slate-500 text-center font-medium">
            {t.matchDetails.pressEscToClose}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

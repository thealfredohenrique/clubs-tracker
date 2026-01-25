'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getMembersStats } from '@/lib/api-client';
import { LanguageToggle, NationFlag } from '@/components';
import { useTranslation, type Translations } from '@/lib/i18n';
import type { Platform, MemberStats, FavoritePosition } from '@/types/clubs-api';

// ============================================
// TYPES
// ============================================

interface CalculatedStats {
  gamesPlayed: number;
  goals: number;
  assists: number;
  goalsPerMatch: number;
  assistsPerMatch: number;
  contributions: number;
  contributionsPerMatch: number;
  winRate: number;
  ratingAve: number;
  manOfTheMatch: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function isValidPlatform(platform: string | null): platform is Platform {
  return platform === 'common-gen5' || platform === 'common-gen4' || platform === 'nx';
}

/**
 * Calcula estatísticas derivadas de um membro
 */
function calculateStats(member: MemberStats): CalculatedStats {
  const gamesPlayed = parseInt(member.gamesPlayed, 10) || 0;
  const goals = parseInt(member.goals, 10) || 0;
  const assists = parseInt(member.assists, 10) || 0;
  const manOfTheMatch = parseInt(member.manOfTheMatch, 10) || 0;
  const ratingAve = parseFloat(member.ratingAve) || 0;
  const winRate = parseFloat(member.winRate) || 0;

  const contributions = goals + assists;

  return {
    gamesPlayed,
    goals,
    assists,
    goalsPerMatch: gamesPlayed > 0 ? goals / gamesPlayed : 0,
    assistsPerMatch: gamesPlayed > 0 ? assists / gamesPlayed : 0,
    contributions,
    contributionsPerMatch: gamesPlayed > 0 ? contributions / gamesPlayed : 0,
    winRate,
    ratingAve,
    manOfTheMatch,
  };
}

/**
 * Calcula a porcentagem para a barra de progresso
 */
function getBarPercentage(valueA: number, valueB: number): { percentA: number; percentB: number } {
  const total = valueA + valueB;
  if (total === 0) return { percentA: 50, percentB: 50 };
  return {
    percentA: (valueA / total) * 100,
    percentB: (valueB / total) * 100,
  };
}

/**
 * Retorna estilos da posição
 */
function getPositionStyle(
  position: FavoritePosition,
  labels: { gol: string; def: string; mid: string; att: string }
): {
  abbr: string;
  bgColor: string;
  textColor: string;
} {
  const styles: Record<FavoritePosition, { abbr: string; bgColor: string; textColor: string }> = {
    goalkeeper: { abbr: labels.gol, bgColor: 'bg-cyan-500/20', textColor: 'text-cyan-400' },
    defender: { abbr: labels.def, bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
    midfielder: { abbr: labels.mid, bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
    forward: { abbr: labels.att, bgColor: 'bg-purple-500/20', textColor: 'text-purple-400' },
  };
  return styles[position];
}

// ============================================
// STAT ROW COMPONENT
// ============================================

interface StatRowProps {
  label: string;
  valueA: number;
  valueB: number;
  format?: 'number' | 'decimal' | 'percent';
  higherIsBetter?: boolean;
}

function StatRow({
  label,
  valueA,
  valueB,
  format = 'number',
  higherIsBetter = true,
}: StatRowProps) {
  const { percentA, percentB } = getBarPercentage(valueA, valueB);

  // Determinar vencedor
  const aWins = higherIsBetter ? valueA > valueB : valueA < valueB;
  const bWins = higherIsBetter ? valueB > valueA : valueB < valueA;
  const isDraw = valueA === valueB;

  // Formatar valores
  const formatValue = (value: number): string => {
    switch (format) {
      case 'decimal':
        return value.toFixed(2);
      case 'percent':
        return `${value.toFixed(0)}%`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="py-2 sm:py-3">
      {/* Values Row */}
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        {/* Player A Value */}
        <span
          className={`text-base sm:text-xl font-bold w-14 sm:w-20 text-left ${isDraw ? 'text-slate-300' : aWins ? 'text-emerald-400' : 'text-slate-500'
            }`}
        >
          {formatValue(valueA)}
        </span>

        {/* Stat Label */}
        <span className="text-[10px] sm:text-sm font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>

        {/* Player B Value */}
        <span
          className={`text-base sm:text-xl font-bold w-14 sm:w-20 text-right ${isDraw ? 'text-slate-300' : bWins ? 'text-cyan-400' : 'text-slate-500'
            }`}
        >
          {formatValue(valueB)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 sm:h-2 bg-slate-800/50 rounded-full overflow-hidden flex">
        <div
          className={`h-full transition-all duration-500 ${isDraw ? 'bg-slate-600' : aWins ? 'bg-emerald-500' : 'bg-white/10'
            }`}
          style={{ width: `${percentA}%` }}
        />
        <div
          className={`h-full transition-all duration-500 ${isDraw ? 'bg-slate-600' : bWins ? 'bg-cyan-500' : 'bg-white/10'
            }`}
          style={{ width: `${percentB}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// PLAYER CARD COMPONENT
// ============================================

interface PlayerCardProps {
  member: MemberStats | null;
  side: 'left' | 'right';
  t: Translations;
  positionLabels: { gol: string; def: string; mid: string; att: string };
}

function PlayerCard({ member, side, t, positionLabels }: PlayerCardProps) {
  if (!member) {
    // Ghost Card Slot - Empty State (Ultra Subtle)
    return (
      <div className="flex flex-col items-center p-4 sm:p-6">
        <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border border-dashed ${side === 'left' ? 'border-slate-600/50' : 'border-slate-600/50'
          } bg-slate-900/30 flex flex-col items-center justify-center mb-3 sm:mb-4`}>
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className={`text-[10px] sm:text-xs font-medium ${side === 'left' ? 'text-slate-500' : 'text-slate-500'
            }`}>{side === 'left' ? 'A' : 'B'}</span>
        </div>
        <p className="text-slate-500 text-xs sm:text-sm font-medium">{t.compare.selectPlayer}</p>
      </div>
    );
  }

  const positionStyle = getPositionStyle(member.favoritePosition, positionLabels);
  const overall = parseInt(member.proOverall, 10) || 0;
  const nationalityId = parseInt(member.proNationality, 10);

  return (
    <div className="flex flex-col items-center p-4 sm:p-6">
      {/* Player Avatar with OVR - Subtle gradient */}
      <div
        className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl ${side === 'left'
            ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900/60 ring-1 ring-emerald-500/20'
            : 'bg-gradient-to-br from-cyan-950/40 to-slate-900/60 ring-1 ring-cyan-500/20'
          } flex items-center justify-center mb-3 sm:mb-4`}
      >
        <span className={`text-3xl sm:text-5xl font-black ${side === 'left' ? 'text-emerald-400' : 'text-cyan-400'
          }`}>
          {overall}
        </span>
      </div>

      {/* Player Name */}
      <h3 className="text-sm sm:text-xl font-bold text-white mb-2 text-center truncate max-w-[120px] sm:max-w-full">
        {member.proName || member.name}
      </h3>

      {/* Nation Flag + Position Badge Row */}
      <div className="flex items-center gap-2">
        {nationalityId > 0 && (
          <NationFlag nationalityId={nationalityId} size="sm" />
        )}
        <span
          className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${positionStyle.bgColor} ${positionStyle.textColor}`}
        >
          {positionStyle.abbr}
        </span>
      </div>
    </div>
  );
}

// ============================================
// PLAYER SELECT COMPONENT
// ============================================

interface PlayerSelectProps {
  members: MemberStats[];
  selectedId: string | null;
  onChange: (memberId: string | null) => void;
  excludeId?: string | null;
  label: string;
  side: 'left' | 'right';
  selectPlaceholder: string;
}

function PlayerSelect({
  members,
  selectedId,
  onChange,
  excludeId,
  label,
  side,
  selectPlaceholder,
}: PlayerSelectProps) {
  const availableMembers = members.filter((m) => m.name !== excludeId);

  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
      <select
        value={selectedId || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className={`w-full px-4 py-3 rounded-xl bg-slate-800/80 border ${side === 'left' ? 'border-emerald-500/30 focus:border-emerald-500' : 'border-cyan-500/30 focus:border-cyan-500'
          } text-white font-medium focus:outline-none focus:ring-2 ${side === 'left' ? 'focus:ring-emerald-500/30' : 'focus:ring-cyan-500/30'
          } transition-all`}
      >
        <option value="">{selectPlaceholder}</option>
        {availableMembers.map((member) => (
          <option key={member.name} value={member.name}>
            {member.proName || member.name} ({member.favoritePosition.substring(0, 3).toUpperCase()})
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================
// LOADING COMPONENT
// ============================================

function LoadingSpinner({ loadingText }: { loadingText: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin w-10 h-10 text-cyan-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-slate-400">{loadingText}</p>
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

interface EmptyStateProps {
  title: string;
  description: string;
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-8 sm:py-12">
      {/* Ghost Card Slots - Ultra Subtle */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8">
        {/* Ghost Slot A */}
        <div className="w-24 h-28 sm:w-32 sm:h-40 rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/20 flex flex-col items-center justify-center">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs font-medium text-slate-600">A</span>
        </div>

        {/* VS Badge - Subtle glass effect */}
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-800/80 ring-1 ring-slate-600/50 flex items-center justify-center">
          <span className="text-xs sm:text-base font-bold text-slate-400">VS</span>
        </div>

        {/* Ghost Slot B */}
        <div className="w-24 h-28 sm:w-32 sm:h-40 rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/20 flex flex-col items-center justify-center">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs font-medium text-slate-600">B</span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
}

// ============================================
// COMPARISON CARD COMPONENT
// ============================================

interface ComparisonCardProps {
  playerA: MemberStats;
  playerB: MemberStats;
  t: Translations;
  positionLabels: { gol: string; def: string; mid: string; att: string };
}

function ComparisonCard({ playerA, playerB, t, positionLabels }: ComparisonCardProps) {
  const statsA = calculateStats(playerA);
  const statsB = calculateStats(playerB);

  return (
    <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 ring-1 ring-white/5">
      {/* VS Header - Subtle ambient gradients */}
      <div className="relative bg-gradient-to-r from-emerald-950/30 via-slate-900 to-cyan-950/30 border-b border-slate-700/40">
        <div className="flex items-stretch">
          {/* Player A Card */}
          <div className="flex-1 border-r border-slate-700/30">
            <PlayerCard member={playerA} side="left" t={t} positionLabels={positionLabels} />
          </div>

          {/* VS Badge - Refined glass morphism */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-800/90 ring-1 ring-slate-600/60 flex items-center justify-center shadow-xl shadow-black/30 backdrop-blur-sm">
              <span className="text-sm sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-200 to-slate-400">VS</span>
            </div>
          </div>

          {/* Player B Card */}
          <div className="flex-1 border-l border-slate-700/30">
            <PlayerCard member={playerB} side="right" t={t} positionLabels={positionLabels} />
          </div>
        </div>
      </div>

      {/* Stats Comparison */}
      <div className="p-4 sm:p-6 divide-y divide-slate-700/30">
        <StatRow
          label={t.compare.rating}
          valueA={statsA.ratingAve}
          valueB={statsB.ratingAve}
          format="decimal"
        />
        <StatRow
          label={t.compare.gamesPlayed}
          valueA={statsA.gamesPlayed}
          valueB={statsB.gamesPlayed}
        />
        <StatRow
          label={t.compare.winRate}
          valueA={statsA.winRate}
          valueB={statsB.winRate}
          format="percent"
        />
        <StatRow
          label={t.compare.goals}
          valueA={statsA.goals}
          valueB={statsB.goals}
        />
        <StatRow
          label={t.compare.goalsPerMatch}
          valueA={statsA.goalsPerMatch}
          valueB={statsB.goalsPerMatch}
          format="decimal"
        />
        <StatRow
          label={t.compare.assists}
          valueA={statsA.assists}
          valueB={statsB.assists}
        />
        <StatRow
          label={t.compare.assistsPerMatch}
          valueA={statsA.assistsPerMatch}
          valueB={statsB.assistsPerMatch}
          format="decimal"
        />
        <StatRow
          label={t.compare.contributions}
          valueA={statsA.contributions}
          valueB={statsB.contributions}
        />
        <StatRow
          label={t.compare.manOfTheMatch}
          valueA={statsA.manOfTheMatch}
          valueB={statsB.manOfTheMatch}
        />
      </div>

      {/* Footer Legend */}
      <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-gray-700/50 bg-gray-800/30">
        <div className="flex items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-gray-500">
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500"></span>
            {t.matches.win}
          </span>
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-500"></span>
            {t.matches.draw}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAGE COMPONENT
// ============================================

function ComparePageContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const clubId = searchParams.get('clubId');
  const platformParam = searchParams.get('platform');
  const clubName = searchParams.get('clubName');

  const platform: Platform = isValidPlatform(platformParam) ? platformParam : 'common-gen5';

  // Position labels for i18n
  const positionLabels = {
    gol: t.positions.gol,
    def: t.positions.def,
    mid: t.positions.mid,
    att: t.positions.att,
  };

  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberStats[]>([]);
  const [playerAId, setPlayerAId] = useState<string | null>(null);
  const [playerBId, setPlayerBId] = useState<string | null>(null);

  // Buscar membros ao carregar
  useEffect(() => {
    async function fetchMembers() {
      if (!clubId) {
        setError(t.compare.noClubId);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getMembersStats(platform, clubId);
        if (result.success) {
          setMembers(result.data.members);
        } else {
          setError(result.error.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t.errors.loadError);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMembers();
  }, [clubId, platform, t.compare.noClubId, t.errors.loadError]);

  // Encontrar jogadores selecionados
  const playerA = useMemo(
    () => members.find((m) => m.name === playerAId) || null,
    [members, playerAId]
  );
  const playerB = useMemo(
    () => members.find((m) => m.name === playerBId) || null,
    [members, playerBId]
  );

  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-6">
          <Link
            href={clubId ? `/club/${clubId}` : '/'}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{t.compare.backToClub}</span>
          </Link>
          <LanguageToggle />
        </nav>

        {/* Header - Refined glass icon */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-800/80 ring-1 ring-slate-600/50 shadow-xl shadow-black/30 mb-3 sm:mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">
            {t.compare.comparison}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-500">
              1v1
            </span>
          </h1>
          {clubName && (
            <p className="text-slate-400 text-sm sm:text-base truncate max-w-xs mx-auto">{decodeURIComponent(clubName)}</p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && <LoadingSpinner loadingText={t.compare.loadingPlayers} />}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-8 bg-red-900/30 border border-red-500/50 rounded-2xl text-center">
            <p className="text-red-300 text-lg font-medium">{error}</p>
            <Link href="/" className="mt-4 inline-block text-emerald-400 hover:text-emerald-300">
              {t.errors.backToSearch}
            </Link>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && members.length > 0 && (
          <>
            {/* Player Selectors */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <PlayerSelect
                members={members}
                selectedId={playerAId}
                onChange={setPlayerAId}
                excludeId={playerBId}
                label={t.compare.playerA}
                side="left"
                selectPlaceholder={t.compare.selectPlayerDropdown}
              />
              <PlayerSelect
                members={members}
                selectedId={playerBId}
                onChange={setPlayerBId}
                excludeId={playerAId}
                label={t.compare.playerB}
                side="right"
                selectPlaceholder={t.compare.selectPlayerDropdown}
              />
            </div>

            {/* Comparison */}
            {playerA && playerB ? (
              <ComparisonCard playerA={playerA} playerB={playerB} t={t} positionLabels={positionLabels} />
            ) : (
              <EmptyState title={t.compare.selectPlayers} description={t.compare.selectPlayersDescription} />
            )}
          </>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-slate-500 text-sm">
          <p>{t.search.apiData}</p>
        </footer>
      </div>
    </main>
  );
}

// ============================================
// PAGE LOADING FALLBACK
// ============================================

function PageLoadingFallback() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="animate-spin w-10 h-10 text-cyan-500"
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
            <p className="text-slate-400">{t.common.loading}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================
// PAGE EXPORT WITH SUSPENSE
// ============================================

export default function ComparePage() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <ComparePageContent />
    </Suspense>
  );
}

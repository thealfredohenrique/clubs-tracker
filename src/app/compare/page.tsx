'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Swords, ChevronDown, User, Trophy } from 'lucide-react';

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
  delay = 0,
}: StatRowProps & { delay?: number }) {
  const [animate, setAnimate] = useState(false);
  const { percentA, percentB } = getBarPercentage(valueA, valueB);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

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
    <div className="space-y-2">
      {/* Values Row */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Player A Value */}
        <div className="text-right flex items-center justify-end gap-1">
          {aWins && <Trophy className="w-3 h-3 text-emerald-400 opacity-60" />}
          <span
            className={`text-base md:text-xl font-bold tabular-nums ${isDraw ? 'text-slate-400' : aWins ? 'text-emerald-400' : 'text-slate-500'}`}
          >
            {formatValue(valueA)}
          </span>
        </div>

        {/* Stat Label */}
        <span className="text-xs uppercase tracking-widest text-slate-500 text-center min-w-[80px] md:min-w-[140px]">
          {label}
        </span>

        {/* Player B Value */}
        <div className="text-left flex items-center gap-1">
          <span
            className={`text-base md:text-xl font-bold tabular-nums ${isDraw ? 'text-slate-400' : bWins ? 'text-cyan-400' : 'text-slate-500'}`}
          >
            {formatValue(valueB)}
          </span>
          {bWins && <Trophy className="w-3 h-3 text-cyan-400 opacity-60" />}
        </div>
      </div>

      {/* Tug-of-War Bar */}
      <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-slate-800">
        {/* Side A */}
        <div
          className={`h-full transition-all duration-700 ease-out ${valueA === 0 && valueB === 0
              ? ''
              : isDraw
                ? 'bg-slate-500'
                : aWins
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                  : 'bg-slate-600'
            }`}
          style={{ width: animate ? `${percentA}%` : '0%' }}
        />
        {/* Side B */}
        <div
          className={`h-full transition-all duration-700 ease-out ${valueA === 0 && valueB === 0
              ? ''
              : isDraw
                ? 'bg-slate-500'
                : bWins
                  ? 'bg-gradient-to-l from-cyan-600 to-cyan-400'
                  : 'bg-slate-600'
            }`}
          style={{ width: animate ? `${percentB}%` : '0%' }}
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
    // Ghost Card Slot - Empty State
    return (
      <div className="flex flex-col items-center p-4 sm:p-6">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 flex flex-col items-center justify-center mb-3">
          <User className="w-8 h-8 text-slate-700" />
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
      {/* OVR Circle */}
      <div
        className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${side === 'left'
          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30'
          : 'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-cyan-500/30'
          }`}
      >
        <span className="text-2xl md:text-3xl font-black text-white">
          {overall}
        </span>
      </div>

      {/* Player Name */}
      <h3 className="text-base md:text-lg font-semibold text-white mt-1 text-center truncate max-w-[100px] sm:max-w-full">
        {member.proName || member.name}
      </h3>

      {/* Nation Flag + Position Badge Row */}
      <div className="flex items-center justify-center gap-2 mt-2">
        {nationalityId > 0 && (
          <NationFlag nationalityId={nationalityId} size="sm" />
        )}
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${positionStyle.bgColor} ${positionStyle.textColor} ${positionStyle.bgColor.replace('/20', '/30').replace('bg-', 'border-')}`}
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
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${side === 'left' ? 'text-emerald-400' : 'text-cyan-400'}`}>
        {label}
      </label>
      <div className="relative w-full">
        <select
          value={selectedId || ''}
          onChange={(e) => onChange(e.target.value || null)}
          className={`w-full px-4 py-3 rounded-xl appearance-none cursor-pointer bg-slate-900/60 backdrop-blur-sm border transition-all duration-200 text-white text-sm focus:outline-none ${side === 'left'
            ? 'border-white/10 hover:border-white/20 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20'
            : 'border-white/10 hover:border-white/20 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20'
            }`}
        >
          <option value="" className="bg-slate-900 text-slate-500">{selectPlaceholder}</option>
          {availableMembers.map((member) => (
            <option key={member.name} value={member.name} className="bg-slate-900">
              {member.proName || member.name} ({member.favoritePosition.substring(0, 3).toUpperCase()})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      </div>
    </div>
  );
}

// ============================================
// LOADING COMPONENT
// ============================================

function LoadingSpinner({ loadingText }: { loadingText: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-cyan-500 animate-spin" />
        <p className="text-slate-500 text-sm">{loadingText}</p>
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
    <div className="text-center py-16 mt-8">
      {/* Ghost Card Slots */}
      <div className="flex items-center justify-center gap-6 mb-8">
        {/* Ghost Slot A */}
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 flex flex-col items-center justify-center">
          <User className="w-8 h-8 text-slate-700" />
          <span className="text-[10px] uppercase tracking-wide text-slate-600 mt-2">A</span>
        </div>

        {/* VS Badge */}
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
          <span className="text-xs font-bold text-slate-500 uppercase">VS</span>
        </div>

        {/* Ghost Slot B */}
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 flex flex-col items-center justify-center">
          <User className="w-8 h-8 text-slate-700" />
          <span className="text-[10px] uppercase tracking-wide text-slate-600 mt-2">B</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
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

  // Calculate wins for summary
  const getWinner = (a: number, b: number, higherIsBetter = true) => {
    if (a === b) return 'draw';
    return (higherIsBetter ? a > b : a < b) ? 'a' : 'b';
  };

  const categories = [
    getWinner(statsA.ratingAve, statsB.ratingAve),
    getWinner(statsA.gamesPlayed, statsB.gamesPlayed),
    getWinner(statsA.winRate, statsB.winRate),
    getWinner(statsA.goals, statsB.goals),
    getWinner(statsA.goalsPerMatch, statsB.goalsPerMatch),
    getWinner(statsA.assists, statsB.assists),
    getWinner(statsA.assistsPerMatch, statsB.assistsPerMatch),
    getWinner(statsA.contributions, statsB.contributions),
    getWinner(statsA.manOfTheMatch, statsB.manOfTheMatch),
  ];

  const winsA = categories.filter(c => c === 'a').length;
  const winsB = categories.filter(c => c === 'b').length;
  const draws = categories.filter(c => c === 'draw').length;

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
      {/* VS Header */}
      <div className="grid grid-cols-[1fr_auto_1fr] p-6 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 via-transparent to-cyan-500/5">
        {/* Player A Card */}
        <PlayerCard member={playerA} side="left" t={t} positionLabels={positionLabels} />

        {/* VS Badge */}
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-400 uppercase">VS</span>
          </div>
        </div>

        {/* Player B Card */}
        <PlayerCard member={playerB} side="right" t={t} positionLabels={positionLabels} />
      </div>

      {/* Stats Comparison */}
      <div className="p-6 flex flex-col gap-5">
        {/* Performance Section */}
        <StatRow
          label={t.compare.rating}
          valueA={statsA.ratingAve}
          valueB={statsB.ratingAve}
          format="decimal"
          delay={0}
        />
        <StatRow
          label={t.compare.gamesPlayed}
          valueA={statsA.gamesPlayed}
          valueB={statsB.gamesPlayed}
          delay={100}
        />
        <StatRow
          label={t.compare.winRate}
          valueA={statsA.winRate}
          valueB={statsB.winRate}
          format="percent"
          delay={200}
        />

        {/* Separator */}
        <div className="my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Attack Section */}
        <StatRow
          label={t.compare.goals}
          valueA={statsA.goals}
          valueB={statsB.goals}
          delay={300}
        />
        <StatRow
          label={t.compare.goalsPerMatch}
          valueA={statsA.goalsPerMatch}
          valueB={statsB.goalsPerMatch}
          format="decimal"
          delay={400}
        />
        <StatRow
          label={t.compare.assists}
          valueA={statsA.assists}
          valueB={statsB.assists}
          delay={500}
        />
        <StatRow
          label={t.compare.assistsPerMatch}
          valueA={statsA.assistsPerMatch}
          valueB={statsB.assistsPerMatch}
          format="decimal"
          delay={600}
        />

        {/* Separator */}
        <div className="my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Contributions Section */}
        <StatRow
          label={t.compare.contributions}
          valueA={statsA.contributions}
          valueB={statsB.contributions}
          delay={700}
        />
        <StatRow
          label={t.compare.manOfTheMatch}
          valueA={statsA.manOfTheMatch}
          valueB={statsB.manOfTheMatch}
          delay={800}
        />
      </div>

      {/* Footer Summary */}
      <div className="px-6 py-4 border-t border-white/5 bg-slate-900/30 flex items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-400">{winsA}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500 mt-1">{t.matches.win}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-400">{draws}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500 mt-1">{t.matches.draw}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-cyan-400">{winsB}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500 mt-1">{t.matches.win}</p>
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
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <Link
            href={clubId ? `/club/${clubId}` : '/'}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t.compare.backToClub}</span>
          </Link>
          <LanguageToggle />
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30 mb-4">
            <Swords className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1">
            {t.compare.comparison}
          </h1>
          <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            1v1
          </p>
          {clubName && (
            <p className="text-slate-500 text-sm mt-2 truncate max-w-xs mx-auto">{decodeURIComponent(clubName)}</p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && <LoadingSpinner loadingText={t.compare.loadingPlayers} />}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-8 bg-red-500/10 border border-red-500/30 rounded-2xl text-center">
            <p className="text-red-400 text-lg font-medium">{error}</p>
            <Link href="/" className="mt-4 inline-block text-emerald-400 hover:text-emerald-300 text-sm">
              {t.errors.backToSearch}
            </Link>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && members.length > 0 && (
          <>
            {/* Player Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
        <footer className="mt-12 text-center">
          <p className="text-slate-600 text-xs">{t.search.apiData}</p>
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
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-cyan-500 animate-spin" />
            <p className="text-slate-500 text-sm">{t.common.loading}</p>
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

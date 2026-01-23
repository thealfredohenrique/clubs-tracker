'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getMembersStats } from '@/lib/api-client';
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
// CONSTANTS
// ============================================

const CREST_BASE_URL =
  'https://eafc24.content.easports.com/fifa/fltOnlineAssets/24B23FDE-7835-41C2-87A2-F453DFDB2E82/2024/fcweb/crests/256x256/l';

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
function getPositionStyle(position: FavoritePosition): {
  abbr: string;
  bgColor: string;
  textColor: string;
} {
  const styles: Record<FavoritePosition, { abbr: string; bgColor: string; textColor: string }> = {
    goalkeeper: { abbr: 'GOL', bgColor: 'bg-amber-500/20', textColor: 'text-amber-400' },
    defender: { abbr: 'DEF', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
    midfielder: { abbr: 'MEI', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
    forward: { abbr: 'ATA', bgColor: 'bg-red-500/20', textColor: 'text-red-400' },
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
    <div className="py-3">
      {/* Values Row */}
      <div className="flex items-center justify-between mb-2">
        {/* Player A Value */}
        <span
          className={`text-xl font-bold w-20 text-left ${isDraw ? 'text-gray-300' : aWins ? 'text-emerald-400' : 'text-gray-500'
            }`}
        >
          {formatValue(valueA)}
        </span>

        {/* Stat Label */}
        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </span>

        {/* Player B Value */}
        <span
          className={`text-xl font-bold w-20 text-right ${isDraw ? 'text-gray-300' : bWins ? 'text-emerald-400' : 'text-gray-500'
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
// PLAYER CARD COMPONENT
// ============================================

interface PlayerCardProps {
  member: MemberStats | null;
  side: 'left' | 'right';
}

function PlayerCard({ member, side }: PlayerCardProps) {
  if (!member) {
    return (
      <div className="flex flex-col items-center p-6">
        <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">Selecione um jogador</p>
      </div>
    );
  }

  const positionStyle = getPositionStyle(member.favoritePosition);
  const overall = parseInt(member.proOverall, 10) || 0;

  return (
    <div className="flex flex-col items-center p-6">
      {/* Player Avatar */}
      <div
        className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${side === 'left' ? 'from-emerald-500/30 to-emerald-700/30' : 'from-cyan-500/30 to-cyan-700/30'
          } border-2 ${side === 'left' ? 'border-emerald-500/50' : 'border-cyan-500/50'
          } flex items-center justify-center mb-4`}
      >
        <span className="text-4xl font-black text-white">
          {overall}
        </span>
      </div>

      {/* Player Name */}
      <h3 className="text-xl font-bold text-white mb-2 text-center">
        {member.proName || member.name}
      </h3>

      {/* Position Badge */}
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${positionStyle.bgColor} ${positionStyle.textColor}`}
      >
        {positionStyle.abbr}
      </span>
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
}

function PlayerSelect({
  members,
  selectedId,
  onChange,
  excludeId,
  label,
  side,
}: PlayerSelectProps) {
  const availableMembers = members.filter((m) => m.name !== excludeId);

  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <select
        value={selectedId || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className={`w-full px-4 py-3 rounded-xl bg-gray-800/80 border ${side === 'left' ? 'border-emerald-500/30 focus:border-emerald-500' : 'border-cyan-500/30 focus:border-cyan-500'
          } text-white font-medium focus:outline-none focus:ring-2 ${side === 'left' ? 'focus:ring-emerald-500/30' : 'focus:ring-cyan-500/30'
          } transition-all`}
      >
        <option value="">Selecionar jogador...</option>
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

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-gray-400">Carregando jogadores...</p>
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-6">
        <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Selecione os Jogadores</h3>
      <p className="text-gray-400 max-w-md mx-auto">
        Escolha dois jogadores nos menus acima para comparar suas estatísticas lado a lado.
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
}

function ComparisonCard({ playerA, playerB }: ComparisonCardProps) {
  const statsA = calculateStats(playerA);
  const statsB = calculateStats(playerB);

  return (
    <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl">
      {/* VS Header */}
      <div className="relative bg-gradient-to-r from-emerald-900/30 via-gray-900 to-cyan-900/30 border-b border-gray-700/50">
        <div className="flex items-stretch">
          {/* Player A Card */}
          <div className="flex-1 border-r border-gray-700/30">
            <PlayerCard member={playerA} side="left" />
          </div>

          {/* VS Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <span className="text-xl font-black text-white">VS</span>
            </div>
          </div>

          {/* Player B Card */}
          <div className="flex-1 border-l border-gray-700/30">
            <PlayerCard member={playerB} side="right" />
          </div>
        </div>
      </div>

      {/* Stats Comparison */}
      <div className="p-6 divide-y divide-gray-700/30">
        <StatRow
          label="Rating"
          valueA={statsA.ratingAve}
          valueB={statsB.ratingAve}
          format="decimal"
        />
        <StatRow
          label="Partidas"
          valueA={statsA.gamesPlayed}
          valueB={statsB.gamesPlayed}
        />
        <StatRow
          label="Win Rate"
          valueA={statsA.winRate}
          valueB={statsB.winRate}
          format="percent"
        />
        <StatRow
          label="Gols"
          valueA={statsA.goals}
          valueB={statsB.goals}
        />
        <StatRow
          label="Gols/Jogo"
          valueA={statsA.goalsPerMatch}
          valueB={statsB.goalsPerMatch}
          format="decimal"
        />
        <StatRow
          label="Assists"
          valueA={statsA.assists}
          valueB={statsB.assists}
        />
        <StatRow
          label="Assists/Jogo"
          valueA={statsA.assistsPerMatch}
          valueB={statsB.assistsPerMatch}
          format="decimal"
        />
        <StatRow
          label="G + A"
          valueA={statsA.contributions}
          valueB={statsB.contributions}
        />
        <StatRow
          label="MoM"
          valueA={statsA.manOfTheMatch}
          valueB={statsB.manOfTheMatch}
        />
      </div>

      {/* Footer Legend */}
      <div className="px-6 py-3 border-t border-gray-700/50 bg-gray-800/30">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            Vencedor
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-500"></span>
            Empate
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAGE COMPONENT
// ============================================

export default function ComparePage() {
  const searchParams = useSearchParams();

  const clubId = searchParams.get('clubId');
  const platformParam = searchParams.get('platform');
  const clubName = searchParams.get('clubName');

  const platform: Platform = isValidPlatform(platformParam) ? platformParam : 'common-gen5';

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
        setError('ID do clube não fornecido. Volte para a página do clube e acesse a comparação por lá.');
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
        setError(err instanceof Error ? err.message : 'Erro ao carregar jogadores.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMembers();
  }, [clubId, platform]);

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
    <main className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <nav className="mb-6">
          <Link
            href={clubId ? `/club/${clubId}?platform=${platform}&name=${encodeURIComponent(clubName || '')}` : '/'}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Voltar para o clube</span>
          </Link>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Comparação{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              X1
            </span>
          </h1>
          {clubName && (
            <p className="text-gray-400">{decodeURIComponent(clubName)}</p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && <LoadingSpinner />}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-8 bg-red-900/30 border border-red-500/50 rounded-2xl text-center">
            <p className="text-red-300 text-lg font-medium">{error}</p>
            <Link href="/" className="mt-4 inline-block text-emerald-400 hover:text-emerald-300">
              Voltar para a busca
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
                label="Jogador A"
                side="left"
              />
              <PlayerSelect
                members={members}
                selectedId={playerBId}
                onChange={setPlayerBId}
                excludeId={playerAId}
                label="Jogador B"
                side="right"
              />
            </div>

            {/* Comparison */}
            {playerA && playerB ? (
              <ComparisonCard playerA={playerA} playerB={playerB} />
            ) : (
              <EmptyState />
            )}
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

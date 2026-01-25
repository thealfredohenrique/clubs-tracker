'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { MemberStats, FavoritePosition } from '@/types/clubs-api';
import { PlayerProfileModal } from './PlayerProfileModal';
import { NationFlag } from './NationFlag';
import { useTranslation } from '@/lib/i18n';

// ============================================
// TYPES
// ============================================

interface ClubRosterProps {
  members: MemberStats[];
  clubId?: string;
}

type TabKey = 'GERAL' | 'ATAQUE' | 'DEFESA';

type SortKey =
  | 'name'
  | 'favoritePosition'
  | 'proOverall'
  | 'gamesPlayed'
  | 'goals'
  | 'assists'
  | 'ratingAve'
  | 'manOfTheMatch'
  | 'momRate'
  | 'winRate'
  | 'goalsPerMatch'
  | 'assistsPerMatch'
  | 'goalsAssists'
  | 'goalsAssistsPerMatch'
  | 'shotSuccessRate'
  | 'tacklesMade'
  | 'tacklesPerMatch'
  | 'tackleSuccessRate'
  | 'redCards'
  | 'redCardsPerMatch'
  | 'cleanSheets'
  | 'cleanSheetRate';

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Converte valor string para número (seguro)
 */
function toNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calcula valor por partida (evita divisão por zero)
 * Retorna "-" se gamesPlayed for 0
 */
function perMatch(total: number | string, games: number | string, decimals: number = 2): string {
  const t = toNumber(total);
  const g = toNumber(games);
  if (g === 0) return '-';
  return (t / g).toFixed(decimals);
}

/**
 * Calcula valor numérico por partida (para ordenação)
 */
function perMatchValue(total: number | string, games: number | string): number {
  const t = toNumber(total);
  const g = toNumber(games);
  if (g === 0) return 0;
  return t / g;
}

/**
 * Calcula taxa percentual (evita divisão por zero)
 * Retorna "-" se total for 0
 */
function ratePercent(part: number | string, total: number | string): string {
  const p = toNumber(part);
  const t = toNumber(total);
  if (t === 0) return '-';
  return `${Math.round((p / t) * 100)}%`;
}

/**
 * Calcula valor percentual numérico (para ordenação)
 */
function rateValue(part: number | string, total: number | string): number {
  const p = toNumber(part);
  const t = toNumber(total);
  if (t === 0) return 0;
  return (p / t) * 100;
}

/**
 * Retorna o ícone e cor da posição
 */
function getPositionStyle(
  position: FavoritePosition,
  positionLabels: { goalkeeper: string; defender: string; midfielder: string; forward: string; gol: string; def: string; mid: string; att: string }
): {
  label: string;
  abbr: string;
  bgColor: string;
  textColor: string;
} {
  const styles: Record<FavoritePosition, { label: string; abbr: string; bgColor: string; textColor: string }> = {
    goalkeeper: {
      label: positionLabels.goalkeeper,
      abbr: positionLabels.gol,
      bgColor: 'bg-amber-500/20',
      textColor: 'text-amber-400',
    },
    defender: {
      label: positionLabels.defender,
      abbr: positionLabels.def,
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400',
    },
    midfielder: {
      label: positionLabels.midfielder,
      abbr: positionLabels.mid,
      bgColor: 'bg-emerald-500/20',
      textColor: 'text-emerald-400',
    },
    forward: {
      label: positionLabels.forward,
      abbr: positionLabels.att,
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-400',
    },
  };

  return styles[position];
}

/**
 * Retorna a cor do rating baseado no valor
 */
function getRatingColor(rating: number): string {
  if (rating >= 8.0) return 'text-emerald-400';
  if (rating >= 7.0) return 'text-yellow-400';
  if (rating >= 6.0) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Ordena membros com base na configuração de ordenação
 */
function sortMembers(members: MemberStats[], sortConfig: SortConfig): MemberStats[] {
  return [...members].sort((a, b) => {
    const { key, direction } = sortConfig;
    let comparison = 0;

    // Extrair valores com base na chave
    const getValue = (member: MemberStats): number | string => {
      const games = toNumber(member.gamesPlayed);
      const goals = toNumber(member.goals);
      const assists = toNumber(member.assists);
      const mom = toNumber(member.manOfTheMatch);
      const tackles = toNumber(member.tacklesMade);
      const redCards = toNumber(member.redCards);
      const isGK = member.favoritePosition === 'goalkeeper';
      const cleanSheets = toNumber(isGK ? member.cleanSheetsGK : member.cleanSheetsDef);

      switch (key) {
        case 'name':
          return member.proName || member.name;
        case 'favoritePosition':
          return member.favoritePosition;
        case 'proOverall':
          return toNumber(member.proOverall);
        case 'gamesPlayed':
          return games;
        case 'goals':
          return goals;
        case 'assists':
          return assists;
        case 'ratingAve':
          return toNumber(member.ratingAve);
        case 'manOfTheMatch':
          return mom;
        case 'momRate':
          return rateValue(mom, games);
        case 'winRate':
          return toNumber(member.winRate);
        case 'goalsPerMatch':
          return perMatchValue(goals, games);
        case 'assistsPerMatch':
          return perMatchValue(assists, games);
        case 'goalsAssists':
          return goals + assists;
        case 'goalsAssistsPerMatch':
          return perMatchValue(goals + assists, games);
        case 'shotSuccessRate':
          return toNumber(member.shotSuccessRate);
        case 'tacklesMade':
          return tackles;
        case 'tacklesPerMatch':
          return perMatchValue(tackles, games);
        case 'tackleSuccessRate':
          return toNumber(member.tackleSuccessRate);
        case 'redCards':
          return redCards;
        case 'redCardsPerMatch':
          return perMatchValue(redCards, games);
        case 'cleanSheets':
          return cleanSheets;
        case 'cleanSheetRate':
          return rateValue(cleanSheets, games);
        default:
          return 0;
      }
    };

    const valueA = getValue(a);
    const valueB = getValue(b);

    // Comparação de strings vs números
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      comparison = valueA.localeCompare(valueB, 'pt-BR', { sensitivity: 'base' });
    } else {
      comparison = (valueA as number) - (valueB as number);
    }

    // Inverter se for descendente
    return direction === 'desc' ? -comparison : comparison;
  });
}

// ============================================
// TAB BUTTON COMPONENT
// ============================================

interface TabButtonProps {
  tab: TabKey;
  activeTab: TabKey;
  onClick: (tab: TabKey) => void;
  children: React.ReactNode;
}

function TabButton({ tab, activeTab, onClick, children }: TabButtonProps) {
  const isActive = tab === activeTab;
  return (
    <button
      onClick={() => onClick(tab)}
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${isActive
        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
        : 'text-gray-400 hover:text-white hover:bg-gray-700/50 border border-transparent'
        }`}
    >
      {children}
    </button>
  );
}

// ============================================
// SORT ICON COMPONENT
// ============================================

interface SortIconProps {
  isActive: boolean;
  direction: SortDirection;
}

function SortIcon({ isActive, direction }: SortIconProps) {
  if (!isActive) {
    // Ícone neutro (cinza) quando não está ativo
    return (
      <svg
        className="w-3 h-3 text-gray-600 ml-1"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M5 12l5-5 5 5H5z" />
        <path d="M5 8l5 5 5-5H5z" opacity="0.5" />
      </svg>
    );
  }

  // Seta para cima (asc) ou para baixo (desc)
  return direction === 'asc' ? (
    <svg
      className="w-3 h-3 text-cyan-400 ml-1"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M5 12l5-5 5 5H5z" />
    </svg>
  ) : (
    <svg
      className="w-3 h-3 text-cyan-400 ml-1"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M5 8l5 5 5-5H5z" />
    </svg>
  );
}

// ============================================
// COMPONENT
// ============================================

export function ClubRoster({ members, clubId }: ClubRosterProps) {
  const { t } = useTranslation();

  // Estado da aba ativa
  const [activeTab, setActiveTab] = useState<TabKey>('GERAL');

  // Estado do jogador selecionado para o modal
  const [selectedPlayer, setSelectedPlayer] = useState<MemberStats | null>(null);

  // Estado de ordenação - padrão: gols descendente
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'goals',
    direction: 'desc',
  });

  // Função para alternar a ordenação
  const handleSort = (key: SortKey) => {
    setSortConfig((current) => {
      if (current.key === key) {
        // Mesma coluna: inverte a direção
        return {
          key,
          direction: current.direction === 'desc' ? 'asc' : 'desc',
        };
      }
      // Nova coluna: define como desc (padrão para stats)
      return { key, direction: 'desc' };
    });
  };

  // Membros ordenados (memoizado para performance)
  const sortedMembers = useMemo(
    () => sortMembers(members, sortConfig),
    [members, sortConfig]
  );

  // Helper para renderizar cabeçalho clicável
  const renderSortableHeader = (
    key: SortKey,
    label: string,
    className: string = ''
  ) => {
    const isActive = sortConfig.key === key;
    return (
      <th
        onClick={() => handleSort(key)}
        className={`px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none ${className}`}
      >
        <span className="inline-flex items-center justify-center">
          {label}
          <SortIcon isActive={isActive} direction={sortConfig.direction} />
        </span>
      </th>
    );
  };

  // Renderiza colunas do cabeçalho baseado na aba ativa
  const renderTableHeaders = () => {
    const nameHeader = renderSortableHeader('name', t.roster.player, 'px-6 text-left');

    switch (activeTab) {
      case 'GERAL':
        return (
          <>
            {nameHeader}
            {renderSortableHeader('favoritePosition', t.roster.position, 'text-center')}
            {renderSortableHeader('proOverall', t.roster.overall, 'text-center')}
            {renderSortableHeader('gamesPlayed', t.roster.gamesPlayed, 'text-center')}
            {renderSortableHeader('winRate', t.roster.winRateShort, 'text-center')}
            {renderSortableHeader('ratingAve', t.roster.rating, 'text-center')}
            {renderSortableHeader('manOfTheMatch', t.roster.mom, 'text-center')}
            {renderSortableHeader('momRate', t.roster.momRate, 'text-center')}
          </>
        );
      case 'ATAQUE':
        return (
          <>
            {nameHeader}
            {renderSortableHeader('goals', t.roster.goalsShort, 'text-center')}
            {renderSortableHeader('goalsPerMatch', t.roster.goalsPerMatch, 'text-center')}
            {renderSortableHeader('shotSuccessRate', t.roster.shotSuccess, 'text-center')}
            {renderSortableHeader('assists', t.roster.assists, 'text-center')}
            {renderSortableHeader('assistsPerMatch', t.roster.assistsPerMatch, 'text-center')}
            {renderSortableHeader('goalsAssists', t.roster.contributions, 'text-center')}
            {renderSortableHeader('goalsAssistsPerMatch', t.roster.contributionsPerMatch, 'text-center')}
          </>
        );
      case 'DEFESA':
        return (
          <>
            {nameHeader}
            {renderSortableHeader('tacklesMade', t.roster.tackles, 'text-center')}
            {renderSortableHeader('tacklesPerMatch', t.roster.tacklesPerMatch, 'text-center')}
            {renderSortableHeader('tackleSuccessRate', t.roster.tackleSuccess, 'text-center')}
            {renderSortableHeader('redCards', t.roster.redCards, 'text-center')}
            {renderSortableHeader('redCardsPerMatch', t.roster.redCardsPerMatch, 'text-center')}
            {renderSortableHeader('cleanSheets', t.roster.cleanSheetsShort, 'text-center')}
            {renderSortableHeader('cleanSheetRate', t.roster.cleanSheetRate, 'text-center')}
          </>
        );
    }
  };

  // Renderiza células da linha baseado na aba ativa
  const renderTableCells = (member: MemberStats, index: number) => {
    const positionStyle = getPositionStyle(member.favoritePosition, t.positions);
    const rating = toNumber(member.ratingAve);
    const ratingColor = getRatingColor(rating);
    const games = toNumber(member.gamesPlayed);
    const goals = toNumber(member.goals);
    const assists = toNumber(member.assists);
    const mom = toNumber(member.manOfTheMatch);
    const overall = toNumber(member.proOverall);
    const tackles = toNumber(member.tacklesMade);
    const redCards = toNumber(member.redCards);
    const winRate = toNumber(member.winRate);
    const shotRate = toNumber(member.shotSuccessRate);
    const tackleRate = toNumber(member.tackleSuccessRate);
    const isGK = member.favoritePosition === 'goalkeeper';
    const cleanSheets = toNumber(isGK ? member.cleanSheetsGK : member.cleanSheetsDef);

    // Célula comum: Jogador
    const nameCell = (
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="w-6 text-center text-sm font-medium text-gray-500">
            {index + 1}
          </span>
          <NationFlag nationalityId={member.proNationality} size="sm" />
          <div>
            <p className="font-semibold text-white">
              {member.proName || member.name}
            </p>
            <p className="text-xs text-gray-500">{member.name}</p>
          </div>
        </div>
      </td>
    );

    // Célula de posição (badge)
    const positionCell = (
      <td className="px-4 py-4 text-center">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${positionStyle.bgColor} ${positionStyle.textColor}`}
        >
          {positionStyle.abbr}
        </span>
      </td>
    );

    switch (activeTab) {
      case 'GERAL':
        return (
          <>
            {nameCell}
            {positionCell}
            {/* OVR */}
            <td className="px-4 py-4 text-center">
              <span
                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-black ${overall >= 85
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : overall >= 80
                    ? 'bg-green-500/20 text-green-400'
                    : overall >= 75
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
              >
                {overall}
              </span>
            </td>
            {/* Jogos */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">{games}</span>
            </td>
            {/* % Vitórias */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">
                {games > 0 ? `${Math.round(winRate)}%` : '-'}
              </span>
            </td>
            {/* Nota Média */}
            <td className="px-4 py-4 text-center">
              <span className={`font-bold ${ratingColor}`}>
                {rating.toFixed(1)}
              </span>
            </td>
            {/* MOM */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">{mom}</span>
            </td>
            {/* % MOM */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">
                {ratePercent(mom, games)}
              </span>
            </td>
          </>
        );

      case 'ATAQUE':
        return (
          <>
            {nameCell}
            {/* Gols */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">{goals}</span>
            </td>
            {/* Gols/J */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">
                {perMatch(goals, games)}
              </span>
            </td>
            {/* % Chutes */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">
                {shotRate > 0 ? `${Math.round(shotRate)}%` : '-'}
              </span>
            </td>
            {/* Assistências */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">{assists}</span>
            </td>
            {/* Assis./J */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">
                {perMatch(assists, games)}
              </span>
            </td>
            {/* G + A */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">{goals + assists}</span>
            </td>
            {/* (G+A)/J */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">
                {perMatch(goals + assists, games)}
              </span>
            </td>
          </>
        );

      case 'DEFESA':
        return (
          <>
            {nameCell}
            {/* Desarmes */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">{tackles}</span>
            </td>
            {/* Des./J */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">
                {perMatch(tackles, games)}
              </span>
            </td>
            {/* % Desarmes */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">
                {tackleRate > 0 ? `${Math.round(tackleRate)}%` : '-'}
              </span>
            </td>
            {/* Vermelhos */}
            <td className="px-4 py-4 text-center">
              <span className={`font-medium ${redCards > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                {redCards}
              </span>
            </td>
            {/* Verm./J */}
            <td className="px-4 py-4 text-center">
              <span className={`font-medium ${redCards > 0 ? 'text-red-300' : 'text-gray-500'}`}>
                {perMatch(redCards, games)}
              </span>
            </td>
            {/* SG (Clean Sheets) */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">{cleanSheets}</span>
            </td>
            {/* % SG */}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">
                {ratePercent(cleanSheets, games)}
              </span>
            </td>
          </>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 border border-gray-700/50 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <svg
              className="w-6 h-6 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {t.roster.title}
            <span className="text-sm font-normal text-gray-400">
              ({members.length} {t.roster.players})
            </span>
          </h2>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            {/* Compare Button */}
            {clubId && members.length >= 2 && (
              <Link
                href={`/compare?clubId=${clubId}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/50 text-amber-400 text-sm font-medium hover:bg-amber-500/10 hover:border-amber-400/70 transition-all mr-2"
                title={t.roster.compare}
              >
                <span className="text-base">⚔️</span>
                <span className="hidden sm:inline">{t.roster.compare}</span>
              </Link>
            )}

            <TabButton tab="GERAL" activeTab={activeTab} onClick={setActiveTab}>
              {t.roster.filterAll}
            </TabButton>
            <TabButton tab="ATAQUE" activeTab={activeTab} onClick={setActiveTab}>
              {t.roster.filterAttack}
            </TabButton>
            <TabButton tab="DEFESA" activeTab={activeTab} onClick={setActiveTab}>
              {t.roster.filterDefense}
            </TabButton>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800/30 text-left">
              {renderTableHeaders()}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/30">
            {sortedMembers.map((member, index) => (
              <tr
                key={member.name}
                onClick={() => setSelectedPlayer(member)}
                className="hover:bg-gray-700/20 hover:bg-white/5 transition-colors cursor-pointer"
              >
                {renderTableCells(member, index)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with legend */}
      <div className="px-6 py-3 border-t border-gray-700/50 bg-gray-800/30">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="font-medium text-gray-400">{t.roster.legend}</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> {t.positions.gol}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span> {t.positions.def}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> {t.positions.mid}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400"></span> {t.positions.att}
          </span>
          <span className="ml-auto text-gray-500">
            {t.roster.legendMom} • {t.roster.legendCs} • {t.roster.legendPerMatch}
          </span>
        </div>
      </div>

      {/* Player Profile Modal */}
      <PlayerProfileModal
        isOpen={selectedPlayer !== null}
        onClose={() => setSelectedPlayer(null)}
        player={selectedPlayer}
      />
    </div>
  );
}

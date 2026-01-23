'use client';

import { useState, useMemo } from 'react';
import type { MemberStats, FavoritePosition } from '@/types/clubs-api';

// ============================================
// TYPES
// ============================================

interface ClubRosterProps {
  members: MemberStats[];
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
  | 'winRate'
  | 'goalsPerMatch'
  | 'goalsAssists'
  | 'shotSuccessRate'
  | 'passSuccessRate'
  | 'tackleSuccessRate'
  | 'cleanSheets';

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calcula valor por partida (evita divisão por zero)
 */
function perMatch(total: number | string, games: number | string): string {
  const t = typeof total === 'string' ? parseFloat(total) : total;
  const g = typeof games === 'string' ? parseInt(games, 10) : games;
  if (g === 0 || isNaN(t) || isNaN(g)) return '0.0';
  return (t / g).toFixed(1);
}

/**
 * Calcula taxa percentual (evita divisão por zero)
 */
function rate(part: number | string, total: number | string): string {
  const p = typeof part === 'string' ? parseFloat(part) : part;
  const t = typeof total === 'string' ? parseFloat(total) : total;
  if (t === 0 || isNaN(p) || isNaN(t)) return '0%';
  return `${Math.round((p / t) * 100)}%`;
}

/**
 * Retorna o ícone e cor da posição
 */
function getPositionStyle(position: FavoritePosition): {
  label: string;
  abbr: string;
  bgColor: string;
  textColor: string;
} {
  const styles: Record<FavoritePosition, { label: string; abbr: string; bgColor: string; textColor: string }> = {
    goalkeeper: {
      label: 'Goleiro',
      abbr: 'GOL',
      bgColor: 'bg-amber-500/20',
      textColor: 'text-amber-400',
    },
    defender: {
      label: 'Defensor',
      abbr: 'DEF',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400',
    },
    midfielder: {
      label: 'Meio-Campo',
      abbr: 'MEI',
      bgColor: 'bg-emerald-500/20',
      textColor: 'text-emerald-400',
    },
    forward: {
      label: 'Atacante',
      abbr: 'ATA',
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
      switch (key) {
        case 'name':
          return member.proName || member.name;
        case 'favoritePosition':
          return member.favoritePosition;
        case 'proOverall':
          return parseInt(member.proOverall, 10) || 0;
        case 'gamesPlayed':
          return parseInt(member.gamesPlayed, 10) || 0;
        case 'goals':
          return parseInt(member.goals, 10) || 0;
        case 'assists':
          return parseInt(member.assists, 10) || 0;
        case 'ratingAve':
          return parseFloat(member.ratingAve) || 0;
        case 'manOfTheMatch':
          return parseInt(member.manOfTheMatch, 10) || 0;
        case 'winRate':
          return parseFloat(member.winRate) || 0;
        case 'goalsPerMatch': {
          const goals = parseInt(member.goals, 10) || 0;
          const games = parseInt(member.gamesPlayed, 10) || 1;
          return goals / games;
        }
        case 'goalsAssists': {
          const goals = parseInt(member.goals, 10) || 0;
          const assists = parseInt(member.assists, 10) || 0;
          return goals + assists;
        }
        case 'shotSuccessRate':
          return parseFloat(member.shotSuccessRate) || 0;
        case 'passSuccessRate':
          return parseFloat(member.passSuccessRate) || 0;
        case 'tackleSuccessRate':
          return parseFloat(member.tackleSuccessRate) || 0;
        case 'cleanSheets': {
          const isGK = member.favoritePosition === 'goalkeeper';
          return parseInt(isGK ? member.cleanSheetsGK : member.cleanSheetsDef, 10) || 0;
        }
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
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${isActive
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

export function ClubRoster({ members }: ClubRosterProps) {
  // Estado da aba ativa
  const [activeTab, setActiveTab] = useState<TabKey>('GERAL');

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
    const nameHeader = renderSortableHeader('name', 'Jogador', 'px-6 text-left');
    const posHeader = renderSortableHeader('favoritePosition', 'Pos', 'text-center');

    switch (activeTab) {
      case 'GERAL':
        return (
          <>
            {nameHeader}
            {posHeader}
            {renderSortableHeader('gamesPlayed', 'Jogos', 'text-center')}
            {renderSortableHeader('winRate', 'Win %', 'text-center')}
            {renderSortableHeader('ratingAve', 'Rating', 'text-center')}
            {renderSortableHeader('manOfTheMatch', 'MoM', 'text-center')}
            {renderSortableHeader('goals', 'Gols', 'text-center')}
            {renderSortableHeader('assists', 'Assists', 'text-center')}
          </>
        );
      case 'ATAQUE':
        return (
          <>
            {nameHeader}
            {posHeader}
            {renderSortableHeader('goals', 'Gols', 'text-center')}
            {renderSortableHeader('goalsPerMatch', 'G/J', 'text-center')}
            {renderSortableHeader('goalsAssists', 'G+A', 'text-center')}
            {renderSortableHeader('assists', 'Assists', 'text-center')}
            {renderSortableHeader('shotSuccessRate', 'Chutes %', 'text-center')}
          </>
        );
      case 'DEFESA':
        return (
          <>
            {nameHeader}
            {posHeader}
            {renderSortableHeader('passSuccessRate', 'Passes %', 'text-center')}
            {renderSortableHeader('tackleSuccessRate', 'Desarmes %', 'text-center')}
            {renderSortableHeader('cleanSheets', 'Clean Sheets', 'text-center')}
            {renderSortableHeader('gamesPlayed', 'Jogos', 'text-center')}
          </>
        );
    }
  };

  // Renderiza células da linha baseado na aba ativa
  const renderTableCells = (member: MemberStats, index: number) => {
    const positionStyle = getPositionStyle(member.favoritePosition);
    const rating = parseFloat(member.ratingAve) || 0;
    const ratingColor = getRatingColor(rating);
    const games = parseInt(member.gamesPlayed, 10) || 0;
    const goals = parseInt(member.goals, 10) || 0;
    const assists = parseInt(member.assists, 10) || 0;
    const isGK = member.favoritePosition === 'goalkeeper';
    const cleanSheets = parseInt(isGK ? member.cleanSheetsGK : member.cleanSheetsDef, 10) || 0;

    // Células comuns: Jogador e Posição
    const nameCell = (
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="w-6 text-center text-sm font-medium text-gray-500">
            {index + 1}
          </span>
          <div>
            <p className="font-semibold text-white">
              {member.proName || member.name}
            </p>
            <p className="text-xs text-gray-500">{member.name}</p>
          </div>
        </div>
      </td>
    );

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
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">{games}</span>
            </td>
            <td className="px-4 py-4 text-center">
              <span className="text-emerald-400 font-medium">
                {parseFloat(member.winRate || '0').toFixed(0)}%
              </span>
            </td>
            <td className="px-4 py-4 text-center">
              <span className={`font-bold ${ratingColor}`}>
                {rating.toFixed(1)}
              </span>
            </td>
            <td className="px-4 py-4 text-center">
              <span className="text-amber-400 font-medium">
                {member.manOfTheMatch}
              </span>
            </td>
            <td className="px-4 py-4 text-center">
              <span className="text-white font-bold">{goals}</span>
            </td>
            <td className="px-4 py-4 text-center">
              <span className="text-gray-300">{assists}</span>
            </td>
          </>
        );

      case 'ATAQUE':
        return (
          <>
            {nameCell}
            {positionCell}
            <td className="px-4 py-4 text-center">
              <span className="text-white font-bold">{goals}</span>
            </td>
            <td className="px-4 py-4 text-center">
              <span className="text-cyan-400 font-medium">
                {perMatch(goals, games)}
              </span>
            </td>
            <td className="px-4 py-4 text-center">
              <span className="text-purple-400 font-bold">{goals + assists}</span>
            </td>
            <td className="px-4 py-4 text-center">
              <span className="text-gray-300">{assists}</span>
            </td>
            <td className="px-4 py-4 text-center">
              <span className="text-yellow-400 font-medium">
                {parseFloat(member.shotSuccessRate || '0').toFixed(0)}%
              </span>
            </td>
          </>
        );

      case 'DEFESA':
        return (
          <>
            {nameCell}
            {positionCell}
            <td className="px-4 py-4 text-center">
              <span className="text-blue-400 font-medium">
                {parseFloat(member.passSuccessRate || '0').toFixed(0)}%
              </span>
            </td>
            <td className="px-4 py-4 text-center">
              <span className="text-orange-400 font-medium">
                {parseFloat(member.tackleSuccessRate || '0').toFixed(0)}%
              </span>
            </td>
            <td className="px-4 py-4 text-center">
              <span className="text-emerald-400 font-bold">{cleanSheets}</span>
            </td>
            <td className="px-4 py-4 text-center">
              <span className="text-white font-medium">{games}</span>
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
            Elenco
            <span className="text-sm font-normal text-gray-400">
              ({members.length} jogadores)
            </span>
          </h2>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            <TabButton tab="GERAL" activeTab={activeTab} onClick={setActiveTab}>
              Geral
            </TabButton>
            <TabButton tab="ATAQUE" activeTab={activeTab} onClick={setActiveTab}>
              Ataque
            </TabButton>
            <TabButton tab="DEFESA" activeTab={activeTab} onClick={setActiveTab}>
              Defesa
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
                className="hover:bg-gray-700/20 transition-colors"
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
          <span className="font-medium text-gray-400">Posições:</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> GOL
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span> DEF
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> MEI
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400"></span> ATA
          </span>
          <span className="ml-auto text-gray-500">
            MoM = Man of the Match
          </span>
        </div>
      </div>
    </div>
  );
}

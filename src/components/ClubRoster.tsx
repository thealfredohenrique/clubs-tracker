'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Users, GitCompare, ChevronUp, ChevronDown } from 'lucide-react';
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
  borderColor: string;
} {
  const styles: Record<FavoritePosition, { label: string; abbr: string; bgColor: string; textColor: string; borderColor: string }> = {
    goalkeeper: {
      label: positionLabels.goalkeeper,
      abbr: positionLabels.gol,
      bgColor: 'bg-orange-500/20',
      textColor: 'text-orange-400',
      borderColor: 'border-orange-500/30',
    },
    defender: {
      label: positionLabels.defender,
      abbr: positionLabels.def,
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
    },
    midfielder: {
      label: positionLabels.midfielder,
      abbr: positionLabels.mid,
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/30',
    },
    forward: {
      label: positionLabels.forward,
      abbr: positionLabels.att,
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-400',
      borderColor: 'border-red-500/30',
    },
  };

  return styles[position];
}

/**
 * Retorna a cor do rating baseado no valor
 */
function getRatingColor(rating: number): string {
  if (rating >= 8.0) return 'text-emerald-400';
  if (rating >= 7.5) return 'text-green-400';
  if (rating >= 7.0) return 'text-yellow-400';
  if (rating >= 6.5) return 'text-orange-400';
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
      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap ${isActive
        ? 'bg-emerald-500/20 text-emerald-400'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
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
    // Ícone neutro (cinza) quando não está ativo - hidden by default, shown on hover
    return (
      <ChevronUp className="w-3 h-3 text-slate-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
    );
  }

  // Seta para cima (asc) ou para baixo (desc)
  return direction === 'asc' ? (
    <ChevronUp className="w-3 h-3 text-emerald-400 ml-1" />
  ) : (
    <ChevronDown className="w-3 h-3 text-emerald-400 ml-1" />
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
        className={`group px-4 py-3 text-[10px] uppercase tracking-widest font-semibold cursor-pointer select-none whitespace-nowrap transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'} ${className}`}
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
    // Ranking column header
    const rankHeader = (
      <th className="w-12 px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-slate-500 text-center">
        #
      </th>
    );
    const nameHeader = renderSortableHeader('name', t.roster.player, 'text-left min-w-[120px] sm:min-w-[180px]');

    switch (activeTab) {
      case 'GERAL':
        return (
          <>
            {rankHeader}
            {nameHeader}
            {renderSortableHeader('favoritePosition', t.roster.position, 'text-center')}
            {renderSortableHeader('proOverall', t.roster.overall, 'text-center hidden sm:table-cell')}
            {renderSortableHeader('gamesPlayed', t.roster.gamesPlayed, 'text-center hidden sm:table-cell')}
            {renderSortableHeader('winRate', t.roster.winRateShort, 'text-center hidden sm:table-cell')}
            {renderSortableHeader('ratingAve', t.roster.rating, 'text-center')}
            {renderSortableHeader('manOfTheMatch', t.roster.mom, 'text-center hidden lg:table-cell')}
            {renderSortableHeader('momRate', t.roster.momRate, 'text-center hidden lg:table-cell')}
          </>
        );
      case 'ATAQUE':
        return (
          <>
            {rankHeader}
            {nameHeader}
            {renderSortableHeader('goals', t.roster.goalsShort, 'text-center')}
            {renderSortableHeader('goalsPerMatch', t.roster.goalsPerMatch, 'text-center hidden sm:table-cell')}
            {renderSortableHeader('shotSuccessRate', t.roster.shotSuccess, 'text-center hidden sm:table-cell')}
            {renderSortableHeader('assists', t.roster.assists, 'text-center')}
            {renderSortableHeader('assistsPerMatch', t.roster.assistsPerMatch, 'text-center hidden sm:table-cell')}
            {renderSortableHeader('goalsAssists', t.roster.contributions, 'text-center hidden lg:table-cell')}
            {renderSortableHeader('goalsAssistsPerMatch', t.roster.contributionsPerMatch, 'text-center hidden lg:table-cell')}
          </>
        );
      case 'DEFESA':
        return (
          <>
            {rankHeader}
            {nameHeader}
            {renderSortableHeader('tacklesMade', t.roster.tackles, 'text-center')}
            {renderSortableHeader('tacklesPerMatch', t.roster.tacklesPerMatch, 'text-center hidden sm:table-cell')}
            {renderSortableHeader('tackleSuccessRate', t.roster.tackleSuccess, 'text-center hidden sm:table-cell')}
            {renderSortableHeader('redCards', t.roster.redCards, 'text-center')}
            {renderSortableHeader('redCardsPerMatch', t.roster.redCardsPerMatch, 'text-center hidden lg:table-cell')}
            {renderSortableHeader('cleanSheets', t.roster.cleanSheetsShort, 'text-center hidden lg:table-cell')}
            {renderSortableHeader('cleanSheetRate', t.roster.cleanSheetRate, 'text-center hidden lg:table-cell')}
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

    // Célula de ranking
    const rankCell = (
      <td className="w-12 px-4 py-3 text-center">
        <span className={`text-sm font-medium ${index === 0 ? 'text-amber-400' :
            index === 1 ? 'text-slate-300' :
              index === 2 ? 'text-amber-600' :
                'text-slate-600'
          }`}>
          {index + 1}
        </span>
      </td>
    );

    // Célula comum: Jogador
    const nameCell = (
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <NationFlag nationalityId={member.proNationality} size="sm" className="hidden sm:block w-5 h-4 rounded-sm object-cover shadow-sm" />
          <div className="min-w-0">
            <p className="font-medium text-white text-sm group-hover:text-emerald-400 transition-colors truncate max-w-[100px] sm:max-w-none">
              {member.proName || member.name}
            </p>
            <p className="text-xs text-slate-500 truncate max-w-[100px] sm:max-w-none mt-0.5">{member.name}</p>
          </div>
        </div>
      </td>
    );

    // Célula de posição (badge)
    const positionCell = (
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-flex items-center justify-center w-10 h-6 rounded-md text-[10px] font-bold uppercase tracking-wide border ${positionStyle.bgColor} ${positionStyle.textColor} ${positionStyle.borderColor}`}
        >
          {positionStyle.abbr}
        </span>
      </td>
    );

    switch (activeTab) {
      case 'GERAL':
        return (
          <>
            {rankCell}
            {nameCell}
            {positionCell}
            {/* OVR */}
            <td className="px-4 py-3 text-center hidden sm:table-cell">
              <span
                className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ring-1 ${overall >= 85
                  ? 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30'
                  : overall >= 80
                    ? 'bg-green-500/20 text-green-400 ring-green-500/30'
                    : overall >= 75
                      ? 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30'
                      : overall >= 70
                        ? 'bg-orange-500/20 text-orange-400 ring-orange-500/30'
                        : 'bg-slate-500/20 text-slate-400 ring-slate-500/30'
                  }`}
              >
                {overall}
              </span>
            </td>
            {/* Jogos */}
            <td className="px-4 py-3 text-center hidden sm:table-cell">
              <span className="text-sm text-slate-300 tabular-nums">{games}</span>
            </td>
            {/* % Vitórias */}
            <td className="px-4 py-3 text-center hidden sm:table-cell">
              <span className="text-sm text-slate-300 tabular-nums">
                {games > 0 ? `${Math.round(winRate)}%` : '-'}
              </span>
            </td>
            {/* Nota Média */}
            <td className="px-4 py-3 text-center">
              <span className={`text-sm font-semibold ${ratingColor}`}>
                {rating.toFixed(1)}
              </span>
            </td>
            {/* MOM */}
            <td className="px-4 py-3 text-center hidden lg:table-cell">
              <span className="text-sm text-slate-300 tabular-nums">{mom}</span>
            </td>
            {/* % MOM */}
            <td className="px-4 py-3 text-center hidden lg:table-cell">
              <span className="text-sm text-slate-300 tabular-nums">
                {ratePercent(mom, games)}
              </span>
            </td>
          </>
        );

      case 'ATAQUE':
        return (
          <>
            {rankCell}
            {nameCell}
            {/* Gols */}
            <td className="px-4 py-3 text-center">
              <span className="text-sm text-slate-300 tabular-nums">{goals}</span>
            </td>
            {/* Gols/J */}
            <td className="px-4 py-3 text-center hidden sm:table-cell">
              <span className="text-sm text-slate-300 tabular-nums">
                {perMatch(goals, games)}
              </span>
            </td>
            {/* % Chutes */}
            <td className="px-4 py-3 text-center hidden sm:table-cell">
              <span className="text-sm text-slate-300 tabular-nums">
                {shotRate > 0 ? `${Math.round(shotRate)}%` : '-'}
              </span>
            </td>
            {/* Assistências */}
            <td className="px-4 py-3 text-center">
              <span className="text-sm text-slate-300 tabular-nums">{assists}</span>
            </td>
            {/* Assis./J */}
            <td className="px-4 py-3 text-center hidden sm:table-cell">
              <span className="text-sm text-slate-300 tabular-nums">
                {perMatch(assists, games)}
              </span>
            </td>
            {/* G + A */}
            <td className="px-4 py-3 text-center hidden lg:table-cell">
              <span className="text-sm text-slate-300 tabular-nums">{goals + assists}</span>
            </td>
            {/* (G+A)/J */}
            <td className="px-4 py-3 text-center hidden lg:table-cell">
              <span className="text-sm text-slate-300 tabular-nums">
                {perMatch(goals + assists, games)}
              </span>
            </td>
          </>
        );

      case 'DEFESA':
        return (
          <>
            {rankCell}
            {nameCell}
            {/* Desarmes */}
            <td className="px-4 py-3 text-center">
              <span className="text-sm text-slate-300 tabular-nums">{tackles}</span>
            </td>
            {/* Des./J */}
            <td className="px-4 py-3 text-center hidden sm:table-cell">
              <span className="text-sm text-slate-300 tabular-nums">
                {perMatch(tackles, games)}
              </span>
            </td>
            {/* % Desarmes */}
            <td className="px-4 py-3 text-center hidden sm:table-cell">
              <span className="text-sm text-slate-300 tabular-nums">
                {tackleRate > 0 ? `${Math.round(tackleRate)}%` : '-'}
              </span>
            </td>
            {/* Vermelhos */}
            <td className="px-4 py-3 text-center">
              <span className={`text-sm tabular-nums ${redCards > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                {redCards}
              </span>
            </td>
            {/* Verm./J */}
            <td className="px-4 py-3 text-center hidden lg:table-cell">
              <span className={`text-sm tabular-nums ${redCards > 0 ? 'text-red-300' : 'text-slate-500'}`}>
                {perMatch(redCards, games)}
              </span>
            </td>
            {/* SG (Clean Sheets) */}
            <td className="px-4 py-3 text-center hidden lg:table-cell">
              <span className="text-sm text-slate-300 tabular-nums">{cleanSheets}</span>
            </td>
            {/* % SG */}
            <td className="px-4 py-3 text-center hidden lg:table-cell">
              <span className="text-sm text-slate-300 tabular-nums">
                {ratePercent(cleanSheets, games)}
              </span>
            </td>
          </>
        );
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5">
      {/* Header - Line 1: Title */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">{t.roster.title}</h2>
          <span className="text-xs text-slate-500 font-normal">
            {members.length} {t.roster.players}
          </span>
        </div>
      </div>

      {/* Header - Line 2: Actions */}
      <div className="flex items-center justify-between px-5 pb-4 border-b border-white/5">
        {/* Tabs */}
        <div className="inline-flex bg-slate-800/50 rounded-lg p-1">
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

        {/* Compare Button */}
        {clubId && members.length >= 2 && (
          <Link
            href={`/compare?clubId=${clubId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 text-sm font-medium transition-all duration-200"
            title={t.roster.compare}
          >
            <GitCompare className="w-4 h-4" />
            <span className="hidden sm:inline">{t.roster.compare}</span>
          </Link>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900/80 border-b border-white/5 text-left">
              {renderTableHeaders()}
            </tr>
          </thead>
          <tbody>
            {sortedMembers.map((member, index) => (
              <tr
                key={member.name}
                onClick={() => setSelectedPlayer(member)}
                className="group border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] cursor-pointer transition-colors duration-150"
              >
                {renderTableCells(member, index)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with legend */}
      <div className="flex items-center justify-center gap-6 px-5 py-4 border-t border-white/5 bg-slate-900/30">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <span className="text-[10px] uppercase tracking-wide text-slate-500">{t.positions.gol}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="text-[10px] uppercase tracking-wide text-slate-500">{t.positions.def}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span className="text-[10px] uppercase tracking-wide text-slate-500">{t.positions.mid}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span className="text-[10px] uppercase tracking-wide text-slate-500">{t.positions.att}</span>
          </span>
        </div>
        <span className="hidden sm:inline text-[10px] text-slate-600 italic">
          {t.roster.legendMom} • {t.roster.legendCs}
        </span>
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

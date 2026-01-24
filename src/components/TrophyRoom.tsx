'use client';

import { useState } from 'react';
import type { PlayoffAchievement } from '@/types/clubs-api';

// ============================================
// TYPES
// ============================================

interface TrophyRoomProps {
  achievements: PlayoffAchievement[];
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Mapeamento dos nomes das temporadas da API para nomes amigáveis
 */
const SEASON_NAMES: Record<string, string> = {
  CLUBS_LEAGUE_SEASON_01: 'Temporada 1',
  CLUBS_LEAGUE_SEASON_02: 'Temporada 2',
  CLUBS_LEAGUE_SEASON_03: 'Temporada 3',
  CLUBS_LEAGUE_SEASON_04: 'Temporada 4',
  CLUBS_LEAGUE_SEASON_05: 'Temporada 5',
  CLUBS_LEAGUE_SEASON_06: 'Temporada 6',
  CLUBS_LEAGUE_SEASON_07: 'Temporada 7',
  CLUBS_LEAGUE_SEASON_08: 'Temporada 8',
};

/**
 * Nomes das divisões
 */
const DIVISION_NAMES: Record<string, string> = {
  '1': 'Divisão 1',
  '2': 'Divisão 2',
  '3': 'Divisão 3',
  '4': 'Divisão 4',
  '5': 'Divisão 5',
  '6': 'Divisão 6',
  '7': 'Divisão 7',
  '8': 'Divisão 8',
  '9': 'Divisão 9',
  '10': 'Divisão 10',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Retorna o nome amigável da temporada
 */
function getSeasonDisplayName(seasonName: string): string {
  return SEASON_NAMES[seasonName] || seasonName.replace('CLUBS_LEAGUE_SEASON_', 'Temporada ');
}

/**
 * Retorna o nome da divisão
 */
function getDivisionName(division: string): string {
  return DIVISION_NAMES[division] || `Divisão ${division}`;
}

/**
 * Retorna o emoji e estilo baseado na posição final
 */
function getTrophyInfo(group: string): {
  emoji: string;
  label: string;
  isChampion: boolean;
  bgClass: string;
  borderClass: string;
  textClass: string;
} {
  const groupNum = parseInt(group, 10);

  if (groupNum === 1) {
    return {
      emoji: '🏆',
      label: 'Campeão',
      isChampion: true,
      bgClass: 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20',
      borderClass: 'border-yellow-500/50',
      textClass: 'text-yellow-300',
    };
  }

  if (groupNum === 2) {
    return {
      emoji: '🥈',
      label: 'Vice-Campeão',
      isChampion: false,
      bgClass: 'bg-gradient-to-br from-gray-400/20 to-gray-500/20',
      borderClass: 'border-gray-400/50',
      textClass: 'text-gray-300',
    };
  }

  if (groupNum === 3) {
    return {
      emoji: '🥉',
      label: '3º Lugar',
      isChampion: false,
      bgClass: 'bg-gradient-to-br from-amber-700/20 to-orange-800/20',
      borderClass: 'border-amber-700/50',
      textClass: 'text-amber-400',
    };
  }

  // Grupos 4-6 (participação nos playoffs)
  return {
    emoji: '🎯',
    label: `${groupNum}º Lugar`,
    isChampion: false,
    bgClass: 'bg-gray-800/50',
    borderClass: 'border-gray-700/50',
    textClass: 'text-gray-400',
  };
}

// ============================================
// COMPONENT
// ============================================

export function TrophyRoom({ achievements }: TrophyRoomProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Se não houver conquistas, não renderiza nada
  if (!achievements || achievements.length === 0) {
    return null;
  }

  // Ordenar por seasonId decrescente (mais recente primeiro)
  const sortedAchievements = [...achievements].sort(
    (a, b) => parseInt(b.seasonId, 10) - parseInt(a.seasonId, 10)
  );

  // Contar troféus (grupo 1, 2 ou 3)
  const trophyCount = achievements.filter(
    (a) => parseInt(a.bestFinishGroup, 10) <= 3
  ).length;

  const championCount = achievements.filter(
    (a) => parseInt(a.bestFinishGroup, 10) === 1
  ).length;

  return (
    <div className="mt-6">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-2xl hover:bg-gray-800/70 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div className="text-left">
              <h3 className="text-white font-semibold">Mural de Conquistas</h3>
              <p className="text-gray-400 text-sm">
                {championCount > 0 && (
                  <span className="text-yellow-400">{championCount} título{championCount > 1 ? 's' : ''}</span>
                )}
                {championCount > 0 && trophyCount > championCount && ' • '}
                {trophyCount > championCount && (
                  <span>{trophyCount - championCount} medalha{trophyCount - championCount > 1 ? 's' : ''}</span>
                )}
                {trophyCount === 0 && (
                  <span>{achievements.length} participaç{achievements.length > 1 ? 'ões' : 'ão'} em playoffs</span>
                )}
              </p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedAchievements.map((achievement) => {
            const trophy = getTrophyInfo(achievement.bestFinishGroup);

            return (
              <div
                key={achievement.seasonId}
                className={`
                  relative p-4 rounded-xl border transition-all
                  ${trophy.bgClass} ${trophy.borderClass}
                  ${trophy.isChampion ? 'shadow-lg shadow-yellow-500/20' : ''}
                `}
              >
                {/* Glow effect for champions */}
                {trophy.isChampion && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400/10 to-transparent pointer-events-none" />
                )}

                <div className="relative flex items-start gap-3">
                  <span className="text-3xl">{trophy.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold ${trophy.textClass}`}>
                      {trophy.label}
                    </p>
                    <p className="text-white text-sm font-medium truncate">
                      {getDivisionName(achievement.bestDivision)}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {getSeasonDisplayName(achievement.seasonName)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

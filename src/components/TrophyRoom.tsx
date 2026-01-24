'use client';

import { useState, useEffect } from 'react';
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
// TROPHY CARD COMPONENT
// ============================================

function TrophyCard({ achievement }: { achievement: PlayoffAchievement }) {
  const trophy = getTrophyInfo(achievement.bestFinishGroup);

  return (
    <div
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
}

// ============================================
// MODAL COMPONENT
// ============================================

function TrophyRoomModal({
  isOpen,
  onClose,
  achievements,
}: {
  isOpen: boolean;
  onClose: () => void;
  achievements: PlayoffAchievement[];
}) {
  // Bloquear scroll do body quando modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Ordenar por seasonId decrescente (mais recente primeiro)
  const sortedAchievements = [...achievements].sort(
    (a, b) => parseInt(b.seasonId, 10) - parseInt(a.seasonId, 10)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Title */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="text-xl font-bold text-white">Sala de Troféus</h2>
              <p className="text-gray-400 text-sm">Histórico de conquistas em playoffs</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {sortedAchievements.map((achievement) => (
              <TrophyCard key={achievement.seasonId} achievement={achievement} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TrophyRoom({ achievements }: TrophyRoomProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Se não houver conquistas, não renderiza nada
  if (!achievements || achievements.length === 0) {
    return null;
  }

  // Contar troféus (grupo 1, 2 ou 3)
  const trophyCount = achievements.filter(
    (a) => parseInt(a.bestFinishGroup, 10) <= 3
  ).length;

  const championCount = achievements.filter(
    (a) => parseInt(a.bestFinishGroup, 10) === 1
  ).length;

  // Gerar texto do botão
  const getButtonText = () => {
    if (championCount > 0 && trophyCount > championCount) {
      return `${championCount} título${championCount > 1 ? 's' : ''} • ${trophyCount - championCount} medalha${trophyCount - championCount > 1 ? 's' : ''}`;
    }
    if (championCount > 0) {
      return `${championCount} título${championCount > 1 ? 's' : ''}`;
    }
    if (trophyCount > 0) {
      return `${trophyCount} medalha${trophyCount > 1 ? 's' : ''}`;
    }
    return `${achievements.length} participaç${achievements.length > 1 ? 'ões' : 'ão'}`;
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50 text-gray-300 hover:text-white transition-all text-sm"
      >
        <span className="text-lg">🏆</span>
        <span className="font-medium">Sala de Troféus</span>
        <span className="text-xs text-gray-500">({getButtonText()})</span>
      </button>

      {/* Modal */}
      <TrophyRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        achievements={achievements}
      />
    </>
  );
}

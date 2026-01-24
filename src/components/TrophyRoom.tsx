'use client';

import { useState, useEffect } from 'react';
import type { PlayoffAchievement } from '@/types/clubs-api';
import { useTranslation, pluralize, type Translations } from '@/lib/i18n';

// ============================================
// TYPES
// ============================================

interface TrophyRoomProps {
  achievements: PlayoffAchievement[];
}

interface TrophyBadgeProps {
  achievements: PlayoffAchievement[];
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Base URL para os brasões oficiais das divisões
 */
const DIVISION_CREST_BASE_URL =
  'https://media.contentapi.ea.com/content/dam/eacom/fc/pro-clubs/divisioncrest';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Retorna o nome amigável da temporada
 */
function getSeasonDisplayName(seasonName: string, seasonLabel: string): string {
  const match = seasonName.match(/CLUBS_LEAGUE_SEASON_(\d+)/);
  if (match) {
    return `${seasonLabel} ${parseInt(match[1], 10)}`;
  }
  return seasonName;
}

/**
 * Retorna o nome da divisão
 */
function getDivisionName(division: string, divisionLabel: string): string {
  return `${divisionLabel} ${division}`;
}

/**
 * Gera a URL do brasão oficial da divisão
 * Retorna null se a divisão for inválida
 */
function getDivisionCrestUrl(division: string): string | null {
  const divNum = parseInt(division, 10);
  if (isNaN(divNum) || divNum <= 0) return null;
  return `${DIVISION_CREST_BASE_URL}${divNum}.png`;
}

/**
 * Retorna o emoji e estilo baseado na posição final
 */
function getTrophyInfo(
  group: string,
  labels: { champion: string; runnerUp: string; thirdPlace: string; place: string }
): {
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
      label: labels.champion,
      isChampion: true,
      bgClass: 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20',
      borderClass: 'border-yellow-500/50',
      textClass: 'text-yellow-300',
    };
  }

  if (groupNum === 2) {
    return {
      emoji: '🥈',
      label: labels.runnerUp,
      isChampion: false,
      bgClass: 'bg-gradient-to-br from-gray-400/20 to-gray-500/20',
      borderClass: 'border-gray-400/50',
      textClass: 'text-gray-300',
    };
  }

  if (groupNum === 3) {
    return {
      emoji: '🥉',
      label: labels.thirdPlace,
      isChampion: false,
      bgClass: 'bg-gradient-to-br from-amber-700/20 to-orange-800/20',
      borderClass: 'border-amber-700/50',
      textClass: 'text-amber-400',
    };
  }

  // Grupos 4-6 (participação nos playoffs)
  return {
    emoji: '🎯',
    label: `${groupNum}º ${labels.place}`,
    isChampion: false,
    bgClass: 'bg-gray-800/50',
    borderClass: 'border-gray-700/50',
    textClass: 'text-gray-400',
  };
}

// ============================================
// TROPHY CARD COMPONENT
// ============================================

function TrophyCard({ achievement, t }: { achievement: PlayoffAchievement; t: Translations }) {
  const trophy = getTrophyInfo(achievement.bestFinishGroup, t.trophies);
  const divisionCrestUrl = getDivisionCrestUrl(achievement.bestDivision);

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

      <div className="relative flex items-center gap-3">
        {/* Division Crest (Left - Avatar) */}
        {divisionCrestUrl ? (
          <img
            src={divisionCrestUrl}
            alt={getDivisionName(achievement.bestDivision, t.trophies.division)}
            className="w-12 h-12 object-contain drop-shadow-lg flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">{trophy.emoji}</span>
          </div>
        )}

        {/* Text Info (Center) */}
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm leading-tight ${trophy.textClass}`}>
            {trophy.label}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            {getSeasonDisplayName(achievement.seasonName, t.trophies.season)}
          </p>
        </div>

        {/* Medal Emoji (Right - Emphasis) */}
        <span className="text-2xl flex-shrink-0">{trophy.emoji}</span>
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
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  achievements: PlayoffAchievement[];
  t: Translations;
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
            aria-label={t.trophies.close}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Title */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="text-xl font-bold text-white">{t.trophies.title}</h2>
              <p className="text-gray-400 text-sm">{t.trophies.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {sortedAchievements.map((achievement) => (
              <TrophyCard key={achievement.seasonId} achievement={achievement} t={t} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT (Standalone button + modal)
// ============================================

export function TrophyRoom({ achievements }: TrophyRoomProps) {
  const { t } = useTranslation();
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
    const medalCount = trophyCount - championCount;
    if (championCount > 0 && medalCount > 0) {
      return `${championCount} ${pluralize(championCount, t.trophies.titles, t.trophies.titles + 's')} • ${medalCount} ${pluralize(medalCount, t.trophies.medals, t.trophies.medals + 's')}`;
    }
    if (championCount > 0) {
      return `${championCount} ${pluralize(championCount, t.trophies.titles, t.trophies.titles + 's')}`;
    }
    if (trophyCount > 0) {
      return `${trophyCount} ${pluralize(trophyCount, t.trophies.medals, t.trophies.medals + 's')}`;
    }
    return `${achievements.length} ${pluralize(achievements.length, t.trophies.participations, t.trophies.participations + 's')}`;
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50 text-gray-300 hover:text-white transition-all text-sm"
      >
        <span className="text-lg">🏆</span>
        <span className="font-medium">{t.trophies.title}</span>
        <span className="text-xs text-gray-500">({getButtonText()})</span>
      </button>

      {/* Modal */}
      <TrophyRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        achievements={achievements}
        t={t}
      />
    </>
  );
}

// ============================================
// TROPHY BADGE COMPONENT (Compact badge for header)
// ============================================

export function TrophyBadge({ achievements }: TrophyBadgeProps) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Se não houver conquistas, não renderiza nada
  if (!achievements || achievements.length === 0) {
    return null;
  }

  // Contar troféus (grupo 1, 2 ou 3)
  const trophyCount = achievements.filter(
    (a) => parseInt(a.bestFinishGroup, 10) <= 3
  ).length;

  // Determinar a cor baseada nas conquistas
  const hasChampion = achievements.some((a) => parseInt(a.bestFinishGroup, 10) === 1);
  const hasMedal = trophyCount > 0;

  return (
    <>
      {/* Badge Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        title={t.trophies.viewTrophies}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
          transition-all cursor-pointer
          ${hasChampion
            ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/40 hover:border-yellow-400/60 hover:from-yellow-500/30 hover:to-amber-500/30'
            : hasMedal
              ? 'bg-gradient-to-r from-gray-500/20 to-gray-400/20 border border-gray-500/40 hover:border-gray-400/60 hover:from-gray-500/30 hover:to-gray-400/30'
              : 'bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 hover:bg-gray-700/70'
          }
        `}
      >
        <span className="text-base">🏆</span>
        <span className={`text-sm font-bold ${hasChampion ? 'text-yellow-300' : hasMedal ? 'text-gray-300' : 'text-gray-400'}`}>
          {trophyCount > 0 ? trophyCount : achievements.length}
        </span>
      </button>

      {/* Modal */}
      <TrophyRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        achievements={achievements}
        t={t}
      />
    </>
  );
}

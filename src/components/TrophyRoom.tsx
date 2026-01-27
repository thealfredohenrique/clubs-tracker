'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, X, XCircle } from 'lucide-react';

import type { PlayoffAchievement } from '@/types/clubs-api';
import { useTranslation, pluralize, type Translations } from '@/lib/i18n';
import { getDivisionCrestUrl } from '@/lib/ea-assets';

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
 * Retorna o emoji e estilo baseado na posição final
 */
function getTrophyInfo(
  group: string,
  labels: { champion: string; runnerUp: string; thirdPlace: string; place: string }
): {
  position: number;
  label: string;
  isChampion: boolean;
  cardClass: string;
  medalClass: string;
  medalTextClass: string;
  labelClass: string;
  isEliminated: boolean;
} {
  const groupNum = parseInt(group, 10);

  // 1º Lugar - Campeão
  if (groupNum === 1) {
    return {
      position: 1,
      label: labels.champion,
      isChampion: true,
      cardClass: 'bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-500/5 border border-amber-400/40 shadow-lg shadow-amber-500/20',
      medalClass: 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-400/50 ring-2 ring-amber-300/50',
      medalTextClass: 'text-amber-900',
      labelClass: 'text-amber-400 font-bold',
      isEliminated: false,
    };
  }

  // 2º Lugar
  if (groupNum === 2) {
    return {
      position: 2,
      label: labels.runnerUp,
      isChampion: false,
      cardClass: 'bg-gradient-to-br from-slate-400/15 via-slate-300/5 to-slate-400/5 border border-slate-400/30 shadow-lg shadow-slate-400/10',
      medalClass: 'bg-gradient-to-br from-slate-300 to-slate-400 shadow-md shadow-slate-400/30',
      medalTextClass: 'text-slate-700',
      labelClass: 'text-slate-300 font-semibold',
      isEliminated: false,
    };
  }

  // 3º Lugar
  if (groupNum === 3) {
    return {
      position: 3,
      label: labels.thirdPlace,
      isChampion: false,
      cardClass: 'bg-gradient-to-br from-orange-500/15 via-amber-600/5 to-orange-500/5 border border-orange-500/30 shadow-lg shadow-orange-500/10',
      medalClass: 'bg-gradient-to-br from-orange-400 to-amber-600 shadow-md shadow-orange-500/30',
      medalTextClass: 'text-orange-900',
      labelClass: 'text-orange-400 font-semibold',
      isEliminated: false,
    };
  }

  // 4º-8º Lugar (Participação)
  if (groupNum >= 4 && groupNum <= 8) {
    return {
      position: groupNum,
      label: `${groupNum}${labels.place}`,
      isChampion: false,
      cardClass: 'bg-slate-800/30 border border-white/5',
      medalClass: 'bg-slate-700 ring-1 ring-white/10',
      medalTextClass: 'text-slate-400',
      labelClass: 'text-slate-400 font-medium',
      isEliminated: false,
    };
  }

  // Eliminado (sem colocação definida)
  return {
    position: groupNum,
    label: `${groupNum}${labels.place}`,
    isChampion: false,
    cardClass: 'bg-red-500/5 border border-red-500/10',
    medalClass: 'bg-red-500/10',
    medalTextClass: 'text-red-400',
    labelClass: 'text-red-400/70',
    isEliminated: groupNum > 8,
  };
}

// ============================================
// TROPHY CARD COMPONENT
// ============================================

interface TrophyCardProps {
  achievement: PlayoffAchievement;
  t: Translations;
  index: number;
}

function TrophyCard({ achievement, t, index }: TrophyCardProps) {
  const trophy = getTrophyInfo(achievement.bestFinishGroup, t.trophies);
  const divisionCrestUrl = getDivisionCrestUrl(achievement.bestDivision);

  // Delay escalonado para animação
  const animationDelay = `${index * 75}ms`;

  return (
    <div
      className={`
        relative p-4 rounded-xl flex flex-col items-center text-center
        transition-all duration-300 hover:scale-[1.02]
        ${trophy.cardClass}
        animate-in fade-in slide-in-from-bottom-2 duration-300
      `}
      style={{ animationDelay }}
    >
      {/* Crest da Divisão */}
      <div className="relative w-16 h-16 mb-3 flex items-center justify-center">
        {divisionCrestUrl ? (
          <img
            src={divisionCrestUrl}
            alt={`Division ${achievement.bestDivision} crest`}
            className="w-full h-full object-contain drop-shadow-lg"
          />
        ) : (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${trophy.medalClass}`}>
            {trophy.isEliminated ? (
              <XCircle className="w-5 h-5 text-red-400" />
            ) : (
              <span className={`font-black text-lg ${trophy.medalTextClass}`}>
                {trophy.position}
              </span>
            )}
          </div>
        )}

        {/* Efeito shimmer para campeões */}
        {trophy.isChampion && (
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        )}
      </div>

      {/* Texto da colocação */}
      <p className={`text-sm ${trophy.labelClass}`}>
        {trophy.label}
      </p>

      {/* Informações da temporada */}
      <span className="text-xs text-slate-500 mt-1">
        {getSeasonDisplayName(achievement.seasonName, t.trophies.season)}
      </span>
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

  // Only render portal on client side
  if (!isOpen || typeof window === 'undefined') return null;

  // Ordenar por seasonId decrescente (mais recente primeiro)
  const sortedAchievements = [...achievements].sort(
    (a, b) => parseInt(b.seasonId, 10) - parseInt(a.seasonId, 10)
  );

  // Calcular estatísticas
  const totalPlayoffs = achievements.length;
  const titles = achievements.filter((a) => parseInt(a.bestFinishGroup, 10) === 1).length;
  const bestPosition = achievements.reduce((best, a) => {
    const pos = parseInt(a.bestFinishGroup, 10);
    return pos < best ? pos : best;
  }, 999);

  const getBestPositionLabel = () => {
    if (bestPosition === 1) return '🥇 1º';
    if (bestPosition === 2) return '🥈 2º';
    if (bestPosition === 3) return '🥉 3º';
    return `${bestPosition}º`;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-4 max-h-[85vh] overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-amber-500/20 shadow-2xl shadow-amber-500/10 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/50 before:to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
          aria-label={t.trophies.close}
        >
          <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          {/* Trophy Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/20">
            <Trophy className="w-7 h-7 text-amber-400" />
          </div>

          <h2 className="text-xl font-bold text-white">{t.trophies.title}</h2>
          <p className="text-sm text-slate-400 mt-1">{t.trophies.subtitle}</p>
        </div>

        {/* Content - Scrollable */}
        <div className="px-6 pb-6 max-h-[50vh] overflow-y-auto">
          {sortedAchievements.length === 0 ? (
            /* Estado Vazio */
            <div className="py-12 text-center">
              <Trophy className="w-16 h-16 text-slate-800 mx-auto" />
              <p className="text-sm text-slate-500 mt-4 font-medium">
                {t.trophies.noTrophies || 'Nenhum troféu ainda'}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {t.trophies.noTrophiesHint || 'Participe de playoffs para conquistar troféus'}
              </p>
            </div>
          ) : (
            /* Grid de Troféus */
            <div className="grid grid-cols-2 gap-3">
              {sortedAchievements.map((achievement, index) => (
                <TrophyCard
                  key={achievement.seasonId}
                  achievement={achievement}
                  t={t}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer - Stats */}
        {sortedAchievements.length > 0 && (
          <div className="px-6 py-4 border-t border-white/5 bg-slate-900/50 flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{totalPlayoffs}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{t.trophies.playoffs || 'Playoffs'}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{getBestPositionLabel()}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{t.trophies.best || 'Melhor'}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-400">{titles}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{t.trophies.titles || 'Títulos'}</p>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
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
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20 hover:border-amber-400/40 hover:from-amber-500/20 hover:to-yellow-500/10 text-amber-300 hover:text-amber-200 transition-all text-sm shadow-lg shadow-amber-500/5 hover:shadow-amber-500/10"
      >
        <Trophy className="w-5 h-5" />
        <span className="font-semibold">{t.trophies.title}</span>
        <span className="text-xs text-amber-400/60">({getButtonText()})</span>
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
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
          transition-all cursor-pointer
          ${hasChampion
            ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/40 hover:border-amber-300/60 hover:from-amber-500/30 hover:to-yellow-500/20 shadow-lg shadow-amber-500/10'
            : hasMedal
              ? 'bg-gradient-to-r from-slate-500/20 to-slate-400/10 border border-slate-400/30 hover:border-slate-300/50 hover:from-slate-500/30 hover:to-slate-400/20'
              : 'bg-slate-800/50 border border-white/5 hover:border-white/10 hover:bg-slate-800/70'
          }
        `}
      >
        <Trophy className={`w-4 h-4 ${hasChampion ? 'text-amber-400' : hasMedal ? 'text-slate-300' : 'text-slate-500'}`} />
        <span className={`text-sm font-bold ${hasChampion ? 'text-amber-300' : hasMedal ? 'text-slate-300' : 'text-slate-400'}`}>
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

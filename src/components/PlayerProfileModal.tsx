'use client';

import { useEffect } from 'react';
import type { MemberStats, FavoritePosition } from '@/types/clubs-api';
import { useTranslation, type Translations } from '@/lib/i18n';
import { NationFlag } from './NationFlag';

// ============================================
// TYPES
// ============================================

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: MemberStats | null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Converte valor string para número (seguro)
 */
function toNumber(value: string | number | undefined): number {
  if (value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Retorna as iniciais do nome do jogador
 */
function getInitials(name: string): string {
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Retorna estilos da posição
 */
function getPositionStyle(
  position: FavoritePosition,
  t: Translations
): {
  label: string;
  abbr: string;
  bgColor: string;
  textColor: string;
  gradientFrom: string;
  gradientTo: string;
} {
  const styles: Record<FavoritePosition, {
    label: string;
    abbr: string;
    bgColor: string;
    textColor: string;
    gradientFrom: string;
    gradientTo: string;
  }> = {
    goalkeeper: {
      label: t.positions.goalkeeper,
      abbr: t.positions.gol,
      bgColor: 'bg-amber-500/20',
      textColor: 'text-amber-400',
      gradientFrom: 'from-amber-500/30',
      gradientTo: 'to-amber-700/20',
    },
    defender: {
      label: t.positions.defender,
      abbr: t.positions.def,
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400',
      gradientFrom: 'from-blue-500/30',
      gradientTo: 'to-blue-700/20',
    },
    midfielder: {
      label: t.positions.midfielder,
      abbr: t.positions.mid,
      bgColor: 'bg-emerald-500/20',
      textColor: 'text-emerald-400',
      gradientFrom: 'from-emerald-500/30',
      gradientTo: 'to-emerald-700/20',
    },
    forward: {
      label: t.positions.forward,
      abbr: t.positions.att,
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-400',
      gradientFrom: 'from-red-500/30',
      gradientTo: 'to-red-700/20',
    },
  };
  return styles[position];
}

/**
 * Retorna a cor do OVR baseado no valor
 */
function getOverallColor(overall: number): string {
  if (overall >= 85) return 'from-emerald-400 to-emerald-600';
  if (overall >= 80) return 'from-green-400 to-green-600';
  if (overall >= 75) return 'from-yellow-400 to-yellow-600';
  if (overall >= 70) return 'from-orange-400 to-orange-600';
  return 'from-gray-400 to-gray-600';
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

// ============================================
// STAT BAR COMPONENT
// ============================================

interface StatBarProps {
  label: string;
  value: number | string;
  maxValue: number;
  format?: 'number' | 'decimal' | 'percent' | 'perMatch';
  color?: string;
}

function StatBar({
  label,
  value,
  maxValue,
  format = 'number',
  color = 'bg-cyan-500',
}: StatBarProps) {
  const numValue = toNumber(value);
  const percentage = maxValue > 0 ? Math.min((numValue / maxValue) * 100, 100) : 0;

  // Formatar valor
  const formatValue = (): string => {
    switch (format) {
      case 'decimal':
        return numValue.toFixed(1);
      case 'percent':
        return `${Math.round(numValue)}%`;
      case 'perMatch':
        return numValue.toFixed(2);
      default:
        return Math.round(numValue).toString();
    }
  };

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-sm font-bold text-white">
          {formatValue()}
        </span>
      </div>
      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// STAT SECTION COMPONENT
// ============================================

interface StatSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function StatSection({ title, icon, children }: StatSectionProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-4">
        {icon}
        {title}
      </h4>
      {children}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function PlayerProfileModal({ isOpen, onClose, player }: PlayerProfileModalProps) {
  const { t } = useTranslation();

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !player) return null;

  // Dados do jogador
  const positionStyle = getPositionStyle(player.favoritePosition, t);
  const overall = toNumber(player.proOverall);
  const overallColor = getOverallColor(overall);
  const gamesPlayed = toNumber(player.gamesPlayed);
  const goals = toNumber(player.goals);
  const assists = toNumber(player.assists);
  const ratingAve = toNumber(player.ratingAve);
  const winRate = toNumber(player.winRate);
  const mom = toNumber(player.manOfTheMatch);
  const shotRate = toNumber(player.shotSuccessRate);
  const passRate = toNumber(player.passSuccessRate);
  const tackles = toNumber(player.tacklesMade);
  const tackleRate = toNumber(player.tackleSuccessRate);
  const redCards = toNumber(player.redCards);
  const passesMade = toNumber(player.passesMade);
  const isGK = player.favoritePosition === 'goalkeeper';
  const cleanSheets = toNumber(isGK ? player.cleanSheetsGK : player.cleanSheetsDef);

  // Cálculos derivados
  const goalsPerMatch = gamesPlayed > 0 ? goals / gamesPlayed : 0;
  const assistsPerMatch = gamesPlayed > 0 ? assists / gamesPlayed : 0;
  const contributions = goals + assists;
  const contributionsPerMatch = gamesPlayed > 0 ? contributions / gamesPlayed : 0;
  const tacklesPerMatch = gamesPlayed > 0 ? tackles / gamesPlayed : 0;
  const momRate = gamesPlayed > 0 ? (mom / gamesPlayed) * 100 : 0;
  const cleanSheetRate = gamesPlayed > 0 ? (cleanSheets / gamesPlayed) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Header */}
        <div className={`relative h-32 bg-gradient-to-br ${positionStyle.gradientFrom} ${positionStyle.gradientTo} rounded-t-2xl overflow-hidden`}>
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white/80 hover:text-white transition-colors z-10 cursor-pointer"
            aria-label={t.common.close}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Player Card (overlapping header) */}
        <div className="relative px-6 -mt-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            {/* Avatar */}
            <div className={`relative w-28 h-28 rounded-2xl bg-gradient-to-br ${positionStyle.gradientFrom} ${positionStyle.gradientTo} border-4 border-gray-800 flex items-center justify-center shadow-xl`}>
              <span className={`text-3xl font-black ${positionStyle.textColor}`}>
                {getInitials(player.proName || player.name)}
              </span>
              {/* Position badge */}
              <span className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md text-xs font-bold ${positionStyle.bgColor} ${positionStyle.textColor} border border-gray-700`}>
                {positionStyle.abbr}
              </span>
            </div>

            {/* Player Info */}
            <div className="flex-1 text-center sm:text-left pb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <NationFlag nationalityId={player.proNationality} size="lg" />
                <h2 className="text-2xl font-black text-white">
                  {player.proName || player.name}
                </h2>
              </div>
              <p className="text-sm text-gray-400 flex items-center justify-center sm:justify-start gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
                {player.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {positionStyle.label} • {t.player.height}: {player.proHeight}cm
              </p>
            </div>

            {/* OVR Badge */}
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${overallColor} flex flex-col items-center justify-center shadow-lg border border-white/10`}>
              <span className="text-3xl font-black text-white leading-none">{overall}</span>
              <span className="text-xs font-bold text-white/70 uppercase">OVR</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="px-6 py-4 border-b border-gray-700/30">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-white">{gamesPlayed}</p>
              <p className="text-xs text-gray-500 uppercase">{t.player.games}</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-black ${getRatingColor(ratingAve)}`}>{ratingAve.toFixed(1)}</p>
              <p className="text-xs text-gray-500 uppercase">{t.player.score}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-400">{Math.round(winRate)}%</p>
              <p className="text-xs text-gray-500 uppercase">{t.player.victories}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-amber-400">{mom}</p>
              <p className="text-xs text-gray-500 uppercase">MOM</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ataque */}
          <StatSection
            title={t.player.attack}
            icon={
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2zm0 2.83L18.17 11H17v8h-2v-6H9v6H7v-8H5.83L12 4.83z" />
              </svg>
            }
          >
            <StatBar label={t.player.goals} value={goals} maxValue={150} color="bg-white" />
            <StatBar label={t.player.goalsPerMatch} value={goalsPerMatch} maxValue={2} format="perMatch" color="bg-cyan-500" />
            <StatBar label={t.player.shotsAccuracy} value={shotRate} maxValue={100} format="percent" color="bg-yellow-500" />
            <StatBar label={t.player.assists} value={assists} maxValue={150} color="bg-blue-400" />
            <StatBar label={t.player.assistsPerMatch} value={assistsPerMatch} maxValue={2} format="perMatch" color="bg-blue-500" />
            <StatBar label={t.player.contributions} value={contributions} maxValue={250} color="bg-purple-500" />
            <StatBar label={t.player.contributionsPerMatch} value={contributionsPerMatch} maxValue={3} format="perMatch" color="bg-purple-400" />
          </StatSection>

          {/* Defesa */}
          <StatSection
            title={t.player.defense}
            icon={
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
              </svg>
            }
          >
            <StatBar label={t.player.tackles} value={tackles} maxValue={200} color="bg-white" />
            <StatBar label={t.player.tacklesPerMatch} value={tacklesPerMatch} maxValue={5} format="perMatch" color="bg-cyan-500" />
            <StatBar label={t.player.tacklesAccuracy} value={tackleRate} maxValue={100} format="percent" color="bg-blue-500" />
            <StatBar label={t.player.cleanSheets} value={cleanSheets} maxValue={50} color="bg-emerald-500" />
            <StatBar label={t.player.cleanSheetRate} value={cleanSheetRate} maxValue={100} format="percent" color="bg-emerald-400" />
            <StatBar label={t.player.redCards} value={redCards} maxValue={10} color="bg-red-500" />
          </StatSection>

          {/* Passes */}
          <StatSection
            title={t.player.passes}
            icon={
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.71 11.29l-9-9a.996.996 0 00-1.41 0l-9 9a.996.996 0 000 1.41l9 9c.39.39 1.02.39 1.41 0l9-9a.996.996 0 000-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z" />
              </svg>
            }
          >
            <StatBar label={t.player.passesMade} value={passesMade} maxValue={2000} color="bg-white" />
            <StatBar label={t.player.passAccuracy} value={passRate} maxValue={100} format="percent" color="bg-emerald-500" />
          </StatSection>

          {/* Performance */}
          <StatSection
            title={t.player.performance}
            icon={
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            }
          >
            <StatBar label={t.player.avgRating} value={ratingAve} maxValue={10} format="decimal" color="bg-yellow-500" />
            <StatBar label={t.player.winRateLabel} value={winRate} maxValue={100} format="percent" color="bg-emerald-500" />
            <StatBar label={t.player.manOfTheMatch} value={mom} maxValue={50} color="bg-amber-500" />
            <StatBar label={t.player.momRate} value={momRate} maxValue={50} format="percent" color="bg-amber-400" />
          </StatSection>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700/30 bg-gray-800/30">
          <p className="text-xs text-gray-500 text-center">
            {t.player.pressEscToClose}
          </p>
        </div>
      </div>
    </div>
  );
}

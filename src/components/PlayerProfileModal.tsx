'use client';

import { useEffect, useState } from 'react';
import { X, Crosshair, Shield, ArrowRightLeft, Star, Gamepad2 } from 'lucide-react';

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
  const [animate, setAnimate] = useState(false);
  const numValue = toNumber(value);
  const percentage = maxValue > 0 ? Math.min((numValue / maxValue) * 100, 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
    <div className="flex items-center gap-3 group mb-3 last:mb-0">
      <span className="text-xs text-slate-400 w-28 shrink-0 group-hover:text-slate-300 transition-colors font-medium uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-2.5 bg-slate-800/80 rounded-full overflow-hidden ring-1 ring-white/5">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700 ease-out shadow-sm`}
          style={{ width: animate ? `${percentage}%` : '0%' }}
        />
      </div>
      <span className="text-sm font-bold text-white w-12 text-right tabular-nums">
        {formatValue()}
      </span>
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
    <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-white/5 shadow-lg hover:border-white/10 transition-colors">
      <h4 className="flex items-center gap-2.5 text-sm font-bold text-white mb-4 pb-3 border-b border-white/5 uppercase tracking-wider">
        <div className="p-1.5 rounded-lg bg-white/5">
          {icon}
        </div>
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 ring-1 ring-white/5"
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
            className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/80 hover:text-white transition-all z-10 cursor-pointer ring-1 ring-white/10 hover:ring-white/20 hover:scale-105"
            aria-label={t.common.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Card (overlapping header) */}
        <div className="relative px-6 -mt-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Avatar */}
            <div className={`relative w-28 h-28 rounded-2xl bg-gradient-to-br ${positionStyle.gradientFrom} ${positionStyle.gradientTo} border-4 border-slate-800 flex items-center justify-center shadow-2xl ring-2 ring-white/10`}>
              <span className={`text-3xl font-black ${positionStyle.textColor} drop-shadow-lg`}>
                {getInitials(player.proName || player.name)}
              </span>
              {/* Position badge */}
              <span className={`absolute -bottom-2 -right-2 px-2.5 py-1 rounded-lg text-xs font-bold ${positionStyle.bgColor} ${positionStyle.textColor} border-2 border-slate-800 shadow-lg`}>
                {positionStyle.abbr}
              </span>
            </div>

            {/* Player Info */}
            <div className="flex-1 text-center sm:text-left pb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                <NationFlag nationalityId={player.proNationality} size="lg" />
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {player.proName || player.name}
                </h2>
              </div>
              <p className="text-sm text-slate-400 flex items-center justify-center sm:justify-start gap-2">
                <Gamepad2 className="w-4 h-4 text-slate-500" />
                <span className="font-medium">{player.name}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1.5 flex items-center justify-center sm:justify-start gap-1.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${positionStyle.bgColor} ${positionStyle.textColor}`}>
                  {positionStyle.label}
                </span>
                <span className="text-slate-600">•</span>
                <span>{t.player.height}: {player.proHeight}cm</span>
              </p>
            </div>

            {/* OVR Badge */}
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${overallColor} flex flex-col items-center justify-center shadow-xl ring-2 ring-white/20`}>
              <span className="text-3xl font-black text-white leading-none drop-shadow-md">{overall}</span>
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">OVR</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="px-6 py-5 border-b border-white/5 bg-slate-900/30">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-xl bg-slate-800/40 ring-1 ring-white/5">
              <p className="text-2xl font-black text-white tabular-nums">{gamesPlayed}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">{t.player.games}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-800/40 ring-1 ring-white/5">
              <p className={`text-2xl font-black tabular-nums ${getRatingColor(ratingAve)}`}>{ratingAve.toFixed(1)}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">{t.player.score}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-800/40 ring-1 ring-white/5">
              <p className="text-2xl font-black text-emerald-400 tabular-nums">{Math.round(winRate)}%</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">{t.player.victories}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-800/40 ring-1 ring-white/5">
              <p className="text-2xl font-black text-amber-400 tabular-nums">{mom}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">MOM</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ataque */}
          <StatSection
            title={t.player.attack}
            icon={<Crosshair className="w-4 h-4 text-red-400" />}
          >
            <StatBar label={t.player.goals} value={goals} maxValue={150} color="bg-gradient-to-r from-red-500 to-red-400" />
            <StatBar label={t.player.goalsPerMatch} value={goalsPerMatch} maxValue={2} format="perMatch" color="bg-gradient-to-r from-red-400 to-orange-400" />
            <StatBar label={t.player.shotsAccuracy} value={shotRate} maxValue={100} format="percent" color="bg-gradient-to-r from-orange-500 to-yellow-400" />
            <StatBar label={t.player.assists} value={assists} maxValue={150} color="bg-gradient-to-r from-pink-500 to-pink-400" />
            <StatBar label={t.player.assistsPerMatch} value={assistsPerMatch} maxValue={2} format="perMatch" color="bg-gradient-to-r from-pink-400 to-rose-400" />
            <StatBar label={t.player.contributions} value={contributions} maxValue={250} color="bg-gradient-to-r from-purple-500 to-purple-400" />
            <StatBar label={t.player.contributionsPerMatch} value={contributionsPerMatch} maxValue={3} format="perMatch" color="bg-gradient-to-r from-purple-400 to-fuchsia-400" />
          </StatSection>

          {/* Defesa */}
          <StatSection
            title={t.player.defense}
            icon={<Shield className="w-4 h-4 text-blue-400" />}
          >
            <StatBar label={t.player.tackles} value={tackles} maxValue={200} color="bg-gradient-to-r from-blue-500 to-blue-400" />
            <StatBar label={t.player.tacklesPerMatch} value={tacklesPerMatch} maxValue={5} format="perMatch" color="bg-gradient-to-r from-blue-400 to-cyan-400" />
            <StatBar label={t.player.tacklesAccuracy} value={tackleRate} maxValue={100} format="percent" color="bg-gradient-to-r from-cyan-500 to-cyan-400" />
            <StatBar label={t.player.cleanSheets} value={cleanSheets} maxValue={50} color="bg-gradient-to-r from-teal-500 to-teal-400" />
            <StatBar label={t.player.cleanSheetRate} value={cleanSheetRate} maxValue={100} format="percent" color="bg-gradient-to-r from-teal-400 to-emerald-400" />
            <StatBar label={t.player.redCards} value={redCards} maxValue={10} color="bg-gradient-to-r from-rose-600 to-red-500" />
          </StatSection>

          {/* Passes */}
          <StatSection
            title={t.player.passes}
            icon={<ArrowRightLeft className="w-4 h-4 text-emerald-400" />}
          >
            <StatBar label={t.player.passesMade} value={passesMade} maxValue={2000} color="bg-gradient-to-r from-emerald-500 to-emerald-400" />
            <StatBar label={t.player.passAccuracy} value={passRate} maxValue={100} format="percent" color="bg-gradient-to-r from-emerald-400 to-green-400" />
          </StatSection>

          {/* Performance */}
          <StatSection
            title={t.player.performance}
            icon={<Star className="w-4 h-4 text-amber-400" />}
          >
            <StatBar label={t.player.avgRating} value={ratingAve} maxValue={10} format="decimal" color="bg-gradient-to-r from-amber-500 to-yellow-400" />
            <StatBar label={t.player.winRateLabel} value={winRate} maxValue={100} format="percent" color="bg-gradient-to-r from-emerald-500 to-green-400" />
            <StatBar label={t.player.manOfTheMatch} value={mom} maxValue={50} color="bg-gradient-to-r from-amber-400 to-orange-400" />
            <StatBar label={t.player.momRate} value={momRate} maxValue={50} format="percent" color="bg-gradient-to-r from-orange-400 to-amber-400" />
          </StatSection>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-slate-900/50">
          <p className="text-xs text-slate-500 text-center font-medium">
            {t.player.pressEscToClose}
          </p>
        </div>
      </div>
    </div>
  );
}

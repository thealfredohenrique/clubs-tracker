'use client';

import Image from 'next/image';

import { getNationalityFlagUrl } from '@/lib/ea-assets';
import { useTranslation } from '@/lib/i18n';

// ============================================
// TYPES
// ============================================

interface NationFlagProps {
  /** ID numérico da nacionalidade (proNationality) */
  nationalityId: string | number | undefined;
  /** Classes CSS adicionais para customizar tamanho/estilo */
  className?: string;
  /** Tamanho predefinido */
  size?: 'sm' | 'md' | 'lg';
}

// ============================================
// COMPONENT
// ============================================

/**
 * Componente para exibir a bandeira de nacionalidade do jogador
 */
export function NationFlag({ nationalityId, className = '', size = 'sm' }: NationFlagProps) {
  const flagUrl = getNationalityFlagUrl(nationalityId);
  const { t } = useTranslation();

  // Don't render if no nationality ID or URL
  if (!flagUrl) return null;

  // Predefined sizes
  const sizes = {
    sm: { width: 20, height: 14 },
    md: { width: 24, height: 17 },
    lg: { width: 32, height: 22 },
  };

  const { width, height } = sizes[size];

  return (
    <Image
      src={flagUrl}
      alt={t.favorites.nationality}
      width={width}
      height={height}
      className={`rounded-sm object-contain ${className}`}
      unoptimized
    />
  );
}

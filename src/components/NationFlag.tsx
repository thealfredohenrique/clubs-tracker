'use client';

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
  const sizeClasses = {
    sm: 'w-5 h-auto',
    md: 'w-6 h-auto',
    lg: 'w-8 h-auto',
  };

  const sizeClass = sizeClasses[size];

  return (
    <img
      src={flagUrl}
      alt={t.favorites.nationality}
      className={`rounded-sm object-contain ${sizeClass} ${className}`}
      onError={(e) => {
        // Esconde a imagem se falhar o carregamento
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

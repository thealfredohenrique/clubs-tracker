'use client';

// ============================================
// CONSTANTS
// ============================================

const FLAG_BASE_URL =
  'https://media.contentapi.ea.com/content/dam/ea/fifa/fifa-21/ratings-collective/f20assets/country-flags';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Gera a URL da bandeira do país baseado no ID de nacionalidade
 */
function getFlagUrl(nationalityId: string | number): string {
  return `${FLAG_BASE_URL}/${nationalityId}.png`;
}

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
  // Não renderizar se não houver ID de nacionalidade
  if (!nationalityId) return null;

  // Tamanhos predefinidos
  const sizeClasses = {
    sm: 'w-5 h-auto',
    md: 'w-6 h-auto',
    lg: 'w-8 h-auto',
  };

  const sizeClass = sizeClasses[size];

  return (
    <img
      src={getFlagUrl(nationalityId)}
      alt="Nacionalidade"
      className={`rounded-sm object-contain ${sizeClass} ${className}`}
      onError={(e) => {
        // Esconde a imagem se falhar o carregamento
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

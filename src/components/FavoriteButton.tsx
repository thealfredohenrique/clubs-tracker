'use client';

import { useFavorites, type FavoriteClub } from '@/hooks';

// ============================================
// TYPES
// ============================================

interface FavoriteButtonProps {
  club: FavoriteClub;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================
// COMPONENT
// ============================================

export function FavoriteButton({ club, size = 'md' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();

  const isFav = isFavorite(club.id);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(club);
  };

  // Não renderizar durante SSR para evitar hydration mismatch
  if (!isLoaded) {
    return (
      <button
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gray-800/50 border border-gray-700/50 opacity-50`}
        disabled
        aria-label="Carregando..."
      >
        <svg
          className={`${iconSizes[size]} text-gray-600`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${isFav
        ? 'bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30'
        : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600'
        }`}
      aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      {isFav ? (
        // Estrela Preenchida (Dourada)
        <svg
          className={`${iconSizes[size]} text-amber-400`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ) : (
        // Estrela Vazada (Outline)
        <svg
          className={`${iconSizes[size]} text-gray-400 hover:text-amber-400 transition-colors`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )}
    </button>
  );
}

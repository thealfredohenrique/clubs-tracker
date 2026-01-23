'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useFavorites, type FavoriteClub } from '@/hooks';

// ============================================
// CONSTANTS
// ============================================

const CREST_BASE_URL =
  'https://eafc24.content.easports.com/fifa/fltOnlineAssets/24B23FDE-7835-41C2-87A2-F453DFDB2E82/2024/fcweb/crests/256x256/l';

// ============================================
// HELPER FUNCTIONS
// ============================================

function getCrestUrl(crestAssetId: string | null): string | null {
  if (!crestAssetId) return null;
  return `${CREST_BASE_URL}${crestAssetId}.png`;
}

function getPlatformShortName(platform: string): string {
  switch (platform) {
    case 'common-gen5':
      return 'PS5/XSX/PC';
    case 'common-gen4':
      return 'PS4/XB1';
    case 'nx':
      return 'Switch';
    default:
      return platform;
  }
}

// ============================================
// FAVORITE CARD COMPONENT
// ============================================

interface FavoriteCardProps {
  favorite: FavoriteClub;
  onRemove: (club: FavoriteClub) => void;
}

function FavoriteCard({ favorite, onRemove }: FavoriteCardProps) {
  const crestUrl = getCrestUrl(favorite.crestUrl);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(favorite);
  };

  return (
    <Link
      href={`/club/${favorite.id}`}
      className="group relative flex flex-col items-center p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600 rounded-xl transition-all duration-200"
    >
      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-900/80 border border-gray-700 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:border-red-500/50 transition-all"
        title="Remover dos favoritos"
      >
        <svg
          className="w-3 h-3 text-gray-400 hover:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Crest */}
      <div className="w-16 h-16 mb-3 rounded-full bg-gray-700/50 p-1.5 flex items-center justify-center group-hover:scale-105 transition-transform">
        {crestUrl ? (
          <Image
            src={crestUrl}
            alt={`${favorite.name} crest`}
            width={56}
            height={56}
            className="object-contain"
            unoptimized
          />
        ) : (
          <span className="text-2xl font-bold text-gray-500">
            {favorite.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-white text-center truncate w-full">
        {favorite.name}
      </p>

      {/* Platform */}
      <p className="text-xs text-gray-500 mt-1">
        {getPlatformShortName(favorite.platform)}
      </p>
    </Link>
  );
}

// ============================================
// FAVORITES LIST COMPONENT
// ============================================

export function FavoritesList() {
  const { favorites, toggleFavorite, isLoaded } = useFavorites();

  // Não renderizar durante SSR ou se não há favoritos
  if (!isLoaded) {
    return null;
  }

  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <svg
          className="w-5 h-5 text-amber-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <h2 className="text-lg font-bold text-white">Meus Clubes</h2>
        <span className="text-sm text-gray-500">
          ({favorites.length} {favorites.length === 1 ? 'clube' : 'clubes'})
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {favorites.map((fav) => (
          <FavoriteCard
            key={fav.id}
            favorite={fav}
            onRemove={toggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}

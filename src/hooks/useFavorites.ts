'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================
// TYPES
// ============================================

export interface FavoriteClub {
  id: string;
  name: string;
  platform: string;
  crestUrl: string | null; // Legacy: crestAssetId
  teamId?: number | null; // For authentic crests
  selectedKitType?: string | null; // "1" = custom, "0" = authentic
}

interface UseFavoritesReturn {
  favorites: FavoriteClub[];
  isFavorite: (clubId: string) => boolean;
  toggleFavorite: (club: FavoriteClub) => void;
  isLoaded: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'proclubs-favorites';
const MAX_FAVORITES = 20;

// ============================================
// HOOK
// ============================================

/**
 * Hook para gerenciar clubes favoritos usando localStorage
 */
export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteClub[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar favoritos do localStorage no mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FavoriteClub[];
        // Validar estrutura dos dados
        if (Array.isArray(parsed)) {
          setFavorites(parsed.filter(isValidFavorite));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Salvar no localStorage sempre que favoritos mudar
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Erro ao salvar favoritos:', error);
      }
    }
  }, [favorites, isLoaded]);

  // Verificar se um clube está nos favoritos
  const isFavorite = useCallback(
    (clubId: string): boolean => {
      return favorites.some((fav) => fav.id === clubId);
    },
    [favorites]
  );

  // Adicionar ou remover clube dos favoritos
  const toggleFavorite = useCallback((club: FavoriteClub) => {
    setFavorites((current) => {
      const exists = current.some((fav) => fav.id === club.id);

      if (exists) {
        // Remover dos favoritos
        return current.filter((fav) => fav.id !== club.id);
      }

      // Adicionar aos favoritos (limite de MAX_FAVORITES)
      if (current.length >= MAX_FAVORITES) {
        console.warn(`Limite de ${MAX_FAVORITES} favoritos atingido`);
        return current;
      }

      return [...current, club];
    });
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoaded,
  };
}

// ============================================
// HELPERS
// ============================================

/**
 * Valida se um objeto é um FavoriteClub válido
 * Backwards compatible: accepts legacy favorites without teamId/selectedKitType
 */
function isValidFavorite(obj: unknown): obj is FavoriteClub {
  if (typeof obj !== 'object' || obj === null) return false;
  const fav = obj as Record<string, unknown>;
  return (
    typeof fav.id === 'string' &&
    typeof fav.name === 'string' &&
    typeof fav.platform === 'string' &&
    (fav.crestUrl === null || typeof fav.crestUrl === 'string') &&
    // Optional new fields - backwards compatible
    (fav.teamId === undefined || fav.teamId === null || typeof fav.teamId === 'number') &&
    (fav.selectedKitType === undefined || fav.selectedKitType === null || typeof fav.selectedKitType === 'string')
  );
}

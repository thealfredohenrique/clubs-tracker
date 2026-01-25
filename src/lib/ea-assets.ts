/**
 * Centralized helpers for EA Sports FC asset URLs
 * 
 * This module provides a single source of truth for generating URLs to EA assets:
 * - Club crests/logos
 * - Player nationality flags
 * - Player avatars (if needed in the future)
 */

import type { ClubInfo, CustomKit } from '@/types/clubs-api';

// ============================================
// CONSTANTS
// ============================================

const CREST_BASE_URL =
  'https://eafc24.content.easports.com/fifa/fltOnlineAssets/24B23FDE-7835-41C2-87A2-F453DFDB2E82/2024/fcweb/crests/256x256/l';

const FLAG_BASE_URL =
  'https://media.contentapi.ea.com/content/dam/ea/fifa/fifa-21/ratings-collective/f20assets/country-flags';

// ============================================
// CLUB LOGO/CREST HELPERS
// ============================================

/**
 * Options for getting club logo URL
 */
export interface ClubLogoOptions {
  /** The club's customKit object */
  customKit?: CustomKit | null;
  /** The club's teamId (for authentic crests) */
  teamId?: number | string | null;
  /** Override: force use of crestAssetId (legacy/favorites) */
  crestAssetId?: string | null;
  /** Override: force selectedKitType value */
  selectedKitType?: string | null;
}

/**
 * Gets the club logo/crest URL based on the kit type selection
 * 
 * Logic:
 * - selectedKitType === "1": Custom Crest → uses crestAssetId
 * - selectedKitType === "0": Authentic Crest → uses teamId
 * - Fallback: uses crestAssetId if available
 * 
 * @param clubInfo - Full ClubInfo object from API, or null/undefined
 * @returns URL string or null if not available
 * 
 * @example
 * // From ClubInfo (most common)
 * getClubLogoUrl(club.clubInfo)
 * 
 * @example
 * // From match data (details)
 * getClubLogoUrl(matchClub.details)
 */
export function getClubLogoUrl(clubInfo: ClubInfo | undefined | null): string | null;

/**
 * Gets the club logo/crest URL from individual options
 * 
 * Useful when you have separated data (e.g., favorites stored in localStorage)
 * 
 * @param options - Object with customKit, teamId, or individual asset IDs
 * @returns URL string or null if not available
 * 
 * @example
 * // From favorites (minimal data)
 * getClubLogoUrl({
 *   selectedKitType: favorite.selectedKitType,
 *   crestAssetId: favorite.crestUrl,
 *   teamId: favorite.teamId
 * })
 */
export function getClubLogoUrl(options: ClubLogoOptions): string | null;

/**
 * Implementation of getClubLogoUrl
 */
export function getClubLogoUrl(
  input: ClubInfo | ClubLogoOptions | undefined | null
): string | null {
  if (!input) return null;

  // Determine if input is ClubInfo or ClubLogoOptions
  const isClubInfo = 'clubId' in input || 'name' in input;

  let customKit: CustomKit | undefined | null;
  let teamId: number | string | undefined | null;
  let crestAssetId: string | undefined | null;
  let selectedKitType: string | undefined | null;

  if (isClubInfo) {
    const clubInfo = input as ClubInfo;
    customKit = clubInfo.customKit;
    teamId = clubInfo.teamId;
    crestAssetId = customKit?.crestAssetId;
    selectedKitType = customKit?.selectedKitType;
  } else {
    const options = input as ClubLogoOptions;
    customKit = options.customKit;
    teamId = options.teamId;
    // Allow overrides from options
    crestAssetId = options.crestAssetId ?? customKit?.crestAssetId;
    selectedKitType = options.selectedKitType ?? customKit?.selectedKitType;
  }

  // Custom Crest (selectedKitType === "1")
  if (selectedKitType === '1' && crestAssetId) {
    return `${CREST_BASE_URL}${crestAssetId}.png`;
  }

  // Authentic/Real Team Crest (selectedKitType === "0")
  if (selectedKitType === '0' && teamId) {
    return `${CREST_BASE_URL}${teamId}.png`;
  }

  // Fallback: use crestAssetId if available (legacy data)
  if (crestAssetId) {
    return `${CREST_BASE_URL}${crestAssetId}.png`;
  }

  return null;
}

// ============================================
// NATIONALITY FLAG HELPERS
// ============================================

/**
 * Gets the nationality flag URL for a player
 * 
 * @param nationalityId - The player's proNationality ID (string or number)
 * @returns URL string or null if nationalityId is falsy
 * 
 * @example
 * getNationalityFlagUrl(player.proNationality) // "54" → Brazil flag URL
 */
export function getNationalityFlagUrl(
  nationalityId: string | number | undefined | null
): string | null {
  if (!nationalityId) return null;
  return `${FLAG_BASE_URL}/${nationalityId}.png`;
}

// ============================================
// PLAYER AVATAR HELPERS (Future use)
// ============================================

/**
 * Gets the player avatar URL (placeholder for future implementation)
 * 
 * Currently, the EA API doesn't provide a direct avatar URL.
 * This function is here for future extensibility.
 * 
 * @returns null (not implemented)
 */
export function getPlayerAvatarUrl(): string | null {
  // EA API doesn't provide player avatars for Pro Clubs
  // This is a placeholder for future implementation
  return null;
}

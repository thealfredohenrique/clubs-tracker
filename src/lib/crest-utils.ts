import type { ClubInfo, CustomKit } from '@/types/clubs-api';

// ============================================
// CONSTANTS
// ============================================

const CREST_BASE_URL =
  'https://eafc24.content.easports.com/fifa/fltOnlineAssets/24B23FDE-7835-41C2-87A2-F453DFDB2E82/2024/fcweb/crests/256x256/l';

// ============================================
// CREST URL HELPERS
// ============================================

/**
 * Gera a URL do escudo do clube baseado no tipo de kit selecionado
 * - selectedKitType === "1": Escudo Personalizado (usa crestAssetId)
 * - selectedKitType === "0": Escudo Autêntico/Real Team (usa teamId)
 * 
 * @param clubInfo - Objeto ClubInfo completo do clube
 * @returns URL do escudo ou null se não disponível
 */
export function getCrestUrl(clubInfo: ClubInfo | undefined | null): string | null {
  if (!clubInfo) return null;

  const customKit = clubInfo.customKit;

  if (!customKit) return null;

  const selectedKitType = customKit.selectedKitType;

  // Escudo Personalizado (Custom Crest)
  if (selectedKitType === '1' && customKit.crestAssetId) {
    return `${CREST_BASE_URL}${customKit.crestAssetId}.png`;
  }

  // Escudo Autêntico (Real Team Crest)
  if (selectedKitType === '0' && clubInfo.teamId) {
    return `${CREST_BASE_URL}${clubInfo.teamId}.png`;
  }

  // Fallback: tenta usar crestAssetId se disponível
  if (customKit.crestAssetId) {
    return `${CREST_BASE_URL}${customKit.crestAssetId}.png`;
  }

  return null;
}

/**
 * Versão simplificada para quando só temos o CustomKit e teamId separados
 * Útil para dados de partidas onde a estrutura é diferente
 * 
 * @param customKit - Objeto CustomKit
 * @param teamId - ID do time (para escudos autênticos)
 * @returns URL do escudo ou null se não disponível
 */
export function getCrestUrlFromKit(
  customKit: CustomKit | undefined | null,
  teamId?: number | string | null
): string | null {
  if (!customKit) return null;

  const selectedKitType = customKit.selectedKitType;

  // Escudo Personalizado (Custom Crest)
  if (selectedKitType === '1' && customKit.crestAssetId) {
    return `${CREST_BASE_URL}${customKit.crestAssetId}.png`;
  }

  // Escudo Autêntico (Real Team Crest)
  if (selectedKitType === '0' && teamId) {
    return `${CREST_BASE_URL}${teamId}.png`;
  }

  // Fallback: tenta usar crestAssetId se disponível
  if (customKit.crestAssetId) {
    return `${CREST_BASE_URL}${customKit.crestAssetId}.png`;
  }

  return null;
}

/**
 * Versão para usar apenas com crestAssetId (fallback legado)
 * @deprecated Use getCrestUrl ou getCrestUrlFromKit quando possível
 */
export function getCrestUrlFromAssetId(crestAssetId: string | undefined | null): string | null {
  if (!crestAssetId) return null;
  return `${CREST_BASE_URL}${crestAssetId}.png`;
}

/**
 * Versão para favoritos que armazenam apenas os campos essenciais
 * Seleciona entre escudo personalizado ou autêntico baseado em selectedKitType
 * 
 * @param selectedKitType - "1" para personalizado, "0" para autêntico
 * @param crestAssetId - ID do escudo personalizado
 * @param teamId - ID do time (para escudos autênticos)
 * @returns URL do escudo ou null se não disponível
 */
export function getCrestUrlForFavorite(
  selectedKitType: string | null | undefined,
  crestAssetId: string | null | undefined,
  teamId: number | null | undefined
): string | null {
  // Escudo Personalizado (Custom Crest)
  if (selectedKitType === '1' && crestAssetId) {
    return `${CREST_BASE_URL}${crestAssetId}.png`;
  }

  // Escudo Autêntico (Real Team Crest)
  if (selectedKitType === '0' && teamId) {
    return `${CREST_BASE_URL}${teamId}.png`;
  }

  // Fallback para dados legados: usa crestAssetId se disponível
  if (crestAssetId) {
    return `${CREST_BASE_URL}${crestAssetId}.png`;
  }

  return null;
}

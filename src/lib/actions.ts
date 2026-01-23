'use server';

/**
 * Server Actions para a API do Pro Clubs
 *
 * Estas funções podem ser chamadas diretamente de componentes client-side
 * e serão executadas no servidor, evitando problemas de CORS.
 */

import {
  searchClubByName,
  getClubOverallStats,
  getMembersCareerStats,
  getMembersStats,
  getClubMatches,
  getClubsInfo,
  isValidPlatform,
  isValidMatchType,
} from '@/lib/api-client';

import type {
  Platform,
  MatchType,
  ApiResult,
  SearchClubResponse,
  OverallStatsResponse,
  MembersCareerStatsResponse,
  MembersStatsResponse,
  MatchesResponse,
  ClubsInfoResponse,
  ApiError,
} from '@/types/clubs-api';

// ============================================
// VALIDAÇÃO
// ============================================

function createValidationError(message: string): ApiResult<never> {
  const error: ApiError = {
    message,
    code: 'VALIDATION_ERROR',
  };
  return { success: false, error };
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Server Action: Busca clubes pelo nome
 */
export async function searchClubAction(
  platform: string,
  clubName: string
): Promise<ApiResult<SearchClubResponse>> {
  // Validações
  if (!isValidPlatform(platform)) {
    return createValidationError('Plataforma inválida');
  }

  if (!clubName || clubName.trim().length === 0) {
    return createValidationError('Nome do clube é obrigatório');
  }

  if (clubName.trim().length < 2) {
    return createValidationError('Nome do clube deve ter pelo menos 2 caracteres');
  }

  return searchClubByName(platform as Platform, clubName.trim());
}

/**
 * Server Action: Retorna estatísticas gerais do clube
 */
export async function getClubOverallStatsAction(
  platform: string,
  clubIds: string
): Promise<ApiResult<OverallStatsResponse>> {
  if (!isValidPlatform(platform)) {
    return createValidationError('Plataforma inválida');
  }

  if (!clubIds || clubIds.trim().length === 0) {
    return createValidationError('ID do clube é obrigatório');
  }

  return getClubOverallStats(platform as Platform, clubIds.trim());
}

/**
 * Server Action: Retorna estatísticas de carreira dos membros
 */
export async function getMembersCareerStatsAction(
  platform: string,
  clubId: string
): Promise<ApiResult<MembersCareerStatsResponse>> {
  if (!isValidPlatform(platform)) {
    return createValidationError('Plataforma inválida');
  }

  if (!clubId || clubId.trim().length === 0) {
    return createValidationError('ID do clube é obrigatório');
  }

  return getMembersCareerStats(platform as Platform, clubId.trim());
}

/**
 * Server Action: Retorna estatísticas atuais dos membros
 */
export async function getMembersStatsAction(
  platform: string,
  clubId: string
): Promise<ApiResult<MembersStatsResponse>> {
  if (!isValidPlatform(platform)) {
    return createValidationError('Plataforma inválida');
  }

  if (!clubId || clubId.trim().length === 0) {
    return createValidationError('ID do clube é obrigatório');
  }

  return getMembersStats(platform as Platform, clubId.trim());
}

/**
 * Server Action: Retorna partidas do clube
 */
export async function getClubMatchesAction(
  platform: string,
  clubIds: string,
  matchType: string
): Promise<ApiResult<MatchesResponse>> {
  if (!isValidPlatform(platform)) {
    return createValidationError('Plataforma inválida');
  }

  if (!clubIds || clubIds.trim().length === 0) {
    return createValidationError('ID do clube é obrigatório');
  }

  if (!isValidMatchType(matchType)) {
    return createValidationError('Tipo de partida inválido');
  }

  return getClubMatches(platform as Platform, clubIds.trim(), matchType as MatchType);
}

/**
 * Server Action: Retorna informações detalhadas dos clubes
 */
export async function getClubsInfoAction(
  platform: string,
  clubIds: string
): Promise<ApiResult<ClubsInfoResponse>> {
  if (!isValidPlatform(platform)) {
    return createValidationError('Plataforma inválida');
  }

  if (!clubIds || clubIds.trim().length === 0) {
    return createValidationError('ID do clube é obrigatório');
  }

  return getClubsInfo(platform as Platform, clubIds.trim());
}

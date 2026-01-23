/**
 * Cliente de API para o Pro Clubs - EA Sports FC
 *
 * Este cliente roda no NAVEGADOR (Client-Side) para evitar bloqueios de IP
 * dos servidores da Vercel/Cloudflare pela EA.
 *
 * Usa corsproxy.io para bypass de CORS.
 */

import type {
  Platform,
  MatchType,
  MatchCategory,
  Match,
  SearchClubResponse,
  OverallStatsResponse,
  MembersCareerStatsResponse,
  MembersStatsResponse,
  MatchesResponse,
  ClubsInfoResponse,
  ApiResult,
  ApiError,
} from '@/types/clubs-api';

// ============================================
// CONFIGURAÇÃO
// ============================================

const EA_API_BASE_URL = 'https://proclubs.ea.com/api/fc';
const CORS_PROXY_URL = 'https://corsproxy.io/?';

/**
 * Timeout padrão para requisições (em ms)
 */
const DEFAULT_TIMEOUT = 15000;

// ============================================
// FUNÇÃO BASE DE FETCH
// ============================================

/**
 * Função base para fazer requisições à API da EA via CORS proxy
 * Esta função roda no NAVEGADOR (Client-Side)
 *
 * @param endpoint - Endpoint da API (sem a base URL)
 * @param params - Parâmetros de query string
 * @param options - Opções adicionais de fetch
 * @returns Promise com o resultado da requisição
 */
async function fetchFromEA<T>(
  endpoint: string,
  params: Record<string, string>,
  options?: {
    timeout?: number;
  }
): Promise<ApiResult<T>> {
  const { timeout = DEFAULT_TIMEOUT } = options ?? {};

  // Construir URL original da EA
  const originalUrl = new URL(`${EA_API_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    originalUrl.searchParams.append(key, value);
  });

  // Envelopar com CORS proxy
  const proxiedUrl = `${CORS_PROXY_URL}${encodeURIComponent(originalUrl.toString())}`;

  // Configurar AbortController para timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(proxiedUrl, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error: ApiError = {
        message: `Erro na requisição: ${response.status} ${response.statusText}`,
        status: response.status,
        code: 'HTTP_ERROR',
      };
      return { success: false, error };
    }

    const data = (await response.json()) as T;
    return { success: true, data };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        const error: ApiError = {
          message: 'Requisição excedeu o tempo limite',
          code: 'TIMEOUT',
        };
        return { success: false, error };
      }

      const error: ApiError = {
        message: err.message,
        code: 'FETCH_ERROR',
      };
      return { success: false, error };
    }

    const error: ApiError = {
      message: 'Erro desconhecido na requisição',
      code: 'UNKNOWN_ERROR',
    };
    return { success: false, error };
  }
}

// ============================================
// FUNÇÕES DA API
// ============================================

/**
 * Busca clubes pelo nome
 *
 * @param platform - Plataforma do jogo
 * @param clubName - Nome do clube a ser pesquisado
 * @returns Lista de clubes encontrados
 */
export async function searchClubByName(
  platform: Platform,
  clubName: string
): Promise<ApiResult<SearchClubResponse>> {
  return fetchFromEA<SearchClubResponse>('/allTimeLeaderboard/search', {
    platform,
    clubName,
  });
}

/**
 * Retorna as estatísticas gerais de um ou mais clubes
 *
 * @param platform - Plataforma do jogo
 * @param clubIds - ID(s) do(s) clube(s) (separados por vírgula se múltiplos)
 * @returns Estatísticas gerais dos clubes
 */
export async function getClubOverallStats(
  platform: Platform,
  clubIds: string
): Promise<ApiResult<OverallStatsResponse>> {
  return fetchFromEA<OverallStatsResponse>('/clubs/overallStats', {
    platform,
    clubIds,
  });
}

/**
 * Retorna as estatísticas de carreira dos membros de um clube
 *
 * @param platform - Plataforma do jogo
 * @param clubId - ID do clube
 * @returns Estatísticas de carreira dos membros
 */
export async function getMembersCareerStats(
  platform: Platform,
  clubId: string
): Promise<ApiResult<MembersCareerStatsResponse>> {
  return fetchFromEA<MembersCareerStatsResponse>('/members/career/stats', {
    platform,
    clubId,
  });
}

/**
 * Retorna as estatísticas atuais dos membros de um clube
 *
 * @param platform - Plataforma do jogo
 * @param clubId - ID do clube
 * @returns Estatísticas atuais dos membros
 */
export async function getMembersStats(
  platform: Platform,
  clubId: string
): Promise<ApiResult<MembersStatsResponse>> {
  return fetchFromEA<MembersStatsResponse>('/members/stats', {
    platform,
    clubId,
  });
}

/**
 * Retorna as partidas de um clube
 *
 * @param platform - Plataforma do jogo
 * @param clubIds - ID(s) do(s) clube(s)
 * @param matchType - Tipo de partida (friendlyMatch, leagueMatch, playoffMatch)
 * @returns Lista de partidas
 */
export async function getClubMatches(
  platform: Platform,
  clubIds: string,
  matchType: MatchType
): Promise<ApiResult<MatchesResponse>> {
  return fetchFromEA<MatchesResponse>('/clubs/matches', {
    platform,
    clubIds,
    matchType,
  });
}

/**
 * Retorna todas as partidas de um clube (Liga, Playoff e Amistoso)
 * Faz 3 requisições em paralelo e combina os resultados
 *
 * @param platform - Plataforma do jogo
 * @param clubIds - ID(s) do(s) clube(s)
 * @returns Lista unificada de partidas ordenada por timestamp (mais recente primeiro)
 */
export async function getAllClubMatches(
  platform: Platform,
  clubIds: string
): Promise<ApiResult<MatchesResponse>> {
  const matchTypes: { type: MatchType; category: MatchCategory }[] = [
    { type: 'leagueMatch', category: 'league' },
    { type: 'playoffMatch', category: 'playoff' },
    { type: 'friendlyMatch', category: 'friendly' },
  ];

  try {
    // Buscar todos os tipos de partida em paralelo
    const results = await Promise.all(
      matchTypes.map(async ({ type, category }) => {
        const result = await getClubMatches(platform, clubIds, type);
        if (result.success) {
          // Adicionar categoria em cada partida
          return result.data.map((match): Match => ({
            ...match,
            matchCategory: category,
          }));
        }
        // Retornar array vazio se falhar (tratamento silencioso)
        return [] as Match[];
      })
    );

    // Combinar todos os resultados
    const allMatches = results.flat();

    // Ordenar por timestamp (mais recente primeiro)
    allMatches.sort((a, b) => b.timestamp - a.timestamp);

    return { success: true, data: allMatches };
  } catch (err) {
    const error: ApiError = {
      message: err instanceof Error ? err.message : 'Erro ao buscar partidas',
      code: 'FETCH_ERROR',
    };
    return { success: false, error };
  }
}

/**
 * Retorna informações detalhadas de um ou mais clubes
 *
 * @param platform - Plataforma do jogo
 * @param clubIds - ID(s) do(s) clube(s) (separados por vírgula se múltiplos)
 * @returns Informações detalhadas dos clubes
 */
export async function getClubsInfo(
  platform: Platform,
  clubIds: string
): Promise<ApiResult<ClubsInfoResponse>> {
  return fetchFromEA<ClubsInfoResponse>('/clubs/info', {
    platform,
    clubIds,
  });
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Verifica se a plataforma é válida
 */
export function isValidPlatform(platform: string): platform is Platform {
  return ['common-gen5', 'common-gen4', 'nx'].includes(platform);
}

/**
 * Verifica se o tipo de partida é válido
 */
export function isValidMatchType(matchType: string): matchType is MatchType {
  return ['friendlyMatch', 'leagueMatch', 'playoffMatch'].includes(matchType);
}

/**
 * Retorna a descrição amigável da plataforma
 */
export function getPlatformDisplayName(platform: Platform): string {
  const platformNames: Record<Platform, string> = {
    'common-gen5': 'PlayStation 5 / Xbox Series X|S / PC',
    'common-gen4': 'PlayStation 4 / Xbox One',
    'nx': 'Nintendo Switch',
  };
  return platformNames[platform];
}

/**
 * Retorna a descrição amigável do tipo de partida
 */
export function getMatchTypeDisplayName(matchType: MatchType): string {
  const matchTypeNames: Record<MatchType, string> = {
    friendlyMatch: 'Partidas Amistosas',
    leagueMatch: 'Partidas de Liga',
    playoffMatch: 'Partidas de Playoffs',
  };
  return matchTypeNames[matchType];
}

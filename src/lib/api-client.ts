/**
 * Cliente de API para o Pro Clubs - EA Sports FC
 *
 * IMPORTANTE: Todas as funções neste arquivo devem ser executadas APENAS no servidor.
 * Nunca importe este arquivo em componentes client-side.
 *
 * A API da EA pode ter bloqueios de CORS e requer headers específicos para funcionar.
 */

import type {
  Platform,
  MatchType,
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

/**
 * Headers padrão para simular um navegador real e evitar bloqueios
 * Estes headers são essenciais para evitar erro 403 em servidores cloud (Vercel, etc.)
 */
const DEFAULT_HEADERS: HeadersInit = {
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Referer': 'https://www.ea.com/',
  'Origin': 'https://www.ea.com',
  'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
};

/**
 * Timeout padrão para requisições (em ms)
 */
const DEFAULT_TIMEOUT = 10000;

// ============================================
// FUNÇÃO BASE DE FETCH
// ============================================

/**
 * Função base para fazer requisições à API da EA
 * Esta função DEVE ser executada apenas no servidor (Server Actions ou Route Handlers)
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
    cache?: RequestCache;
    revalidate?: number;
  }
): Promise<ApiResult<T>> {
  const { timeout = DEFAULT_TIMEOUT, cache, revalidate } = options ?? {};

  // Construir URL com query params
  const url = new URL(`${EA_API_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  // Configurar AbortController para timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
    };

    // Configurar cache/revalidação para Next.js
    if (cache) {
      fetchOptions.cache = cache;
    }

    if (revalidate !== undefined) {
      fetchOptions.next = { revalidate };
    }

    const response = await fetch(url.toString(), fetchOptions);

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error: ApiError = {
        message: `Erro na requisição: ${response.status} ${response.statusText}`,
        status: response.status,
        code: 'HTTP_ERROR',
      };
      return { success: false, error };
    }

    const data = await response.json() as T;
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
  return fetchFromEA<SearchClubResponse>(
    '/allTimeLeaderboard/search',
    {
      platform,
      clubName: clubName,
    },
    { cache: 'no-store' }
  );
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
  return fetchFromEA<OverallStatsResponse>(
    '/clubs/overallStats',
    {
      platform,
      clubIds,
    },
    { revalidate: 60 } // Revalidar a cada 60 segundos
  );
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
  return fetchFromEA<MembersCareerStatsResponse>(
    '/members/career/stats',
    {
      platform,
      clubId,
    },
    { revalidate: 60 }
  );
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
  return fetchFromEA<MembersStatsResponse>(
    '/members/stats',
    {
      platform,
      clubId,
    },
    { revalidate: 60 }
  );
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
  return fetchFromEA<MatchesResponse>(
    '/clubs/matches',
    {
      platform,
      clubIds,
      matchType,
    },
    { revalidate: 30 } // Partidas atualizam mais frequentemente
  );
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
  return fetchFromEA<ClubsInfoResponse>(
    '/clubs/info',
    {
      platform,
      clubIds,
    },
    { revalidate: 300 } // Info de clube muda com menos frequência
  );
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

/**
 * Tipos para a API do Pro Clubs - EA Sports FC
 * Baseado na documentação: docs/clubs-api.md
 */

// ============================================
// ENUMS E TIPOS UTILITÁRIOS
// ============================================

/**
 * Plataformas suportadas pela API
 */
export type Platform = 'common-gen5' | 'common-gen4' | 'nx';

/**
 * Tipos de partida disponíveis
 */
export type MatchType = 'friendlyMatch' | 'leagueMatch' | 'playoffMatch';

/**
 * Categorias de partida para exibição
 */
export type MatchCategory = 'league' | 'playoff' | 'friendly';

/**
 * Posições favoritas dos jogadores
 */
export type FavoritePosition = 'goalkeeper' | 'defender' | 'midfielder' | 'forward';

/**
 * Posições durante a partida
 */
export type MatchPosition = 'goalkeeper' | 'defender' | 'midfielder' | 'forward';

// ============================================
// CUSTOM KIT (Kit Personalizado)
// ============================================

export interface CustomKit {
  stadName: string;
  kitId: string;
  seasonalTeamId?: string;
  seasonalKitId?: string;
  selectedKitType?: string;
  customKitId: string;
  customAwayKitId?: string;
  customThirdKitId?: string;
  customKeeperKitId?: string;
  kitColor1?: string;
  kitColor2?: string;
  kitColor3?: string;
  kitColor4?: string;
  kitAColor1?: string;
  kitAColor2?: string;
  kitAColor3?: string;
  kitAColor4?: string;
  kitThrdColor1?: string;
  kitThrdColor2?: string;
  kitThrdColor3?: string;
  kitThrdColor4?: string;
  dCustomKit?: string;
  crestColor?: string;
  crestAssetId: string;
}

// ============================================
// CLUB INFO (Informações do Clube)
// ============================================

export interface ClubInfo {
  name: string;
  clubId: number;
  regionId: number;
  teamId: number;
  customKit?: CustomKit;
}

// ============================================
// SEARCH CLUB (Busca de Clubes)
// ============================================

export interface ClubSearchResult {
  clubId: string;
  wins: string;
  losses: string;
  ties: string;
  gamesPlayed: string;
  gamesPlayedPlayoff: string;
  goals: string;
  goalsAgainst: string;
  cleanSheets: string;
  points: string;
  reputationtier: string;
  promotions: string;
  relegations: string;
  bestDivision: string;
  clubInfo: ClubInfo;
  platform: Platform;
  clubName: string;
  currentDivision: string;
}

// ============================================
// OVERALL STATS (Estatísticas Gerais)
// ============================================

export interface ClubOverallStats {
  clubId: string;
  bestDivision: string;
  bestFinishGroup: string;
  finishesInDivision1Group1: string;
  finishesInDivision2Group1: string;
  finishesInDivision3Group1: string;
  finishesInDivision4Group1: string;
  finishesInDivision5Group1: string;
  finishesInDivision6Group1: string;
  gamesPlayed: string;
  gamesPlayedPlayoff: string;
  goals: string;
  goalsAgainst: string;
  promotions: string;
  relegations: string;
  losses: string;
  ties: string;
  wins: string;
  lastMatch0: string;
  lastMatch1: string;
  lastMatch2: string;
  lastMatch3: string;
  lastMatch4: string;
  lastMatch5: string;
  lastMatch6: string;
  lastMatch7: string;
  lastMatch8: string;
  lastMatch9: string;
  lastOpponent0: string;
  lastOpponent1: string;
  lastOpponent2: string;
  lastOpponent3: string;
  lastOpponent4: string;
  lastOpponent5: string;
  lastOpponent6: string;
  lastOpponent7: string;
  lastOpponent8: string;
  lastOpponent9: string;
  wstreak: string;
  unbeatenstreak: string;
  skillRating: string;
  reputationtier: string;
  leagueAppearances: string;
}

// ============================================
// MEMBER CAREER STATS (Estatísticas de Carreira)
// ============================================

export interface MemberCareerStats {
  name: string;
  proPos: string;
  gamesPlayed: string;
  goals: string;
  assists: string;
  manOfTheMatch: string;
  ratingAve: string;
  prevGoals: string;
  favoritePosition: FavoritePosition;
}

export interface PositionCount {
  midfielder: number;
  goalkeeper: number;
  forward: number;
  defender: number;
}

export interface MembersCareerStatsResponse {
  members: MemberCareerStats[];
  positionCount: PositionCount;
}

// ============================================
// MEMBER STATS (Estatísticas Atuais dos Membros)
// ============================================

export interface MemberStats {
  name: string;
  gamesPlayed: string;
  winRate: string;
  goals: string;
  assists: string;
  cleanSheetsDef: string;
  cleanSheetsGK: string;
  shotSuccessRate: string;
  passesMade: string;
  passSuccessRate: string;
  ratingAve: string;
  tacklesMade: string;
  tackleSuccessRate: string;
  proName: string;
  proPos: string;
  proStyle: string;
  proHeight: string;
  proNationality: string;
  proOverall: string;
  proOverallStr: string;
  manOfTheMatch: string;
  redCards: string;
  prevGoals: string;
  prevGoals1: string;
  prevGoals2: string;
  prevGoals3: string;
  prevGoals4: string;
  prevGoals5: string;
  prevGoals6: string;
  prevGoals7: string;
  prevGoals8: string;
  prevGoals9: string;
  prevGoals10: string;
  favoritePosition: FavoritePosition;
}

export interface MembersStatsResponse {
  members: MemberStats[];
  positionCount: PositionCount;
}

// ============================================
// MATCH DATA (Dados das Partidas)
// ============================================

export interface TimeAgo {
  number: number;
  unit: string;
}

export interface MatchClubData {
  date: string;
  gameNumber: string;
  goals: string;
  goalsAgainst: string;
  losses: string;
  matchType: string;
  result: string;
  score: string;
  season_id: string;
  TEAM: string;
  ties: string;
  winnerByDnf: string;
  wins: string;
  details: ClubInfo;
}

export interface MatchPlayerData {
  archetypeid: string;
  assists: string;
  goals: string;
  goalsconceded: string;
  mom: string;
  passattempts: string;
  passesmade: string;
  pos: MatchPosition;
  rating: string;
  redcards: string;
  shots: string;
  tackleattempts: string;
  tacklesmade: string;
  playername: string;
}

export interface MatchAggregateData {
  assists: number;
  goals: number;
  goalsconceded: number;
  mom: number;
  passattempts: number;
  passesmade: number;
  rating: number;
  redcards: number;
  shots: number;
  tackleattempts: number;
  tacklesmade: number;
}

export interface Match {
  matchId: string;
  timestamp: number;
  timeAgo: TimeAgo;
  clubs: Record<string, MatchClubData>;
  players: Record<string, Record<string, MatchPlayerData>>;
  aggregate: Record<string, MatchAggregateData>;
  /** Categoria da partida (adicionada pelo cliente) */
  matchCategory?: MatchCategory;
}

// ============================================
// CLUBS INFO RESPONSE (Resposta de Info dos Clubes)
// ============================================

export type ClubsInfoResponse = Record<string, ClubInfo>;

// ============================================
// API RESPONSE TYPES (Tipos de Resposta da API)
// ============================================

export type SearchClubResponse = ClubSearchResult[];
export type OverallStatsResponse = ClubOverallStats[];
export type MatchesResponse = Match[];

// ============================================
// API REQUEST PARAMS (Parâmetros de Requisição)
// ============================================

export interface SearchClubParams {
  platform: Platform;
  clubName: string;
}

export interface ClubIdParams {
  platform: Platform;
  clubIds: string;
}

export interface SingleClubIdParams {
  platform: Platform;
  clubId: string;
}

export interface MatchesParams {
  platform: Platform;
  clubIds: string;
  matchType: MatchType;
}

// ============================================
// API ERROR (Erro da API)
// ============================================

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

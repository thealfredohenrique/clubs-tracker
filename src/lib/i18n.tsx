'use client';

import { createContext, useContext, useCallback, useSyncExternalStore, ReactNode } from 'react';

// ============================================
// TYPES
// ============================================

export type Language = 'pt' | 'en';

export interface Translations {
  // Common
  common: {
    back: string;
    close: string;
    loading: string;
    error: string;
    noResults: string;
    search: string;
  };

  // Navigation
  nav: {
    backToSearch: string;
  };

  // Club Header
  header: {
    matches: string;
    goals: string;
    goalDiff: string;
    cleanSheets: string;
    matchHistory: string;
    wins: string;
    draws: string;
    losses: string;
    winRate: string;
    recentForm: string;
    points: string;
  };

  // Roster
  roster: {
    title: string;
    players: string;
    player: string;
    filterAll: string;
    filterAttack: string;
    filterDefense: string;
    compare: string;
    position: string;
    overall: string;
    gamesPlayed: string;
    goalsShort: string;
    assists: string;
    rating: string;
    mom: string;
    momRate: string;
    winRateShort: string;
    goalsPerMatch: string;
    assistsPerMatch: string;
    contributions: string;
    contributionsPerMatch: string;
    shotSuccess: string;
    tackles: string;
    tacklesPerMatch: string;
    tackleSuccess: string;
    redCards: string;
    redCardsPerMatch: string;
    cleanSheetsShort: string;
    cleanSheetRate: string;
    legend: string;
    legendPositions: string;
    legendMom: string;
    legendCs: string;
    legendPerMatch: string;
  };

  // Position names
  positions: {
    goalkeeper: string;
    defender: string;
    midfielder: string;
    forward: string;
    gol: string;
    def: string;
    mid: string;
    att: string;
  };

  // Match History
  matches: {
    title: string;
    recentMatches: string;
    all: string;
    league: string;
    playoff: string;
    friendly: string;
    win: string;
    draw: string;
    loss: string;
    vs: string;
    ago: string;
    details: string;
    noMatches: string;
    unknownOpponent: string;
    goals: string;
    assistsLabel: string;
    results: string;
    types: string;
    noFilterResults: string;
    matchesCount: string;
  };

  // Time units
  time: {
    seconds: string;
    minutes: string;
    hours: string;
    days: string;
    weeks: string;
    months: string;
    years: string;
  };

  // Trophy Room
  trophies: {
    title: string;
    subtitle: string;
    champion: string;
    runnerUp: string;
    thirdPlace: string;
    place: string;
    season: string;
    division: string;
    titles: string;
    medals: string;
    participations: string;
    viewTrophies: string;
    close: string;
  };

  // Search
  search: {
    title: string;
    subtitle: string;
    placeholder: string;
    button: string;
    searching: string;
    platform: string;
    favorites: string;
    noFavorites: string;
    clubName: string;
    results: string;
    club: string;
    clubs: string;
    division: string;
    noResults: string;
    tryDifferent: string;
    enterClubName: string;
    noClubsFound: string;
    apiData: string;
    myClubs: string;
    removeFromFavorites: string;
  };

  // Player Profile Modal
  player: {
    profile: string;
    stats: string;
    form: string;
    goalsPerMatch: string;
    assistsPerMatch: string;
    rating: string;
    passSuccess: string;
    shotSuccess: string;
    tackleSuccess: string;
    height: string;
    nationality: string;
    style: string;
    // New translations for modal
    games: string;
    score: string;
    victories: string;
    attack: string;
    defense: string;
    passes: string;
    performance: string;
    goals: string;
    shotsAccuracy: string;
    assists: string;
    assistsShort: string;
    contributions: string;
    contributionsPerMatch: string;
    tackles: string;
    tacklesPerMatch: string;
    tacklesAccuracy: string;
    cleanSheets: string;
    cleanSheetRate: string;
    redCards: string;
    passesMade: string;
    passAccuracy: string;
    avgRating: string;
    winRateLabel: string;
    manOfTheMatch: string;
    momRate: string;
    pressEscToClose: string;
  };

  // Match Details Modal
  matchDetails: {
    summary: string;
    players: string;
    ourTeam: string;
    opponent: string;
    shots: string;
    passes: string;
    passAccuracy: string;
    tacklesMade: string;
    tackleAccuracy: string;
    redCards: string;
    avgRating: string;
    victory: string;
    defeat: string;
    drawResult: string;
    // New translations for modal
    unknownTeam: string;
    passesAttempted: string;
    passesCompleted: string;
    tacklesAttempted: string;
    tacklesCompleted: string;
    playersCount: string;
    noPlayersFound: string;
    position: string;
    pressEscToClose: string;
  };

  // Compare Page
  compare: {
    title: string;
    comparison: string;
    playerA: string;
    playerB: string;
    selectPlayer: string;
    selectPlayerDropdown: string;
    selectPlayers: string;
    selectPlayersDescription: string;
    loadingPlayers: string;
    backToClub: string;
    noClubId: string;
    gamesPlayed: string;
    goals: string;
    goalsPerMatch: string;
    assists: string;
    assistsPerMatch: string;
    contributions: string;
    contributionsPerMatch: string;
    rating: string;
    winRate: string;
    manOfTheMatch: string;
  };

  // Errors
  errors: {
    clubNotFound: string;
    loadError: string;
    somethingWrong: string;
    tryAgain: string;
    pageNotFound: string;
    pageNotFoundDescription: string;
    unexpectedError: string;
    unexpectedErrorDescription: string;
    backToSearch: string;
    errorDetails: string;
  };
}

// ============================================
// TRANSLATIONS
// ============================================

const translations: Record<Language, Translations> = {
  pt: {
    common: {
      back: 'Voltar',
      close: 'Fechar',
      loading: 'Carregando...',
      error: 'Erro',
      noResults: 'Nenhum resultado encontrado',
      search: 'Buscar',
    },
    nav: {
      backToSearch: 'Voltar para busca',
    },
    header: {
      matches: 'Partidas',
      goals: 'Gols',
      goalDiff: 'Saldo',
      cleanSheets: 'Clean Sheets',
      matchHistory: 'Histórico de Partidas',
      wins: 'Vitórias',
      draws: 'Empates',
      losses: 'Derrotas',
      winRate: 'Win Rate',
      recentForm: 'Forma Recente',
      points: 'pts',
    },
    roster: {
      title: 'Elenco',
      players: 'jogadores',
      player: 'Jogador',
      filterAll: 'Geral',
      filterAttack: 'Ataque',
      filterDefense: 'Defesa',
      compare: 'Comparar',
      position: 'Pos',
      overall: 'OVR',
      gamesPlayed: 'Jogos',
      goalsShort: 'Gols',
      assists: 'Assist',
      rating: 'Nota',
      mom: 'MOM',
      momRate: 'MOM%',
      winRateShort: '%V',
      goalsPerMatch: 'Gols/J',
      assistsPerMatch: 'Ass/J',
      contributions: 'G+A',
      contributionsPerMatch: 'G+A/J',
      shotSuccess: '%Chute',
      tackles: 'Desarmes',
      tacklesPerMatch: 'Des/J',
      tackleSuccess: '%Desarme',
      redCards: 'Verm',
      redCardsPerMatch: 'Verm/J',
      cleanSheetsShort: 'SG',
      cleanSheetRate: '%SG',
      legend: 'Posições:',
      legendPositions: 'Posições',
      legendMom: 'MOM = Melhor em Campo',
      legendCs: 'SG = Sem Gols',
      legendPerMatch: '/J = Por Jogo',
    },
    positions: {
      goalkeeper: 'Goleiro',
      defender: 'Defensor',
      midfielder: 'Meio-campista',
      forward: 'Atacante',
      gol: 'GOL',
      def: 'DEF',
      mid: 'MEI',
      att: 'ATA',
    },
    matches: {
      title: 'Partidas',
      recentMatches: 'Partidas Recentes',
      all: 'Todos',
      league: 'Liga',
      playoff: 'Playoff',
      friendly: 'Amistoso',
      win: 'Vitória',
      draw: 'Empate',
      loss: 'Derrota',
      vs: 'vs',
      ago: 'Há',
      details: 'Detalhes',
      noMatches: 'Nenhuma partida encontrada.',
      unknownOpponent: 'Adversário Desconhecido',
      goals: 'Gols',
      assistsLabel: 'Assists',
      results: 'Resultados',
      types: 'Tipo',
      noFilterResults: 'Nenhuma partida deste tipo encontrada recentemente.',
      matchesCount: 'partidas',
    },
    time: {
      seconds: 'segundos',
      minutes: 'minutos',
      hours: 'horas',
      days: 'dias',
      weeks: 'semanas',
      months: 'meses',
      years: 'anos',
    },
    trophies: {
      title: 'Sala de Troféus',
      subtitle: 'Histórico de conquistas em playoffs',
      champion: 'Campeão',
      runnerUp: 'Vice-Campeão',
      thirdPlace: '3º Lugar',
      place: 'º Lugar',
      season: 'Temporada',
      division: 'Divisão',
      titles: 'título',
      medals: 'medalha',
      participations: 'participação',
      viewTrophies: 'Ver Sala de Troféus',
      close: 'Fechar',
    },
    search: {
      title: 'Clubs Tracker',
      subtitle: 'Acompanhe as estatísticas do seu clube no EA Sports FC Pro Clubs',
      placeholder: 'Ex: Fera Enjaulada',
      button: 'Buscar Clube',
      searching: 'Buscando...',
      platform: 'Plataforma',
      favorites: 'Favoritos',
      noFavorites: 'Nenhum clube favoritado ainda.',
      clubName: 'Nome do Clube',
      results: 'Resultados',
      club: 'clube',
      clubs: 'clubes',
      division: 'Divisão',
      noResults: 'Nenhum resultado encontrado.',
      tryDifferent: 'Tente buscar com um nome diferente ou verifique a plataforma.',
      enterClubName: 'Digite o nome do clube',
      noClubsFound: 'Nenhum clube encontrado com esse nome.',
      apiData: 'Dados fornecidos pela API do EA Sports FC Clubs',
      myClubs: 'Meus Clubes',
      removeFromFavorites: 'Remover dos favoritos',
    },
    player: {
      profile: 'Perfil do Jogador',
      stats: 'Estatísticas',
      form: 'Forma',
      goalsPerMatch: 'Gols por Jogo',
      assistsPerMatch: 'Assistências por Jogo',
      rating: 'Nota Média',
      passSuccess: 'Precisão de Passes',
      shotSuccess: 'Precisão de Chutes',
      tackleSuccess: 'Precisão de Desarmes',
      height: 'Altura',
      nationality: 'Nacionalidade',
      style: 'Estilo',
      games: 'Jogos',
      score: 'Nota',
      victories: 'Vitórias',
      attack: 'Ataque',
      defense: 'Defesa',
      passes: 'Passes',
      performance: 'Performance',
      goals: 'Gols',
      shotsAccuracy: 'Precisão de Chutes',
      assists: 'Assistências',
      assistsShort: 'Assists por Jogo',
      contributions: 'G+A',
      contributionsPerMatch: '(G+A) por Jogo',
      tackles: 'Desarmes',
      tacklesPerMatch: 'Desarmes por Jogo',
      tacklesAccuracy: 'Precisão Desarmes',
      cleanSheets: 'Clean Sheets',
      cleanSheetRate: 'Taxa Clean Sheet',
      redCards: 'Cartões Vermelhos',
      passesMade: 'Passes Feitos',
      passAccuracy: 'Precisão de Passes',
      avgRating: 'Nota Média',
      winRateLabel: 'Taxa Win Rate',
      manOfTheMatch: 'Man of the Match',
      momRate: 'Taxa MOM',
      pressEscToClose: 'Pressione ESC ou clique fora para fechar',
    },
    matchDetails: {
      summary: 'Resumo',
      players: 'Jogadores',
      ourTeam: 'Nosso Time',
      opponent: 'Adversário',
      shots: 'Chutes',
      passes: 'Passes',
      passAccuracy: '% Passes',
      tacklesMade: 'Desarmes',
      tackleAccuracy: '% Desarmes',
      redCards: 'Cartões Vermelhos',
      avgRating: 'Rating Médio',
      victory: 'VITÓRIA',
      defeat: 'DERROTA',
      drawResult: 'EMPATE',
      unknownTeam: 'Time Desconhecido',
      passesAttempted: 'Passes Tentados',
      passesCompleted: 'Passes Certos',
      tacklesAttempted: 'Desarmes Tentados',
      tacklesCompleted: 'Desarmes Certos',
      playersCount: 'jogadores',
      noPlayersFound: 'Nenhum jogador encontrado',
      position: 'Posição',
      pressEscToClose: 'Pressione ESC ou clique fora para fechar',
    },
    compare: {
      title: 'Comparação de Jogadores',
      comparison: 'Comparação',
      playerA: 'Jogador A',
      playerB: 'Jogador B',
      selectPlayer: 'Selecione um jogador',
      selectPlayerDropdown: 'Selecionar jogador...',
      selectPlayers: 'Selecione os Jogadores',
      selectPlayersDescription: 'Escolha dois jogadores nos menus acima para comparar suas estatísticas lado a lado.',
      loadingPlayers: 'Carregando jogadores...',
      backToClub: 'Voltar para o clube',
      noClubId: 'ID do clube não fornecido. Volte para a página do clube e acesse a comparação por lá.',
      gamesPlayed: 'Partidas',
      goals: 'Gols',
      goalsPerMatch: 'Gols/Partida',
      assists: 'Assistências',
      assistsPerMatch: 'Assist./Partida',
      contributions: 'Contribuições',
      contributionsPerMatch: 'Contr./Partida',
      rating: 'Nota Média',
      winRate: 'Taxa de Vitória',
      manOfTheMatch: 'Craque do Jogo',
    },
    errors: {
      clubNotFound: 'Clube não encontrado.',
      loadError: 'Erro ao carregar dados.',
      somethingWrong: 'Ops! Algo deu errado',
      tryAgain: 'Tentar Novamente',
      pageNotFound: 'Página não encontrada',
      pageNotFoundDescription: 'A página que você está procurando não existe ou foi movida. Pode ser que o clube não exista ou a API esteja indisponível.',
      unexpectedError: 'Ops! Algo deu errado',
      unexpectedErrorDescription: 'Ocorreu um erro inesperado. Isso pode acontecer quando a API do EA Sports está fora do ar ou há problemas de conexão.',
      backToSearch: 'Voltar para a Busca',
      errorDetails: 'Detalhes do erro (desenvolvimento)',
    },
  },
  en: {
    common: {
      back: 'Back',
      close: 'Close',
      loading: 'Loading...',
      error: 'Error',
      noResults: 'No results found',
      search: 'Search',
    },
    nav: {
      backToSearch: 'Back to search',
    },
    header: {
      matches: 'Matches',
      goals: 'Goals',
      goalDiff: 'GD',
      cleanSheets: 'Clean Sheets',
      matchHistory: 'Match History',
      wins: 'Wins',
      draws: 'Draws',
      losses: 'Losses',
      winRate: 'Win Rate',
      recentForm: 'Recent Form',
      points: 'pts',
    },
    roster: {
      title: 'Squad',
      players: 'players',
      player: 'Player',
      filterAll: 'All',
      filterAttack: 'Attack',
      filterDefense: 'Defense',
      compare: 'Compare',
      position: 'Pos',
      overall: 'OVR',
      gamesPlayed: 'Games',
      goalsShort: 'Goals',
      assists: 'Assists',
      rating: 'Rating',
      mom: 'MOTM',
      momRate: 'MOTM%',
      winRateShort: 'W%',
      goalsPerMatch: 'G/M',
      assistsPerMatch: 'A/M',
      contributions: 'G+A',
      contributionsPerMatch: 'G+A/M',
      shotSuccess: 'Shot%',
      tackles: 'Tackles',
      tacklesPerMatch: 'T/M',
      tackleSuccess: 'Tackle%',
      redCards: 'Red',
      redCardsPerMatch: 'Red/M',
      cleanSheetsShort: 'CS',
      cleanSheetRate: 'CS%',
      legend: 'Positions:',
      legendPositions: 'Positions',
      legendMom: 'MOTM = Man of the Match',
      legendCs: 'CS = Clean Sheet',
      legendPerMatch: '/M = Per Match',
    },
    positions: {
      goalkeeper: 'Goalkeeper',
      defender: 'Defender',
      midfielder: 'Midfielder',
      forward: 'Forward',
      gol: 'GK',
      def: 'DEF',
      mid: 'MID',
      att: 'FWD',
    },
    matches: {
      title: 'Matches',
      recentMatches: 'Recent Matches',
      all: 'All',
      league: 'League',
      playoff: 'Playoff',
      friendly: 'Friendly',
      win: 'Win',
      draw: 'Draw',
      loss: 'Loss',
      vs: 'vs',
      ago: '',
      details: 'Details',
      noMatches: 'No matches found.',
      unknownOpponent: 'Unknown Opponent',
      goals: 'Goals',
      assistsLabel: 'Assists',
      results: 'Results',
      types: 'Type',
      noFilterResults: 'No matches of this type found recently.',
      matchesCount: 'matches',
    },
    time: {
      seconds: 'seconds',
      minutes: 'minutes',
      hours: 'hours',
      days: 'days',
      weeks: 'weeks',
      months: 'months',
      years: 'years',
    },
    trophies: {
      title: 'Trophy Room',
      subtitle: 'Playoff achievements history',
      champion: 'Champion',
      runnerUp: 'Runner-up',
      thirdPlace: '3rd Place',
      place: 'th Place',
      season: 'Season',
      division: 'Division',
      titles: 'title',
      medals: 'medal',
      participations: 'participation',
      viewTrophies: 'View Trophy Room',
      close: 'Close',
    },
    search: {
      title: 'Clubs Tracker',
      subtitle: 'Track your EA Sports FC Pro Clubs statistics',
      placeholder: 'e.g., Fera Enjaulada',
      button: 'Search Club',
      searching: 'Searching...',
      platform: 'Platform',
      favorites: 'Favorites',
      noFavorites: 'No favorite clubs yet.',
      clubName: 'Club Name',
      results: 'Results',
      club: 'club',
      clubs: 'clubs',
      division: 'Division',
      noResults: 'No results found.',
      tryDifferent: 'Try searching with a different name or check the platform.',
      enterClubName: 'Enter club name',
      noClubsFound: 'No clubs found with that name.',
      apiData: 'Data provided by EA Sports FC Clubs API',
      myClubs: 'My Clubs',
      removeFromFavorites: 'Remove from favorites',
    },
    player: {
      profile: 'Player Profile',
      stats: 'Statistics',
      form: 'Form',
      goalsPerMatch: 'Goals per Match',
      assistsPerMatch: 'Assists per Match',
      rating: 'Average Rating',
      passSuccess: 'Pass Accuracy',
      shotSuccess: 'Shot Accuracy',
      tackleSuccess: 'Tackle Accuracy',
      height: 'Height',
      nationality: 'Nationality',
      style: 'Style',
      games: 'Games',
      score: 'Rating',
      victories: 'Wins',
      attack: 'Attack',
      defense: 'Defense',
      passes: 'Passes',
      performance: 'Performance',
      goals: 'Goals',
      shotsAccuracy: 'Shot Accuracy',
      assists: 'Assists',
      assistsShort: 'Assists per Match',
      contributions: 'G+A',
      contributionsPerMatch: '(G+A) per Match',
      tackles: 'Tackles',
      tacklesPerMatch: 'Tackles per Match',
      tacklesAccuracy: 'Tackle Accuracy',
      cleanSheets: 'Clean Sheets',
      cleanSheetRate: 'Clean Sheet Rate',
      redCards: 'Red Cards',
      passesMade: 'Passes Made',
      passAccuracy: 'Pass Accuracy',
      avgRating: 'Avg Rating',
      winRateLabel: 'Win Rate',
      manOfTheMatch: 'Man of the Match',
      momRate: 'MOM Rate',
      pressEscToClose: 'Press ESC or click outside to close',
    },
    matchDetails: {
      summary: 'Summary',
      players: 'Players',
      ourTeam: 'Our Team',
      opponent: 'Opponent',
      shots: 'Shots',
      passes: 'Passes',
      passAccuracy: 'Pass %',
      tacklesMade: 'Tackles',
      tackleAccuracy: 'Tackle %',
      redCards: 'Red Cards',
      avgRating: 'Avg Rating',
      victory: 'VICTORY',
      defeat: 'DEFEAT',
      drawResult: 'DRAW',
      unknownTeam: 'Unknown Team',
      passesAttempted: 'Passes Attempted',
      passesCompleted: 'Passes Completed',
      tacklesAttempted: 'Tackles Attempted',
      tacklesCompleted: 'Tackles Completed',
      playersCount: 'players',
      noPlayersFound: 'No players found',
      position: 'Position',
      pressEscToClose: 'Press ESC or click outside to close',
    },
    compare: {
      title: 'Player Comparison',
      comparison: 'Comparison',
      playerA: 'Player A',
      playerB: 'Player B',
      selectPlayer: 'Select a player',
      selectPlayerDropdown: 'Select player...',
      selectPlayers: 'Select Players',
      selectPlayersDescription: 'Choose two players from the menus above to compare their stats side by side.',
      loadingPlayers: 'Loading players...',
      backToClub: 'Back to club',
      noClubId: 'Club ID not provided. Go back to the club page and access comparison from there.',
      gamesPlayed: 'Matches',
      goals: 'Goals',
      goalsPerMatch: 'Goals/Match',
      assists: 'Assists',
      assistsPerMatch: 'Assists/Match',
      contributions: 'Contributions',
      contributionsPerMatch: 'Contrib./Match',
      rating: 'Avg Rating',
      winRate: 'Win Rate',
      manOfTheMatch: 'Man of the Match',
    },
    errors: {
      clubNotFound: 'Club not found.',
      loadError: 'Error loading data.',
      somethingWrong: 'Oops! Something went wrong',
      tryAgain: 'Try Again',
      pageNotFound: 'Page not found',
      pageNotFoundDescription: 'The page you are looking for does not exist or has been moved. The club may not exist or the API may be unavailable.',
      unexpectedError: 'Oops! Something went wrong',
      unexpectedErrorDescription: 'An unexpected error occurred. This can happen when the EA Sports API is down or there are connection issues.',
      backToSearch: 'Back to Search',
      errorDetails: 'Error details (development)',
    },
  },
};

// ============================================
// CONTEXT
// ============================================

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'clubs-tracker-language';

// ============================================
// EXTERNAL STORE FOR LANGUAGE
// ============================================

let currentLanguage: Language = 'pt';
const listeners = new Set<() => void>();

function getSnapshot(): Language {
  return currentLanguage;
}

function getServerSnapshot(): Language {
  return 'pt';
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setLanguageStore(lang: Language) {
  currentLanguage = lang;
  listeners.forEach((listener) => listener());
}

// Initialize from localStorage (client-side only)
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'pt' || stored === 'en') {
    currentLanguage = stored;
  } else {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) {
      currentLanguage = 'en';
    }
  }
}

// ============================================
// PROVIDER
// ============================================

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageStore(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Pluralize a word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

/**
 * Format time ago string
 */
export function formatTimeAgo(
  number: number,
  unit: string,
  t: Translations
): string {
  const unitMap: Record<string, keyof Translations['time']> = {
    seconds: 'seconds',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    weeks: 'weeks',
    months: 'months',
    years: 'years',
  };

  const translatedUnit = t.time[unitMap[unit] || 'days'];
  const prefix = t.matches.ago;

  // For English, format is "X days ago"
  if (!prefix) {
    return `${number} ${translatedUnit} ago`;
  }

  // For Portuguese, format is "Há X dias"
  return `${prefix} ${number} ${translatedUnit}`;
}

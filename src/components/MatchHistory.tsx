import type { Match, MatchPlayerData, MatchCategory } from '@/types/clubs-api';

// ============================================
// TYPES
// ============================================

interface MatchHistoryProps {
  matches: Match[];
  clubId: string;
}

type MatchResult = 'win' | 'draw' | 'loss';

interface ProcessedMatch {
  matchId: string;
  timestamp: number;
  timeAgo: string;
  result: MatchResult;
  ourGoals: number;
  theirGoals: number;
  opponentName: string;
  opponentId: string;
  scorers: string[];
  assisters: string[];
  category: MatchCategory;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Formata o tempo decorrido de forma amigável
 */
function formatTimeAgo(timeAgo: { number: number; unit: string }): string {
  const { number, unit } = timeAgo;

  const unitMap: Record<string, { singular: string; plural: string }> = {
    seconds: { singular: 'segundo', plural: 'segundos' },
    minutes: { singular: 'minuto', plural: 'minutos' },
    hours: { singular: 'hora', plural: 'horas' },
    days: { singular: 'dia', plural: 'dias' },
    weeks: { singular: 'semana', plural: 'semanas' },
    months: { singular: 'mês', plural: 'meses' },
    years: { singular: 'ano', plural: 'anos' },
  };

  const unitText = unitMap[unit] || { singular: unit, plural: unit };
  const label = number === 1 ? unitText.singular : unitText.plural;

  return `Há ${number} ${label}`;
}

/**
 * Determina o resultado da partida para o clube especificado
 */
function getMatchResult(ourGoals: number, theirGoals: number): MatchResult {
  if (ourGoals > theirGoals) return 'win';
  if (ourGoals < theirGoals) return 'loss';
  return 'draw';
}

/**
 * Retorna estilos baseados no resultado
 */
function getResultStyles(result: MatchResult): {
  bgColor: string;
  borderColor: string;
  textColor: string;
  label: string;
  icon: string;
} {
  const styles: Record<MatchResult, ReturnType<typeof getResultStyles>> = {
    win: {
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      label: 'Vitória',
      icon: 'V',
    },
    draw: {
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/30',
      textColor: 'text-gray-400',
      label: 'Empate',
      icon: 'E',
    },
    loss: {
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      label: 'Derrota',
      icon: 'D',
    },
  };

  return styles[result];
}

/**
 * Retorna estilos e informações do badge de categoria
 */
function getCategoryBadge(category: MatchCategory): {
  label: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
} {
  switch (category) {
    case 'playoff':
      return {
        label: 'Playoff',
        bgColor: 'bg-orange-500/20',
        textColor: 'text-orange-400',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    case 'friendly':
      return {
        label: 'Amistoso',
        bgColor: 'bg-gray-500/20',
        textColor: 'text-gray-400',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
            />
          </svg>
        ),
      };
    case 'league':
    default:
      return {
        label: 'Liga',
        bgColor: 'bg-cyan-500/20',
        textColor: 'text-cyan-400',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z"
              clipRule="evenodd"
            />
            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
          </svg>
        ),
      };
  }
}

/**
 * Extrai os goleadores do nosso time
 */
function getScorers(players: Record<string, MatchPlayerData>): string[] {
  const scorers: string[] = [];

  Object.values(players).forEach((player) => {
    const goals = parseInt(player.goals, 10) || 0;
    if (goals > 0) {
      const goalText = goals > 1 ? `${player.playername} (${goals})` : player.playername;
      scorers.push(goalText);
    }
  });

  return scorers;
}

/**
 * Extrai os assistentes do nosso time
 */
function getAssisters(players: Record<string, MatchPlayerData>): string[] {
  const assisters: string[] = [];

  Object.values(players).forEach((player) => {
    const assists = parseInt(player.assists, 10) || 0;
    if (assists > 0) {
      const assistText = assists > 1 ? `${player.playername} (${assists})` : player.playername;
      assisters.push(assistText);
    }
  });

  return assisters;
}

/**
 * Processa os dados da partida para exibição
 */
function processMatches(matches: Match[], clubId: string): ProcessedMatch[] {
  return matches.map((match) => {
    const clubIds = Object.keys(match.clubs);
    const opponentId = clubIds.find((id) => id !== clubId) || clubIds[0];

    const ourClubData = match.clubs[clubId];
    const opponentClubData = match.clubs[opponentId];

    const ourGoals = parseInt(ourClubData?.goals || '0', 10);
    const theirGoals = parseInt(opponentClubData?.goals || '0', 10);

    const ourPlayers = match.players[clubId] || {};

    return {
      matchId: match.matchId,
      timestamp: match.timestamp,
      timeAgo: formatTimeAgo(match.timeAgo),
      result: getMatchResult(ourGoals, theirGoals),
      ourGoals,
      theirGoals,
      opponentName: opponentClubData?.details?.name || 'Adversário Desconhecido',
      opponentId,
      scorers: getScorers(ourPlayers),
      assisters: getAssisters(ourPlayers),
      category: match.matchCategory || 'league',
    };
  });
}

// ============================================
// COMPONENT
// ============================================

export function MatchHistory({ matches, clubId }: MatchHistoryProps) {
  const processedMatches = processMatches(matches, clubId);

  if (processedMatches.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-800/50 border border-gray-700/50 p-8 text-center">
        <p className="text-gray-400">Nenhuma partida encontrada.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 border border-gray-700/50 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/50">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <svg
            className="w-6 h-6 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Partidas Recentes
          <span className="text-sm font-normal text-gray-400">
            ({processedMatches.length} partidas)
          </span>
        </h2>
      </div>

      {/* Match List */}
      <div className="divide-y divide-gray-700/30">
        {processedMatches.map((match) => {
          const resultStyles = getResultStyles(match.result);
          const categoryBadge = getCategoryBadge(match.category);

          return (
            <div
              key={match.matchId}
              className={`p-4 md:p-5 ${resultStyles.bgColor} hover:bg-gray-700/20 transition-colors`}
            >
              <div className="flex items-center gap-4">
                {/* Result Badge */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl ${resultStyles.bgColor} border ${resultStyles.borderColor} flex items-center justify-center`}
                >
                  <span className={`text-xl font-black ${resultStyles.textColor}`}>
                    {resultStyles.icon}
                  </span>
                </div>

                {/* Match Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    {/* Score and Opponent */}
                    <div className="flex items-center gap-3">
                      {/* Score */}
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-black ${resultStyles.textColor}`}>
                          {match.ourGoals}
                        </span>
                        <span className="text-gray-500 text-lg">-</span>
                        <span className="text-2xl font-black text-gray-400">
                          {match.theirGoals}
                        </span>
                      </div>

                      {/* VS Opponent */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">vs</span>
                        <span className="font-semibold text-white truncate max-w-[150px] sm:max-w-[200px]">
                          {match.opponentName}
                        </span>
                      </div>

                      {/* Category Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryBadge.bgColor} ${categoryBadge.textColor}`}
                        title={categoryBadge.label}
                      >
                        {categoryBadge.icon}
                        <span className="hidden sm:inline">{categoryBadge.label}</span>
                      </span>
                    </div>

                    {/* Time Ago */}
                    <span className="text-sm text-gray-500 flex-shrink-0">
                      {match.timeAgo}
                    </span>
                  </div>

                  {/* Scorers */}
                  {match.scorers.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-gray-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <circle cx="10" cy="10" r="8" />
                      </svg>
                      <span className="text-gray-400">
                        <span className="text-gray-500">Gols: </span>
                        {match.scorers.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Assisters */}
                  {match.assisters.length > 0 && (
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-gray-500 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      <span className="text-gray-400">
                        <span className="text-gray-500">Assists: </span>
                        {match.assisters.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Legend */}
      <div className="px-6 py-3 border-t border-gray-700/50 bg-gray-800/30">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="font-medium text-gray-400">Resultados:</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Vitória
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span> Empate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400"></span> Derrota
          </span>
          <span className="mx-2 text-gray-600">|</span>
          <span className="font-medium text-gray-400">Tipo:</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Liga
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span> Playoff
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-500"></span> Amistoso
          </span>
        </div>
      </div>
    </div>
  );
}

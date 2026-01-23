import type { Match, MatchPlayerData } from '@/types/clubs-api';

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
        </div>
      </div>
    </div>
  );
}

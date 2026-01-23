import type { MemberStats, FavoritePosition } from '@/types/clubs-api';

// ============================================
// TYPES
// ============================================

interface ClubRosterProps {
  members: MemberStats[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Retorna o ícone e cor da posição
 */
function getPositionStyle(position: FavoritePosition): {
  label: string;
  abbr: string;
  bgColor: string;
  textColor: string;
} {
  const styles: Record<FavoritePosition, { label: string; abbr: string; bgColor: string; textColor: string }> = {
    goalkeeper: {
      label: 'Goleiro',
      abbr: 'GOL',
      bgColor: 'bg-amber-500/20',
      textColor: 'text-amber-400',
    },
    defender: {
      label: 'Defensor',
      abbr: 'DEF',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400',
    },
    midfielder: {
      label: 'Meio-Campo',
      abbr: 'MEI',
      bgColor: 'bg-emerald-500/20',
      textColor: 'text-emerald-400',
    },
    forward: {
      label: 'Atacante',
      abbr: 'ATA',
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-400',
    },
  };

  return styles[position];
}

/**
 * Retorna a cor do rating baseado no valor
 */
function getRatingColor(rating: number): string {
  if (rating >= 8.0) return 'text-emerald-400';
  if (rating >= 7.0) return 'text-yellow-400';
  if (rating >= 6.0) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Ordena membros por gols (decrescente)
 */
function sortMembersByGoals(members: MemberStats[]): MemberStats[] {
  return [...members].sort((a, b) => {
    const goalsA = parseInt(a.goals, 10) || 0;
    const goalsB = parseInt(b.goals, 10) || 0;
    return goalsB - goalsA;
  });
}

// ============================================
// COMPONENT
// ============================================

export function ClubRoster({ members }: ClubRosterProps) {
  const sortedMembers = sortMembersByGoals(members);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 border border-gray-700/50 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/50">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <svg
            className="w-6 h-6 text-cyan-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Elenco
          <span className="text-sm font-normal text-gray-400">
            ({members.length} jogadores)
          </span>
        </h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800/30 text-left">
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Jogador
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
                Pos
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
                OVR
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
                Jogos
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
                Gols
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
                Assists
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
                Rating
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
                MoM
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/30">
            {sortedMembers.map((member, index) => {
              const positionStyle = getPositionStyle(member.favoritePosition);
              const rating = parseFloat(member.ratingAve) || 0;
              const ratingColor = getRatingColor(rating);
              const overall = parseInt(member.proOverall, 10) || 0;

              return (
                <tr
                  key={member.name}
                  className="hover:bg-gray-700/20 transition-colors"
                >
                  {/* Player Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Rank Number */}
                      <span className="w-6 text-center text-sm font-medium text-gray-500">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-white">
                          {member.proName || member.name}
                        </p>
                        <p className="text-xs text-gray-500">{member.name}</p>
                      </div>
                    </div>
                  </td>

                  {/* Position */}
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${positionStyle.bgColor} ${positionStyle.textColor}`}
                    >
                      {positionStyle.abbr}
                    </span>
                  </td>

                  {/* Overall */}
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-black ${overall >= 85
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : overall >= 80
                            ? 'bg-green-500/20 text-green-400'
                            : overall >= 75
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                        }`}
                    >
                      {overall}
                    </span>
                  </td>

                  {/* Games */}
                  <td className="px-4 py-4 text-center">
                    <span className="text-white font-medium">
                      {member.gamesPlayed}
                    </span>
                  </td>

                  {/* Goals */}
                  <td className="px-4 py-4 text-center">
                    <span className="text-white font-bold">{member.goals}</span>
                  </td>

                  {/* Assists */}
                  <td className="px-4 py-4 text-center">
                    <span className="text-gray-300">{member.assists}</span>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-4 text-center">
                    <span className={`font-bold ${ratingColor}`}>
                      {rating.toFixed(1)}
                    </span>
                  </td>

                  {/* Man of the Match */}
                  <td className="px-4 py-4 text-center">
                    <span className="text-amber-400 font-medium">
                      {member.manOfTheMatch}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with legend */}
      <div className="px-6 py-3 border-t border-gray-700/50 bg-gray-800/30">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="font-medium text-gray-400">Posições:</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> GOL
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span> DEF
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> MEI
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400"></span> ATA
          </span>
          <span className="ml-auto text-gray-500">
            MoM = Man of the Match
          </span>
        </div>
      </div>
    </div>
  );
}

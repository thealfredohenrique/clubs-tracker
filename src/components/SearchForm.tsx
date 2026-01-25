'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { searchClubByName } from '@/lib/api-client';
import type { ClubSearchResult, Platform } from '@/types/clubs-api';
import { useTranslation } from '@/lib/i18n';
import { getClubLogoUrl } from '@/lib/ea-assets';

// ============================================
// CONSTANTS
// ============================================

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'common-gen5', label: 'PlayStation 5 / Xbox Series X|S / PC' },
  { value: 'common-gen4', label: 'PlayStation 4 / Xbox One' },
  { value: 'nx', label: 'Nintendo Switch' },
];

// ============================================
// COMPONENT
// ============================================

export function SearchForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const [clubName, setClubName] = useState('');
  const [platform, setPlatform] = useState<Platform>('common-gen5');
  const [results, setResults] = useState<ClubSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clubName.trim()) {
      setError(t.search.enterClubName);
      return;
    }

    setError(null);
    setHasSearched(true);
    setIsLoading(true);

    try {
      const result = await searchClubByName(platform, clubName.trim());

      if (result.success) {
        setResults(result.data);
        if (result.data.length === 0) {
          setError(t.search.noClubsFound);
        }
      } else {
        setError(result.error.message);
        setResults([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.loadError);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClub = (club: ClubSearchResult) => {
    const url = `/club/${club.clubId}`;
    router.push(url);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Club Name Input */}
        <div>
          <label
            htmlFor="clubName"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            {t.search.clubName}
          </label>
          <input
            type="text"
            id="clubName"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder={t.search.placeholder}
            className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-colors backdrop-blur-sm"
            disabled={isLoading}
          />
        </div>

        {/* Platform Select */}
        <div>
          <label
            htmlFor="platform"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            {t.search.platform}
          </label>
          <select
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-colors appearance-none cursor-pointer backdrop-blur-sm"
            disabled={isLoading}
          >
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value} className="bg-slate-800">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button - Refined gradient */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-6 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/30 ring-1 ring-white/10"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t.search.searching}
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {t.search.button}
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-center">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      {hasSearched && results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            {t.search.results} ({results.length} {results.length === 1 ? t.search.club : t.search.clubs})
          </h2>
          <div className="space-y-3">
            {results.map((club) => {
              const crestUrl = getClubLogoUrl(club.clubInfo);
              const wins = parseInt(club.wins, 10);
              const losses = parseInt(club.losses, 10);
              const ties = parseInt(club.ties, 10);

              return (
                <button
                  key={club.clubId}
                  onClick={() => handleSelectClub(club)}
                  className="w-full p-4 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-700/40 hover:border-emerald-500/30 rounded-xl transition-all duration-200 text-left group cursor-pointer backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    {/* Crest */}
                    <div className="flex-shrink-0 w-14 h-14 bg-slate-800/50 rounded-lg flex items-center justify-center overflow-hidden ring-1 ring-white/5">
                      {crestUrl ? (
                        <img
                          src={crestUrl}
                          alt={club.clubName}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-slate-500">
                          {club.clubName.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Club Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {club.clubName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 mt-1">
                        <span>{t.search.division} {club.currentDivision}</span>
                        <span className="text-emerald-400">{wins}V</span>
                        <span className="text-slate-400">{ties}E</span>
                        <span className="text-red-400">{losses}D</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 text-slate-500 group-hover:text-emerald-400 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results Hint */}
      {hasSearched && results.length === 0 && !error && (
        <div className="mt-6 p-6 bg-slate-900/40 border border-slate-700/40 rounded-xl text-center backdrop-blur-sm">
          <p className="text-slate-400">{t.search.noResults}</p>
          <p className="text-slate-500 text-sm mt-1">
            {t.search.tryDifferent}
          </p>
        </div>
      )}
    </div>
  );
}

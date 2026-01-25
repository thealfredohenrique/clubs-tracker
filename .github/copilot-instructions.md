# Clubs Tracker

Next.js 16 + React 19 app for EA Sports FC Pro Clubs statistics with i18n support (PT/EN).

## Critical: Client-Side API Only

**All EA API calls must run in the browser** via `src/lib/api-client.ts`. Server-side fetching causes IP blocks.

```
Browser → corsproxy.io → proclubs.ea.com/api/fc → JSON
```

## Key Files

- `src/lib/api-client.ts` - All EA endpoints using `fetchFromEA<T>()` → `ApiResult<T>`
- `src/lib/i18n.tsx` - Translation context with `useTranslation()` hook
- `src/types/clubs-api.ts` - Types mirroring EA API responses
- `docs/clubs-api.md` - EA API reference (endpoints, params, response shapes)

## Code Patterns

```typescript
// EA API returns strings - always parse
const gamesPlayed = parseInt(member.gamesPlayed, 10) || 0;

// Platform validation (used across pages)
function isValidPlatform(p: string | null): p is Platform {
  return p === 'common-gen5' || p === 'common-gen4' || p === 'nx';
}

// Components use section comments
// ============================================
// TYPES / CONSTANTS / HELPER FUNCTIONS / COMPONENT
// ============================================
```

## Conventions

- **Imports**: Barrel exports `import { X, Y } from '@/components'`
- **Client components**: Mark with `'use client'` when using hooks/state
- **Styling**: Tailwind CSS 4, dark theme (gray-950), emerald/cyan accents
- **Storage**: Favorites in localStorage key `proclubs-favorites`

## Adding Features

**New API endpoint**: Add types in `clubs-api.ts` → Add function in `api-client.ts` using `fetchFromEA<T>()`

**New component**: Create in `src/components/` → Export via `index.ts`

## Commands

```bash
npm run dev    # Development server
npm run build  # Production build
npm run lint   # ESLint
```

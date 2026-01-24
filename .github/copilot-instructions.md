# Clubs Tracker - AI Agent Instructions

## Project Overview

Next.js 16 app for tracking EA Sports FC Pro Clubs statistics. Fetches data from EA's unofficial API via CORS proxy (client-side only to avoid IP blocks from Vercel/Cloudflare).

## Architecture

### Data Flow
```
Browser → corsproxy.io → proclubs.ea.com/api/fc → JSON responses
```

**Critical**: All EA API calls run client-side via `src/lib/api-client.ts`. Server-side fetching causes IP blocks from EA.

### Key Directories
- `src/lib/api-client.ts` - Single API client with all EA endpoints, uses `ApiResult<T>` pattern
- `src/types/clubs-api.ts` - Complete TypeScript types mirroring EA API responses
- `src/components/` - React components with barrel export via `index.ts`
- `src/hooks/` - Custom hooks (e.g., `useFavorites` for localStorage persistence)
- `docs/clubs-api.md` - EA API documentation (Portuguese) - reference for endpoint params

### Pages Structure
- `/` - Homepage with search form and favorites
- `/club/[clubId]?platform=X&name=Y` - Club detail page
- `/compare?...` - Player comparison page
- `/debug` - Debug page

## Code Conventions

### TypeScript Patterns
```typescript
// API responses use string numbers - always parse
const gamesPlayed = parseInt(member.gamesPlayed, 10) || 0;
const ratingAve = parseFloat(member.ratingAve) || 0;

// Use ApiResult<T> pattern for API calls
type ApiResult<T> = { success: true; data: T } | { success: false; error: ApiError };

// Platform type is strictly typed
type Platform = 'common-gen5' | 'common-gen4' | 'nx';
```

### Component Structure
Components follow this pattern with clear sections:
```typescript
// ============================================
// TYPES
// ============================================

// ============================================
// CONSTANTS  
// ============================================

// ============================================
// HELPER FUNCTIONS
// ============================================

// ============================================
// COMPONENT
// ============================================
```

### Imports
- Use barrel exports: `import { SearchForm, FavoritesList } from '@/components';`
- Types use `@/types/clubs-api` or `@/types`
- API functions from `@/lib/api-client`

### Styling
- Tailwind CSS 4 with dark theme (gray-950 base)
- Emerald/cyan gradient accent colors
- Use responsive classes: `text-4xl md:text-5xl`

## Common Tasks

### Adding a New API Endpoint
1. Add types to `src/types/clubs-api.ts`
2. Add function to `src/lib/api-client.ts` using `fetchFromEA<T>()`
3. Export from the respective index files

### Adding a New Component
1. Create component in `src/components/`
2. Export via `src/components/index.ts`
3. Mark as `'use client'` if using hooks/state

### Crest Images
```typescript
const CREST_BASE_URL = 'https://eafc24.content.easports.com/fifa/fltOnlineAssets/24B23FDE-7835-41C2-87A2-F453DFDB2E82/2024/fcweb/crests/256x256/l';
const crestUrl = `${CREST_BASE_URL}${crestAssetId}.png`;
```

## Commands
```bash
npm run dev   # Start dev server
npm run build # Production build
npm run lint  # ESLint check
```

## Important Notes
- UI text is in Portuguese (Brazilian)
- EA API returns most numeric values as strings - always parse
- Platform validation helper: `isValidPlatform()` pattern used across pages
- Favorites stored in localStorage with key `proclubs-favorites`

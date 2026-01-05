# DriftLog - AI Coding Agent Instructions

## Project Overview
DriftLog is an **offline-first workout logging app** for endurance athletes built with Expo (SDK 54) + React Native 0.81.5. The app emphasizes minimal interaction, one-tap logging, and local-only data with no accounts or tracking.

## Tech Stack & Configuration

### Core Dependencies
- **Routing**: Expo Router v6 (file-based, tabs in `app/(tabs)/`)
- **Styling**: NativeWind v5 (Tailwind CSS v4) with custom design tokens in `global.css`
- **State**: Zustand v5 stores with persist middleware (AsyncStorage)
- **Database**: Expo SQLite + Drizzle ORM with full type safety
- **Tooling**: Biome for linting/formatting, TypeScript with strict mode

### Path Aliases (tsconfig.json)
Always use path aliases for imports:
```typescript
import { useSessionStore } from "@/features/session";
import { db } from "@/core/db";
import { Button } from "@/components/ui/Button";
```

## Architecture Patterns

### Feature-Based Modules
Each feature (`src/features/`) is self-contained with `store.ts`, `types.ts`, `index.ts`:
- **Session** - Active workout state (in-memory until session ends, then persist)
- **Planning** - Weekly intent (loads current week from DB, caches in memory)
- **History** - Past sessions (queries on demand, no caching)
- **Settings** - App preferences (persisted via Zustand middleware)

**Critical**: Session store keeps exercises/sets in memory during active session. Only writes to DB on `endSession()`. See [src/features/session/store.ts](../src/features/session/store.ts).

### Database Schema (Drizzle)
Schema defined in [src/core/db/schema.ts](../src/core/db/schema.ts) with relations:
- `sessions` → `exercises` (one-to-many)
- `exercises` → `sets` (one-to-many)  
- `sessions` → `plans` (optional link)
- `sessions` → `reflections` (one-to-one)

**When modifying schema**: Run `pnpm db:generate` to create migration, then restart app.

### Styling with NativeWind v5

**Theme System**: Dual light/dark mode with custom tokens in `global.css`:
```tsx
// Use semantic theme classes (auto dark mode support)
<View className="bg-light-surface dark:bg-dark-surface">
  <Text className="text-light-text-primary dark:text-dark-text-primary">
    Content
  </Text>
</View>

// Primary brand color
<Button className="bg-primary-500 dark:bg-dark-primary" />
```

**Design Tokens**:
- Backgrounds: `light-bg-primary`, `dark-bg-primary`, etc.
- Text: `light-text-primary`, `dark-text-primary`, etc.
- Borders: `light-border-light`, `dark-border-medium`
- Primary: `primary-500` (light) / `dark-primary` (dark)

See [docs/development/styling.md](../docs/development/styling.md) for complete color system.

## Development Workflows

### Running the App
```bash
pnpm start         # Expo dev server (use 'i' for iOS, 'a' for Android)
pnpm ios           # iOS Simulator directly
pnpm android       # Android Emulator directly
```

### Code Quality
```bash
pnpm typecheck     # TypeScript (run before commits)
pnpm lint          # Biome check
pnpm lint:fix      # Auto-fix Biome issues
pnpm format        # Format code with Biome
```

### Database Operations
```bash
pnpm db:generate   # Generate migration after schema changes
pnpm db:studio     # Open Drizzle Studio (DB browser)
```

**Important**: App auto-runs migrations on startup. Database file location: device-specific SQLite storage.

## Project-Specific Conventions

### Component Structure
Base UI components in `src/components/ui/` must:
1. Support both light/dark mode with `dark:` variants
2. Accept `className` prop for customization
3. Use semantic design tokens (not raw colors)

Example: [src/components/ui/Button.tsx](../src/components/ui/Button.tsx)

### Store Patterns (Zustand)
Stores expose state + actions at top level (no nested objects):
```typescript
export const useSessionStore = create<SessionStore>((set, get) => ({
  // State
  isSessionActive: false,
  currentExercises: [],
  
  // Actions
  startSession: async () => { /* ... */ },
  addExercise: (name: string) => { /* ... */ },
}));
```

**Never** store derived state. Use direct DB queries in components when needed.

### Helper Utilities
Common patterns in [src/core/utils/helpers.ts](../src/core/utils/helpers.ts):
- `generateId()` - ULID-based IDs for all entities
- `getTodayString()` - ISO date (YYYY-MM-DD) for `date` fields
- `getNowString()` - ISO datetime for timestamps

**Always** use these helpers for consistency.

### Offline-First Principles
1. **No network calls** - All data lives in local SQLite
2. **Instant interactions** - No loading spinners on core flows
3. **Accept messy data** - Partial logs are valid (e.g., reps without weight)
4. **Auto-save on session end** - In-memory during workout, persist on `endSession()`

## Common Tasks

### Adding a New Feature Module
1. Create folder in `src/features/<name>/`
2. Add `types.ts` (TypeScript interfaces)
3. Add `store.ts` (Zustand store following existing patterns)
4. Export from `index.ts`
5. Use path alias `@/features/<name>` in components

### Adding a DB Table
1. Define schema in [src/core/db/schema.ts](../src/core/db/schema.ts) with relations
2. Add types to [src/core/types/database.ts](../src/core/types/database.ts)
3. Run `pnpm db:generate`
4. Restart app to apply migration

### Creating a New Screen
1. Add route file in `app/(tabs)/` for tab screens
2. Use Expo Router conventions (file = route)
3. Wrap in `ScrollView` with bottom padding for tab bar clearance
4. Use `useTheme()` for StatusBar style

## Key Design Decisions

### Why In-Memory Session State?
During workouts, users log sets rapidly. Writing to DB on every set would be slow. Session store batches all writes to `endSession()` for performance.

### Why Zustand Over React Context?
Zustand provides simpler state management with built-in persistence middleware and better TypeScript inference than Context API.

### Why Drizzle Over Raw SQL?
Type-safe queries prevent runtime errors, and relations auto-join without manual SQL. Schema migrations are version-controlled.

### Why NativeWind Over StyleSheet?
Consistent styling language with web (Tailwind), built-in dark mode support, and smaller bundle size vs. component libraries.

## Known Constraints

- **React Native 0.81.5**: Pinned for Expo SDK 54 compatibility
- **lightningcss@1.30.1**: Pinned in pnpm overrides for NativeWind v5 stability
- **No Web Support**: App targets iOS/Android only (web compatibility not tested)
- **SQLite Limits**: Local-only data, no cloud sync (by design)

## Testing & Debugging

### Type Errors
Run `pnpm typecheck` - common issues:
- Missing path alias imports (use `@/` not relative paths)
- Zustand store actions not properly typed
- Drizzle schema changes without migration

### Metro Bundler Issues
Clear cache: `pnpm start --clear`

### Database Issues
1. Check [src/core/db/index.ts](../src/core/db/index.ts) initialization
2. Verify schema matches types in [src/core/types/database.ts](../src/core/types/database.ts)
3. Use `pnpm db:studio` to inspect data

## Next Implementation Phase

Current state: Core architecture complete, placeholder UIs in place.

**Priority tasks** (see [docs/development/QUICKSTART.md](../docs/development/QUICKSTART.md)):
1. Today screen - Session logging UI with exercise input + one-tap set logging
2. Plan screen - Weekly calendar view with day plan editor
3. History screen - Session list and detail views with reflections

**Principle**: Keep interactions minimal - large tap targets, auto-carry forward values, no forced fields.

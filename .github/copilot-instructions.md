# DriftLog - AI Coding Agent Instructions

## Project Overview
DriftLog is a **production-ready, offline-first workout logging app** for endurance athletes built with Expo (SDK 54) + React Native 0.81.5. The app emphasizes minimal interaction, one-tap logging, and local-only data with no accounts or tracking.

## Tech Stack & Configuration

### Core Dependencies
- **Routing**: Expo Router v6 (file-based, tabs in `app/(tabs)/`)
- **Styling**: NativeWind v5 Preview (5.0.0-preview.2) with Tailwind CSS v4 and custom design tokens in `global.css`
- **State**: Zustand v5 stores with persist middleware (AsyncStorage)
- **Database**: Expo SQLite + Drizzle ORM with full type safety
- **Lists**: FlashList for performant virtualized lists
- **Drag & Drop**: react-native-draggable-flatlist for reorderable exercises
- **Haptics**: expo-haptics for tactile feedback
- **Tooling**: Biome for linting/formatting, TypeScript with strict mode

### Path Aliases (tsconfig.json)
Always use path aliases for imports:
```typescript
import { useSessionStore } from "@/features/session";
import { useHistoryStore } from "@/features/history";
import { useRoutineStore } from "@/features/routines";
import { useSettingsStore } from "@/features/settings";
import { db, waitForDb } from "@/core/db";
import { Button, Card, BottomSheet } from "@/components/ui";
import { SessionCard, ReflectionSection } from "@/components/history";
import { ActiveSessionBanner, TimerPicker } from "@/components/session";
import { useTheme } from "@/core/contexts/ThemeContext";
import { Navigation } from "@/core/utils/navigation";
```

## Architecture Patterns

### Feature-Based Modules
Each feature (`src/features/`) is self-contained with `store.ts`, `types.ts`, `index.ts`:
- **Session** - Active workout state (in-memory during session, persisted on end + AsyncStorage for crash recovery)
- **Routines** - Reusable workout templates (full CRUD, planned dates, create from session)
- **History** - Past sessions (paginated queries, search, date filtering, reflections)
- **Settings** - App preferences (theme, auto-end, session duration - persisted via Zustand middleware)

**Critical**: Session store keeps exercises/sets in memory during active session. Only writes to DB on `endSession()`. Session state is also persisted to AsyncStorage for crash recovery. See [src/features/session/store.ts](../src/features/session/store.ts) and [src/features/session/persistence.ts](../src/features/session/persistence.ts).

### Database Schema (Drizzle)
Schema defined in [src/core/db/schema.ts](../src/core/db/schema.ts) with relations:
- `sessions` → `exercises` (one-to-many)
- `exercises` → `sets` (one-to-many)
- `sessions` → `routines` (optional link via `routineId`)
- `sessions` → `reflections` (one-to-one)
- `routines` → `routine_exercises` (one-to-many)
- `plans` → `planned_exercises` (one-to-many)

**Tables**: sessions, exercises, sets, reflections, routines, routine_exercises, plans, planned_exercises

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
1. Add route file in `app/(tabs)/` for tab screens or `app/<name>/` for stack screens
2. Use Expo Router conventions (file = route, `[param]` for dynamic routes)
3. Use `useSafeAreaInsets()` for proper layout
4. Use `useTheme()` for StatusBar style

## Key Design Decisions

### Why In-Memory Session State?
During workouts, users log sets rapidly. Writing to DB on every set would be slow. Session store batches all writes to `endSession()` for performance. Session state also persists to AsyncStorage for crash recovery.

### Why Zustand Over React Context?
Zustand provides simpler state management with built-in persistence middleware and better TypeScript inference than Context API.

### Why Drizzle Over Raw SQL?
Type-safe queries prevent runtime errors, and relations auto-join without manual SQL. Schema migrations are version-controlled.

### Why NativeWind Over StyleSheet?
Consistent styling language with web (Tailwind), built-in dark mode support, and smaller bundle size vs. component libraries.

### Why FlashList Over FlatList?
FlashList provides significantly better performance for long lists with recycling and optimized rendering.

## Known Constraints

- **React Native 0.81.5**: Pinned for Expo SDK 54 compatibility
- **NativeWind 5.0.0-preview.2**: Using preview version for v5 features
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

## Current App State

### Fully Implemented Features
- ✅ Session logging with timer (pause/resume, configurable duration)
- ✅ Exercise management (add, complete, reorder via drag)
- ✅ Routines CRUD (create, edit, delete, plan for dates)
- ✅ Start sessions from routines or freestyle
- ✅ Create routines from past sessions
- ✅ History with pagination, search, and date filtering
- ✅ Session detail view with exercises and sets
- ✅ Reflections (feeling + notes) with encryption
- ✅ In-progress sessions management (resume/discard)
- ✅ Settings (theme, auto-end session, session duration)
- ✅ Week navigation with completion indicators
- ✅ Session persistence across app kill

### Screens
- `app/(tabs)/index.tsx` - Today screen (planned routines, freestyle start)
- `app/(tabs)/plan.tsx` - Weekly planning with routines
- `app/(tabs)/history.tsx` - Session history list
- `app/(tabs)/settings.tsx` - App settings
- `app/session/[routineId].tsx` - Active workout session
- `app/history/[id].tsx` - Session detail view
- `app/routines/[id].tsx` - Routine editor

**Principle**: Keep interactions minimal - large tap targets, auto-carry forward values, no forced fields.

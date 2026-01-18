# DriftLog - AI Coding Agent Instructions

## Project Overview
DriftLog is an **offline-first workout logging app** for endurance athletes built with Expo (SDK 54) + React Native 0.81.5. The app emphasizes minimal interaction, one-tap logging, and local-only data with no accounts or tracking.

## Build/Lint/Test Commands

### Development Commands
```bash
ppnpm start          # Start Expo development server (with --clear)
ppnpm ios            # Launch iOS Simulator
ppnpm android        # Launch Android Emulator
ppnpm web            # Web version (if needed)
ppnpm prebuild       # Generate native files
```

### Code Quality Commands
```bash
ppnpm lint           # Run Biome linter (check)
ppnpm lint:fix       # Auto-fix linting issues
ppnpm format         # Format code with Biome
ppnpm check:ci        # CI-ready linting check
ppnpm typecheck      # TypeScript type checking (RUN BEFORE COMMITS)
```

### Database Commands
```bash
ppnpm db:generate    # Generate Drizzle migrations after schema changes
ppnpm db:studio      # Open Drizzle Studio (DB browser)
```

### Testing
**No testing framework currently configured** - this is a gap in the project.

## Code Style Guidelines

### Import Conventions
- **Always use path aliases** (`@/`) instead of relative paths
- Path aliases configured in tsconfig.json:
  ```typescript
  "@/features/*": ["src/features/*"]
  "@/components/*": ["src/components/*"]
  "@/core/*": ["src/core/*"]
  "@/hooks/*": ["src/hooks/*"]
  "@/*": ["src/*"]
  ```
- Example imports:
  ```typescript
  import { useSessionStore } from "@/features/session";
  import { db } from "@/core/db";
  import { Button } from "@/components/ui/Button";
  ```

### Formatting Rules (Biome)
- **Indentation**: 2 spaces
- **Line width**: 100 characters
- **Line endings**: LF
- **Quotes**: Double quotes for strings and JSX
- **Semicolons**: Always required
- **JSON**: Comments and trailing commas allowed

### TypeScript Conventions
- **Strict mode** enabled
- **Always run `ppnpm typecheck`** before commits
- Use interfaces for object shapes
- Store types in `types.ts` files within feature modules
- Database types in `src/core/types/database.ts`

### Naming Conventions
- **Components**: PascalCase (e.g., `WorkoutSession`, `ExerciseList`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Stores**: `use[Feature]Store` pattern (e.g., `useSessionStore`)
- **Database tables**: snake_case (e.g., `workout_sessions`, `exercise_sets`)

### Component Structure
- UI components in `src/components/ui/` must support both light/dark mode
- All components accept `className` prop for customization
- Use semantic design tokens, not raw colors
- Example component pattern:
  ```tsx
  interface ButtonProps {
    children: React.ReactNode;
    className?: string;
    onPress: () => void;
  }

  export function Button({ children, className, onPress }: ButtonProps) {
    return (
      <TouchableOpacity
        className={`bg-primary-500 dark:bg-dark-primary ${className}`}
        onPress={onPress}
      >
        <Text className="text-light-text-primary dark:text-dark-text-primary">
          {children}
        </Text>
      </TouchableOpacity>
    );
  }
  ```

### Styling with NativeWind v5
- **Theme System**: Dual light/dark mode with semantic classes
- **Use semantic tokens**:
  ```tsx
  // Backgrounds
  className="bg-light-surface dark:bg-dark-surface"

  // Text
  className="text-light-text-primary dark:text-dark-text-primary"

  // Primary brand
  className="bg-primary-500 dark:bg-dark-primary"
  ```
- **Never use raw colors** - always use theme tokens
- Design tokens defined in `global.css`

### State Management (Zustand)
- **Store pattern**: Expose state + actions at top level (no nested objects)
- **Feature modules**: Each feature in `src/features/` has `store.ts`, `types.ts`, `index.ts`
- **Critical**: Session store keeps exercises in memory during active session
- **Only write to DB on session end** for performance
- Example store:
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

### Database Patterns (Drizzle + SQLite)
- **Schema defined in**: `src/core/db/schema.ts`
- **Relations**: `sessions` → `exercises` → `sets` (one-to-many)
- **Type safety**: Always use generated types from Drizzle
- **Migrations**: Auto-run on startup, generate with `ppnpm db:generate`
- **Helper utilities**: Use `generateId()`, `getTodayString()`, `getNowString()`

### Error Handling
- **No network calls** - all data is local SQLite
- **Type-safe queries** with Drizzle prevent runtime errors
- **Graceful degradation** for partial data (messy data is acceptable)
- **Console errors** for development, user-friendly messages for production

### File Organization
```
src/
├── components/
│   └── ui/              # Base UI components (theme-aware)
├── features/            # Feature modules (store, types, index)
├── core/
│   ├── db/             # Database setup and schema
│   ├── types/          # TypeScript definitions
│   └── utils/          # Helper functions
└── hooks/              # Custom React hooks
```

## Architecture Principles

### Offline-First
1. **No network calls** - all data lives in local SQLite
2. **Instant interactions** - no loading spinners on core flows
3. **Accept messy data** - partial logs are valid
4. **Auto-save on session end** - batch writes for performance

### Performance
- **In-memory session state** during workouts
- **Batch DB writes** on `endSession()` only
- **Flash List** for performant long lists
- **Zustand** over Context for better TypeScript inference

### Type Safety
- **Strict TypeScript** mode enabled
- **Drizzle ORM** for type-safe database queries
- **Generated types** for all database entities
- **Path aliases** prevent import errors

## Common Development Tasks

### Adding New Feature Module
1. Create `src/features/<name>/` folder
2. Add `types.ts` (TypeScript interfaces)
3. Add `store.ts` (Zustand store)
4. Add `index.ts` (public exports)
5. Use path alias `@/features/<name>` in components

### Modifying Database Schema
1. Update schema in `src/core/db/schema.ts`
2. Update types in `src/core/types/database.ts`
3. Run `ppnpm db:generate`
4. Restart app to apply migration

### Creating New Screen
1. Add route file in `app/(tabs)/` for tab screens
2. Use Expo Router file-based routing
3. Wrap in `ScrollView` with bottom padding
4. Use `useTheme()` for StatusBar style

## Key Constraints
- **React Native 0.81.5**: Pinned for Expo SDK 54
- **NativeWind 5.0.0-preview.2**: Using preview version for v5 features
- **lightningcss@1.30.1**: Pinned for NativeWind v5 stability
- **No web support**: iOS/Android only
- **SQLite limits**: Local-only data, no cloud sync

## Debugging Common Issues
- **Type errors**: Run `ppnpm typecheck`, check path aliases
- **Metro bundler**: Clear cache with `ppnpm start --clear`
- **Database**: Use `ppnpm db:studio` to inspect data
- **Styling**: Verify theme tokens in `global.css`

## Development Workflow
1. **Always run `ppnpm typecheck`** before commits
2. **Use semantic theme classes** for consistent styling
3. **Follow established patterns** when adding features
4. **Generate migrations** after schema changes
5. **Test on both light/dark modes**
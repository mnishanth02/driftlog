# Quick Start Guide - DriftLog Development

## ✅ Production Ready!

DriftLog is a fully functional offline-first workout logging app with:
- ✅ Expo Router v6 (file-based routing)
- ✅ Feature-based architecture (4 modules)
- ✅ Offline-first database (SQLite + Drizzle ORM)
- ✅ State management (Zustand with persistence)
- ✅ Type safety (TypeScript with path aliases)
- ✅ NativeWind v5 (TailwindCSS v4 styling)

---

## 🚀 Running the App

### Start Development Server
```bash
pnpm start
```

Then press:
- `i` - Open iOS Simulator
- `a` - Open Android Emulator
- `r` - Reload app
- `m` - Toggle menu

### Platform-Specific
```bash
pnpm ios        # iOS only
pnpm android    # Android only
```

---

## 📱 App Structure

### Navigation (4 Tabs)
1. **Today** - Planned routines and freestyle session start
2. **Plan** - Weekly planning with routines
3. **History** - Past sessions with search and filtering
4. **Settings** - Theme, auto-end, session duration

### All Features Working
- ✅ Tab navigation between screens
- ✅ Theme switching (light/dark/system)
- ✅ Session logging with pause/resume timer
- ✅ Exercise management (add, complete, reorder via drag)
- ✅ Routines CRUD (create, edit, delete, plan for dates)
- ✅ Start sessions from routines or freestyle
- ✅ Create routines from past sessions
- ✅ History with pagination, search, and date filtering
- ✅ Session detail view with exercises and sets
- ✅ Reflections (feeling + notes) with encryption
- ✅ In-progress sessions management (resume/discard)
- ✅ Week navigation with completion indicators
- ✅ Session persistence across app kills

---

## 🗄️ Database

### Auto-Initialize
Database auto-initializes on first app launch. Schema in `src/core/db/schema.ts`.

### Generate Migrations (after schema changes)
```bash
pnpm db:generate
```

### View Database
```bash
pnpm db:studio
```

---

## 🏗️ Code Examples

### Using the Session Store

```typescript
import { useSessionStore } from "@/features/session";

function SessionScreen() {
  const { 
    isSessionActive, 
    currentExercises, 
    startSession,
    startSessionFromRoutine,
    addExercise, 
    toggleExerciseComplete,
    reorderExercises,
    endSession,
    pauseTimer,
    resumeTimer,
  } = useSessionStore();

  // Start freestyle session
  const handleStart = async () => {
    await startSession();
  };

  // Start from routine
  const handleStartFromRoutine = async (routineId: string) => {
    await startSessionFromRoutine(routineId);
  };

  // Add exercise
  const handleAddExercise = () => {
    addExercise("Squats");
  };

  // Toggle completion
  const handleToggle = async (exerciseId: string) => {
    await toggleExerciseComplete(exerciseId);
  };

  return (/* Your UI */);
}
```

### Using the Routines Store

```typescript
import { useRoutineStore } from "@/features/routines";

function RoutinesScreen() {
  const { 
    routines,
    loadRoutines,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    planRoutineForDate,
  } = useRoutineStore();

  // Load routines
  useEffect(() => {
    loadRoutines();
  }, []);

  // Create routine
  const handleCreate = async () => {
    await createRoutine("Push Day", ["Bench Press", "Shoulder Press"]);
  };

  // Plan for date
  const handlePlan = async (routineId: string, date: string) => {
    await planRoutineForDate(routineId, date);
  };

  return (/* Your UI */);
}
```

### Using the History Store

```typescript
import { useHistoryStore } from "@/features/history";

function HistoryScreen() {
  const {
    sessions,
    isLoading,
    hasMore,
    loadSessions,
    loadMoreSessions,
    searchSessions,
    setDateRange,
  } = useHistoryStore();

  // Load initial sessions
  useEffect(() => {
    loadSessions();
  }, []);

  // Load more (pagination)
  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadMoreSessions();
    }
  };

  // Search
  const handleSearch = (query: string) => {
    searchSessions(query);
  };

  return (/* Your UI */);
}
```

---

## 📂 Project Structure

### UI Components
- Base components → `src/components/ui/`
- Session components → `src/components/session/`
- History components → `src/components/history/`
- Routines components → `src/components/routines/`
- Planning components → `src/components/planning/`

### Feature Modules
- Session → `src/features/session/` (store, types, persistence)
- Routines → `src/features/routines/` (store, types)
- History → `src/features/history/` (store, types)
- Settings → `src/features/settings/` (store, types)

### Core Infrastructure
- Database → `src/core/db/` (schema, initialization)
- Types → `src/core/types/` (database types)
- Contexts → `src/core/contexts/` (ThemeContext)
- Utils → `src/core/utils/` (helpers, validation, encryption, etc.)

### Custom Hooks
- Timer hook → `src/hooks/useSessionTimer.ts`

---

## 🎨 Styling with NativeWind

### Theme-Aware Colors
```tsx
<View className="bg-light-surface dark:bg-dark-surface">
  <Text className="text-light-text-primary dark:text-dark-text-primary">
    Hello DriftLog
  </Text>
</View>
```

### Primary Brand Color
```tsx
<Pressable className="bg-primary-500 dark:bg-dark-primary">
  <Text className="text-white dark:text-dark-bg-primary">
    Start Session
  </Text>
</Pressable>
```

### Design Tokens (from global.css)
- Backgrounds: `light-bg-primary`, `dark-bg-primary`
- Surfaces: `light-surface`, `dark-surface`
- Text: `light-text-primary`, `dark-text-primary`
- Borders: `light-border-light`, `dark-border-medium`
- Primary: `primary-500` (light), `dark-primary` (dark)

---

## 🧪 Development Workflow

### 1. Make Changes
Edit files in `src/` or `app/`

### 2. Check Types
```bash
pnpm typecheck
```

### 3. Fix Linting
```bash
pnpm lint:fix
```

### 4. Format Code
```bash
pnpm format
```

### 5. Test in Simulator
Reload app with `r` in Expo CLI

---

## 📖 Documentation

- **Architecture**: `docs/development/ARCHITECTURE.md`
- **Styling Guide**: `docs/development/styling.md`
- **Local Builds**: `docs/development/LOCAL_BUILDS.md`
- **Product Spec**: `docs/plan/driftlog-plan.md`

---

## 🐛 Troubleshooting

### Metro bundler issues
```bash
pnpm start --clear
```

### TypeScript errors
```bash
pnpm typecheck
```

### Biome errors
```bash
pnpm lint:fix
```

### Database issues
```bash
pnpm db:studio   # Inspect data
pnpm db:generate # Generate new migration
```

### App won't start
1. Clear Metro cache: `pnpm start --clear`
2. Delete `node_modules/.cache`
3. Restart dev server

---

## 🎯 Future Enhancements

### Potential Additions
1. Set logging UI (reps/weight per exercise)
2. Exercise library with history
3. Progress tracking and statistics
4. Data export (JSON/CSV)
5. Widgets for quick session start

---

## 💡 Tips

1. **Use path aliases**: Import with `@/` instead of relative paths
2. **Type everything**: All stores and components are typed
3. **Test offline**: Core feature, test in airplane mode
4. **Keep it simple**: Follow the "no forced behavior" principle
5. **Large tap targets**: Remember users are fatigued during workouts
6. **Run typecheck**: Always run before commits

---

## 🚦 Status Check

Run these to verify everything is working:

```bash
# Should pass
pnpm typecheck

# Should pass
pnpm lint

# Should start
pnpm start
```

---

**Ready to extend!** See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed structure docs. 💪

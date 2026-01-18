# Quick Start Guide - DriftLog Development

## ✅ Migration Complete!

Your app has been successfully migrated to a production-ready structure with:
- ✅ Expo Router (file-based routing)
- ✅ Modular architecture (4 feature modules)
- ✅ Offline-first database (SQLite + Drizzle ORM)
- ✅ State management (Zustand)
- ✅ Type safety (TypeScript with path aliases)

---

## 🚀 Running the App

### Start Development Server
```bash
pnpm start
```

Then press:
- `i` - Open iOS Simulator
- `a` - Open Android Emulator
- `w` - Open in web browser
- `r` - Reload app
- `m` - Toggle menu

### Platform-Specific
```bash
pnpm ios        # iOS only
pnpm android    # Android only
pnpm web        # Web only
```

---

## 📱 Current App Structure


### Navigation (4 Tabs)
1. **Today** - Active session logging (placeholder ready)
2. **Plan** - Routines management (working)
3. **History** - Past sessions (placeholder ready)
4. **Settings** - Theme toggle (working) + future settings


### What Works Now
- ✅ Tab navigation between screens
- ✅ Theme switching (light/dark/system)
- ✅ NativeWind styling
- ✅ Database schema defined
- ✅ State stores configured
- ✅ Routines CRUD (create, edit, delete)
- ✅ Week navigation with routine filtering


### What's Next (UI Implementation)
- [ ] Session logging interface (Today screen)
- [ ] Routines assignment and quick start (Plan screen)
- [ ] History list and detail views (History screen)
- [ ] Complete settings (units, auto-end, etc.)

---

## 🗄️ Database Setup

### Initialize Database
The database will auto-initialize on first app launch. Tables are defined in `src/core/db/schema.ts`.

### Generate Migrations (when schema changes)
```bash
pnpm db:generate
```

### View Database (Drizzle Studio)
```bash
pnpm db:studio
```

---

## 🏗️ Building Features

### Example: Using the Session Store

```typescript
// In a component
import { useSessionStore } from "@/features/session";

function TodayScreen() {
  const { 
    isSessionActive, 
    currentExercises, 
    startSession, 
    addExercise, 
    addSet 
  } = useSessionStore();

  const handleStart = async () => {
    await startSession();
  };

  const handleAddExercise = () => {
    addExercise("Squats");
  };

  const handleAddSet = (exerciseId: string) => {
    addSet(exerciseId, 10, 100); // 10 reps, 100kg
  };

  return (
    // Your UI here
  );
}
```


### Example: Using the Routines Store

```typescript
import { useRoutinesStore } from "@/features/routines";

function PlanScreen() {
  const { routines, addRoutine, deleteRoutine } = useRoutinesStore();

  const handleAddRoutine = () => {
    addRoutine("Push Day");
  };

  const handleDeleteRoutine = (id: string) => {
    deleteRoutine(id);
  };

  return (
    // Your UI here
  );
}
```

---

## 📂 Where to Add Code

### UI Components
- Base components → `src/components/ui/`
- Feature components → within feature folders or `src/components/`

### Business Logic
- Session logic → `src/features/session/store.ts`
- Planning logic → `src/features/planning/store.ts`
- History logic → `src/features/history/store.ts`
- Settings logic → `src/features/settings/store.ts`

### Database Changes
- Schema → `src/core/db/schema.ts`
- Types → `src/core/types/database.ts`

### Utilities
- Helpers → `src/core/utils/helpers.ts`
- New utils → `src/core/utils/<name>.ts`

---

## 🎨 Styling with NativeWind

### Theme-Aware Colors
```tsx
<View className="bg-white dark:bg-black">
  <Text className="text-black dark:text-white">
    Hello DriftLog
  </Text>
</View>
```

### Custom Theme Colors (from global.css)
```tsx
<Text className="text-primary-500 dark:text-dark-primary">
  Primary Text
</Text>
```

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
- **Migration Summary**: `docs/development/MIGRATION_SUMMARY.md`
- **Product Spec**: `docs/plan/driftlog-plan.md`
- **Styling Guide**: `docs/development/styling.md`

---

## 🐛 Troubleshooting

### Metro bundler issues
```bash
pnpm start --clear
```

### TypeScript errors after changes
```bash
pnpm typecheck
```

### Biome errors
```bash
pnpm lint:fix
```

### Database schema out of sync
```bash
pnpm db:generate
pnpm db:migrate
```

### App won't start
1. Clear Metro cache: `pnpm start --clear`
2. Delete `node_modules/.cache`
3. Restart dev server

---

## 🎯 Feature Implementation Order (Recommended)

### Phase 1: Core Session Logging
1. ✅ Database schema (done)
2. ✅ Session store (done)
3. ⏳ Today screen UI - Session start/end
4. ⏳ Exercise input component
5. ⏳ One-tap set logging
6. ⏳ Session reflection prompt


### Phase 2: Routines
1. ✅ Routines store (done)
2. ⏳ Routines CRUD UI
3. ⏳ Routine assignment to week days
4. ⏳ Routine quick start from Plan screen

### Phase 3: History
1. ✅ History store (done)
2. ⏳ Session list view
3. ⏳ Session detail screen
4. ⏳ Reflection display

### Phase 4: Polish
1. ⏳ Settings: Units selector
2. ⏳ Settings: Auto-end session
3. ⏳ Large tap targets (accessibility)
4. ⏳ Offline testing
5. ⏳ Performance optimization

---

## 💡 Tips

1. **Use path aliases**: Import with `@/` instead of relative paths
2. **Type everything**: All stores and components are typed
3. **Test offline**: Core feature, test in airplane mode
4. **Keep it simple**: Follow the "no forced behavior" principle
5. **Large tap targets**: Remember users are fatigued during workouts

---

## 🚦 Status Check

Run these to verify everything is working:

```bash
# ✅ Should pass
pnpm typecheck

# ✅ Should pass
pnpm lint

# ✅ Should start
pnpm start
```

---

**Ready to build!** Start with the Today screen session logging interface. 💪

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed structure docs.

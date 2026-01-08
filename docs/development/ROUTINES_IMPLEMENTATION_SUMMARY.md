# Plan Tab Redesign - Implementation Complete ✅

## Implemented Features

### 1. Database Schema ✅
- Added `routines` table (id, title, notes, createdAt, updatedAt)
- Added `routine_exercises` table (id, routineId, name, order, createdAt, updatedAt)
- Generated migration: `drizzle/0003_third_valkyrie.sql`
- Added types to `src/core/types/database.ts`
- Updated `src/core/db/index.ts` with migration logic

### 2. Routines Feature Module ✅
- **Location**: `src/features/routines/`
- **Files**:
  - `types.ts`: DraftExercise, RoutineWithExercises types
  - `store.ts`: Zustand store with full CRUD + draft state management
  - `index.ts`: Clean exports
- **Store Actions**:
  - `loadRoutines()`, `loadRoutine(id)`, `createRoutine()`, `updateRoutine()`, `deleteRoutine()`
  - Draft management: `startDraft()`, `updateDraftTitle()`, `addDraftExercise()`, `removeDraftExercise()`, `reorderDraftExercises()`, `clearDraft()`

### 3. Header Compactness ✅
- **Reduced spacing** by ~20-30% in:
  - `WeekNavigationRail.tsx`: Day chip size (w-13→w-11, h-13→h-11), gap (gap-2→gap-1.5), font size (text-lg→text-base)
  - `plan.tsx` header rows: Heights (48px→40px, 52px→44px, 32px→28px), margins (8px→6px)
  - Chevron buttons: Size (w-11→w-9, h-11→h-9), icon (20px→18px)
  - Week label font: text-lg→text-base

### 4. Create/Edit Routine Screen ✅
- **Location**: `app/routines/[id].tsx`
- **Features**:
  - Header: Cancel (discards) | Title | Save (persists)
  - Routine title input (placeholder: "Routine Title")
  - Empty state with centered "Add Exercise" button
  - Scrollable exercise list with drag-and-drop reordering (react-native-draggable-flatlist)
  - Inline edit mode: tap Edit icon → save/cancel controls
  - Delete without confirmation (friction-free)
  - Footer: Fixed text input + "Add" button
  - Auto-focus after adding exercise
  - Submit on Return key
  - Delete Routine button at bottom (edit mode only, with confirmation)
- **Navigation**:
  - New routine: Navigate to `/routines/new` (id="new" handled specially)
  - Edit routine: Navigate to `/routines/[routineId]`
  - Back button treated as Cancel (silent discard per spec)

### 5. Plan Tab Sub-Switcher ✅
- **Location**: `app/(tabs)/plan.tsx`
- **Features**:
  - TabBar component below "Weekly Plan" title
  - Tabs: "Week" | "Routines"
  - Persisted via AsyncStorage (`@driftlog_plan_tab`)
  - Default: "Week"
  - Conditional rendering:
    - **Week tab**: Existing weekly planning UI (unchanged)
    - **Routines tab**: Routines list with empty state + RoutineCard grid
  - FAB (+ button) bottom-right when Routines tab active → navigates to `/routines/new`

### 6. RoutineCard Component ✅
- **Location**: `src/components/routines/RoutineCard.tsx`
- **Features**:
  - Title display (fallback to first exercise name if empty/default)
  - Exercise list: comma-separated, max 2 lines (~80 chars)
  - Truncation: Shows "+N more" if exercises exceed 2 lines
  - Tap card body → navigate to edit screen
  - "Start Routine" button → placeholder (console.log for now)

### 7. Dependency Installation ✅
- `react-native-draggable-flatlist`: v4.0.3
- Reanimated: Already configured (v4.1.6)
- GestureHandler: Already configured (v2.28.0)

## Locked Design Decisions Implemented

✅ **IA**: Sub-switcher (Week/Routines) inside Plan tab
✅ **Header**: Tighter spacing + lighter visuals
✅ **Back behavior**: Silent discard (Cancel semantics)
✅ **Title fallback**: First exercise name
✅ **Routine deletion**: Yes, with confirmation in edit screen
✅ **Reordering**: Drag-and-drop in v1
✅ **Storage**: SQLite (Drizzle ORM)
✅ **Exercise model**: Name-only
✅ **Integration**: No routine → day linkage yet (Start Routine is placeholder)
✅ **Footer input**: Return key + auto-focus
✅ **Card truncation**: 2 lines + "+N more"

## File Structure

```
app/
  (tabs)/
    plan.tsx              ✅ Updated with sub-tabs
  routines/
    [id].tsx              ✅ Create/Edit screen

src/
  components/
    routines/
      RoutineCard.tsx     ✅ Card component
      index.ts            ✅ Exports
  core/
    db/
      schema.ts           ✅ Added routines + routine_exercises tables
      index.ts            ✅ Migration logic
    types/
      database.ts         ✅ Routine + RoutineExercise types
  features/
    routines/
      store.ts            ✅ Zustand store
      types.ts            ✅ DraftExercise types
      index.ts            ✅ Exports

drizzle/
  0003_third_valkyrie.sql ✅ Migration file
```

## Next Steps (Not in Scope)

- Apply routine to specific day (copy exercises to plan)
- Routine duplication
- Routine notes field (currently stored but not exposed in UI)
- Start Routine → pre-fill Today screen
- Routine templates/favorites

## Testing Checklist

- [ ] Run app: `pnpm start`
- [ ] Navigate to Plan tab
- [ ] Switch to Routines tab
- [ ] Create new routine with 3+ exercises
- [ ] Drag-reorder exercises
- [ ] Edit exercise inline
- [ ] Delete exercise (no confirm)
- [ ] Save routine
- [ ] Edit existing routine
- [ ] Delete routine (confirm dialog)
- [ ] Cancel routine edit (silent discard)
- [ ] Check tab persistence (relaunch app)
- [ ] Check Week tab still works
- [ ] Check header spacing is more compact

## Known Limitations

- "Start Routine" button is placeholder (console.log only)
- No link between routines and day plans yet
- Routine notes field not exposed in Create/Edit UI (stored in DB)
- No exercise suggestions/autocomplete
- No routine sharing/export

## TypeScript Status

✅ All files pass `pnpm typecheck`
✅ No compile errors
✅ Full type safety across stores and components

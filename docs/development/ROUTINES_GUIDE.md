# Routines System - Complete Guide

## Overview

The Routines system enables users to create, store, and manage reusable workout templates. Each routine contains a named list of exercises that can be used to:
- Pre-structure workouts for consistency
- Quickly log sessions without retyping exercise names
- Organize training plans into repeatable patterns

### Key Design Decisions

1. **Simplicity First**: Routines store only exercise names, no reps/sets (those are logged during sessions)
2. **Friction-Free Editing**: Inline editing, no confirmation for exercise deletion, silent discard on back
3. **Smart Fallbacks**: Routine title defaults to first exercise name if left empty
4. **Offline-First**: All data stored in local SQLite via Drizzle ORM
5. **Drag-to-Reorder**: Native iOS/Android feel with react-native-draggable-flatlist
6. **Integration-Ready**: Designed to connect with Plan tab (day planning) and Today screen (session logging) in future iterations

---

## Database Schema

### Tables

#### `routines`
Primary table for workout templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | ULID-based unique identifier |
| `title` | text | NOT NULL | User-defined routine name |
| `notes` | text | nullable | Optional description/instructions |
| `planned_date` | text | nullable | ISO date (YYYY-MM-DD) when routine is scheduled |
| `created_at` | text | NOT NULL | ISO datetime of creation |
| `updated_at` | text | NOT NULL | ISO datetime of last update |

#### `routine_exercises`
Exercises within each routine, with ordering.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | ULID-based unique identifier |
| `routine_id` | text | NOT NULL, FK | Foreign key to `routines` |
| `name` | text | NOT NULL | Exercise name (e.g., "Squats", "Bench Press") |
| `order` | integer | NOT NULL | Zero-indexed position in routine |
| `created_at` | text | NOT NULL | ISO datetime of creation |
| `updated_at` | text | NOT NULL | ISO datetime of last update |

**Foreign Key Behavior**: `ON DELETE CASCADE` - Deleting a routine removes all associated exercises.

### Relations (Drizzle ORM)

```typescript
export const routinesRelations = relations(routines, ({ many }) => ({
  exercises: many(routineExercises),
}));

export const routineExercisesRelations = relations(routineExercises, ({ one }) => ({
  routine: one(routines, {
    fields: [routineExercises.routineId],
    references: [routines.id],
  }),
}));
```

### Migration

**File**: `drizzle/0004_material_firestar.sql`

Includes:
- Table creation statements
- Index on `routine_exercises.routine_id` for fast lookups
- Cascade delete constraints

**Running Migrations**:
- Automatic on app startup via `src/core/db/index.ts`
- Manual generation: `pnpm db:generate`

---

## Store Implementation

**Location**: `src/features/routines/store.ts`

### State Structure

```typescript
interface RoutinesStore {
  // Persistent State
  routines: RoutineWithExercises[];        // All loaded routines
  selectedRoutine: RoutineWithExercises | null;  // Currently editing routine
  
  // Draft State (in-memory during creation/editing)
  draftTitle: string;
  draftExercises: DraftExercise[];
  isDraftMode: boolean;
  
  // Actions
  loadRoutines: () => Promise<void>;
  loadRoutine: (id: string) => Promise<void>;
  createRoutine: (title: string, exerciseNames: string[]) => Promise<string>;
  updateRoutine: (id: string, title: string, exerciseNames: string[]) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  
  // Draft Management
  startDraft: (routine?: RoutineWithExercises) => void;
  updateDraftTitle: (title: string) => void;
  addDraftExercise: (name: string) => void;
  removeDraftExercise: (id: string) => void;
  reorderDraftExercises: (fromIndex: number, toIndex: number) => void;
  clearDraft: () => void;
}
```

### Key Types

```typescript
// src/features/routines/types.ts
export type DraftExercise = {
  id: string;          // Temporary ID for UI (not persisted until save)
  name: string;
  order: number;
};

export type RoutineWithExercises = {
  routine: Routine;              // From database.ts
  exercises: RoutineExercise[];  // Sorted by order
};
```

### Usage Patterns

#### Creating a New Routine

```typescript
// 1. Start draft mode
startDraft();

// 2. Add exercises
addDraftExercise("Squats");
addDraftExercise("Bench Press");
addDraftExercise("Deadlift");

// 3. Set title
updateDraftTitle("Upper/Lower Split - Day 1");

// 4. Persist to database
const routineId = await createRoutine(draftTitle, draftExercises.map(e => e.name));

// 5. Clean up
clearDraft();
```

#### Editing an Existing Routine

```typescript
// 1. Load routine into draft
await loadRoutine(routineId);
startDraft(selectedRoutine);

// 2. Modify exercises
addDraftExercise("Romanian Deadlifts");
removeDraftExercise(exerciseId);
reorderDraftExercises(0, 2);

// 3. Save changes
await updateRoutine(routineId, draftTitle, draftExercises.map(e => e.name));

// 4. Clean up
clearDraft();
```

#### Loading All Routines

```typescript
// Typically in useEffect when navigating to Routines tab
useEffect(() => {
  loadRoutines();
}, []);
```

### Draft State Management

- **Purpose**: Keeps edits in memory until user explicitly saves
- **Lifecycle**:
  1. `startDraft()` - Initialize draft (empty or from existing routine)
  2. User modifies title/exercises
  3. `createRoutine()` or `updateRoutine()` - Persist to DB
  4. `clearDraft()` - Reset state
- **Silent Discard**: No confirmation needed when navigating away (back button, cancel)

---

## UI Components

### RoutineCard Component

**Location**: `src/components/routines/RoutineCard.tsx`

#### Features

- **Title Display**: Shows `routine.title`, falls back to first exercise name if empty/default
- **Exercise Preview**: Comma-separated list of exercise names
- **Truncation**: Max 2 lines (~80 characters), shows "+N more" suffix
- **Tap to Edit**: Entire card body is pressable, navigates to edit screen
- **Start Button**: Bottom-aligned CTA (placeholder, logs to console)

#### Props

```typescript
interface RoutineCardProps {
  routine: RoutineWithExercises;
  onPress: () => void;           // Navigate to edit screen
  onStartRoutine: () => void;    // Start session from routine (future)
}
```

#### Visual Design

```tsx
<Card> {/* bg-light-surface dark:bg-dark-surface */}
  <Pressable onPress={onPress}>
    <Text className="text-lg font-bold"> {/* Title or fallback */}
      {displayTitle}
    </Text>
    <Text className="text-sm text-secondary"> {/* Exercise list */}
      {truncatedExercises}
    </Text>
  </Pressable>
  
  <Button 
    variant="primary"
    title="Start Routine"
    onPress={onStartRoutine}
  />
</Card>
```

#### Truncation Logic

```typescript
const MAX_PREVIEW_LENGTH = 80;
const exerciseNames = routine.exercises.map(e => e.name);
const preview = exerciseNames.join(", ");

if (preview.length > MAX_PREVIEW_LENGTH) {
  const visible = exerciseNames.slice(0, 2); // First 2 exercises
  const remaining = exerciseNames.length - visible.length;
  return `${visible.join(", ")} +${remaining} more`;
}
return preview;
```

---

## Integration Points

### Plan Tab

**Current Integration**:
- Plan tab shows routines filtered by `plannedDate`
- Week navigation allows selecting dates
- RoutineCard list displays all routines for selected date with empty state
- "Add Routine" button navigates to create screen with date pre-filled

**Date Filtering**:
```typescript
// In plan.tsx
const filteredRoutines = routines.filter((r) => r.plannedDate === selectedDate);
```

### Today Screen (Session Logging)

**Planned Integration** (not yet implemented):
- "Start Routine" button pre-fills exercises into active session
- Auto-populate exercise list without typing
- Carry forward last sets/reps from previous sessions

**Implementation Path**:
```typescript
// In RoutineCard.tsx
const onStartRoutine = async () => {
  // 1. Start new session
  const sessionId = await useSessionStore.getState().startSession();
  
  // 2. Add exercises from routine
  for (const exercise of routine.exercises) {
    useSessionStore.getState().addExercise(exercise.name);
  }
  
  // 3. Navigate to Today screen
  router.push('/');
};
```

---

## Visual Design

### Color System

All components follow `global.css` design tokens:

**Backgrounds**:
- Primary: `bg-light-bg-primary dark:bg-dark-bg-primary`
- Surface: `bg-light-surface dark:bg-dark-surface`

**Text Hierarchy**:
- Primary: `text-light-text-primary dark:text-dark-text-primary`
- Secondary: `text-light-text-secondary dark:text-dark-text-secondary`
- Tertiary: `text-light-text-tertiary dark:text-dark-text-tertiary`

**Borders**:
- Light: `border-light-border-light dark:border-dark-border-medium`
- Medium: `border-light-border-medium dark:border-dark-border-dark`

**Brand Colors**:
- Primary: `bg-primary-500 dark:bg-dark-primary` (#F4A261 / #FF9F6C)
- Text on primary: `text-white dark:text-dark-bg-primary`

### Spacing Standards

**Screen Padding**:
- Horizontal: `px-5` (20px) for all main content
- Top (with header): `pt-16` (64px) for status bar clearance
- Bottom (with input): `pb-6` (24px)

**Component Gaps**:
- Action buttons: `gap-3` (12px)
- Card spacing: `mb-3` or `gap-4` (12-16px)
- Icon groups: `gap-3` (12px)

**Border Radius**:
- Buttons: `rounded-xl` (20px)
- Cards: `rounded-2xl` (24px)
- Input fields: `rounded-xl` (20px)
- Circular icons: `rounded-full`

---

## Future Enhancements

### Short-Term (v1.1)

1. **Routine Duplication**
   - "Duplicate Routine" button in edit screen
   - Creates copy with "(Copy)" suffix
   - Useful for variations (e.g., "Upper Body A" → "Upper Body B")

2. **Routine Notes Field**
   - Database field exists but not exposed in UI
   - Add multiline text input below title
   - Use cases: Intensity notes, progression strategy, warm-up instructions

3. **Exercise Suggestions**
   - Autocomplete dropdown when typing exercise name
   - Sources: User's exercise history, common exercise database
   - Reduces typos, speeds up input

4. **Start Routine Integration**
   - Complete "Start Routine" flow to Today screen
   - Pre-populate exercises in active session
   - Auto-navigate to Today tab

### Mid-Term (v1.2-1.3)

5. **Routine Templates**
   - Predefined routines (5x5, PPL, Upper/Lower)
   - One-tap import to user's library
   - Editable after import

6. **Exercise Details**
   - Add notes field to `routine_exercises` table
   - Per-exercise instructions (e.g., "Pause at bottom")
   - Target reps/sets (guidance, not enforced)

7. **Routine Folders/Tags**
   - Organize routines by category (Strength, Cardio, Mobility)
   - Filter/search in Plan tab

8. **Progress Tracking**
   - Link sessions to originating routine
   - Show last completion date on RoutineCard
   - Volume trends per routine

---

## File Reference

### Core Files

- **Store**: `src/features/routines/store.ts`
- **Types**: `src/features/routines/types.ts`
- **Schema**: `src/core/db/schema.ts`
- **Database Types**: `src/core/types/database.ts`

### UI Components

- **RoutineCard**: `src/components/routines/RoutineCard.tsx`
- **Edit Screen**: `app/routines/[id].tsx`

### Integration

- **Plan Tab**: `app/(tabs)/plan.tsx`

### Utilities

- **Helpers**: `src/core/utils/helpers.ts` (generateId, getNowString)

---

**Last Updated**: January 8, 2026  
**Status**: ✅ Implemented & Tested  
**Next Priority**: Start Routine integration with Today screen

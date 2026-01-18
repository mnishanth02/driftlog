# DriftLog - Codebase Structure & Architecture

**Generated:** Sun Jan 18 2026  
**Purpose:** Comprehensive documentation for understanding and adapting the DriftLog mobile app codebase

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Routing Architecture](#routing-architecture)
5. [Component Library](#component-library)
6. [Feature Modules](#feature-modules)
7. [Database Schema](#database-schema)
8. [State Management](#state-management)
9. [Styling System](#styling-system)
10. [Native Platform Integration](#native-platform-integration)
11. [Build & Development](#build--development)
12. [Key Dependencies](#key-dependencies)
13. [Web Adaptation Considerations](#web-adaptation-considerations)

---

## Project Overview

DriftLog is a **production-ready, offline-first workout logging app** for endurance athletes built with:
- **Expo SDK 54** (React Native 0.81.5)
- **NativeWind v5** (Tailwind CSS for React Native)
- **Drizzle ORM** + **Expo SQLite** (local-only data)
- **Zustand** (state management)
- **Expo Router v6** (file-based routing)

### Core Design Principles

1. **Offline-First**: No network calls, all data stored locally in SQLite
2. **Minimal Interaction**: One-tap logging, quick session creation
3. **No Accounts**: No authentication, no cloud sync, no tracking
4. **Performance**: In-memory session state during workouts, batch DB writes
5. **Type Safety**: Strict TypeScript, Drizzle ORM for type-safe queries

---

## Technology Stack

### Core Framework
- **React**: 19.1.0
- **React Native**: 0.81.5 (pinned for Expo SDK 54 compatibility)
- **Expo**: ^54.0.31
- **Expo Router**: ^6.0.21 (file-based routing)

### Database & State
- **expo-sqlite**: ^16.0.10 (SQLite database)
- **drizzle-orm**: ^0.45.1 (type-safe ORM)
- **zustand**: ^5.0.10 (lightweight state management)
- **@react-native-async-storage/async-storage**: 2.2.0 (session persistence)

### Styling
- **nativewind**: 5.0.0-preview.2 (Tailwind CSS for RN)
- **tailwindcss**: ^4.1.18
- **lightningcss**: 1.30.1 (pinned for NativeWind v5 stability)

### UI & Gestures
- **react-native-gesture-handler**: ~2.28.0
- **react-native-reanimated**: ~4.1.6
- **react-native-worklets**: 0.5.1
- **react-native-safe-area-context**: ~5.6.2
- **react-native-screens**: ~4.16.0
- **react-native-draggable-flatlist**: ^4.0.3
- **@shopify/flash-list**: 2.0.2 (performant list rendering)

### Utilities
- **date-fns**: ^4.1.0 (date manipulation)
- **expo-crypto**: ~15.0.8 (cryptographic operations)
- **expo-haptics**: ^15.0.8 (tactile feedback)
- **expo-secure-store**: ~15.0.8 (secure storage)

### Dev Tools
- **TypeScript**: ~5.9.3
- **@biomejs/biome**: 2.3.11 (linter/formatter)
- **drizzle-kit**: ^0.31.8 (database migrations)

---

## Directory Structure

```
driftlog/
├── app/                          # Expo Router - File-based routing
│   ├── (tabs)/                   # Tab navigator layout group
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── index.tsx             # "Today" screen (home)
│   │   ├── history.tsx           # Past workouts with search/filter
│   │   ├── plan.tsx              # Weekly planning view
│   │   └── settings.tsx          # App preferences
│   ├── history/
│   │   └── [id].tsx              # Session detail screen (dynamic route)
│   ├── routines/
│   │   └── [id].tsx              # Routine detail/edit screen
│   ├── session/
│   │   └── [routineId].tsx       # Active workout session (supports "freestyle", "active", or routine ID)
│   └── _layout.tsx               # Root layout (providers, font loading, db init)
│
├── src/
│   ├── components/               # React components organized by domain
│   │   ├── ui/                   # Base UI components (theme-aware)
│   │   │   ├── Button.tsx        # Primary/secondary/ghost button
│   │   │   ├── Card.tsx          # Container with title support
│   │   │   ├── BottomSheet.tsx   # Modal bottom sheet
│   │   │   ├── DatePicker.tsx    # Date selection modal
│   │   │   ├── DateRangePicker.tsx # Date range filter
│   │   │   ├── FreestyleCard.tsx # Quick start card for Today screen
│   │   │   ├── SearchBar.tsx     # Search input with clear button
│   │   │   ├── Skeleton.tsx      # Loading placeholder
│   │   │   └── ThemeToggle.tsx   # Light/dark/system theme switcher
│   │   ├── session/              # Active workout components
│   │   │   ├── ActiveSessionBanner.tsx  # Resume banner on Today screen
│   │   │   ├── ExerciseRow.tsx   # Exercise item with drag handle
│   │   │   ├── SessionHeader.tsx # Timer display + controls
│   │   │   └── TimerPicker.tsx   # Duration selection modal
│   │   ├── history/              # Past session components
│   │   │   ├── SessionCard.tsx   # Compact session preview
│   │   │   ├── SessionCardSkeleton.tsx  # Loading state
│   │   │   ├── InProgressSessionCard.tsx # Orphaned sessions
│   │   │   ├── SessionMetadata.tsx # Date/duration/routine info
│   │   │   ├── ExerciseDetailCard.tsx # Exercise with sets breakdown
│   │   │   └── ReflectionSection.tsx # Post-workout notes
│   │   ├── routines/             # Routine components
│   │   │   └── RoutineCard.tsx   # Routine preview with actions
│   │   ├── planning/             # Planning components
│   │   │   └── WeekNavigationRail.tsx # Week day selector
│   │   └── ErrorBoundary.tsx     # Global error catcher
│   │
│   ├── features/                 # Feature modules (store + types)
│   │   ├── session/              # Active workout session
│   │   │   ├── store.ts          # Zustand store for in-memory session state
│   │   │   ├── persistence.ts    # AsyncStorage config for crash recovery
│   │   │   ├── types.ts          # ExerciseLog, SessionStore types
│   │   │   └── index.ts          # Public exports
│   │   ├── history/              # Past sessions & reflections
│   │   │   ├── store.ts          # Load/filter/search sessions
│   │   │   ├── types.ts          # HistorySession, filters
│   │   │   └── index.ts
│   │   ├── routines/             # Reusable workout templates
│   │   │   ├── store.ts          # CRUD operations for routines
│   │   │   ├── types.ts          # Routine, RoutineExercise types
│   │   │   └── index.ts
│   │   └── settings/             # App preferences
│   │       ├── store.ts          # Theme, auto-end session config
│   │       ├── types.ts
│   │       └── index.ts
│   │
│   ├── core/                     # Core utilities & infrastructure
│   │   ├── db/                   # Database layer
│   │   │   ├── index.ts          # Drizzle setup, initDatabase(), waitForDb()
│   │   │   └── schema.ts         # SQLite schema definitions (Drizzle ORM)
│   │   ├── types/
│   │   │   └── database.ts       # Generated TypeScript types for DB entities
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx  # Light/dark theme provider
│   │   └── utils/
│   │       ├── helpers.ts        # generateId(), getTodayString(), formatTime()
│   │       ├── dateFormats.ts    # Date format constants
│   │       ├── validation.ts     # Input validation utilities
│   │       ├── encryption.ts     # Crypto utilities (future use)
│   │       ├── secureStorage.ts  # Secure key-value storage
│   │       ├── secureDelete.ts   # Data deletion with verification
│   │       ├── navigation.ts     # Navigation helpers
│   │       ├── logger.ts         # Logging utility
│   │       └── errors.ts         # Error handling utilities
│   │
│   └── hooks/                    # Custom React hooks
│       ├── useSessionTimer.ts    # Timer logic with pause/resume
│       └── index.ts
│
├── assets/                       # Static assets
│   ├── icon.png                  # App icon
│   ├── splash.png                # Splash screen
│   ├── adaptive-icon.png         # Android adaptive icon
│   └── favicon.png               # Web favicon (unused)
│
├── ios/                          # iOS native project (CocoaPods)
│   ├── DriftLog/
│   │   ├── AppDelegate.swift     # iOS app entry point
│   │   ├── Info.plist            # iOS configuration
│   │   └── PrivacyInfo.xcprivacy # Privacy manifest
│   ├── Podfile                   # CocoaPods dependencies
│   └── Podfile.lock
│
├── android/                      # Android native project (Gradle)
│   ├── app/
│   │   ├── build.gradle          # Android build config
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   └── java/             # Native Android code (minimal)
│   │   └── proguard-rules.pro
│   ├── build.gradle              # Root Gradle config
│   └── gradle.properties
│
├── drizzle/                      # Database migrations
│   ├── 0000_lying_lady_deathstrike.sql
│   ├── 0001_steady_umar.sql
│   ├── ...                       # Auto-generated migration files
│   └── migrations.js
│
├── docs/                         # Documentation
│   ├── development/              # Dev guides
│   │   ├── ARCHITECTURE.md
│   │   ├── QUICKSTART.md
│   │   └── styling.md
│   └── deployment/               # Deployment guides
│       ├── EAS_BUILD_GUIDE.md
│       └── APP_STORE_PRIVACY_GUIDE.md
│
├── scripts/                      # Build & utility scripts
│   ├── local-prebuild-clean.mjs  # Clean native folders
│   └── reset-db.sh               # Database reset script
│
├── global.css                    # Tailwind theme tokens
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
├── tsconfig.json                 # TypeScript config
├── babel.config.js               # Babel config (RN presets)
├── metro.config.js               # Metro bundler config
├── drizzle.config.ts             # Drizzle Kit config
├── postcss.config.mjs            # PostCSS config for Tailwind
├── biome.json                    # Biome linter/formatter config
├── package.json                  # Dependencies & scripts
├── pnpm-lock.yaml                # Lockfile (pnpm)
└── AGENTS.md                     # AI coding agent instructions
```

---

## Routing Architecture

### Expo Router v6 (File-Based)

DriftLog uses **Expo Router** for declarative, file-based routing with automatic type safety.

#### Route Structure

```typescript
// Root Layout: app/_layout.tsx
export default function RootLayout() {
  // Providers: SafeAreaProvider, GestureHandlerRootView, ThemeProvider
  // Database initialization with splash screen control
  return <Stack />; // No headers, fade animation
}

// Tab Layout: app/(tabs)/_layout.tsx
export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="plan" options={{ title: "Plan" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
```

#### Navigation Patterns

```typescript
// Navigate to session (dynamic route)
router.push(`/session/${routineId}`);
router.push("/session/freestyle"); // No routine
router.push("/session/active");    // Resume existing

// Navigate to session detail
router.push(`/history/${sessionId}`);

// Navigate to routine editor
router.push(`/routines/${routineId}`);
router.push(`/routines/new?date=${selectedDate}`);

// Tab navigation
router.push("/(tabs)/history");
```

#### Navigation Helper Utilities

**Location:** `src/core/utils/navigation.ts`

```typescript
export const Navigation = {
  goToSession: (routineId: string) => router.push(`/session/${routineId}`),
  goToRoutine: (routineId: string) => router.push(`/routines/${routineId}`),
  goToTab: (tab: "plan" | "history" | "settings") => router.push(`/(tabs)/${tab}`),
  goBack: () => router.back(),
  endSessionAndGoHome: () => router.replace("/(tabs)/"), // Use replace to fix nav stack
};
```

---

## Component Library

### UI Components (`src/components/ui/`)

All UI components support **light/dark mode** and accept `className` prop for customization.

#### Button

```typescript
<Button
  title="Start Workout"
  onPress={handleStart}
  variant="primary" // "primary" | "secondary" | "ghost"
  disabled={false}
  className="mb-4"
/>
```

**Variants:**
- `primary`: Orange background, white text
- `secondary`: Light background, dark border
- `ghost`: Transparent background, colored text

#### Card

```typescript
<Card title="Settings" className="mb-4">
  {/* Card content */}
</Card>
```

**Features:**
- Optional title
- Light/dark mode surface colors
- Rounded corners (16px)
- Border + shadow

#### BottomSheet

```typescript
<BottomSheet visible={isOpen} onClose={() => setIsOpen(false)}>
  {/* Sheet content */}
</BottomSheet>
```

**Features:**
- Gesture-based dismiss
- Backdrop overlay
- Keyboard-avoiding
- Animated slide-up

#### DatePicker / DateRangePicker

```typescript
<DatePicker
  visible={showPicker}
  onClose={() => setShowPicker(false)}
  onSelect={(date: string) => handleDate(date)}
/>

<DateRangePicker
  visible={showRangePicker}
  onClose={() => setShowRangePicker(false)}
  onApply={(start: string, end: string) => handleRange(start, end)}
  onClear={() => handleClearFilter()}
/>
```

**Features:**
- Calendar-based selection
- ISO date string output (YYYY-MM-DD)
- Quick date shortcuts
- Range validation

#### SearchBar

```typescript
<SearchBar
  value={query}
  onChangeText={setQuery}
  onClear={() => setQuery("")}
  placeholder="Search sessions..."
/>
```

**Features:**
- Clear button (visible when text present)
- Debounce support (implement in parent)
- Keyboard dismiss on scroll

### Session Components (`src/components/session/`)

#### ActiveSessionBanner

Shown on Today screen when app is relaunched with an active session.

```typescript
<ActiveSessionBanner onDismiss={() => dismissBanner()} />
```

**Features:**
- Resume button (navigates to `/session/active`)
- Dismiss button (hides banner without ending session)

#### ExerciseRow

Draggable exercise item in active session.

```typescript
<ExerciseRow
  exercise={exerciseLog}
  isActive={isCurrentExercise}
  onPress={() => toggleComplete(exerciseLog.id)}
  onLongPress={drag} // From react-native-draggable-flatlist
  isDragging={isDragging}
/>
```

**Features:**
- Checkbox to mark complete
- Drag handle icon (hold to reorder)
- Active state highlight
- Completed state styling

#### SessionHeader

Timer display at top of active session screen.

```typescript
<SessionHeader onTimerPress={() => setShowTimerPicker(true)} />
```

**Features:**
- Elapsed time display (MM:SS)
- Target duration display
- Play/pause button
- Timer icon (opens duration picker)
- Safe area insets for notch/status bar

#### TimerPicker

Modal for selecting target session duration.

```typescript
<TimerPicker
  visible={showPicker}
  onClose={() => setShowPicker(false)}
/>
```

**Features:**
- Preset durations: 15, 30, 45, 60, 90 minutes
- Reset button (restarts timer)
- Updates session store directly

### History Components (`src/components/history/`)

#### SessionCard

Compact session preview for history list.

```typescript
<SessionCard
  session={historySession}
  onPress={() => navigateToDetail(session.id)}
/>
```

**Features:**
- Date + duration
- Exercise count + routine badge
- Reflection indicator
- Completed state checkmark

#### SessionCardSkeleton

Loading placeholder for session list.

```typescript
<SessionCardSkeleton showRoutine={true} showReflection={false} />
```

**Features:**
- Animated shimmer effect
- Configurable elements (routine, reflection)
- Matches SessionCard dimensions

#### InProgressSessionCard

Card for orphaned sessions (started but not properly ended).

```typescript
<InProgressSessionCard
  session={inProgressSession}
  onResume={() => resumeSession(session.id)}
  onDiscard={() => discardSession(session.id)}
/>
```

**Features:**
- Resume button (navigates to `/session/active`)
- Discard button (permanently removes session)
- Warning styling (yellow/orange accent)

#### ExerciseDetailCard

Expandable exercise details on session detail screen.

```typescript
<ExerciseDetailCard exercise={exerciseWithSets} />
```

**Features:**
- Exercise name + completion status
- Sets breakdown (reps, weight, timestamp)
- Collapsible (tap to expand/collapse)

#### ReflectionSection

Post-workout notes display/edit.

```typescript
<ReflectionSection
  sessionId={sessionId}
  reflection={reflection}
  onUpdate={(newReflection) => saveReflection(newReflection)}
/>
```

**Features:**
- Feeling emoji selection
- Notes textarea
- Editable after session ends

### Routine Components (`src/components/routines/`)

#### RoutineCard

Routine preview on Plan screen.

```typescript
<RoutineCard
  routine={routine}
  onPress={() => navigateToRoutine(routine.id)}
  onStartRoutine={() => startSession(routine.id)}
  onDelete={() => deleteRoutine(routine.id)}
  isCompleted={completedToday}
  completedDate={todayString}
/>
```

**Features:**
- Title + exercise count
- Start button (creates session from routine)
- Swipeable delete action
- Completion badge (green checkmark)

### Planning Components (`src/components/planning/`)

#### WeekNavigationRail

Horizontal week day selector.

```typescript
<WeekNavigationRail
  currentWeekDates={weekDates} // ["2026-01-13", "2026-01-14", ...]
  selectedDate={selectedDate}
  onDaySelect={(date) => setSelectedDate(date)}
  routinesMap={routinesMap} // Map<date, count>
  sessionsMap={sessionsMap} // Map<date, count>
/>
```

**Features:**
- Mon-Sun week view
- Active day highlight
- Dot indicators (routines, sessions)
- Smooth scroll to selected date

---

## Feature Modules

### Session Module (`src/features/session/`)

**Purpose:** Manage active workout session (in-memory state + DB writes)

#### Store State

```typescript
interface SessionStore {
  // Session identity
  activeSessionId: string | null;
  currentRoutineId: string | null;
  currentRoutineTitle: string | null;
  isSessionActive: boolean;

  // Exercise data (in-memory during session)
  currentExercises: ExerciseLog[];
  activeExerciseIndex: number;

  // Timing
  sessionStartTime: string | null; // ISO datetime
  timerStartTime: string | null;   // Separate timer control
  targetDuration: number;           // minutes (15, 30, 60, 90)
  lastActivityTimestamp: string | null;

  // Timer state
  isTimerPaused: boolean;
  pausedAt: string | null;
  accumulatedPausedTime: number; // seconds

  // Auto-end configuration
  autoEndTimerId: NodeJS.Timeout | null;
  timerWarningShown: boolean;

  // Recovery state
  hasHydrated: boolean;
  isResumedFromKill: boolean; // Set during rehydration, cleared on manual end
}
```

#### Key Actions

```typescript
// Start new session
await startSession();

// Start session from routine template
await startSessionFromRoutine(routineId);

// End session (saves exercises/sets to DB)
await endSession();

// Clear session (abandon without saving)
await clearSession();

// Exercise management
addExercise(name: string);
toggleExerciseComplete(exerciseId: string);
reorderExercises(newOrder: ExerciseLog[]);

// Timer controls
pauseTimer();
resumeTimer();
toggleTimerPause();
setTargetDuration(minutes: number);
resetTimerWithDuration(minutes: number);

// Recovery
dismissResumedFromKillBanner();
```

#### Persistence Strategy

**Critical Design:** Session state is persisted to AsyncStorage for crash recovery, but DB writes are batched at session end for performance.

```typescript
// sessionPersistConfig (src/features/session/persistence.ts)
{
  name: 'session-storage',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state) => ({
    activeSessionId: state.activeSessionId,
    currentRoutineId: state.currentRoutineId,
    currentRoutineTitle: state.currentRoutineTitle,
    currentExercises: state.currentExercises,
    // ... other session data
  }),
  onRehydrateStorage: () => (state) => {
    if (state?.isSessionActive && state?.activeSessionId) {
      state.isResumedFromKill = true; // Show resume banner
      state.hasHydrated = true;
    }
  },
}
```

**Flow:**
1. User starts session → In-memory state + DB row created
2. User adds exercises → In-memory array updated + DB rows created
3. App crashes/killed → State saved to AsyncStorage
4. App relaunches → AsyncStorage rehydrated → Banner shown
5. User ends session → All data written to DB, AsyncStorage cleared

### History Module (`src/features/history/`)

**Purpose:** Load, filter, and search past sessions

#### Store State

```typescript
interface HistoryStore {
  sessions: HistorySession[];
  inProgressSessions: HistorySession[]; // Orphaned sessions
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  offset: number;
  limit: number;
}
```

#### Key Actions

```typescript
// Load initial sessions (with pagination)
await loadSessions({ reset: true });

// Load orphaned in-progress sessions
await loadInProgressSessions();

// Infinite scroll
await loadMoreSessions();

// Refresh current view
await refreshSessions();

// Search by exercise name
await searchSessions(query: string);

// Filter by date range
await filterByDateRange(startDate: string, endDate: string);

// Get completion status
await getCompletedRoutineIdsForDate(date: string): Promise<Set<string>>;

// Get sessions count for date range (for indicators)
await getSessionsCountByDate(startDate: string, endDate: string): Promise<Map<string, number>>;

// Discard orphaned session
await discardSession(sessionId: string);
```

#### Query Patterns

```typescript
// Example: Load sessions with pagination
const sessions = await db.query.sessions.findMany({
  where: eq(sessions.isActive, false), // Only completed sessions
  orderBy: [desc(sessions.startTime)],
  limit: 20,
  offset: 0,
  with: {
    routine: true,
    exercises: {
      with: { sets: true }
    },
    reflection: true,
  },
});
```

### Routines Module (`src/features/routines/`)

**Purpose:** CRUD operations for reusable workout templates

#### Store State

```typescript
interface RoutineStore {
  routines: Routine[];
  isLoading: boolean;
}
```

#### Key Actions

```typescript
// Load all routines
await loadRoutines();

// Load single routine with exercises
await loadRoutineWithExercises(routineId: string);

// Create routine
await createRoutine(title: string, exercises: string[], plannedDate?: string);

// Update routine
await updateRoutine(routineId: string, updates: Partial<Routine>);

// Delete routine
await deleteRoutine(routineId: string);

// Duplicate routine
await duplicateRoutine(routineId: string, newPlannedDate?: string);
```

### Settings Module (`src/features/settings/`)

**Purpose:** App preferences (persisted to AsyncStorage)

#### Store State

```typescript
interface SettingsStore {
  // Session defaults
  sessionDuration: number; // Default target duration (minutes)

  // Auto-end configuration
  autoEndSession: boolean;
  autoEndTimeout: number; // Minutes of inactivity before auto-end
}
```

#### Key Actions

```typescript
setSessionDuration(minutes: number);
setAutoEndSession(enabled: boolean);
setAutoEndTimeout(minutes: number);
```

---

## Database Schema

### Overview

DriftLog uses **Drizzle ORM** with **Expo SQLite** for a fully typed, local-only database.

**Schema Location:** `src/core/db/schema.ts`  
**Migrations:** `drizzle/` (auto-generated)

### Tables

#### `sessions`

Active and completed workout sessions.

```typescript
sessions {
  id: text (PK)
  date: text                    // ISO date (YYYY-MM-DD)
  startTime: text               // ISO datetime
  endTime: text | null
  isActive: boolean             // true = in progress, false = completed
  routineId: text | null        // FK to routines.id
  targetDuration: integer | null // Target minutes (15, 30, 60, 90)
  createdAt: text
  updatedAt: text
}

// Indexes:
// - idx_sessions_is_active (WHERE is_active = 1)
// - idx_sessions_date
// - idx_sessions_date_range (date, start_time)
```

#### `exercises`

Exercises logged in a session.

```typescript
exercises {
  id: text (PK)
  sessionId: text (FK → sessions.id ON DELETE CASCADE)
  name: text
  order: integer                // Display order
  completedAt: text | null      // ISO datetime when marked complete
  createdAt: text
  updatedAt: text
}

// Indexes:
// - idx_exercises_session_id
```

#### `sets`

Individual sets within an exercise.

```typescript
sets {
  id: text (PK)
  exerciseId: text (FK → exercises.id ON DELETE CASCADE)
  reps: integer
  weight: real | null           // Optional weight in kg/lbs
  order: integer                // Set number (1, 2, 3, ...)
  timestamp: text               // ISO datetime when logged
  createdAt: text
  updatedAt: text
}

// Indexes:
// - idx_sets_exercise_id
```

#### `reflections`

Post-workout reflections (one per session).

```typescript
reflections {
  id: text (PK)
  sessionId: text (FK → sessions.id ON DELETE CASCADE, UNIQUE)
  feeling: text | null          // "How did this feel?"
  notes: text | null            // "Anything to note?"
  createdAt: text
  updatedAt: text
}

// Indexes:
// - reflections_session_id_unique (UNIQUE)
```

#### `routines`

Reusable workout templates.

```typescript
routines {
  id: text (PK)
  title: text
  notes: text | null
  plannedDate: text | null      // ISO date when routine is planned
  createdAt: text
  updatedAt: text
}

// Indexes:
// - idx_routines_planned_date (WHERE planned_date IS NOT NULL)
```

#### `routine_exercises`

Exercises in a routine template.

```typescript
routine_exercises {
  id: text (PK)
  routineId: text (FK → routines.id ON DELETE CASCADE)
  name: text
  order: integer                // Display order
  createdAt: text
  updatedAt: text
}

// Indexes:
// - idx_routine_exercises_routine_id
```

### Relations

```typescript
sessions.routine → routines (one-to-one)
sessions.exercises → exercises[] (one-to-many)
sessions.reflection → reflections (one-to-one)
exercises.sets → sets[] (one-to-many)
routines.exercises → routine_exercises[] (one-to-many)
```

### Database Initialization

**Location:** `src/core/db/index.ts`

```typescript
// Initialize database (called in app/_layout.tsx)
const success = await initDatabase();

// Wait for database before queries (use in stores)
await waitForDb();

// Check if database is ready (synchronous)
const ready = isDbInitialized();
```

**Migration Strategy:**
- Tables are created/verified on app launch
- Missing non-critical columns are added via ALTER TABLE
- Missing critical columns trigger table recreation (data loss)
- Indexes are created after tables are ready

### Query Examples

```typescript
// Get completed sessions for history list
const sessions = await db.query.sessions.findMany({
  where: eq(sessions.isActive, false),
  orderBy: [desc(sessions.startTime)],
  limit: 20,
  with: {
    routine: true,
    exercises: { with: { sets: true } },
    reflection: true,
  },
});

// Get single session detail
const session = await db.query.sessions.findFirst({
  where: eq(sessions.id, sessionId),
  with: {
    exercises: {
      orderBy: [asc(exercises.order)],
      with: {
        sets: { orderBy: [asc(sets.order)] },
      },
    },
    reflection: true,
  },
});

// Get routines for a specific date
const routines = await db.query.routines.findMany({
  where: eq(routines.plannedDate, "2026-01-18"),
  orderBy: [asc(routines.createdAt)],
  with: {
    exercises: { orderBy: [asc(routineExercises.order)] },
  },
});

// Search sessions by exercise name (raw SQL for LIKE)
const results = await db
  .select()
  .from(sessions)
  .innerJoin(exercises, eq(exercises.sessionId, sessions.id))
  .where(and(
    eq(sessions.isActive, false),
    like(exercises.name, `%${query}%`)
  ))
  .orderBy(desc(sessions.startTime));
```

---

## State Management

### Zustand Architecture

DriftLog uses **Zustand** for global state management with **AsyncStorage persistence** for critical data.

#### Store Pattern

```typescript
// Store with persistence
export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      // State
      isSessionActive: false,
      currentExercises: [],

      // Actions
      startSession: async () => {
        // ...
        set({ isSessionActive: true, ... });
      },
    }),
    sessionPersistConfig, // AsyncStorage config
  ),
);

// Usage in components
function SessionScreen() {
  // Selective subscription (prevents re-renders)
  const isActive = useSessionStore((state) => state.isSessionActive);
  const exercises = useSessionStore((state) => state.currentExercises);

  // Destructure actions (stable references)
  const { startSession, endSession } = useSessionStore();

  // Direct store access (outside React)
  const handleAction = () => {
    useSessionStore.getState().startSession();
  };
}
```

#### Persistence Configuration

**Session Store** (Critical for crash recovery):
```typescript
{
  name: 'session-storage',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state) => ({
    activeSessionId: state.activeSessionId,
    currentExercises: state.currentExercises,
    // ... session data
  }),
}
```

**Settings Store** (User preferences):
```typescript
{
  name: 'settings-storage',
  storage: createJSONStorage(() => AsyncStorage),
  // Entire store is persisted
}
```

**History Store** (No persistence):
- Data loaded on demand from SQLite
- No need for AsyncStorage caching

#### Store Performance Patterns

1. **Selective Subscriptions**: Use selectors to prevent unnecessary re-renders
   ```typescript
   const isActive = useSessionStore((state) => state.isSessionActive);
   // Component only re-renders when isActive changes
   ```

2. **Direct Access**: Call actions outside React using `getState()`
   ```typescript
   useSessionStore.getState().addExercise("Push-ups");
   ```

3. **Batch Updates**: Update multiple fields in single `set()` call
   ```typescript
   set({
     isSessionActive: true,
     currentExercises: [...],
     sessionStartTime: now,
   });
   ```

4. **Avoid Nested Objects**: Use flat state structure for better reactivity
   ```typescript
   // Good
   interface Store {
     isActive: boolean;
     exerciseCount: number;
   }

   // Avoid
   interface Store {
     session: {
       isActive: boolean;
       exerciseCount: number;
     };
   }
   ```

---

## Styling System

### NativeWind v5 (Tailwind CSS for React Native)

DriftLog uses **NativeWind v5** for Tailwind-style utility classes with React Native.

#### Configuration

**PostCSS:** `postcss.config.mjs`
```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**Metro:** `metro.config.js`
```javascript
const { withNativewind } = require("nativewind/metro");
module.exports = withNativewind(config);
```

**Global CSS:** `global.css`
```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";
@import "nativewind/theme";

@theme {
  /* Design tokens defined here */
}
```

#### Design Tokens

**Theme Definition:** `global.css` (lines 11-102)

```css
@theme {
  /* Primary Brand Colors */
  --color-primary-500: #f4a261; /* Main orange */
  --color-dark-primary: #ff9f6c; /* Brighter for dark mode */

  /* Light Mode */
  --color-light-bg-primary: #faf4f0;
  --color-light-surface: #ffffff;
  --color-light-text-primary: #2b2b2b;
  --color-light-border-light: #e8e4df;

  /* Dark Mode */
  --color-dark-bg-primary: #0f0f0f;
  --color-dark-surface: #252525;
  --color-dark-text-primary: #f5f5f5;
  --color-dark-border-light: #2f2f2f;

  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Typography */
  --font-size-base: 0.875rem; /* 14px */
  --font-size-lg: 1rem; /* 16px */
  --font-size-2xl: 1.5rem; /* 24px */

  /* Spacing */
  --spacing-4: 1rem; /* 16px */
  --spacing-6: 1.5rem; /* 24px */

  /* Border Radius */
  --radius-lg: 1rem; /* 16px */
  --radius-2xl: 1.5rem; /* 24px */
}
```

#### Semantic Classes

**Always use semantic classes, never raw colors:**

```tsx
// Backgrounds
<View className="bg-light-bg-primary dark:bg-dark-bg-primary">
<View className="bg-light-surface dark:bg-dark-surface">

// Text
<Text className="text-light-text-primary dark:text-dark-text-primary">
<Text className="text-light-text-secondary dark:text-dark-text-secondary">

// Borders
<View className="border border-light-border-light dark:border-dark-border-medium">

// Primary Brand
<View className="bg-primary-500 dark:bg-dark-primary">
<Text className="text-primary-500 dark:text-dark-primary">
```

#### Common Patterns

**Card:**
```tsx
<View className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-2xl p-5 shadow-sm">
  {children}
</View>
```

**Button:**
```tsx
<Pressable className="bg-primary-500 dark:bg-dark-primary rounded-xl py-4 px-6 active:opacity-70">
  <Text className="text-white dark:text-dark-bg-primary font-semibold">
    {title}
  </Text>
</Pressable>
```

**Input:**
```tsx
<TextInput
  className="bg-light-bg-cream dark:bg-dark-bg-elevated border border-light-border-light dark:border-dark-border-medium rounded-2xl px-5 py-4 text-light-text-primary dark:text-dark-text-primary"
  placeholderTextColor={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
/>
```

#### Theme Context

**Location:** `src/core/contexts/ThemeContext.tsx`

```typescript
const { colorScheme, setColorScheme, toggleColorScheme } = useTheme();
// colorScheme: "light" | "dark" (effective scheme)
// setColorScheme("light" | "dark" | "system")
// toggleColorScheme() -> switches between light/dark

// StatusBar integration
<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
```

---

## Native Platform Integration

### iOS (CocoaPods)

**Location:** `ios/`

#### Key Files

- **`Podfile`**: CocoaPods dependency manifest
- **`Podfile.lock`**: Locked versions
- **`DriftLog/AppDelegate.swift`**: iOS app entry point
- **`DriftLog/Info.plist`**: iOS configuration (bundle ID, permissions, etc.)
- **`DriftLog/PrivacyInfo.xcprivacy`**: Privacy manifest (required for App Store)

#### Native Modules

DriftLog uses **Expo modules** (no custom native code):
- **expo-sqlite**: Local SQLite database
- **expo-secure-store**: Keychain storage
- **expo-crypto**: Cryptographic operations
- **expo-haptics**: Tactile feedback
- **react-native-gesture-handler**: Gesture recognition
- **react-native-reanimated**: Animations
- **react-native-screens**: Native navigation primitives
- **react-native-safe-area-context**: Safe area insets

#### Building iOS

```bash
# Install CocoaPods dependencies
cd ios && pod install

# Open Xcode workspace
xed ios/DriftLog.xcworkspace

# Run on simulator
pnpm ios

# Run on device (requires Apple Developer account)
pnpm local:run:ios --device
```

### Android (Gradle)

**Location:** `android/`

#### Key Files

- **`build.gradle`**: Root Gradle config
- **`app/build.gradle`**: App-level Gradle config (build types, signing, etc.)
- **`gradle.properties`**: Gradle properties
- **`app/src/main/AndroidManifest.xml`**: Android manifest (permissions, activities, etc.)
- **`proguard-rules.pro`**: ProGuard configuration for release builds

#### Native Modules

Same Expo modules as iOS (auto-linked via Gradle).

#### Building Android

```bash
# Run on emulator/device
pnpm android

# Build APK (debug)
cd android && ./gradlew assembleDebug

# Build APK (release)
cd android && ./gradlew assembleRelease

# Build AAB (release, for Play Store)
cd android && ./gradlew bundleRelease
```

### Platform-Specific Code

#### Conditional Rendering

```typescript
import { Platform } from "react-native";

{Platform.OS === "ios" && <IOSOnlyComponent />}
{Platform.OS === "android" && <AndroidOnlyComponent />}

const height = Platform.select({
  ios: 60,
  android: 56,
  default: 60,
});
```

#### File Extensions

```
Component.tsx       # Shared
Component.ios.tsx   # iOS-specific
Component.android.tsx # Android-specific
Component.web.tsx   # Web-specific (unused in DriftLog)
```

#### Safe Area Handling

```typescript
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Screen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Content */}
    </View>
  );
}
```

---

## Build & Development

### Development Workflow

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start

# Run on iOS simulator
pnpm ios

# Run on Android emulator
pnpm android

# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix

# Database
pnpm db:generate     # Generate migrations after schema changes
pnpm db:studio       # Open Drizzle Studio (DB browser)
```

### Build Commands

#### EAS Build (Cloud)

```bash
# Development builds
pnpm build:dev            # iOS + Android
pnpm build:dev:ios        # iOS only
pnpm build:dev:android    # Android only
pnpm build:dev:sim        # iOS simulator build

# Preview builds (TestFlight/internal testing)
pnpm build:preview
pnpm build:preview:ios
pnpm build:preview:android

# Production builds (App Store/Play Store)
pnpm build:prod
pnpm build:prod:ios
pnpm build:prod:android

# Submit to stores
pnpm submit:ios
pnpm submit:android
pnpm submit:all
```

#### Local Builds

```bash
# Prebuild (generate native folders)
pnpm prebuild
pnpm prebuild:clean

# Android local builds
pnpm local:build:android:apk  # Debug APK
pnpm local:build:android:aab  # Release AAB

# iOS local builds (requires Xcode)
pnpm local:ios:open           # Open Xcode
pnpm local:run:ios:release    # Run release build
```

### Environment Configuration

**Expo Config:** `app.json`
```json
{
  "expo": {
    "name": "DriftLog",
    "slug": "driftlog",
    "version": "1.0.0",
    "scheme": "driftlog",
    "ios": {
      "bundleIdentifier": "com.driftlog.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.driftlog.app",
      "versionCode": 1
    }
  }
}
```

**EAS Config:** `eas.json`
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "distribution": "store",
      "autoIncrement": true,
      "channel": "production"
    }
  }
}
```

---

## Key Dependencies

### Mobile-Specific Dependencies

These dependencies are **React Native-specific** and will require web alternatives:

#### Core React Native
- **react-native**: 0.81.5 → Will need **react-dom** for web
- **react-native-gesture-handler**: ~2.28.0 → Web gesture library needed
- **react-native-reanimated**: ~4.1.6 → Consider **framer-motion** for web
- **react-native-safe-area-context**: ~5.6.2 → CSS safe-area-inset-* for web
- **react-native-screens**: ~4.16.0 → Not needed for web (React Router handles this)

#### UI & Interactions
- **react-native-draggable-flatlist**: ^4.0.3 → **@dnd-kit/sortable** for web
- **@shopify/flash-list**: 2.0.2 → Standard **virtualized lists** (react-window/react-virtual) for web
- **react-native-calendars**: ^1.1313.0 → Web calendar library (react-day-picker, date-fns)

#### Expo Modules (Mobile-only)
- **expo-sqlite**: ^16.0.10 → **IndexedDB** or **Web SQL** (via sql.js) for web
- **expo-secure-store**: ~15.0.8 → **Web Crypto API** + **localStorage** for web
- **expo-crypto**: ~15.0.8 → **Web Crypto API** (crypto.subtle) for web
- **expo-haptics**: ^15.0.8 → **Vibration API** (limited support) or remove for web
- **expo-file-system**: → **File API** (Blob, File, FileReader) for web

#### Storage
- **@react-native-async-storage/async-storage**: 2.2.0 → **localStorage** for web

### Cross-Platform Dependencies

These work on both mobile and web:

- **react**: 19.1.0 ✅
- **zustand**: ^5.0.10 ✅
- **date-fns**: ^4.1.0 ✅
- **drizzle-orm**: ^0.45.1 (with different driver for web)
- **expo-router**: ^6.0.21 (supports web)
- **nativewind**: 5.0.0-preview.2 (supports web with tailwindcss)

---

## Web Adaptation Considerations

### 1. Routing

**Current:** Expo Router (file-based, React Native)  
**Web Alternative:** Expo Router supports web, OR use **React Router v6**

```typescript
// Expo Router (works on web)
import { useRouter } from "expo-router";
const router = useRouter();
router.push("/history");

// React Router (web-only alternative)
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();
navigate("/history");
```

### 2. Database

**Current:** Expo SQLite (native SQLite)  
**Web Alternatives:**
- **IndexedDB** (native browser database)
- **sql.js** (SQLite compiled to WebAssembly)
- **PGlite** (Postgres in WebAssembly)
- **Drizzle ORM** supports all of the above

```typescript
// Mobile (expo-sqlite)
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
const expoDb = openDatabaseSync("driftlog.db");
const db = drizzle(expoDb, { schema });

// Web (sql.js)
import { drizzle } from "drizzle-orm/sql-js";
import initSqlJs from "sql.js";
const SQL = await initSqlJs();
const sqlJsDb = new SQL.Database();
const db = drizzle(sqlJsDb, { schema });
```

### 3. Storage (AsyncStorage)

**Current:** @react-native-async-storage/async-storage  
**Web Alternative:** localStorage (synchronous) or localForage (async)

```typescript
// Mobile (AsyncStorage)
import AsyncStorage from "@react-native-async-storage/async-storage";
await AsyncStorage.setItem("key", "value");
const value = await AsyncStorage.getItem("key");

// Web (localStorage)
localStorage.setItem("key", "value");
const value = localStorage.getItem("key");

// Web (localForage - async, larger storage)
import localforage from "localforage";
await localforage.setItem("key", "value");
const value = await localforage.getItem("key");
```

### 4. Styling (NativeWind)

**Current:** NativeWind v5 (Tailwind for React Native)  
**Web:** NativeWind v5 supports web, OR use **vanilla Tailwind CSS**

NativeWind classes work on web, but some React Native-specific props don't translate:
- **android_ripple**: No web equivalent (use CSS :active)
- **hitSlop**: No web equivalent (use padding)
- **accessible/accessibilityLabel**: Use aria-label

```tsx
// Mobile
<Pressable
  android_ripple={{ color: "rgba(255, 255, 255, 0.3)" }}
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  accessibilityLabel="Start workout"
>
  <Text>Start</Text>
</Pressable>

// Web (button element)
<button
  className="active:opacity-70 p-2"
  aria-label="Start workout"
>
  Start
</button>
```

### 5. Gestures & Animations

**Current:**
- react-native-gesture-handler (pan, swipe, etc.)
- react-native-reanimated (smooth animations)
- react-native-draggable-flatlist (reorder lists)

**Web Alternatives:**
- **@dnd-kit/core + @dnd-kit/sortable**: Drag & drop (keyboard accessible)
- **framer-motion**: Declarative animations (similar API to Reanimated)
- **React Spring**: Physics-based animations

```tsx
// Mobile (react-native-draggable-flatlist)
<DraggableFlatList
  data={items}
  onDragEnd={({ data }) => setItems(data)}
  renderItem={({ item, drag }) => (
    <TouchableOpacity onLongPress={drag}>
      <Text>{item.name}</Text>
    </TouchableOpacity>
  )}
/>

// Web (@dnd-kit/sortable)
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={items}>
    {items.map(item => (
      <SortableItem key={item.id} id={item.id}>
        {item.name}
      </SortableItem>
    ))}
  </SortableContext>
</DndContext>
```

### 6. Native Modules (Expo)

**Current:** Expo modules (expo-sqlite, expo-secure-store, expo-haptics, etc.)  
**Web Alternatives:**

| Mobile Module | Web Alternative |
|---------------|----------------|
| expo-sqlite | IndexedDB / sql.js / PGlite |
| expo-secure-store | Web Crypto API + localStorage |
| expo-crypto | Web Crypto API (crypto.subtle) |
| expo-haptics | Vibration API (limited) or remove |
| expo-file-system | File API (Blob, File, FileReader) |
| expo-constants | Environment variables |

### 7. Safe Area Handling

**Current:** react-native-safe-area-context (notch, home indicator, etc.)  
**Web:** CSS environment variables

```tsx
// Mobile (react-native-safe-area-context)
import { useSafeAreaInsets } from "react-native-safe-area-context";
const insets = useSafeAreaInsets();
<View style={{ paddingTop: insets.top }}>

// Web (CSS env variables)
<div style={{
  paddingTop: "env(safe-area-inset-top)",
  paddingBottom: "env(safe-area-inset-bottom)",
}}>
```

### 8. Lists & Scrolling

**Current:**
- @shopify/flash-list (virtualized, performant)
- FlatList (React Native built-in)

**Web Alternatives:**
- **react-window**: Virtualized lists (lightweight)
- **react-virtual**: Virtualized lists (more features)
- **@tanstack/virtual**: Modern virtualization (TanStack)

```tsx
// Mobile (FlashList)
<FlashList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  estimatedItemSize={100}
/>

// Web (react-window)
<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={100}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ItemCard item={items[index]} />
    </div>
  )}
</FixedSizeList>
```

### 9. Platform Detection

```typescript
// Mobile (React Native Platform API)
import { Platform } from "react-native";
const isWeb = Platform.OS === "web";
const isIOS = Platform.OS === "ios";

// Web (user agent or feature detection)
const isWeb = typeof window !== "undefined";
const isMobile = /Mobi|Android/i.test(navigator.userAgent);
```

### 10. Component Mapping

| Mobile Component | Web Component |
|-----------------|---------------|
| View | div |
| Text | p, span, h1-h6 |
| Pressable | button, a |
| TouchableOpacity | button (with CSS opacity) |
| TextInput | input, textarea |
| ScrollView | div (with overflow-y: auto) |
| FlatList | div + map() or virtualized list |
| Image | img |
| StatusBar | meta tags (theme-color) |

---

## Next Steps for Web Adaptation

### Phase 1: Core Infrastructure

1. **Database Layer**
   - Replace expo-sqlite with sql.js or IndexedDB
   - Update `src/core/db/index.ts` to detect platform and use appropriate driver
   - Test all Drizzle queries work with new driver

2. **Storage Layer**
   - Replace AsyncStorage with localStorage/localForage
   - Update Zustand persistence config
   - Ensure session recovery works

3. **Routing**
   - Verify Expo Router web support OR migrate to React Router
   - Update navigation helpers in `src/core/utils/navigation.ts`

### Phase 2: UI Components

4. **Replace Mobile-Specific Components**
   - Convert View/Text/Pressable to semantic HTML (div/p/button)
   - Remove android_ripple, hitSlop props
   - Update accessibility props (accessibilityLabel → aria-label)

5. **Gestures & Animations**
   - Replace react-native-draggable-flatlist with @dnd-kit/sortable
   - Replace react-native-reanimated with framer-motion (if needed)

6. **Lists**
   - Replace FlashList with react-window or @tanstack/virtual
   - Optimize for web scrolling performance

### Phase 3: Features

7. **Haptics & Native Modules**
   - Remove expo-haptics (or use Vibration API)
   - Replace expo-secure-store with Web Crypto API + localStorage

8. **Safe Areas**
   - Replace useSafeAreaInsets with CSS env() variables
   - Add PWA meta tags for mobile web

### Phase 4: Styling

9. **NativeWind → Tailwind CSS**
   - NativeWind v5 supports web, so classes should work
   - Remove React Native-specific props
   - Test responsive design (mobile/tablet/desktop)

10. **Theme System**
    - Ensure light/dark mode works with CSS variables
    - Update ThemeContext for web (use localStorage instead of AsyncStorage)

---

## Architecture Strengths for Web Adaptation

✅ **Zustand State Management**: Works identically on web  
✅ **Drizzle ORM**: Supports multiple drivers (sql.js, PGlite, IndexedDB)  
✅ **TypeScript**: Type safety carries over to web  
✅ **Modular Architecture**: Features are isolated, easy to adapt one at a time  
✅ **Semantic Design Tokens**: Theme system translates well to CSS variables  
✅ **Offline-First**: No API layer to rewrite, all data is local  

---

## Conclusion

DriftLog is a **well-architected, production-ready mobile app** with:
- Clean separation of concerns (components, features, core utilities)
- Type-safe database with Drizzle ORM
- Performant state management with Zustand
- Modern styling with NativeWind v5
- Comprehensive error handling and logging

The codebase is **highly adaptable to web** due to:
- Platform-agnostic state management
- Database layer that can swap drivers
- UI components that follow semantic patterns
- Minimal custom native code (all Expo modules)

**Estimated Web Adaptation Effort**: 2-4 weeks for full-stack developer

**Key Challenges**:
1. Database migration (expo-sqlite → sql.js/IndexedDB)
2. Gesture/animation libraries (RN-specific → web libraries)
3. List virtualization (FlashList → react-window)
4. Component conversion (View/Text → semantic HTML)

**Recommended Approach**: Incremental migration, starting with core infrastructure (database, storage, routing) and progressively replacing mobile-specific UI components.

---

**Documentation Version**: 1.0  
**Last Updated**: Sun Jan 18 2026  
**Author**: AI Assistant (Codebase Analysis)

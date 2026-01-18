# DriftLog - Production Architecture

## Overview
DriftLog is a production-ready, offline-first workout logging app built with Expo Router, React Native, and NativeWind v5.

## Tech Stack
- **Framework**: Expo SDK 54 + React Native 0.81.5
- **Routing**: Expo Router v6 (file-based routing)
- **Styling**: NativeWind v5 (TailwindCSS v4 for React Native)
- **State Management**: Zustand v5 with persist middleware
- **Database**: Expo SQLite with Drizzle ORM
- **Lists**: FlashList for high-performance virtualized lists
- **Drag & Drop**: react-native-draggable-flatlist for exercise reordering
- **Haptics**: expo-haptics for tactile feedback
- **TypeScript**: Full type safety with path aliases
- **Linting/Formatting**: Biome

## Project Structure

\`\`\`
driftlog/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx              # Root layout with providers
│   ├── (tabs)/                  # Tab navigation group
│   │   ├── _layout.tsx          # Tab bar configuration
│   │   ├── index.tsx            # Today screen (planned routines, freestyle start)
│   │   ├── plan.tsx             # Weekly planning screen
│   │   ├── history.tsx          # Session history screen (FlashList)
│   │   └── settings.tsx         # Settings screen
│   ├── session/
│   │   └── [routineId].tsx      # Active workout session screen
│   ├── history/
│   │   └── [id].tsx             # Session detail screen
│   └── routines/
│       └── [id].tsx             # Routine editor screen
│
├── src/                         # Source code
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Base UI components
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── DateRangePicker.tsx
│   │   │   ├── FreestyleCard.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── session/             # Session screen components
│   │   │   ├── ActiveSessionBanner.tsx
│   │   │   ├── ExerciseRow.tsx
│   │   │   ├── SessionHeader.tsx
│   │   │   └── TimerPicker.tsx
│   │   ├── history/             # History screen components
│   │   │   ├── ExerciseDetailCard.tsx
│   │   │   ├── InProgressSessionCard.tsx
│   │   │   ├── ReflectionSection.tsx
│   │   │   ├── SessionCard.tsx
│   │   │   ├── SessionCardSkeleton.tsx
│   │   │   └── SessionMetadata.tsx
│   │   ├── routines/            # Routines components
│   │   │   └── RoutineCard.tsx
│   │   ├── planning/            # Planning components
│   │   │   └── WeekNavigationRail.tsx
│   │   └── ErrorBoundary.tsx
│   │
│   ├── core/                    # Core infrastructure
│   │   ├── contexts/            # React contexts
│   │   │   └── ThemeContext.tsx
│   │   ├── db/                  # Database setup
│   │   │   ├── index.ts         # DB initialization with waitForDb()
│   │   │   └── schema.ts        # Drizzle schema & relations
│   │   ├── types/               # Shared TypeScript types
│   │   │   └── database.ts
│   │   └── utils/               # Helper functions
│   │       ├── helpers.ts       # Date, ID generation, time utils
│   │       ├── validation.ts    # Input sanitization
│   │       ├── encryption.ts    # Reflection encryption
│   │       ├── navigation.ts    # Type-safe navigation
│   │       ├── logger.ts        # Logging utility
│   │       ├── errors.ts        # Error handling
│   │       ├── secureStorage.ts # Secure storage wrapper
│   │       ├── secureDelete.ts  # Secure deletion
│   │       └── dateFormats.ts   # Date format constants
│   │
│   ├── features/                # Feature modules (domain logic)
│   │   ├── session/             # Workout session module
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── store.ts         # Zustand store with persistence
│   │   │   └── persistence.ts   # AsyncStorage crash recovery
│   │   ├── routines/            # Routines module
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   └── store.ts         # CRUD operations
│   │   ├── history/             # History module
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   └── store.ts         # Pagination, search, filtering
│   │   └── settings/            # Settings module
│   │       ├── index.ts
│   │       ├── types.ts
│   │       └── store.ts         # Persisted preferences
│   │
│   └── hooks/                   # Custom React hooks
│       ├── index.ts
│       └── useSessionTimer.ts   # Timer management hook
│
├── assets/                      # Static assets (images, fonts)
├── docs/                        # Documentation
├── drizzle/                     # Database migrations (generated)
├── drizzle.config.ts            # Drizzle ORM config
├── metro.config.js              # Metro bundler config (NativeWind)
├── tsconfig.json                # TypeScript config (path aliases)
└── package.json                 # Dependencies & scripts
\`\`\`

## Feature Architecture

DriftLog follows a **feature-based architecture** with four independent modules:

### 1. Session Module (\`src/features/session/\`)
**Purpose**: Manage active workout sessions with real-time exercise tracking.

- **State**: Active session data, exercises, timer state, pause/resume
- **Actions**: Start/end session, add/complete/reorder exercises
- **Store**: In-memory during workout, writes to DB on \`endSession()\`, AsyncStorage for crash recovery

Key capabilities:
- Start freestyle or routine-based sessions
- Add exercises with validation
- Complete/uncomplete exercises with haptic feedback
- Drag-to-reorder exercises
- Pause/resume timer with accumulated pause tracking
- Target duration with time-up warnings
- Auto-end session on inactivity (configurable)
- Session persistence across app kills

### 2. Routines Module (\`src/features/routines/\`)
**Purpose**: Create and manage reusable workout templates.

- **State**: Routines list, draft routine for editing
- **Actions**: CRUD operations, plan for dates, create from sessions
- **Store**: Queries DB on demand, draft state for editing flow

Key capabilities:
- Create/edit/delete routines
- Add/edit/remove/reorder exercises
- Plan routines for specific dates
- Create routines from past sessions
- Start sessions from routines

### 3. History Module (\`src/features/history/\`)
**Purpose**: View past sessions and add reflections.

- **State**: Sessions list (paginated), in-progress sessions, current session detail
- **Actions**: Load/search/filter sessions, save reflections, discard in-progress
- **Store**: Queries DB on demand with pagination support

Key capabilities:
- Paginated session list with FlashList
- Session detail with exercises and sets
- Search by routine name or exercise
- Date range filtering
- Reflections with encrypted storage
- In-progress session management (resume/discard)
- Create routine from completed session
- Completion status tracking for routines

### 4. Settings Module (\`src/features/settings/\`)
**Purpose**: App preferences persisted across sessions.

- **State**: Theme, auto-end settings, session duration
- **Actions**: Update settings
- **Store**: Persisted to AsyncStorage via Zustand persist middleware

Key capabilities:
- Theme switching (light/dark/system)
- Auto-end session toggle with timeout presets
- Default session duration preference

## Database Schema

### Tables
- **sessions**: Workout sessions with start/end times, routineId reference, targetDuration
- **exercises**: Exercises within a session with completion tracking
- **sets**: Individual sets with reps/weight/timestamp
- **reflections**: Post-session notes with encrypted feeling and notes
- **routines**: Reusable workout templates
- **routine_exercises**: Exercises within a routine
- **plans**: Daily workout planning (date-based)
- **planned_exercises**: Exercises within a plan

### Relations
- Session → Routine (optional via \`routineId\`)
- Session → Exercises (one-to-many, cascade delete)
- Exercise → Sets (one-to-many, cascade delete)
- Session → Reflection (one-to-one, cascade delete)
- Routine → RoutineExercises (one-to-many, cascade delete)
- Plan → PlannedExercises (one-to-many, cascade delete)

### Indexes (Performance)
- \`idx_sessions_is_active\` - Active sessions lookup
- \`idx_sessions_date\` - Date-based queries
- \`idx_sessions_date_range\` - Range queries for history
- \`idx_exercises_session_id\` - Exercise loading
- \`idx_sets_exercise_id\` - Set loading
- \`idx_routines_planned_date\` - Planned routines lookup
- \`plans_date_unique\` - One plan per date
- \`reflections_session_id_unique\` - One reflection per session

## Path Aliases

Configured in \`tsconfig.json\`:

\`\`\`typescript
import { useSessionStore } from "@/features/session";
import { useHistoryStore } from "@/features/history";
import { useRoutineStore } from "@/features/routines";
import { useSettingsStore } from "@/features/settings";
import { ThemeProvider, useTheme } from "@/core/contexts/ThemeContext";
import { Button, Card, BottomSheet } from "@/components/ui";
import { SessionCard, ReflectionSection } from "@/components/history";
import { ActiveSessionBanner, TimerPicker } from "@/components/session";
import { db, waitForDb } from "@/core/db";
import { Navigation } from "@/core/utils/navigation";
\`\`\`

## Development

### Running the App
\`\`\`bash
# Start development server
pnpm start

# Run on iOS
pnpm ios

# Run on Android
pnpm android
\`\`\`

### Type Checking
\`\`\`bash
pnpm typecheck
\`\`\`

### Linting & Formatting
\`\`\`bash
pnpm lint          # Check for issues
pnpm lint:fix      # Auto-fix issues
pnpm format        # Format code
\`\`\`

### Database Operations
\`\`\`bash
# Generate migration after schema changes
pnpm db:generate

# Open Drizzle Studio to inspect data
pnpm db:studio
\`\`\`

## Design Principles

1. **Offline-First**: App works with no internet connection
2. **Minimal Interaction**: Large tap targets, auto-carry forward values
3. **No Forced Behavior**: Accepts partial/messy data
4. **Instant**: No spinners on core flows
5. **Privacy**: No accounts, no tracking, local data only
6. **Crash Resilient**: Session state persisted to AsyncStorage

## Implemented Features

### Core Features (Complete)
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
- \`app/(tabs)/index.tsx\` - Today screen (planned routines, freestyle start)
- \`app/(tabs)/plan.tsx\` - Weekly planning with routines
- \`app/(tabs)/history.tsx\` - Session history list (FlashList)
- \`app/(tabs)/settings.tsx\` - App settings
- \`app/session/[routineId].tsx\` - Active workout session
- \`app/history/[id].tsx\` - Session detail view
- \`app/routines/[id].tsx\` - Routine editor

## Future Enhancements

1. Set logging UI (reps/weight per exercise)
2. Exercise library with history
3. Progress tracking and statistics
4. Data export (JSON/CSV)
5. Widgets for quick session start

---

**Built with care for endurance athletes who need simple, reliable workout tracking.**

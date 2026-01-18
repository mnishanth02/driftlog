# DriftLog - Production Architecture

## Overview
DriftLog is an offline-first workout logging app built with Expo Router, React Native, and NativeWind v5.

## Tech Stack
- **Framework**: Expo SDK 54 + React Native 0.81.5
- **Routing**: Expo Router v6 (file-based routing)
- **Styling**: NativeWind v5 (TailwindCSS v4 for React Native)
- **State Management**: Zustand v5 with persist middleware
- **Database**: Expo SQLite with Drizzle ORM
- **TypeScript**: Full type safety with path aliases
- **Linting/Formatting**: Biome

## Project Structure

```
driftlog/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx              # Root layout with providers
│   └── (tabs)/                  # Tab navigation group
│       ├── _layout.tsx          # Tab bar configuration
│       ├── index.tsx            # Today screen (Session)
│       ├── plan.tsx             # Weekly planning screen
│       ├── history.tsx          # Session history screen
│       └── settings.tsx         # Settings screen
│
├── src/                         # Source code
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Base UI components (Button, Card, etc.)
│   │   └── ThemeDemo.tsx        # Theme demo component
│   │
│   ├── core/                    # Core infrastructure
│   │   ├── contexts/            # React contexts
│   │   │   └── ThemeContext.tsx
│   │   ├── db/                  # Database setup
│   │   │   ├── index.ts         # DB initialization
│   │   │   └── schema.ts        # Drizzle schema & relations
│   │   ├── types/               # Shared TypeScript types
│   │   │   └── database.ts
│   │   └── utils/               # Helper functions
│   │       └── helpers.ts       # Date, ID generation, etc.
│   │
│   └── features/                # Feature modules (domain logic)
│       ├── session/             # Workout session module
│       │   ├── index.ts
│       │   ├── types.ts
│       │   └── store.ts         # Zustand store
│       ├── planning/            # Weekly planning module
│       │   ├── index.ts
│       │   ├── index.ts
│       │   ├── types.ts
│       │   └── store.ts
│       └── settings/            # Settings module
│
├── assets/                      # Static assets (images, fonts)
├── docs/                        # Documentation
├── drizzle/                     # Database migrations (generated)
├── drizzle.config.ts            # Drizzle ORM config
├── metro.config.js              # Metro bundler config (NativeWind)
├── tsconfig.json                # TypeScript config (path aliases)
└── package.json                 # Dependencies & scripts

DriftLog follows a **feature-based architecture** with four independent modules:

### 2. Planning Module (`src/features/planning/`)
- **Store**: Loads from DB, caches current week in memory

### 3. History Module (`src/features/history/`)
**Purpose**: View past sessions and add reflections.

- **State**: Sessions list, current session detail
- **Actions**: Load sessions, load detail, save reflections
- **Store**: Queries DB on demand, no caching

### 4. Settings Module (`src/features/settings/`)
**Purpose**: App preferences (units, auto-end session, theme).

- **State**: Units, auto-end timeout, etc.
- **Actions**: Update settings
- **Store**: Persisted to AsyncStorage via Zustand persist middleware

## Database Schema

### Tables
- **sessions**: Workout sessions with start/end times
- **exercises**: Exercises within a session
- **sets**: Individual sets with reps/weight
- **plans**: Daily workout intents
- **reflections**: Post-session notes

### Relations
- Session → Plan (optional)
- Session → Exercises (one-to-many)
- Exercise → Sets (one-to-many)
- Session → Reflection (one-to-one, optional)

## Path Aliases

Configured in `tsconfig.json`:

```typescript
import { useSessionStore } from "@/features/session";
import { ThemeProvider } from "@/core/contexts/ThemeContext";
import { Button } from "@/components/ui/Button";
import { db } from "@/core/db";
```

## Development

### Running the App
```bash
# Start development server
ppnpm start

# Run on iOS
ppnpm ios

# Run on Android
ppnpm android
```

### Type Checking
```bash
ppnpm typecheck
```

### Linting & Formatting
```bash
ppnpm lint          # Check for issues
ppnpm lint:fix      # Auto-fix issues
ppnpm format        # Format code
```

### Database Migrations
```bash
# Generate migration
ppnpm drizzle-kit generate

# Apply migration
ppnpm drizzle-kit migrate
```

## Design Principles

1. **Offline-First**: App works with no internet connection
2. **Minimal Interaction**: Large tap targets, auto-carry forward values
3. **No Forced Behavior**: Accepts partial/messy data
4. **Instant**: No spinners on core flows
5. **Privacy**: No accounts, no tracking, local data only

## Next Steps

1. Implement session logging UI (Today screen)
2. Build weekly planning interface
3. Create history list & detail views
4. Add reflection prompts
5. Implement auto-end session timer
6. Add data export (v1.1+)

---

**Built with care for endurance athletes who need simple, reliable workout tracking.**

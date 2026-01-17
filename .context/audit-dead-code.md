# DriftLog Dead Code Audit Report

## Summary

After a comprehensive analysis of the DriftLog codebase, I've identified several categories of issues including unused components, functions, types, and TODO comments that need attention.

---

## 1. UNUSED COMPONENTS

### src/components/ThemeDemo.tsx
| Type | Description | Recommendation |
|------|-------------|----------------|
| **Dead Code** | ThemeDemo component is defined but never imported or used in any app routes. Only referenced in documentation files. | **DELETE** - This is a demo/showcase component that serves no functional purpose in the production app. |

### src/components/ui/TabBar.tsx
| Type | Description | Recommendation |
|------|-------------|----------------|
| **Unused Export** | Only imported in ThemeDemo which is itself unused. Exported from ui/index.ts but no real usage in app. | **DELETE** or keep if planning to use. The app uses Expo Router tabs instead. |

### src/components/ui/MetricCard.tsx
| Type | Description | Recommendation |
|------|-------------|----------------|
| **Unused Export** | Only imported in ThemeDemo which is itself unused. No other usage in the app. | **DELETE** or keep if planning to use for workout metrics display. |

---

## 2. UNUSED UTILITIES & FUNCTIONS

### src/core/utils/helpers.ts
| Line | Function | Type | Recommendation |
|------|----------|------|----------------|
| 55-63 | `isSameWeek` | **Unused Export** | No imports found. **DELETE** unless planning future use. |
| 65-75 | `getWeekOffset` | **Unused Export** | No imports found. **DELETE** unless planning future use. |

### src/core/utils/errors.ts
| Line | Function | Type | Recommendation |
|------|----------|------|----------------|
| 106 | TODO comment | **TODO** | `// TODO: In production, send to error tracking service` - Needs attention for production deployment. |
| 144-148 | `showWarningToast` | **Unused Export** | Defined but never imported/used anywhere. **DELETE** or wire up where warnings are needed. |
| 187-203 | `createErrorHandler` | **Unused Export** | Defined but never imported/used. **DELETE** unless planning to use. |
| 215-225 | `withErrorHandling` | **Unused Export** | Defined but never imported/used. **DELETE** unless planning to use. |

### src/core/utils/navigation.ts
| Line | Function | Type | Recommendation |
|------|----------|------|----------------|
| 105 | `export default Navigation` | **Redundant Export** | Named export `Navigation` exists on line ~19. Default export at end is redundant. **REMOVE default export**. |

---

## 3. UNUSED TYPE DEFINITIONS

### src/features/session/types.ts
| Line | Type | Issue | Recommendation |
|------|------|-------|----------------|
| 3 | `SessionDuration` | **Unused Type** | Type `SessionDuration` is exported but never imported or used anywhere in the codebase. | **DELETE** |

### src/features/history/store.ts
| Line | Function | Type | Recommendation |
|------|----------|------|----------------|
| 72 | `isRoutineCompletedToday` | **Unused Store Action** | Defined in types and implemented in store, but never called from any component. `hasCompletedToday` is used instead for batch checking. | Consider **DELETE** or document as internal API. |

---

## 4. UNUSED FEATURE MODULE

### src/features/session/orchestrator.ts
| Type | Description | Recommendation |
|------|-------------|----------------|
| **Unused Export** | SessionOrchestrator namespace is exported from features/session/index.ts but **never imported** in any component. The app directly uses useSessionStore actions instead. | **DELETE** the entire file OR refactor app to use it consistently. This is 459 lines of dead code. |

---

## 5. TODO/FIXME COMMENTS

| File | Line | Comment | Priority |
|------|------|---------|----------|
| src/core/utils/errors.ts | 106 | `// TODO: In production, send to error tracking service` | **Medium** - Need error tracking (Sentry) before production. |
| [app/history/[id].tsx](app/history/[id].tsx#L36) | 36 | `// TODO: Add weightUnit to settings store in future phase` | **Low** - Feature enhancement, not a bug. |

---

## 6. UNUSED VARIABLES

### [app/history/[id].tsx](app/history/[id].tsx)
| Line | Variable | Issue | Recommendation |
|------|----------|-------|----------------|
| 37 | `_weightUnit` | **Unused Variable** | Variable is declared with `const _weightUnit = "lbs"` and never used. The underscore prefix indicates intentional non-use. | **DELETE** or implement weight unit display. |

### src/components/ui/Skeleton.tsx
| Line | Variable | Issue | Recommendation |
|------|----------|-------|----------------|
| 23 | `variant` | **Unused Prop** | Prop accepted but only destructured to type and never used. Comment says "for future use - tooltips". | Keep as-is if planned, or **DELETE** prop from interface. |

---

## 7. CONTEXT FUNCTION NEVER USED

### src/core/contexts/ThemeContext.tsx
| Line | Function | Issue | Recommendation |
|------|----------|-------|----------------|
| 68-74 | `toggleColorScheme` | **Unused Function** | Exported via useTheme but never called anywhere. The app uses setColorScheme via ThemeToggle instead. | Consider **DELETE** or keep for programmatic theme toggle needs. |

---

## 8. SUMMARY BY IMPACT

### High Impact (Should Delete)
1. **src/features/session/orchestrator.ts** - 459 lines of unused orchestration layer
2. **src/components/ThemeDemo.tsx** - 114 lines unused demo component
3. **src/components/ui/TabBar.tsx** - 35 lines unused (app uses Expo Router tabs)
4. **src/components/ui/MetricCard.tsx** - 32 lines unused

### Medium Impact (Consider Deleting)
1. `isSameWeek`, `getWeekOffset` - utility functions never called
2. `showWarningToast`, `createErrorHandler`, `withErrorHandling` - error utilities never used
3. `SessionDuration` type - never imported
4. `isRoutineCompletedToday` store action - never called

### Low Impact (Cleanup)
1. Remove redundant `export default Navigation`
2. Clean up TODO comments or create tickets
3. Remove unused `_weightUnit` variable
4. Remove `toggleColorScheme` if not needed

---

## 9. RECOMMENDATIONS

### Immediate Actions
1. **Delete src/features/session/orchestrator.ts** - The app works without it. This is the biggest piece of dead code.
2. **Delete src/components/ThemeDemo.tsx** - Demo component, not needed.
3. **Remove unused exports from src/components/ui/index.ts** for TabBar and MetricCard if deleting those files.

### Before Production
1. Address the error tracking TODO in src/core/utils/errors.ts
2. Clean up the weightUnit TODO or create a feature ticket

### Optional Cleanup
1. Remove the unused utility functions from helpers.ts
2. Remove the unused error utilities from errors.ts
3. Remove the SessionDuration type from session types

---

## 10. DEAD CODE METRICS

| Category | Files Affected | Lines of Dead Code (Approx) |
|----------|----------------|----------------------------|
| Unused Components | 3 | ~180 |
| Unused Feature Module | 1 | ~460 |
| Unused Functions | 6 | ~120 |
| Unused Types | 1 | ~5 |
| Unused Variables | 2 | ~5 |
| **Total** | **13** | **~770** |

Removing this dead code would reduce the codebase by approximately 770 lines, improving maintainability and reducing bundle size.

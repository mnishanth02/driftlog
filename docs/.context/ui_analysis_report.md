# UI/UX Analysis Report

**Date:** January 18, 2026
**Scope:** Routine Editor, Active Session, Session Details

## Executive Summary
The analyzed screens generally follow the project's "offline-first, minimal interaction" philosophy with good accessibility foundations (hit slop, proper roles). However, there is a recurring pattern of arbitrary pixel values ("magic numbers") for strict dimensions and fonts, rather than relying on the Tailwind/NativeWind scaling system. This leads to subtle inconsistencies and maintainability issues.

## key Findings

### 1. Global & Structural Issues
*   **Arbitrary Header Dimensions**: Multiple screens (`app/history/[id].tsx`, `app/routines/[id].tsx`) use:
    *   `h-13` (52px) - Non-standard. Standard is `h-12` (48px) or `h-14` (56px).
    *   `min-w-17.5` (70px) - Non-standard width for back button areas.
    *   `text-[17px]` - Force-overriding the scale. `text-base` (16px) or `text-lg` (18px) should be used.
*   **Hardcoded Color Logic**:
    *   `Ionicons` often use ternary logic with hardcoded hex values (e.g., `#f5f5f5` vs `#2b2b2b`).
    *   **Risk**: If `global.css` tokens change, these icons will remain the old colors, breaking the theme system sync.
    *   **Fix**: Create a `useIconColors()` hook or constant map that references the CSS variable values or centralized theme constants.

### 2. Typographic Inconsistencies
*   **Routine Component**: Uses `text-[34px]` for the title input.
    *   **Fix**: Use `text-4xl` (36px) or `text-3xl` (30px) to stay on the scale.
*   **Exercise Detail Card**: uses `text-[10px]` for the "Completed" badge.
    *   **Issue**: This is largely inaccessible and hard to read.
    *   **Fix**: Bump to `text-xs` (12px) or `text-[11px]` minimum if space is strict.

### 3. Spacing Grid Violations
*   **Exercise Detail Card**: Uses `mb-1.5` (6px).
    *   **Issue**: Drifts off the 4px spacing grid (`mb-1`=4px, `mb-2`=8px).
    *   **Fix**: Standardize to `mb-2`.
*   **FlatList Padding**: Uses `padding: 20` in style props.
    *   **Fix**: While acceptable, using `p-5` (20px) is preferred if passed via `contentContainerClassName` (if supported) or a constant `LAYOUT.screenPadding`.

### 4. Component-Specific UX
*   **Exercise Row (`ExerciseRow.tsx`)**:
    *   **Good**: Excellent use of visual states (dragging vs active vs completed) and `aria` roles.
    *   **Good**: Hamburger menu visual construction is clean, though manual (`w-4 h-0.5`).
*   **Timer Picker (`TimerPicker.tsx`)**:
    *   **Good**: Large touch targets (`py-5 px-6`) perfect for the "fatigued athlete" persona.
    *   **Visuals**: Uses `bg-primary-500` for selection, which is high contrast and clear.

## Recommendations Plan

1.  **Standardize Headers**: Create a `ScreenHeader` component or strict standard classes (`h-14`, `text-lg`) to eliminate magic numbers.
2.  **Fix Badge Typography**: Increase "Completed" badge font size in history.
3.  **Refactor Icon Colors**: abstract icon color selection to ensure it tracks with the theme (e.g., `const iconColors = useThemeColors()`).
4.  **Align Spacing**: Run a pass to snap `1.5` (6px) or `13` (52px) values to the nearest grid step (4, 8, 12, 16, ... 48, 56).

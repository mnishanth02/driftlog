# Phase 6: Responsive Design

**Duration:** 3-4 hours

---

## Overview

Add responsive design for web using a hybrid approach:
- Mobile-first centered container
- Responsive enhancements for key screens

---

## Strategy

DriftLog is a workout logging app optimized for mobile use. The responsive strategy is:

1. **Default:** Center content in a mobile-width container on larger screens
2. **Enhancement:** Add responsive improvements where beneficial (history, planning)
3. **Interactions:** Web-specific hover states for better UX

This maintains the mobile-first design while looking polished on desktop.

---

## Tasks

### 6.1 Create WebContainer Component

**Create:** `src/components/ui/WebContainer.tsx`

Purpose: Wrap content in a centered, max-width container on web.

**Implementation:**
```tsx
import { Platform, View, ViewProps } from "react-native";

interface WebContainerProps extends ViewProps {
  children: React.ReactNode;
  maxWidth?: number; // Default: 480px (mobile width)
  className?: string;
}

export function WebContainer({ 
  children, 
  maxWidth = 480,
  className = "",
  style,
  ...props
}: WebContainerProps) {
  // Pass through on native
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  // Centered container on web
  return (
    <View
      className={`flex-1 w-full ${className}`}
      style={[{ alignSelf: "center", maxWidth }, style]}
      {...props}
    >
      {children}
    </View>
  );
}
```

**Key features:**
- No-op on native (doesn't affect mobile app)
- Centered with `alignSelf: "center"`
- Respects parent flex layout
- Accepts additional className and style props
- Default maxWidth of 480px (typical mobile width)

---

### 6.2 Apply WebContainer to Main Screens

Wrap the main content of each screen with WebContainer.

**Files to modify:**

1. **`app/(tabs)/index.tsx`** (Today screen)
2. **`app/(tabs)/history.tsx`** (History screen)
3. **`app/(tabs)/plan.tsx`** (Planning screen)
4. **`app/(tabs)/settings.tsx`** (Settings screen)
5. **`app/routines/[id].tsx`** (Routine editor)
6. **`app/session/[routineId].tsx`** (Active session)
7. **`app/history/[id].tsx`** (Session detail)

**Pattern:**
```tsx
import { WebContainer } from "@/components/ui/WebContainer";

export default function Screen() {
  const insets = useSafeAreaInsets();
  
  return (
    <WebContainer>
      <View style={{ paddingTop: insets.top }}>
        {/* Existing screen content */}
      </View>
    </WebContainer>
  );
}
```

**Note:** Keep safe area insets inside WebContainer to maintain proper mobile behavior.

---

### 6.3 Add Web Hover States

Web users expect hover feedback. Add hover states to interactive elements.

**NativeWind hover classes:**
```tsx
// Buttons
<Pressable className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700">
  
// Cards
<Pressable className="bg-light-surface dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800">
  
// List items
<TouchableOpacity className="opacity-100 hover:opacity-80">
```

**Files to update:**

| File | Elements to Update |
|------|-------------------|
| `src/components/ui/Button.tsx` | All button variants |
| `src/components/ui/Card.tsx` | Pressable cards |
| `src/components/history/SessionCard.tsx` | Session list items |
| `src/components/routines/RoutineCard.tsx` | Routine list items |
| `src/components/session/ExerciseRow.tsx` | Exercise rows |
| `src/components/planning/WeekNavigationRail.tsx` | Day buttons |

**Example update:**
```tsx
// Before
<Pressable className="bg-primary-500">

// After
<Pressable className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700">
```

**Hover states by element type:**

| Element | Hover Pattern |
|---------|---------------|
| Primary button | `hover:bg-primary-600` |
| Secondary button | `hover:bg-gray-100 dark:hover:bg-gray-800` |
| Card/List item | `hover:opacity-90` or subtle bg change |
| Delete button | `hover:bg-red-600` |
| Icon button | `hover:opacity-70` |

**Note:** `hover:` classes are web-only. They're ignored on native platforms.

---

### 6.4 Optional: Responsive Breakpoints

For screens that benefit from wider layouts on desktop:

**Add responsive utilities to `global.css`:**
```css
@theme {
  /* Existing theme tokens... */
  
  /* Responsive breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

**Example responsive classes:**
```tsx
// Responsive padding
<View className="p-4 md:p-6 lg:p-8">

// Responsive grid
<View className="flex-col md:flex-row">

// Responsive width
<View className="w-full md:w-1/2 lg:w-1/3">

// Responsive text
<Text className="text-base md:text-lg lg:text-xl">
```

**Screens that benefit from responsive layouts:**

1. **History screen** (`app/(tabs)/history.tsx`)
   - Could show 2 columns on tablet/desktop
   - Wider search bar

2. **Planning screen** (`app/(tabs)/plan.tsx`)
   - Week view could expand horizontally
   - More routine cards visible

3. **Settings screen** (`app/(tabs)/settings.tsx`)
   - Form inputs could be wider
   - Two-column layout for settings groups

**Example: History screen responsive grid**
```tsx
<View className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {sessions.map(session => (
    <SessionCard key={session.id} session={session} />
  ))}
</View>
```

**Note:** This is optional for MVP. The centered container works well without breakpoints.

---

### 6.5 Test Responsive Layouts

Test on various viewport widths:

| Viewport | Device | Width |
|----------|--------|-------|
| Mobile S | iPhone SE | 320px |
| Mobile M | iPhone 12 | 375px |
| Mobile L | iPhone 12 Pro Max | 428px |
| Tablet | iPad | 768px |
| Laptop | MacBook | 1024px |
| Desktop | Standard monitor | 1440px |
| Desktop L | Large monitor | 1920px |

**Browser DevTools:**
1. Open DevTools (F12)
2. Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
3. Select different devices or drag to resize
4. Verify content centered and readable at all sizes

---

## Validation

After completing this phase:

**Visual testing checklist:**
- [ ] Content centered on desktop (not stretched edge-to-edge)
- [ ] Max width looks appropriate (not too narrow or wide)
- [ ] No horizontal scrolling at any width
- [ ] Interactive elements have hover states
- [ ] Text remains readable at all sizes
- [ ] Buttons are appropriately sized (not too small on large screens)

**Interaction testing:**
- [ ] Hover states visible on desktop
- [ ] Touch interactions still work on mobile
- [ ] No accidental hover effects on touch devices

---

## Advanced: Web-Specific Features (Optional)

### Cursor Styles

Add cursor hints for interactive elements on web:

```tsx
// In global.css or inline styles
<Pressable style={{ cursor: 'pointer' }}>
```

NativeWind utility (if supported):
```tsx
<Pressable className="cursor-pointer">
```

### Focus Styles

Add keyboard focus indicators:

```tsx
<Pressable className="focus:outline-2 focus:outline-primary-500">
```

### Tooltips

Consider adding tooltips for icon-only buttons on web:

```tsx
<Pressable title="Delete routine" aria-label="Delete routine">
  <TrashIcon />
</Pressable>
```

---

## Files Summary

### Created
| File | Purpose |
|------|---------|
| `src/components/ui/WebContainer.tsx` | Responsive container |

### Modified
| File | Changes |
|------|---------|
| `global.css` | Optional breakpoints |
| `app/(tabs)/index.tsx` | Wrap with WebContainer |
| `app/(tabs)/history.tsx` | Wrap with WebContainer, hover states |
| `app/(tabs)/plan.tsx` | Wrap with WebContainer, hover states |
| `app/(tabs)/settings.tsx` | Wrap with WebContainer |
| `app/routines/[id].tsx` | Wrap with WebContainer, hover states |
| `app/session/[routineId].tsx` | Wrap with WebContainer |
| `app/history/[id].tsx` | Wrap with WebContainer |
| `src/components/ui/Button.tsx` | Hover states |
| `src/components/ui/Card.tsx` | Hover states |
| `src/components/history/SessionCard.tsx` | Hover states |
| `src/components/routines/RoutineCard.tsx` | Hover states |
| `src/components/session/ExerciseRow.tsx` | Hover states |
| `src/components/planning/WeekNavigationRail.tsx` | Hover states |

---

## Next Phase

[Phase 7: Testing](./07-TESTING.md)

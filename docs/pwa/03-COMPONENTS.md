# Phase 3: Component Replacements

**Duration:** 8-10 hours

This is the largest phase. It replaces native-only components with cross-platform alternatives.

---

## Overview

| Component | Issue | Solution |
|-----------|-------|----------|
| Browser Check | Need to detect unsupported browsers | Create compatibility utility |
| Alert.alert() | Falls back to window.alert on web | Custom AlertProvider modal |
| expo-haptics | No-op on web | Platform-aware wrapper |
| FlashList | No web support | Conditional FlatList |
| DraggableFlatList | No web support | @dnd-kit abstraction |
| Platform.OS | Missing web checks | Update all instances |

---

## Task 3.1: Browser Compatibility Check

**Create:** `src/core/utils/browserCompat.ts`

Purpose: Detect if browser supports required features (SharedArrayBuffer for OPFS).

**Function signature:**
```typescript
export function checkBrowserSupport(): { 
  supported: boolean; 
  reason?: string;
}
```

**Implementation:**
- Check if `typeof window === "undefined"` (SSR safety)
- Check if `typeof SharedArrayBuffer !== "undefined"`
- Return appropriate error message if unsupported

**Example error message:**
```
"Your browser doesn't support the required features. Please use Chrome 102+, Safari 15.2+, Firefox 111+, or Edge 102+."
```

---

**Create:** `src/components/ui/UnsupportedBrowser.tsx`

Purpose: Display friendly message when browser is unsupported.

**Should include:**
- Clear heading explaining the issue
- List of supported browsers with versions
- Suggestion to update or switch browser
- Use NativeWind styling consistent with app theme

**Example structure:**
```tsx
export function UnsupportedBrowser({ reason }: { reason: string }) {
  return (
    <View className="flex-1 justify-center items-center p-6 bg-light-bg-primary dark:bg-dark-bg-primary">
      <Text className="text-2xl font-bold mb-4">Browser Not Supported</Text>
      <Text className="text-center mb-6">{reason}</Text>
      {/* List of supported browsers */}
    </View>
  );
}
```

---

**Modify:** `app/_layout.tsx`

Add browser check before rendering app:

```tsx
import { Platform } from "react-native";
import { checkBrowserSupport } from "@/core/utils/browserCompat";
import { UnsupportedBrowser } from "@/components/ui/UnsupportedBrowser";

export default function RootLayout() {
  // Browser check on web only
  if (Platform.OS === "web") {
    const { supported, reason } = checkBrowserSupport();
    if (!supported) {
      return <UnsupportedBrowser reason={reason!} />;
    }
  }

  // Existing layout code...
}
```

---

## Task 3.2: Custom Alert System

The app uses `Alert.alert()` in 23 locations. Web needs a modal-based replacement.

**Install:** No additional packages needed (use React Native Modal)

---

**Create:** `src/core/contexts/AlertContext.tsx`

Purpose: Provide alert state management via React Context.

**Context interface:**
```typescript
interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AlertContextValue {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}
```

**Implementation notes:**
- Use `useState` to manage alert visibility and content
- Provide `AlertProvider` component
- Export `useAlert` hook for consuming context

---

**Create:** `src/components/ui/AlertDialog.tsx`

Purpose: Modal component for displaying alerts.

**Requirements:**
- Use React Native `Modal` component
- Match native Alert appearance with NativeWind
- Support multiple buttons (up to 3)
- Destructive button styling (red: `bg-red-500`)
- Cancel button styling (gray: `bg-gray-500`)
- Default button styling (primary brand color)
- Backdrop press to dismiss (for single button alerts)
- Accessible (label props, focus management)

**Layout structure:**
```
Modal (full screen overlay)
  └─ Backdrop (semi-transparent)
      └─ Alert Card (centered, max-width 320px)
          ├─ Title
          ├─ Message (optional)
          └─ Buttons (stacked if 3+, row if 2)
```

---

**Modify:** `app/_layout.tsx`

Wrap app with AlertProvider:

```tsx
import { AlertProvider } from "@/core/contexts/AlertContext";
import { AlertDialog } from "@/components/ui/AlertDialog";

export default function RootLayout() {
  return (
    <AlertProvider>
      {/* Existing providers and routes */}
      <AlertDialog />
    </AlertProvider>
  );
}
```

---

**Replace All Alert.alert() Calls**

**Files with Alert.alert() (23 instances):**

| File | Instances | Notes |
|------|-----------|-------|
| `app/session/[routineId].tsx` | 6 | Confirmation dialogs for session actions |
| `app/routines/[id].tsx` | 4 | Delete confirmations, unsaved changes |
| `app/(tabs)/plan.tsx` | 3 | Delete plan confirmations |
| `app/history/[id].tsx` | 2 | Delete session, reflection |
| `src/core/utils/errors.ts` | 3 | Error display alerts |
| `src/features/session/store.ts` | 6 | Session state alerts (special handling needed) |
| `src/components/session/ActiveSessionBanner.tsx` | 1 | End session confirmation |
| `src/components/history/InProgressSessionCard.tsx` | 1 | Discard session confirmation |

**Replacement pattern:**

```tsx
// Before
import { Alert } from "react-native";
Alert.alert("Title", "Message", [
  { text: "Cancel", style: "cancel" },
  { text: "OK", onPress: () => handleOk() }
]);

// After
import { useAlert } from "@/core/contexts/AlertContext";
const { showAlert } = useAlert();
showAlert({
  title: "Title",
  message: "Message",
  buttons: [
    { text: "Cancel", style: "cancel" },
    { text: "OK", onPress: () => handleOk() }
  ]
});
```

**Special case: Zustand store alerts**

Stores can't use hooks. Options:
1. **Pass alert function to store actions** (recommended)
2. Create a global alert ref
3. Move alert logic to components

Example approach for store:
```tsx
// In component
const { showAlert } = useAlert();
const handleEndSession = () => {
  sessionStore.endSession(showAlert);
};

// In store
endSession: (showAlert?: AlertFunction) => {
  if (showAlert) {
    showAlert({ title: "End session?", buttons: [...] });
  }
}
```

---

## Task 3.3: Haptics Utility

**Create:** `src/core/utils/haptics.ts`

Purpose: Platform-aware haptics that no-ops on web.

**Functions to export:**
```typescript
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export function triggerHaptic(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium
): void {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(style);
}

export function triggerSelectionHaptic(): void {
  if (Platform.OS === "web") return;
  Haptics.selectionAsync();
}

export function triggerNotificationHaptic(
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success
): void {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(type);
}
```

---

**Modify:** Replace direct expo-haptics imports

**Files to update:**
- `src/components/session/ExerciseRow.tsx`
- `app/routines/[id].tsx`

**Pattern:**
```tsx
// Before
import * as Haptics from "expo-haptics";
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// After
import { triggerHaptic } from "@/core/utils/haptics";
triggerHaptic();
```

---

## Task 3.4: VirtualizedList Wrapper

**Create:** `src/components/ui/VirtualizedList.tsx`

Purpose: Use FlashList on native, FlatList on web.

**Implementation:**
```tsx
import { Platform, FlatList, FlatListProps } from "react-native";
import { FlashList, FlashListProps } from "@shopify/flash-list";

// Conditional component selection
const ListComponent = Platform.OS === "web" ? FlatList : FlashList;

export function VirtualizedList<T>(props: VirtualizedListProps<T>) {
  const { estimatedItemSize, ...restProps } = props;
  
  // Omit estimatedItemSize on web (FlatList doesn't have it)
  if (Platform.OS === "web") {
    return <FlatList {...restProps} />;
  }
  
  return <FlashList estimatedItemSize={estimatedItemSize} {...restProps} />;
}
```

**Type definitions:**
```typescript
type VirtualizedListProps<T> = 
  | (FlashListProps<T> & { estimatedItemSize?: number })
  | FlatListProps<T>;
```

---

**Modify:** `app/(tabs)/history.tsx`

Replace FlashList with VirtualizedList:

```tsx
// Before
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={sessions}
  renderItem={renderSession}
  estimatedItemSize={120}
/>

// After
import { VirtualizedList } from "@/components/ui/VirtualizedList";

<VirtualizedList
  data={sessions}
  renderItem={renderSession}
  estimatedItemSize={120}
/>
```

---

## Task 3.5: Drag & Drop Abstraction

**Install @dnd-kit:**
```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

**Create:** `src/components/ui/SortableList/` directory structure

```
src/components/ui/SortableList/
├── index.ts
├── types.ts
├── SortableList.native.tsx
└── SortableList.web.tsx
```

---

**Create:** `src/components/ui/SortableList/types.ts`

Shared type definitions:

```typescript
import { ReactNode } from "react";

export interface SortableListProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (info: RenderItemInfo<T>) => ReactNode;
  onDragEnd: (data: T[]) => void;
}

export interface RenderItemInfo<T> {
  item: T;
  index: number;
  drag?: () => void;
  isActive?: boolean;
}
```

---

**Create:** `src/components/ui/SortableList/SortableList.native.tsx`

Wrapper around react-native-draggable-flatlist:

```typescript
import DraggableFlatList from "react-native-draggable-flatlist";
import { SortableListProps } from "./types";

export function SortableListNative<T>(props: SortableListProps<T>) {
  const { data, keyExtractor, renderItem, onDragEnd } = props;
  
  return (
    <DraggableFlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={({ item, drag, isActive, getIndex }) => 
        renderItem({ item, index: getIndex()!, drag, isActive })
      }
      onDragEnd={({ data }) => onDragEnd(data)}
    />
  );
}
```

---

**Create:** `src/components/ui/SortableList/SortableList.web.tsx`

@dnd-kit implementation for web:

```typescript
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ScrollView } from "react-native";
import { SortableListProps } from "./types";

export function SortableListWeb<T>(props: SortableListProps<T>) {
  // Implementation using @dnd-kit
  // Use DndContext, SortableContext, useSortable hook
  // Render items in ScrollView with drag handles
}
```

**Key @dnd-kit patterns:**
- `useSensors` with PointerSensor and KeyboardSensor
- `DndContext` with `closestCenter` collision detection
- `SortableContext` with `verticalListSortingStrategy`
- Each item uses `useSortable` hook
- `handleDragEnd` calls `arrayMove` then `onDragEnd`

---

**Create:** `src/components/ui/SortableList/index.ts`

Platform-specific export:

```typescript
import { Platform } from "react-native";
import { SortableListNative } from "./SortableList.native";
import { SortableListWeb } from "./SortableList.web";

export const SortableList = Platform.select({
  web: SortableListWeb,
  default: SortableListNative,
})!;

export type { SortableListProps, RenderItemInfo } from "./types";
```

---

**Modify:** Replace DraggableFlatList usage

**Files:**
- `app/routines/[id].tsx`
- `app/session/[routineId].tsx`

**Pattern:**
```tsx
// Before
import DraggableFlatList from "react-native-draggable-flatlist";

<DraggableFlatList
  data={exercises}
  keyExtractor={(item) => item.id}
  renderItem={({ item, drag, isActive }) => (
    <ExerciseRow item={item} drag={drag} isActive={isActive} />
  )}
  onDragEnd={({ data }) => handleReorder(data)}
/>

// After
import { SortableList } from "@/components/ui/SortableList";

<SortableList
  data={exercises}
  keyExtractor={(item) => item.id}
  renderItem={({ item, drag, isActive }) => (
    <ExerciseRow item={item} drag={drag} isActive={isActive} />
  )}
  onDragEnd={handleReorder}
/>
```

---

## Task 3.6: Platform.OS Updates

Search for all `Platform.OS` checks and add web handling.

**Files to audit:**
- `app/routines/[id].tsx` (lines 73, 335, 475)
- `app/session/[routineId].tsx` (line 271)
- `app/history/[id].tsx` (line 440)

**Common patterns to update:**

1. **Keyboard behavior:**
```tsx
// Before
behavior={Platform.OS === "ios" ? "padding" : "height"}

// After
behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "web" ? undefined : "height"}
```

2. **Android-specific checks:**
```tsx
// Before
if (Platform.OS !== "android") return;

// After
if (Platform.OS === "ios" || Platform.OS === "web") return;
```

3. **iOS-specific checks:**
```tsx
// Before
if (Platform.OS === "ios") {
  // iOS only code
}

// After
if (Platform.OS === "ios") {
  // iOS only code
} else if (Platform.OS === "web") {
  // Web alternative or no-op
}
```

---

## Validation

After completing this phase:

```bash
pnpm typecheck    # Should pass
pnpm web          # Should load without component errors
```

**Test checklist:**
- [ ] App loads on web without errors
- [ ] Browser compatibility check works
- [ ] Alerts display as modals on web
- [ ] Haptics don't cause errors on web  
- [ ] History list renders on web
- [ ] Drag and drop works on web (in routine editor)
- [ ] All Platform.OS checks handle web

---

## Files Summary

### Created (14 files)
| File | Purpose |
|------|---------|
| `src/core/utils/browserCompat.ts` | Browser detection |
| `src/components/ui/UnsupportedBrowser.tsx` | Error UI |
| `src/core/contexts/AlertContext.tsx` | Alert state |
| `src/components/ui/AlertDialog.tsx` | Alert modal |
| `src/core/utils/haptics.ts` | Haptics wrapper |
| `src/components/ui/VirtualizedList.tsx` | List wrapper |
| `src/components/ui/SortableList/index.ts` | Export barrel |
| `src/components/ui/SortableList/types.ts` | Shared types |
| `src/components/ui/SortableList/SortableList.native.tsx` | Native DnD |
| `src/components/ui/SortableList/SortableList.web.tsx` | Web DnD |

### Modified (11+ files)
| File | Changes |
|------|---------|
| `app/_layout.tsx` | Browser check, AlertProvider |
| `app/(tabs)/history.tsx` | VirtualizedList |
| `app/routines/[id].tsx` | SortableList, haptics, Platform.OS, alerts |
| `app/session/[routineId].tsx` | SortableList, Platform.OS, alerts |
| `app/(tabs)/plan.tsx` | Alerts |
| `app/history/[id].tsx` | Platform.OS, alerts |
| `src/core/utils/errors.ts` | Alerts |
| `src/features/session/store.ts` | Alerts (special handling) |
| `src/components/session/ExerciseRow.tsx` | Haptics |
| `src/components/session/ActiveSessionBanner.tsx` | Alerts |
| `src/components/history/InProgressSessionCard.tsx` | Alerts |

---

## Next Phase

[Phase 4: Service Worker](./04-SERVICE_WORKER.md)

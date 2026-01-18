# Swipeable Card Actions - Research & Implementation Plan

## Executive Summary

This document provides comprehensive research on swipeable list item patterns from popular apps, UX analysis of DriftLog's current "Assign" flow, and a detailed implementation plan for improving the swipeable card actions on the History screen.

**Key Findings:**
- Current implementation is functionally correct but could benefit from visual polish and UX refinement
- The "Assign" action should be a one-tap flow (date picker immediately) to maintain minimal interaction principle
- Design needs better visual hierarchy to distinguish destructive vs non-destructive actions
- Haptic feedback is correctly implemented but could be enhanced with audio cues

---

## 1. Research: Real-World Swipeable Patterns

### 1.1 iOS Mail (Apple)
**Pattern:**
- Swipe left: Reveals "Flag", "More", "Delete" (progressive reveal)
- Swipe right: "Mark as Read" (single action)
- Full swipe triggers primary action (Archive/Delete)

**Visual Design:**
- Distinct colors: Blue (Flag), Gray (More), Red (Delete)
- Icon + Label beneath (vertical stack)
- Rounded corners on action buttons (matches card radius)
- Actions slide in progressively as user swipes further

**Feedback:**
- Haptic feedback on swipe threshold
- Smooth spring animations
- Visual snap points

**Lessons for DriftLog:**
- ✅ Use distinct colors (already implemented: primary for Assign, red for Delete)
- ✅ Vertical icon + label stack (already implemented)
- ⚠️ Could add rounded corners on left edge of first button
- ✅ Haptic feedback already present

---

### 1.2 Apple Reminders
**Pattern:**
- Swipe left: "Flag" and "Delete" actions
- Swipe right: "Complete" (with checkmark animation)
- Full swipe immediately triggers action

**Visual Design:**
- Large tap targets (80-100px wide minimum)
- Icon-first design with small label
- Actions appear behind card (no sliding drawer)
- Card slides to reveal actions underneath

**Feedback:**
- Strong haptics on full swipe
- Visual checkmark animation
- Undo toast after destructive actions

**Lessons for DriftLog:**
- ✅ Large tap targets (80px for Delete implemented)
- ✅ Icon-first design already used
- ⚠️ Could add undo toast for Delete action
- ✅ Card slides correctly (using ReanimatedSwipeable)

---

### 1.3 Gmail
**Pattern:**
- Swipe left: Archive (full swipe triggers)
- Swipe right: Snooze (full swipe triggers)
- Partial swipe shows icon + label
- Actions are contextual based on mailbox

**Visual Design:**
- Single-color backgrounds during swipe (green/blue)
- Icon grows/shrinks based on swipe distance
- Clean, minimal design
- No multiple buttons (single action per direction)

**Feedback:**
- Haptics at trigger threshold
- Undo snackbar after action
- Smooth momentum scrolling

**Lessons for DriftLog:**
- ⚠️ Different pattern (single action per direction)
- Not applicable: We need both Assign + Delete visible simultaneously
- ✅ Undo could be useful for Delete

---

### 1.4 Todoist
**Pattern:**
- Swipe right: Complete task (full swipe triggers)
- Swipe left: Edit, Reschedule, More (progressive reveal)
- Long-press for additional menu

**Visual Design:**
- Colored icons (green for complete, blue for edit, red for delete)
- Icons without labels (icon-only when space constrained)
- Smooth progressive reveal
- Actions have equal width

**Feedback:**
- Haptics on completion
- Celebratory animation on task complete
- Spring animation on card return

**Lessons for DriftLog:**
- ⚠️ Equal width buttons could improve visual balance
- ✅ Current design uses labels which is better for clarity
- ✅ Colored icons already implemented

---

### 1.5 Strong (Fitness App)
**Pattern:**
- Swipe left on workout history: "Edit" and "Delete"
- Swipe right: No action (scroll only)
- Edit opens workout in editor
- Delete shows confirmation alert

**Visual Design:**
- Blue for Edit, Red for Delete
- Large tap targets (entire card height)
- Icon + Label vertical stack
- Rounded corners matching card design

**Feedback:**
- Haptics on swipe
- Confirmation dialog for Delete
- Edit preserves workout data

**Lessons for DriftLog:**
- ✅ Similar use case (workout history)
- ✅ Edit → Assign mapping is logical
- ✅ Delete confirmation implemented
- ✅ Design pattern is nearly identical

---

### 1.6 Strava (Fitness App)
**Pattern:**
- Swipe left: "Edit" and "Delete" (activity history)
- Full swipe doesn't trigger action
- Must tap button explicitly
- No swipe-right actions

**Visual Design:**
- Orange for Edit (brand color), Red for Delete
- Icon + Label
- Actions slide from right
- Card elevation increases during swipe

**Feedback:**
- Subtle haptics
- Delete requires confirmation
- Edit opens full-screen editor

**Lessons for DriftLog:**
- ✅ Explicit tap required (safer UX)
- ✅ Brand color for primary action (primary-500)
- ✅ Delete confirmation essential
- ⚠️ Could add subtle shadow during swipe

---

## 2. Analysis: Current "Assign" Flow

### 2.1 Current Implementation Review
```typescript
// From history.tsx
const handleAssignToDate = useCallback((sessionId: string) => {
  setSessionToAssign(sessionId);
  setShowDatePicker(true);
}, []);

const handleDateSelected = useCallback(async (date: string) => {
  if (!sessionToAssign) return;
  try {
    const routineId = await createRoutineFromSession(sessionToAssign, date);
    Alert.alert("Routine Created", `A new routine has been assigned to ${date}`, [
      { text: "OK" },
      { text: "View Routine", onPress: () => router.push(`/routines/${routineId}`) }
    ]);
  } catch {
    Alert.alert("Error", "Failed to create routine. Please try again.");
  } finally {
    setSessionToAssign(null);
  }
}, [sessionToAssign, createRoutineFromSession, router]);
```

**User Flow:**
1. User swipes left on session card
2. Taps "Assign" button
3. Date picker bottom sheet appears
4. User selects date
5. Routine created with success alert
6. Optional: Navigate to routine

### 2.2 User Intent Analysis

**What is the user trying to do?**
- Convert a past workout into a reusable template for a future date
- Essentially: "I want to do this workout again on [date]"

**Current UX Assessment:**
✅ **Correct:** Opening date picker immediately is the right pattern
- User explicitly wants to assign to a date
- No intermediate step needed
- Follows principle of minimal interaction

✅ **Correct:** Bottom sheet for date picker
- Modal context appropriate for date selection
- Easy to dismiss if user changes mind
- Native iOS pattern (similar to Reminders, Calendar)

✅ **Correct:** Success alert with "View Routine" option
- Confirms action completed
- Provides navigation to result
- Not intrusive (can dismiss)

**Potential Improvements:**
1. **Visual feedback during routine creation:** Show loading spinner in button
2. **Alternative: Quick-assign shortcuts:** Common dates (Tomorrow, Next Week, etc.)
3. **Optimization:** Consider pre-loading date picker to reduce perceived latency

**Recommendation:** Keep current flow, add minor enhancements.

---

## 3. Design Recommendations

### 3.1 Visual Hierarchy

**Destructive vs Non-Destructive Actions:**
```tsx
// CURRENT (Good baseline)
<Pressable className="bg-primary-500 dark:bg-dark-primary">  // Assign
<Pressable className="bg-error">  // Delete

// RECOMMENDED (Enhanced visual distinction)
<Pressable className="bg-primary-500 dark:bg-dark-primary shadow-md">  // Assign
<Pressable className="bg-error shadow-lg">  // Delete (stronger shadow)
```

**Color Psychology:**
- Primary (Peach/Orange): Positive, creative action → ✅ Assign
- Red: Danger, destructive → ✅ Delete
- Current mapping is optimal

---

### 3.2 Button Styling Specifications

#### Current Implementation Review:
```tsx
// Assign Button
<Pressable
  onPress={handleAssign}
  className="bg-primary-500 dark:bg-dark-primary flex-col justify-center items-center rounded-l-2xl h-full w-20"
>
  <Ionicons name="calendar-outline" size={22} color="#ffffff" />
  <Text className="text-white text-xs font-semibold mt-1">Assign</Text>
</Pressable>

// Delete Button
<Pressable
  onPress={handleDelete}
  className="bg-error justify-center items-center rounded-r-2xl h-full"
  style={{ width: 80 }}
>
  <Ionicons name="trash-outline" size={22} color="#ffffff" />
  <Text className="text-white text-xs font-semibold mt-1">Delete</Text>
</Pressable>
```

**Assessment:**
✅ Vertical icon + label layout (good for recognition)
✅ Consistent sizing (22px icons, 12px text)
✅ Semantic colors from design system
✅ Rounded corners match card design
⚠️ Inconsistent width specification (Assign: w-20 [80px], Delete: style={width: 80})

#### Recommended Improvements:

```tsx
// 1. CONSISTENCY: Use same width specification method
// Replace: className="w-20" with style={{ width: 80 }}
// OR use Tailwind classes for both

// 2. VISUAL POLISH: Add active state feedback
<Pressable
  onPress={handleAssign}
  className="bg-primary-500 dark:bg-dark-primary flex-col justify-center items-center rounded-l-2xl h-full active:opacity-80"
  style={{ width: 80 }}
>

// 3. ACCESSIBILITY: Increase icon size slightly for better visibility
<Ionicons name="calendar-outline" size={24} color="#ffffff" />  // 22 → 24

// 4. SPACING: Add explicit gap between icon and text
<View className="items-center gap-1">
  <Ionicons name="calendar-outline" size={24} color="#ffffff" />
  <Text className="text-white text-xs font-semibold">Assign</Text>
</View>
```

---

### 3.3 Color Specifications

Using DriftLog design tokens:

```tsx
// Light Mode
Assign Button:
  Background: var(--color-primary-500) = #f4a261
  Text: #ffffff
  Icon: #ffffff
  Active: opacity 80%

Delete Button:
  Background: var(--color-error) = #ef4444
  Text: #ffffff
  Icon: #ffffff
  Active: opacity 80%

// Dark Mode
Assign Button:
  Background: var(--color-dark-primary) = #ff9f6c
  Text: var(--color-dark-bg-primary) = #0f0f0f  // Better contrast
  Icon: var(--color-dark-bg-primary) = #0f0f0f

Delete Button:
  Background: var(--color-error) = #ef4444  // Same in dark mode
  Text: #ffffff
  Icon: #ffffff
  Active: opacity 80%
```

**Rationale:**
- Dark mode primary is brighter (#ff9f6c) for contrast
- Using dark background color for text/icons on bright background
- Maintains WCAG AA contrast standards

---

### 3.4 Interaction Details

#### Swipe Gesture Configuration:
```tsx
<ReanimatedSwipeable
  ref={swipeRef}
  friction={2}              // ✅ Good default (2 is standard)
  rightThreshold={40}       // ✅ Requires 40px swipe to reveal
  renderRightActions={renderRightActions}
  overshootRight={false}    // ✅ Prevents over-swiping
  overshootLeft={false}     // Add this for symmetry
  enableTrackpadTwoFingerGesture  // Add for iPad support
  containerStyle={{         // Add for smooth reveal
    overflow: 'hidden',
  }}
>
```

#### Snap Points:
- **0px:** Closed (resting state)
- **40px threshold:** Actions start revealing
- **160px:** Fully revealed (80px + 80px buttons)
- **No full-swipe action:** Safer UX (explicit tap required)

#### Animation Timing:
```tsx
// Spring animation on open
useAnimatedStyle(() => ({
  transform: [{ translateX: swipeProgress.value }],
}), { 
  spring: { damping: 20, stiffness: 90 } 
});

// Smooth close on tap
swipeRef.current?.close({ 
  animated: true, 
  duration: 200 
});
```

---

### 3.5 Feedback Mechanisms

#### Current Haptics (Already Implemented):
```tsx
// Assign action
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);  // ✅

// Delete action
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);  // ✅
```

**Assessment:** Excellent haptic choices
- Medium impact for non-destructive action
- Warning notification for destructive action

#### Recommended Enhancements:

```tsx
// 1. Add haptic on swipe threshold
<ReanimatedSwipeable
  onSwipeableWillOpen={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }}
  ...
>

// 2. Success haptic after routine creation
const handleDateSelected = async (date: string) => {
  try {
    const routineId = await createRoutineFromSession(sessionToAssign, date);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(...);
  } catch {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert("Error", ...);
  }
};

// 3. Subtle haptic on card press (optional)
const handlePress = useCallback(() => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  swipeRef.current?.close();
  onPress();
}, [onPress]);
```

#### Visual Feedback:
```tsx
// Active state on button press
className="active:opacity-80 active:scale-95"

// Loading state during routine creation
const [isCreating, setIsCreating] = useState(false);

<Pressable disabled={isCreating}>
  {isCreating ? (
    <ActivityIndicator size="small" color="#ffffff" />
  ) : (
    <>
      <Ionicons name="calendar-outline" size={24} color="#ffffff" />
      <Text>Assign</Text>
    </>
  )}
</Pressable>
```

---

### 3.6 Accessibility Considerations

#### Current Status:
⚠️ No accessibility labels on swipe actions
⚠️ No alternative for users who can't swipe

#### Recommendations:

```tsx
// 1. Add accessibility labels
<Pressable
  onPress={handleAssign}
  accessibilityRole="button"
  accessibilityLabel="Assign workout to a date"
  accessibilityHint="Creates a routine from this workout"
  accessible={true}
>

// 2. Add VoiceOver hints
<ReanimatedSwipeable
  accessibilityLabel="Swipe left for actions"
  accessibilityHint="Double-tap and swipe left to reveal assign and delete options"
>

// 3. Support for alternative interaction (long-press)
<Pressable
  onPress={handlePress}
  onLongPress={() => {
    // Show action sheet as alternative to swiping
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Assign to Date', 'Delete Session'],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) onAssignToDate();
        if (buttonIndex === 2) onDelete();
      }
    );
  }}
>

// 4. Increase touch target size (already good at 80px width)
```

---

## 4. Implementation Plan

### 4.1 Current State Assessment

**What's Working:**
✅ Swipe gesture library (react-native-gesture-handler + reanimated)
✅ Basic visual design (colors, layout, icons)
✅ Haptic feedback
✅ Delete confirmation
✅ Assign → Date picker flow
✅ Routine creation logic

**What Needs Improvement:**
1. Visual polish (shadows, active states, consistency)
2. Accessibility (labels, hints, alternative interactions)
3. Enhanced feedback (loading states, success haptics)
4. Minor UX refinements (undo for delete, quick-assign shortcuts)

---

### 4.2 Implementation Steps

#### Phase 1: Visual Polish (30 minutes)
**Objective:** Improve visual consistency and feedback

```tsx
// File: src/components/history/SessionCard.tsx

// 1. Fix width specification inconsistency
// BEFORE:
className="w-20"  // Assign
style={{ width: 80 }}  // Delete

// AFTER (consistent):
style={{ width: 80 }}  // Both buttons

// 2. Add active state feedback
className="active:opacity-80"  // Both buttons

// 3. Increase icon size for better visibility
size={24}  // Changed from 22

// 4. Add explicit gap between icon and text
// Wrap content in View with gap
<View className="items-center gap-1">
  <Ionicons ... />
  <Text ...>Assign</Text>
</View>

// 5. Add subtle shadow to Assign button
className="... shadow-sm"
```

**Files to modify:**
- `/src/components/history/SessionCard.tsx`

---

#### Phase 2: Enhanced Feedback (45 minutes)
**Objective:** Add loading states and improved haptics

```tsx
// File: src/components/history/SessionCard.tsx

// 1. Add loading state to Assign button
interface SessionCardProps {
  session: HistorySession;
  onPress: () => void;
  onDelete: () => void;
  onAssignToDate: () => void;
  isAssigning?: boolean;  // NEW
}

// 2. Conditional rendering based on loading
{isAssigning ? (
  <ActivityIndicator size="small" color="#ffffff" />
) : (
  <View className="items-center gap-1">
    <Ionicons name="calendar-outline" size={24} color="#ffffff" />
    <Text className="text-white text-xs font-semibold">Assign</Text>
  </View>
)}

// 3. Disable button during loading
<Pressable
  onPress={handleAssign}
  disabled={isAssigning}
  className={`... ${isAssigning ? 'opacity-50' : ''}`}
>

// File: app/(tabs)/history.tsx

// 4. Track assignment state
const [assigningSessionId, setAssigningSessionId] = useState<string | null>(null);

// 5. Update handlers
const handleDateSelected = useCallback(async (date: string) => {
  if (!sessionToAssign) return;
  setAssigningSessionId(sessionToAssign);
  
  try {
    const routineId = await createRoutineFromSession(sessionToAssign, date);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(...);
  } catch {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert("Error", ...);
  } finally {
    setAssigningSessionId(null);
    setSessionToAssign(null);
  }
}, [sessionToAssign, createRoutineFromSession, router]);

// 6. Pass loading state to SessionCard
<SessionCard
  ...
  isAssigning={item.id === assigningSessionId}
/>
```

**Files to modify:**
- `/src/components/history/SessionCard.tsx`
- `/app/(tabs)/history.tsx`

---

#### Phase 3: Accessibility (45 minutes)
**Objective:** Make swipe actions accessible to all users

```tsx
// File: src/components/history/SessionCard.tsx

// 1. Add accessibility labels to buttons
<Pressable
  onPress={handleAssign}
  accessibilityRole="button"
  accessibilityLabel="Assign workout to a date"
  accessibilityHint="Opens date picker to create a routine from this workout"
  accessible={true}
  className="..."
>

<Pressable
  onPress={handleDelete}
  accessibilityRole="button"
  accessibilityLabel="Delete workout session"
  accessibilityHint="Permanently removes this workout from history"
  accessible={true}
  className="..."
>

// 2. Add swipeable accessibility
<ReanimatedSwipeable
  ref={swipeRef}
  accessibilityLabel="Workout session card"
  accessibilityHint="Swipe left to reveal actions or long-press for options"
  ...
>

// 3. Add long-press alternative for non-swipe users
<Pressable
  onPress={handlePress}
  onLongPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: `${formatDate(session.date, "EEEE, MMMM d")} Session`,
        options: ['Cancel', 'Assign to Date', 'Delete Session'],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) handleAssign();
        if (buttonIndex === 2) handleDelete();
      }
    );
  }}
  className="..."
>

// 4. Import ActionSheetIOS at top
import { ActionSheetIOS, Platform, Pressable, Text, View } from "react-native";

// 5. Android alternative (use Alert.alert with buttons)
const showActionsMenu = () => {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(...);
  } else {
    Alert.alert(
      `${formatDate(session.date, "EEEE, MMMM d")} Session`,
      'Choose an action',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Assign to Date', onPress: handleAssign },
        { text: 'Delete Session', onPress: handleDelete, style: 'destructive' },
      ]
    );
  }
};
```

**Files to modify:**
- `/src/components/history/SessionCard.tsx`

---

#### Phase 4: UX Refinements (Optional - 60 minutes)
**Objective:** Add quality-of-life improvements

**4.1 Undo Toast for Delete:**
```tsx
// File: app/(tabs)/history.tsx

// 1. Install react-native-toast-message (or use Alert with custom timeout)
// For now, use setTimeout with Alert as temporary undo

const handleDelete = useCallback((sessionId: string) => {
  if (isSessionActive && sessionId === activeSessionId) {
    Alert.alert("Cannot Delete Active Session", ...);
    return;
  }

  // Store deleted session temporarily
  const sessionToDelete = sessions.find(s => s.id === sessionId);
  
  Alert.alert(
    "Delete Session",
    "Are you sure you want to delete this workout session?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await deleteSession(sessionId);
            
            // Show undo option (simple implementation)
            setTimeout(() => {
              Alert.alert(
                "Session Deleted",
                "Undo is not yet available",
                [{ text: "OK" }],
                { cancelable: true }
              );
            }, 100);
          } catch {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Error", "Failed to delete session. Please try again.");
          }
        },
      },
    ],
  );
}, [deleteSession, isSessionActive, activeSessionId, sessions]);
```

**4.2 Quick-Assign Shortcuts:**
```tsx
// File: app/(tabs)/history.tsx

// Add quick-assign buttons to date picker bottom sheet
// Modify DatePicker component to accept optional quick actions

<DatePicker
  visible={showDatePicker}
  onClose={() => { ... }}
  onSelect={handleDateSelected}
  quickActions={[
    { label: 'Tomorrow', date: addDays(new Date(), 1) },
    { label: 'Next Week', date: addDays(new Date(), 7) },
    { label: 'In 2 Weeks', date: addDays(new Date(), 14) },
  ]}
/>
```

---

### 4.3 Code Patterns & Examples

#### Complete Updated SessionCard Component:

```tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { memo, useCallback, useRef } from "react";
import { ActionSheetIOS, ActivityIndicator, Alert, Platform, Pressable, Text, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { useTheme } from "@/core/contexts/ThemeContext";
import { formatDate, formatElapsedTime } from "@/core/utils/helpers";
import type { HistorySession } from "@/features/history";

interface SessionCardProps {
  session: HistorySession;
  onPress: () => void;
  onDelete: () => void;
  onAssignToDate: () => void;
  isAssigning?: boolean;  // NEW: Loading state
}

function SessionCardComponent({ 
  session, 
  onPress, 
  onDelete, 
  onAssignToDate,
  isAssigning = false  // NEW
}: SessionCardProps) {
  const { colorScheme } = useTheme();
  const swipeRef = useRef<SwipeableMethods | null>(null);

  const duration = session.endTime
    ? Math.floor(
        (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000,
      )
    : null;

  const handleAssign = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeRef.current?.close();
    onAssignToDate();
  }, [onAssignToDate]);

  const handleDelete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    swipeRef.current?.close();
    onDelete();
  }, [onDelete]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);  // NEW: Subtle feedback
    swipeRef.current?.close();
    onPress();
  }, [onPress]);

  // NEW: Long-press alternative for accessibility
  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: `${formatDate(session.date, "EEEE, MMMM d")} Session`,
          options: ['Cancel', 'Assign to Date', 'Delete Session'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleAssign();
          if (buttonIndex === 2) handleDelete();
        }
      );
    } else {
      Alert.alert(
        `${formatDate(session.date, "EEEE, MMMM d")} Session`,
        'Choose an action',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Assign to Date', onPress: handleAssign },
          { text: 'Delete Session', onPress: handleDelete, style: 'destructive' },
        ]
      );
    }
  }, [session.date, handleAssign, handleDelete]);

  const renderRightActions = useCallback(() => {
    return (
      <View className="flex-row justify-end items-center">
        {/* Assign to Date Action */}
        <Pressable
          onPress={handleAssign}
          disabled={isAssigning}  // NEW
          accessibilityRole="button"  // NEW
          accessibilityLabel="Assign workout to a date"  // NEW
          accessibilityHint="Opens date picker to create a routine from this workout"  // NEW
          accessible={true}  // NEW
          className={`bg-primary-500 dark:bg-dark-primary flex-col justify-center items-center rounded-l-2xl h-full active:opacity-80 ${isAssigning ? 'opacity-50' : ''}`}  // UPDATED
          style={{ width: 80 }}  // UPDATED: Consistent with Delete
        >
          {isAssigning ? (  // NEW: Loading state
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <View className="items-center gap-1">  {/* NEW: Explicit gap */}
              <Ionicons name="calendar-outline" size={24} color="#ffffff" />  {/* UPDATED: Size 22 → 24 */}
              <Text className="text-white text-xs font-semibold">Assign</Text>
            </View>
          )}
        </Pressable>

        {/* Delete Action */}
        <Pressable
          onPress={handleDelete}
          accessibilityRole="button"  // NEW
          accessibilityLabel="Delete workout session"  // NEW
          accessibilityHint="Permanently removes this workout from history"  // NEW
          accessible={true}  // NEW
          className="bg-error justify-center items-center rounded-r-2xl h-full active:opacity-80"  // UPDATED
          style={{ width: 80 }}
        >
          <View className="items-center gap-1">  {/* NEW: Explicit gap */}
            <Ionicons name="trash-outline" size={24} color="#ffffff" />  {/* UPDATED: Size 22 → 24 */}
            <Text className="text-white text-xs font-semibold">Delete</Text>
          </View>
        </Pressable>
      </View>
    );
  }, [handleAssign, handleDelete, isAssigning]);  // UPDATED: Dependencies

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      overshootRight={false}
      overshootLeft={false}  // NEW: Symmetry
      enableTrackpadTwoFingerGesture  // NEW: iPad support
      accessibilityLabel="Workout session card"  // NEW
      accessibilityHint="Swipe left to reveal actions or long-press for options"  // NEW
      // NEW: Haptic on swipe threshold
      onSwipeableWillOpen={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}  // NEW: Accessibility alternative
        className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-2xl p-5 mb-3 active:opacity-70"
      >
        {/* Header: Date & Duration */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-bold text-light-text-primary dark:text-dark-text-primary">
            {formatDate(session.date, "EEEE, MMMM d")}
          </Text>
          {duration && (
            <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {formatElapsedTime(duration)}
            </Text>
          )}
        </View>

        {/* Routine Title (if exists) */}
        {session.planTitle ? (
          <View className="flex-row items-center mb-2">
            <Ionicons
              name="barbell-outline"
              size={16}
              color={colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
              style={{ marginRight: 6 }}
            />
            <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {session.planTitle}
            </Text>
          </View>
        ) : null}

        {/* Stats Row */}
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center">
            <Ionicons
              name="fitness-outline"
              size={16}
              color={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
              style={{ marginRight: 4 }}
            />
            <Text className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
              {session.exerciseCount} {session.exerciseCount === 1 ? "exercise" : "exercises"}
            </Text>
          </View>

          {session.hasReflection ? (
            <View className="flex-row items-center">
              <Ionicons
                name="chatbox-outline"
                size={16}
                color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
                style={{ marginRight: 4 }}
              />
              <Text className="text-sm text-primary-500 dark:text-dark-primary">Reflection</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </ReanimatedSwipeable>
  );
}

export const SessionCard = memo(SessionCardComponent);
```

---

### 4.4 File Structure

```
src/
├── components/
│   ├── history/
│   │   ├── SessionCard.tsx           ← PRIMARY CHANGES
│   │   ├── SessionCardSkeleton.tsx   (unchanged)
│   │   └── index.ts                  (unchanged)
│   └── ui/
│       ├── DatePicker.tsx            ← Optional: Quick-assign shortcuts
│       └── ...
├── app/
│   └── (tabs)/
│       └── history.tsx               ← SECONDARY CHANGES (loading state)
```

---

## 5. Testing Checklist

### 5.1 Visual Testing
- [ ] Swipe left reveals both buttons smoothly
- [ ] Buttons have correct colors in light mode
- [ ] Buttons have correct colors in dark mode
- [ ] Icons are clearly visible (24px size)
- [ ] Text labels are readable (12px)
- [ ] Active states show feedback (opacity change)
- [ ] Loading spinner appears when assigning
- [ ] Buttons are properly aligned (80px width each)
- [ ] Rounded corners match card design
- [ ] No visual glitches during animation

### 5.2 Interaction Testing
- [ ] Swipe threshold is comfortable (40px)
- [ ] Tap "Assign" opens date picker
- [ ] Date picker appears as bottom sheet
- [ ] Selecting date creates routine
- [ ] Success alert appears with navigation option
- [ ] Tap "Delete" shows confirmation alert
- [ ] Confirming delete removes session
- [ ] Swipeable closes after button tap
- [ ] Can swipe multiple cards without conflict
- [ ] Long-press shows action sheet (iOS) or alert (Android)

### 5.3 Haptic Feedback Testing
- [ ] Light haptic on swipe threshold
- [ ] Light haptic on card press
- [ ] Medium haptic on Assign button tap
- [ ] Warning haptic on Delete button tap
- [ ] Success haptic after routine creation
- [ ] Error haptic on failure
- [ ] Heavy haptic on long-press

### 5.4 Accessibility Testing
- [ ] VoiceOver reads button labels correctly
- [ ] VoiceOver hints describe actions
- [ ] Long-press alternative works without swiping
- [ ] Action sheet is accessible
- [ ] Button disabled state prevents interaction
- [ ] Loading state is announced
- [ ] Color contrast meets WCAG AA standards
- [ ] Touch targets are at least 44x44pt

### 5.5 Edge Cases
- [ ] Assigning while another is loading
- [ ] Swiping while scrolling
- [ ] Rapid swipe + tap spam
- [ ] Delete confirmation during assignment
- [ ] Offline behavior (routine creation should queue)
- [ ] Very long session dates
- [ ] Sessions without reflections
- [ ] Empty history state

---

## 6. Summary & Recommendations

### What's Already Great:
✅ **Solid foundation:** react-native-gesture-handler + reanimated is the gold standard
✅ **Correct pattern:** Swipe-left for actions matches iOS conventions
✅ **Good haptics:** Appropriate feedback types for each action
✅ **Right colors:** Primary for Assign, Red for Delete
✅ **Smart UX:** Assign → Date picker is the correct flow

### Priority Improvements:

**High Priority (Do First):**
1. ✅ Fix width specification consistency (trivial, 2 minutes)
2. ✅ Add loading state to Assign button (UX improvement, 20 minutes)
3. ✅ Add success/error haptics to routine creation (polish, 10 minutes)
4. ✅ Increase icon size to 24px (visibility, 2 minutes)

**Medium Priority (Nice to Have):**
5. ⚠️ Add accessibility labels and hints (inclusive, 30 minutes)
6. ⚠️ Add long-press alternative for non-swipe users (accessibility, 30 minutes)
7. ⚠️ Add explicit gap between icon and text (visual polish, 5 minutes)

**Low Priority (Optional):**
8. ⚠️ Undo toast for Delete action (requires library or custom implementation)
9. ⚠️ Quick-assign shortcuts in date picker (convenience feature)
10. ⚠️ Subtle shadow on Assign button (minor visual polish)

### Implementation Time Estimate:
- **Phase 1 (Visual Polish):** 30 minutes
- **Phase 2 (Enhanced Feedback):** 45 minutes
- **Phase 3 (Accessibility):** 45 minutes
- **Phase 4 (Optional UX):** 60 minutes
- **Total:** 2-3 hours for all improvements

### Key Takeaways:
1. **Current implementation is 80% there** - mostly needs polish, not redesign
2. **Assign flow is correct** - keep date picker immediate open
3. **Focus on accessibility** - add labels, hints, and long-press alternative
4. **Enhance feedback** - loading states and success haptics
5. **Visual consistency** - fix minor styling inconsistencies

---

## Appendix: Design Token Reference

```css
/* DriftLog Color Tokens */
--color-primary-500: #f4a261;        /* Light mode primary */
--color-dark-primary: #ff9f6c;       /* Dark mode primary */
--color-error: #ef4444;              /* Destructive actions */
--color-success: #10b981;            /* Success feedback */

/* Surfaces */
--color-light-surface: #ffffff;      /* Light mode cards */
--color-dark-surface: #252525;       /* Dark mode cards */

/* Text */
--color-light-text-primary: #2b2b2b;
--color-dark-text-primary: #f5f5f5;

/* Borders */
--color-light-border-light: #e8e4df;
--color-dark-border-medium: #3a3a3a;

/* Spacing */
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */

/* Border Radius */
--radius-2xl: 1.5rem;  /* 24px - Card radius */
```

---

**End of Report**

This research and implementation plan should provide everything needed to enhance the swipeable card actions in DriftLog. The current implementation is solid; the suggested improvements are mostly polish and accessibility enhancements rather than fundamental changes.

# DriftLog Plan Tab & Routines - Android/iOS Compatibility Audit Report

## Executive Summary

After thorough analysis of the Plan tab and Routines functionality, I've identified **23 issues** across 6 files. The codebase shows good awareness of platform differences (particularly keyboard handling), but there are several areas requiring attention for full cross-platform compatibility.

---

## 1. [app/(tabs)/plan.tsx](app/(tabs)/plan.tsx)

### Issue 1.1: Missing Accessibility Labels on Icon Buttons
| Property | Value |
|----------|-------|
| **Line** | ~229-240 (Empty state icon) |
| **Platform** | Both |
| **Severity** | Medium |
| **Description** | The Ionicons calendar icon in the empty state has no accessibility label and isn't wrapped in an accessible element. Screen readers will skip over it or read it incorrectly. |
| **Fix** | Wrap icon in View with accessibilityLabel or provide meaningful context. |

### Issue 1.2: ScrollView Missing Accessibility Properties
| Property | Value |
|----------|-------|
| **Line** | 193-196 |
| **Platform** | Both |
| **Severity** | Low |
| **Description** | Main ScrollView lacks accessibilityRole and could benefit from accessibilityLabel. |
| **Fix** | Add accessibilityRole="list" or wrap content in appropriate accessible container. |

### Issue 1.3: Touch Feedback Inconsistency
| Property | Value |
|----------|-------|
| **Line** | 155-165 (Week navigation buttons), 215-224 (Create button) |
| **Platform** | Android |
| **Severity** | Medium |
| **Description** | Using Pressable with `active:opacity-70` provides iOS-like opacity feedback, but Android users expect ripple effects. This creates UX inconsistency. |
| **Fix** | Consider using `android_ripple={{ color: 'rgba(0,0,0,0.1)' }}` prop on Pressable or use a platform-adaptive component. |

### Issue 1.4: Loading State Lacks Accessibility Announcement
| Property | Value |
|----------|-------|
| **Line** | 135-141 |
| **Platform** | Both |
| **Severity** | Low |
| **Description** | Loading state shows text but doesn't announce to screen readers. Should use `accessibilityLiveRegion="polite"`. |
| **Fix** | Add accessibilityRole="alert" and `accessibilityLiveRegion="polite"` to loading container. |

### Issue 1.5: Alert.alert Platform Styling Differences
| Property | Value |
|----------|-------|
| **Line** | 282-298 (Delete confirmation) |
| **Platform** | Both |
| **Severity** | Low |
| **Description** | Alert.alert is fine, but the destructive button ordering differs between platforms (iOS puts destructive on left, Android varies by version). Consider this is acceptable platform behavior, but document it. |
| **Fix** | No code change required, but be aware of this behavioral difference. |

---

## 2. [app/routines/[id].tsx](app/routines/[id].tsx)

### Issue 2.1: KeyboardAvoidingView Behavior Differences ⚠️
| Property | Value |
|----------|-------|
| **Line** | 289-296 |
| **Platform** | Android |
| **Severity** | High |
| **Description** | While the code attempts to handle Android keyboard with `behavior="height"` and manual keyboard height tracking, this approach can still fail on certain Android devices/OEMs with custom keyboards. The keyboardVerticalOffset may need adjustment for different scenarios. |
| **Fix** | Consider using `react-native-keyboard-aware-scroll-view` for more reliable cross-platform keyboard handling, or add runtime detection for problematic devices. |

### Issue 2.2: TextInput Missing Platform-Specific Styling
| Property | Value |
|----------|-------|
| **Line** | 337-347 (Title input), 441-455 (Exercise input) |
| **Platform** | Android |
| **Severity** | Medium |
| **Description** | TextInput lacks Android-specific props like `underlineColorAndroid="transparent"` (may show default underline on some Android versions). Also missing `selectionColor` for consistent cursor/selection appearance. |
| **Fix** | Add `underlineColorAndroid="transparent"` and `selectionColor={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}` to all TextInput components. |

### Issue 2.3: Touch Target Size Below Android Minimum
| Property | Value |
|----------|-------|
| **Line** | 240-248 (Edit button hitSlop), 251-259 (Delete button hitSlop) |
| **Platform** | Android |
| **Severity** | Medium |
| **Description** | The edit/delete buttons are `p-1` with hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}. The visual size may be ~24x24dp with hitSlop extending to ~40x40dp. Android Material guidelines recommend 48x48dp minimum. |
| **Fix** | Increase the base touch area or hitSlop to ensure 48x48dp total touch target. Use `min-w-12 min-h-12` (48dp). |

### Issue 2.4: DraggableFlatList Long Press Delay
| Property | Value |
|----------|-------|
| **Line** | 200-208 (Drag handle) |
| **Platform** | Both |
| **Severity** | Low |
| **Description** | The drag handle uses ScaleDeformable without specifying `delayLongPress`. Default varies between platforms (~500ms iOS, ~400ms Android). This can feel inconsistent. |
| **Fix** | Add explicit `delayLongPress={200}` for consistent feel, or add a visual hint that long press is required. |

### Issue 2.5: Missing Haptic Feedback for Drag Operations
| Property | Value |
|----------|-------|
| **Line** | 200-208 (Drag handle), 405-413 (DraggableFlatList) |
| **Platform** | Both |
| **Severity** | Low |
| **Description** | Drag operations should provide haptic feedback on both platforms for better UX. Currently no haptic feedback is triggered on drag start/end. |
| **Fix** | Add `expo-haptics` and trigger `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)` on drag start. DraggableFlatList has `onDragBegin` callback. |

### Issue 2.6: Shadow/Elevation Inconsistency
| Property | Value |
|----------|-------|
| **Line** | 302-305 (Header shadow), 387-392 (Empty state card) |
| **Platform** | Android |
| **Severity** | Low |
| **Description** | Using `shadow-sm dark:shadow-dark-sm` NativeWind classes. On Android, shadows are typically implemented via elevation. The current approach may not render shadows correctly on Android. |
| **Fix** | Add explicit elevation for Android: `style={{ elevation: 2 }}` alongside the shadow classes, or use NativeWind's built-in elevation support. |

### Issue 2.7: Header Cancel/Save Buttons Missing Accessibility State
| Property | Value |
|----------|-------|
| **Line** | 311-320 (Cancel), 334-346 (Save) |
| **Platform** | Both |
| **Severity** | Medium |
| **Description** | The Save button has a disabled state but doesn't communicate this to screen readers via accessibilityState. |
| **Fix** | Add accessibilityRole="button" and accessibilityState={{ disabled: !canSave }} to both header buttons. |

### Issue 2.8: Footer Absolute Positioning May Cause Issues
| Property | Value |
|----------|-------|
| **Line** | 422-438 (Footer View) |
| **Platform** | Android |
| **Severity** | High |
| **Description** | The footer uses position: 'absolute' with dynamic bottom based on keyboard height. On some Android devices, this can cause the footer to "jump" or flicker during keyboard animations. The keyboard height tracking via `keyboardDidShow`/`keyboardDidHide` may have timing issues. |
| **Fix** | Consider using `keyboardWillShow`/`keyboardWillHide` (iOS only, so need polyfill for Android), or use `LayoutAnimation` to smooth transitions. Alternatively, restructure to avoid absolute positioning with `react-native-keyboard-aware-scroll-view`. |

### Issue 2.9: Accessibility Hints Missing on Interactive Elements
| Property | Value |
|----------|-------|
| **Line** | 459-468 (Add button) |
| **Platform** | Both |
| **Severity** | Low |
| **Description** | The circular Add button lacks accessibilityLabel and accessibilityHint. |
| **Fix** | Add accessibilityRole="button" and accessibilityLabel="Add exercise". |

### Issue 2.10: Delete Routine Button Accessibility
| Property | Value |
|----------|-------|
| **Line** | 472-482 |
| **Platform** | Both |
| **Severity** | Medium |
| **Description** | Delete routine button lacks accessibilityRole and accessibilityLabel. |
| **Fix** | Add proper accessibility attributes. |

---

## 3. src/components/planning/WeekNavigationRail.tsx

### Issue 3.1: LinearGradient Edge Fades on Android
| Property | Value |
|----------|-------|
| **Line** | 154-170 |
| **Platform** | Android |
| **Severity** | Low |
| **Description** | `expo-linear-gradient`'s LinearGradient generally works on Android, but the pointerEvents styling may behave differently. On some older Android versions, the gradient may not render as smoothly. |
| **Fix** | Test on various Android versions. Consider adding a fallback solid color for older devices if needed. |

### Issue 3.2: Touch Target Size for Day Circles
| Property | Value |
|----------|-------|
| **Line** | 107-137 (Pressable day buttons) |
| **Platform** | Both |
| **Severity** | Medium |
| **Description** | Day circles are `w-12 h-12` (48dp) which meets Android guidelines but is slightly above iOS minimum (44pt). However, there's no hitSlop for the area between circles, making rapid navigation slightly harder. |
| **Fix** | Consider adding hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }} for easier tapping. |

### Issue 3.3: ScrollView Scroll Indicator Hidden
| Property | Value |
|----------|-------|
| **Line** | 80 |
| **Platform** | Both |
| **Severity** | Low |
| **Description** | showsHorizontalScrollIndicator={false} hides the scroll indicator, which can make it unclear to users that the content is scrollable, especially with the edge fade gradients. |
| **Fix** | Consider keeping the indicator visible briefly on first load, or ensure the edge fades are visually obvious enough. |

### Issue 3.4: Elevation vs Shadow for Activity Dot
| Property | Value |
|----------|-------|
| **Line** | 139-150 (Activity indicator dot) |
| **Platform** | Android |
| **Severity** | Low |
| **Description** | The activity dot uses inline shadowColor, shadowOffset, shadowOpacity, shadowRadius with elevation: 2. On Android, elevation is the primary shadow mechanism. Mixing both can lead to unexpected results. |
| **Fix** | Separate shadow styles by platform: Platform.select({ ios: { shadow... }, android: { elevation } }). |

---

## 4. src/components/routines/RoutineCard.tsx

### Issue 4.1: Touch Feedback Using Opacity Only
| Property | Value |
|----------|-------|
| **Line** | 50-63 (Main card pressable), 85-95 (Delete button) |
| **Platform** | Android |
| **Severity** | Medium |
| **Description** | Using `active:opacity-70` for touch feedback. Android users expect ripple effects. |
| **Fix** | Add `android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}` to Pressable components. |

### Issue 4.2: Nested Pressables Without proper Accessibility
| Property | Value |
|----------|-------|
| **Line** | 42-114 (Card structure) |
| **Platform** | Both |
| **Severity** | Medium |
| **Description** | The card has a main Pressable for edit and a nested Pressable for delete. This can confuse screen readers about the primary action. |
| **Fix** | Consider using `accessibilityActions` on the parent container to define multiple actions, or ensure each action has clear accessibilityRole and accessibilityLabel. |

### Issue 4.3: Completion Badge Not Accessible
| Property | Value |
|----------|-------|
| **Line** | 66-74 (Checkmark badge) |
| **Platform** | Both |
| **Severity** | Low |
| **Description** | The completion checkmark View has accessibilityLabel but no accessibilityRole. Should be accessibilityRole="image" or wrapped properly. |
| **Fix** | Add accessibilityRole="image" or `importantForAccessibility="yes"`. |

### Issue 4.4: Minimum Touch Target for Delete Button
| Property | Value |
|----------|-------|
| **Line** | 85-95 |
| **Platform** | Both |
| **Severity** | Medium |
| **Description** | Delete button is `min-w-9 min-h-9 w-9 h-9` (36dp). This is below both iOS (44pt) and Android (48dp) minimums. |
| **Fix** | Increase to `min-w-11 min-h-11 w-11 h-11` (44dp) or add hitSlop. |

### Issue 4.5: disabled Button State Not Announced
| Property | Value |
|----------|-------|
| **Line** | 106-113 (Completed Today ghost button) |
| **Platform** | Both |
| **Severity** | Low |
| **Description** | The "Completed Today" button passes disabled={true} but the Button component should propagate `accessibilityState={{ disabled: true }}`. |
| **Fix** | Verify Button component passes accessibility state, or add explicitly. |

---

## 5. src/features/routines/store.ts

### Issue 5.1: No Error State Propagation to UI
| Property | Value |
|----------|-------|
| **Line** | Various (all async actions) |
| **Platform** | Both |
| **Severity** | Medium |
| **Description** | Error handling logs to console but doesn't set an error state in the store. This means UI can't display platform-appropriate error messages consistently. |
| **Fix** | Add error: string | null to state and `setError` action. Update all catch blocks to set error state. |

### Issue 5.2: Database Operations Not Batched
| Property | Value |
|----------|-------|
| **Line** | 79-90 (createRoutine), 108-125 (updateRoutine) |
| **Platform** | Both |
| **Severity** | Low |
| **Description** | Creating/updating routine exercises is done in a loop with individual inserts. On low-end Android devices, this can cause UI jank. |
| **Fix** | Consider batching inserts with db.batch() if Drizzle supports it, or wrap in a transaction. |

---

## 6. [app/(tabs)/_layout.tsx](app/(tabs)/_layout.tsx)

### Issue 6.1: Tab Bar Height Calculation
| Property | Value |
|----------|-------|
| **Line** | 17-22 |
| **Platform** | Android |
| **Severity** | Low |
| **Description** | Tab bar height is `60 + (insets.bottom || 0)`. On Android devices without gesture navigation, insets.bottom is 0, making the tab bar 60px. On devices with gesture navigation, the safe area is added. This can lead to inconsistent tab bar heights across Android devices. |
| **Fix** | Consider using a minimum padding: Math.max(insets.bottom, 8) (already done), but the height calculation could use the same approach. |

---

## Summary by Severity

| Severity | Count |
|----------|-------|
| **Critical** | 0 |
| **High** | 2 |
| **Medium** | 11 |
| **Low** | 10 |

## Priority Recommendations

### Immediate Action (High Severity)
1. **[app/routines/[id].tsx](app/routines/[id].tsx#L289-L296)**: Review KeyboardAvoidingView implementation - test on multiple Android devices/emulators with different keyboard apps
2. **[app/routines/[id].tsx](app/routines/[id].tsx#L422-L438)**: Footer absolute positioning may need refinement for Android keyboard transitions

### Short-term (Medium Severity)
1. Add `android_ripple` to all Pressable components for Material Design compliance
2. Increase touch targets to meet platform minimums (48dp Android, 44pt iOS)
3. Add proper accessibility states (accessibilityState) to disabled buttons
4. Add `underlineColorAndroid="transparent"` to all TextInput components
5. Add accessibilityRole to all interactive elements missing it

### Long-term (Low Severity)
1. Add haptic feedback for drag operations
2. Separate shadow/elevation styles by platform
3. Add error state to routines store for better error handling
4. Consider batching database operations for performance

---

## Testing Recommendations

1. **Physical Device Testing**: Test on at least 2 Android devices (one Samsung with One UI, one stock Android) and 2 iOS devices (one with notch, one without)
2. **Keyboard Testing**: Test with multiple keyboards on Android (Gboard, Samsung Keyboard, SwiftKey)
3. **Accessibility Testing**: Enable TalkBack (Android) and VoiceOver (iOS) to verify screen reader compatibility
4. **Performance Testing**: Profile on low-end Android device to check for jank during routine creation with many exercises

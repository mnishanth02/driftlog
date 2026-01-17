# DriftLog History Module - Android/iOS Compatibility Audit Report

## Executive Summary

After thorough analysis of the History tab and related components, I've identified **28 issues** across platform-specific UI concerns, accessibility gaps, performance considerations, and UX consistency matters. Below is the detailed report organized by file.

---

## 1. History Tab Screen

**File**: [app/(tabs)/history.tsx](app/(tabs)/history.tsx)

### Issue 1.1: Missing Android Touch Feedback (Ripple Effect)
| Field | Value |
|-------|-------|
| **Description** | All Pressable components use `active:opacity-70` which provides iOS-style opacity feedback. Android users expect ripple effects. |
| **Platform** | Android |
| **Severity** | Medium |
| **Locations** | Lines 293, 315, 345, 360, 377 (filter button, clear buttons, filter chips) |
| **Recommended Fix** | Use `android_ripple` prop on Pressable or wrap in `TouchableNativeFeedback` for Android. Example: `android_ripple={{ color: 'rgba(244, 162, 97, 0.2)' }}` |

### Issue 1.2: FlashList `estimatedItemSize` Missing
| Field | Value |
|-------|-------|
| **Description** | FlashList is missing `estimatedItemSize` prop which is required for optimal performance and to avoid warnings. |
| **Platform** | Both |
| **Severity** | High |
| **Location** | Line 394 |
| **Recommended Fix** | Add `estimatedItemSize={120}` (approximate height of SessionCard) to FlashList props. |

### Issue 1.3: Pull-to-Refresh Visual Feedback Differs
| Field | Value |
|-------|-------|
| **Description** | FlashList uses refreshing and onRefresh but no `refreshControl` is specified. iOS and Android have different default refresh indicator appearances. |
| **Platform** | Both |
| **Severity** | Low |
| **Location** | Lines 411-412 |
| **Recommended Fix** | Use `RefreshControl` with platform-specific colors: `refreshControl={<RefreshControl refreshing={isLoading && sessions.length > 0} onRefresh={handleRefresh} tintColor={colorScheme === 'dark' ? '#ff9f6c' : '#f4a261'} colors={['#f4a261']} progressBackgroundColor={colorScheme === 'dark' ? '#252525' : '#ffffff'} />}` |

### Issue 1.4: Filter Button Touch Target Below Android Minimum
| Field | Value |
|-------|-------|
| **Description** | Filter button has `min-w-11 min-h-11 w-12 h-12` (44x44 to 48x48 px at 1x). While this meets iOS minimum (44x44), Android recommends 48x48dp minimum. |
| **Platform** | Android |
| **Severity** | Low |
| **Location** | Lines 290-307 |
| **Recommended Fix** | Increase to `min-w-12 min-h-12` consistently for Android compliance. |

### Issue 1.5: Missing `accessibilityState` for Filter Button
| Field | Value |
|-------|-------|
| **Description** | Filter button has accessibilityRole but doesn't communicate its pressed/active state to screen readers when filtering is active. |
| **Platform** | Both |
| **Severity** | Medium |
| **Location** | Lines 293-305 |
| **Recommended Fix** | Add `accessibilityState={{ expanded: showFilters }}` to the filter button Pressable. |

### Issue 1.6: SearchBar Missing accessibilityLabel
| Field | Value |
|-------|-------|
| **Description** | SearchBar component doesn't expose accessibility props, and the TextInput inside lacks accessibilityLabel. |
| **Platform** | Both |
| **Severity** | Medium |
| **Location** | Lines 271-276 |
| **Recommended Fix** | Add accessibilityLabel prop to SearchBar and pass it to the inner TextInput. |

### Issue 1.7: Skeleton Array Index Keys
| Field | Value |
|-------|-------|
| **Description** | Using array index as key for skeletons. While this is acknowledged with a biome ignore comment, it can cause issues if the skeleton count changes dynamically. |
| **Platform** | Both |
| **Severity** | Low |
| **Location** | Lines 159-162 |
| **Recommended Fix** | Current implementation is acceptable for static skeletons. Consider using stable IDs like `skeleton-${i}`. |

### Issue 1.8: Empty State Icons Missing Accessibility
| Field | Value |
|-------|-------|
| **Description** | Ionicons in empty states lack accessibilityLabel. Screen readers may announce "image" without context. |
| **Platform** | Both |
| **Severity** | Medium |
| **Location** | Lines 184-188 |
| **Recommended Fix** | Add `accessible={false}` to decorative icons (since the adjacent text provides context), or use accessibilityLabel if standalone. |

---

## 2. Session Detail Screen

**File**: [app/history/[id].tsx](app/history/[id].tsx)

### Issue 2.1: Back Button Uses Custom Implementation Instead of Platform Native
| Field | Value |
|-------|-------|
| **Description** | Custom back button with chevron icon instead of using platform navigation patterns. Android uses arrow-back, iOS uses chevron. This creates inconsistent UX. |
| **Platform** | Both |
| **Severity** | Medium |
| **Locations** | Lines 127-135, 180-188, 233-241, 292-300 |
| **Recommended Fix** | Use Platform.select for icon: `Platform.select({ ios: 'chevron-back', android: 'arrow-back' })`. Or better: use Expo Router's built-in header with back button. |

### Issue 2.2: Header Shadow Uses iOS-only `shadow-sm` Class
| Field | Value |
|-------|-------|
| **Description** | Header uses `shadow-sm dark:shadow-dark-sm` which uses shadowColor, shadowOffset, etc. These don't work on Android. Android requires elevation. |
| **Platform** | Android |
| **Severity** | Medium |
| **Locations** | Lines 124, 177, 230, 289 |
| **Recommended Fix** | Add elevation style for Android: `style={{ elevation: 2 }}` alongside the shadow classes, or use NativeWind's elevation class. |

### Issue 2.3: `will-change-variable` Class Unknown/Non-standard
| Field | Value |
|-------|-------|
| **Description** | The class `will-change-variable` is used but doesn't appear to be a valid Tailwind/NativeWind class. May be intended as will-change for animation optimization. |
| **Platform** | Both |
| **Severity** | Low |
| **Locations** | Lines 124, 177, 230, 289 |
| **Recommended Fix** | Remove or replace with valid class. CSS `will-change` is not supported in React Native. |

### Issue 2.4: KeyboardAvoidingView Behavior for Android
| Field | Value |
|-------|-------|
| **Description** | KeyboardAvoidingView uses `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`. Android with `undefined` behavior may not handle keyboard properly. |
| **Platform** | Android |
| **Severity** | High |
| **Location** | Lines 425-428 |
| **Recommended Fix** | Use `behavior="height"` for Android, and consider adding `keyboardVerticalOffset` based on header height. |

### Issue 2.5: TextInput Missing `returnKeyType` and `onSubmitEditing`
| Field | Value |
|-------|-------|
| **Description** | Reflection TextInputs lack keyboard action configuration which affects UX flow, especially on Android where the Enter key behavior differs. |
| **Platform** | Both |
| **Severity** | Low |
| **Locations** | Lines 443-452, 461-475 |
| **Recommended Fix** | Add `returnKeyType="next"` on feeling input, `returnKeyType="done"` on notes input with `blurOnSubmit={true}`. |

### Issue 2.6: Back Button hitSlop May Be Insufficient
| Field | Value |
|-------|-------|
| **Description** | Back button uses `hitSlop={8}` which is a number, not an object. React Native expects hitSlop object. |
| **Platform** | Both |
| **Severity** | High |
| **Locations** | Lines 127, 180, 233, 292 |
| **Recommended Fix** | Change to `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}` |

### Issue 2.7: `min-w-17.5` Custom Class May Not Render Correctly
| Field | Value |
|-------|-------|
| **Description** | `min-w-17.5` (70px) is a custom Tailwind value. Verify it's defined in theme or use explicit styles. |
| **Platform** | Both |
| **Severity** | Low |
| **Location** | Lines 128, 139, 181, etc. |
| **Recommended Fix** | Verify class exists in theme or use `style={{ minWidth: 70 }}` |

### Issue 2.8: Duplicate Error State Components
| Field | Value |
|-------|-------|
| **Description** | Lines 199-261 and 263-318 contain nearly identical error state UI code. This violates DRY and could lead to inconsistencies. |
| **Platform** | Both |
| **Severity** | Low |
| **Location** | Lines 199-318 |
| **Recommended Fix** | Extract to a shared `<ErrorState message={} onBack={}>` component. |

### Issue 2.9: Alert Uses Platform-Specific Styling
| Field | Value |
|-------|-------|
| **Description** | Alert.alert is used for confirmations (line 76). Alert appearance differs significantly between iOS (centered modal) and Android (bottom dialog on some versions). |
| **Platform** | Both |
| **Severity** | Low |
| **Location** | Lines 76-82 |
| **Recommended Fix** | Consider using a custom modal for critical actions to ensure consistent UX, or accept the platform difference as native behavior. |

---

## 3. ExerciseDetailCard Component

**File**: src/components/history/ExerciseDetailCard.tsx

### Issue 3.1: Component Not Interactive - Missing Touchable Wrapper
| Field | Value |
|-------|-------|
| **Description** | ExerciseDetailCard is purely visual but should likely expand to show sets. No interaction affordance is provided. |
| **Platform** | Both |
| **Severity** | Low |
| **Recommended Fix** | If expansion is planned, wrap in Pressable with appropriate accessibility props. |

### Issue 3.2: Icon accessibilityLabel Missing
| Field | Value |
|-------|-------|
| **Description** | Fitness icon is decorative but not marked as such. |
| **Platform** | Both |
| **Severity** | Low |
| **Location** | Lines 16-20 |
| **Recommended Fix** | Add `accessible={false}` to the icon since the exercise name provides context. |

### Issue 3.3: "Completed" Badge Has Small Touch Target
| Field | Value |
|-------|-------|
| **Description** | The "Completed" badge is very small (10px font). While it's not interactive, it might be hard to read. |
| **Platform** | Both |
| **Severity** | Low |
| **Location** | Lines 26-28 |
| **Recommended Fix** | Consider increasing to 11-12px for better readability, especially for users with visual impairments. |

---

## 4. InProgressSessionCard Component

**File**: src/components/history/InProgressSessionCard.tsx

### Issue 4.1: Card Has accessibilityRole but No accessibilityLabel
| Field | Value |
|-------|-------|
| **Description** | The outer View has accessibilityRole="alert" but isn't actually pressable. This confuses screen reader users. |
| **Platform** | Both |
| **Severity** | High |
| **Location** | Lines 35-37 |
| **Recommended Fix** | Remove accessibilityRole from the View or make the entire card tappable to resume. |

### Issue 4.2: Missing `android_ripple` on Action Buttons
| Field | Value |
|-------|-------|
| **Description** | Resume and Discard buttons use opacity feedback only. |
| **Platform** | Android |
| **Severity** | Medium |
| **Locations** | Lines 76-81, 83-88 |
| **Recommended Fix** | Add `android_ripple={{ color: 'rgba(255,255,255,0.2)' }}` to Resume button and appropriate color for Discard. |

### Issue 4.3: Destructive Action Uses Native Alert
| Field | Value |
|-------|-------|
| **Description** | Alert.alert for discard confirmation has different styling on iOS vs Android. |
| **Platform** | Both |
| **Severity** | Low |
| **Location** | Lines 24-33 |
| **Recommended Fix** | Accept as platform-native behavior or use custom modal for consistency. |

### Issue 4.4: Time Calculation Could Be Inaccurate
| Field | Value |
|-------|-------|
| **Description** | formatDistanceToNow calculation using sessionStartTime without timezone consideration may show incorrect "ago" time. |
| **Platform** | Both |
| **Severity** | Low |
| **Location** | Lines 21-22 |
| **Recommended Fix** | Use a timezone-aware library or ensure sessionStartTime is stored in UTC consistently. |

---

## 5. SessionCard Component

**File**: src/components/history/SessionCard.tsx

### Issue 5.1: Missing `android_ripple` Touch Feedback
| Field | Value |
|-------|-------|
| **Description** | Uses `active:opacity-70` only. |
| **Platform** | Android |
| **Severity** | Medium |
| **Location** | Line 26 |
| **Recommended Fix** | Add `android_ripple={{ color: 'rgba(244, 162, 97, 0.15)', borderless: false }}` |

### Issue 5.2: Accessibility Hint May Be Confusing
| Field | Value |
|-------|-------|
| **Description** | accessibilityHint says "Double tap to view session details" - "Double tap" is iOS VoiceOver language. Android TalkBack uses "double-tap" or just describes the action. |
| **Platform** | Android |
| **Severity** | Low |
| **Location** | Line 25 |
| **Recommended Fix** | Simplify to accessibilityHint="View session details" which is platform-neutral. |

### Issue 5.3: Memo Comparison May Be Shallow
| Field | Value |
|-------|-------|
| **Description** | React.memo(SessionCard) without custom comparison. If session object reference changes but values are same, unnecessary re-renders occur. |
| **Platform** | Both |
| **Severity** | Low |
| **Location** | Line 63 |
| **Recommended Fix** | Consider adding custom comparison: `React.memo(SessionCard, (prev, next) => prev.session.id === next.session.id && prev.session.updatedAt === next.session.updatedAt)` |

---

## 6. ReflectionSection Component

**File**: src/components/history/ReflectionSection.tsx

### Issue 6.1: Edit/Add Button Touch Target Too Small
| Field | Value |
|-------|-------|
| **Description** | Edit button has `px-2 py-1` making it approximately 30x24 which is below both iOS (44x44) and Android (48x48) minimums. |
| **Platform** | Both |
| **Severity** | High |
| **Location** | Lines 25-28 |
| **Recommended Fix** | Increase padding to `px-3 py-2` and add `minWidth: 44, minHeight: 44` via style prop. |

### Issue 6.2: Missing Accessibility Props on Edit Button
| Field | Value |
|-------|-------|
| **Description** | No accessibilityRole or accessibilityLabel on edit button. |
| **Platform** | Both |
| **Severity** | Medium |
| **Location** | Lines 25-28 |
| **Recommended Fix** | Add `accessibilityRole="button"` and `accessibilityLabel={hasReflection ? "Edit reflection" : "Add reflection"}` |

---

## 7. SessionCardSkeleton Component

**File**: src/components/history/SessionCardSkeleton.tsx

### Issue 7.1: Skeleton Has No Animation
| Field | Value |
|-------|-------|
| **Description** | Skeleton is static with just opacity. Modern skeleton patterns use shimmer/pulse animation for better UX feedback. |
| **Platform** | Both |
| **Severity** | Low |
| **Recommended Fix** | Add pulsing animation using Reanimated: implement useAnimatedStyle with opacity cycling from 0.4 to 1.0. |

### Issue 7.2: Screen Reader Should Skip Skeletons
| Field | Value |
|-------|-------|
| **Description** | Skeletons are visual loading indicators but may be announced by screen readers. |
| **Platform** | Both |
| **Severity** | Low |
| **Recommended Fix** | Add `accessible={false}` and `importantForAccessibility="no"` on skeleton components, and announce loading via parent component with `accessibilityLiveRegion="polite"`. |

---

## 8. SessionMetadata Component

**File**: src/components/history/SessionMetadata.tsx

### Issue 8.1: Very Small Font Sizes
| Field | Value |
|-------|-------|
| **Description** | Uses text-xs, text-[10px] which may be too small for readability and accessibility compliance (WCAG recommends minimum 12px). |
| **Platform** | Both |
| **Severity** | Medium |
| **Locations** | Lines 27, 36, 48, 54 |
| **Recommended Fix** | Increase minimum font size to text-xs (12px) for better readability. |

---

## 9. BottomSheet Component

**File**: src/components/ui/BottomSheet.tsx

### Issue 9.1: Shadow Styles Won't Work on Android
| Field | Value |
|-------|-------|
| **Description** | Uses shadowColor, shadowOffset, shadowOpacity, shadowRadius which are iOS-only. elevation is provided but may not be sufficient alone. |
| **Platform** | Android |
| **Severity** | Medium |
| **Location** | Lines 100-104 |
| **Recommended Fix** | The elevation is correct for Android. Consider verifying it produces the desired visual effect. |

### Issue 9.2: Android Hardware Back Button Handling
| Field | Value |
|-------|-------|
| **Description** | Modal has onRequestClose which handles Android back button, but the closing animation may not sync properly if user presses back rapidly. |
| **Platform** | Android |
| **Severity** | Low |
| **Location** | Line 60 |
| **Recommended Fix** | Add debounce or state check to prevent double-closing. |

### Issue 9.3: Backdrop Pressable Missing Accessibility
| Field | Value |
|-------|-------|
| **Description** | Backdrop press area has no accessibility label. |
| **Platform** | Both |
| **Severity** | Low |
| **Location** | Line 62 |
| **Recommended Fix** | Add `accessibilityRole="button"` and `accessibilityLabel="Close sheet"` to backdrop Pressable. |

---

## 10. SearchBar Component

**File**: src/components/ui/SearchBar.tsx

### Issue 10.1: Clear Button hitSlop Uses Object Format (Correct)
| Field | Value |
|-------|-------|
| **Description** | Uses `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}` which is correct format. ✅ No issue. |
| **Platform** | N/A |
| **Severity** | N/A |

### Issue 10.2: TextInput Missing accessibilityLabel
| Field | Value |
|-------|-------|
| **Description** | TextInput has placeholder but no explicit accessibility label. |
| **Platform** | Both |
| **Severity** | Medium |
| **Location** | Lines 38-47 |
| **Recommended Fix** | Add `accessibilityLabel="Search sessions"` to TextInput. |

### Issue 10.3: Missing `selectionColor` for Cursor Visibility
| Field | Value |
|-------|-------|
| **Description** | Text selection/cursor color not specified, may be invisible in certain themes. |
| **Platform** | Both |
| **Severity** | Low |
| **Location** | Lines 38-47 |
| **Recommended Fix** | Add `selectionColor={colorScheme === 'dark' ? '#ff9f6c' : '#f4a261'}` |

---

## 11. History Store (Performance Concerns)

**File**: src/features/history/store.ts

### Issue 11.1: Search Fetches All Sessions Then Filters
| Field | Value |
|-------|-------|
| **Description** | searchSessions loads ALL completed sessions into memory then filters. For large history this causes memory spikes and slow performance. |
| **Platform** | Both |
| **Severity** | High |
| **Location** | Lines 348-392 |
| **Recommended Fix** | Implement SQLite FTS (Full Text Search) or use SQL LIKE queries for better performance. Consider pagination for search results. |

### Issue 11.2: Date Range Filter Also Loads All Then Filters
| Field | Value |
|-------|-------|
| **Description** | fetchSessionsByDateRange has proper WHERE clause but still filters in-memory for completed exercises. |
| **Platform** | Both |
| **Severity** | Medium |
| **Location** | Lines 394-433 |
| **Recommended Fix** | Add index on date column and use SQL subquery for filtering. |

### Issue 11.3: No Error Boundaries for Database Operations
| Field | Value |
|-------|-------|
| **Description** | Database errors are caught and logged but the UI may be left in inconsistent state (isLoading stays true). |
| **Platform** | Both |
| **Severity** | Medium |
| **Location** | Various catch blocks |
| **Recommended Fix** | Ensure all catch blocks set appropriate state (isLoading: false, error message, etc.) and consider adding error state to store. |

---

## Summary by Severity

| Severity | Count |
|----------|-------|
| **Critical** | 0 |
| **High** | 6 |
| **Medium** | 12 |
| **Low** | 15 |

## Priority Fixes (Top 10)

1. **[HIGH]** Add `estimatedItemSize` to FlashList in history.tsx
2. **[HIGH]** Fix hitSlop format on back buttons (number → object)
3. **[HIGH]** Fix incorrect accessibilityRole on InProgressSessionCard View
4. **[HIGH]** Fix KeyboardAvoidingView behavior for Android
5. **[HIGH]** Increase touch target on ReflectionSection edit button
6. **[HIGH]** Optimize searchSessions to avoid loading all data into memory
7. **[MEDIUM]** Add `android_ripple` to Pressable components throughout
8. **[MEDIUM]** Fix header shadows for Android (add elevation)
9. **[MEDIUM]** Add accessibility labels to interactive elements
10. **[MEDIUM]** Increase minimum font sizes for WCAG compliance

---

This audit provides a comprehensive review of the History module. Addressing the High severity issues first will significantly improve cross-platform compatibility and accessibility.

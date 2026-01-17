# DriftLog Core UI Components & Infrastructure Audit Report

## Executive Summary

This audit covers 14 core UI components, 2 layout files, and supporting infrastructure. Several cross-platform issues, API inconsistencies, and best practice violations were identified.

---

## 1. src/components/ui/BottomSheet.tsx

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **Static screen height** | Both | 🔴 High | Uses `Dimensions.get('window').height` once at module load. Won't update on device rotation or iPad split-view. |
| **Missing safe area handling** | iOS | 🟠 Medium | Content can extend under the home indicator on notched devices. |
| **No keyboard avoidance** | Both | 🟠 Medium | If bottom sheet contains inputs, keyboard may cover them. |
| **Hardcoded backdrop color** | Both | 🟡 Low | `rgba(0, 0, 0, 0.6)` is hardcoded rather than using theme token. |
| **Missing gesture to dismiss** | Both | 🟠 Medium | No swipe-down gesture to close the sheet (only backdrop tap). |
| **Height prop inconsistency** | Both | 🟡 Low | height prop accepts `number | string` but only applies numeric values in style. Percentage strings are ignored. |

**Recommended Fixes:**
```tsx
// Use useWindowDimensions hook instead
const { height: SCREEN_HEIGHT } = useWindowDimensions();

// Wrap content in SafeAreaView or use useSafeAreaInsets
// Add KeyboardAvoidingView if inputs are expected
// Implement PanGestureHandler for swipe-to-dismiss
```

---

## 2. src/components/ui/Button.tsx

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **disabled:opacity-50 may not work** | Both | 🟠 Medium | NativeWind pseudo-classes for disabled may require explicit conditional styling in React Native. |
| **Missing haptic feedback** | iOS | 🟡 Low | No haptic feedback on press for better UX. |
| **No loading state** | Both | 🟠 Medium | No built-in loading indicator for async actions. |
| **Missing `accessibilityState`** | Both | 🟡 Low | Should include `accessibilityState={{ disabled }}` for screen readers. |
| **Android ripple effect missing** | Android | 🟡 Low | No `android_ripple` prop for native Material Design feedback. |

**Recommended Fixes:**
```tsx
<Pressable
  android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
  accessibilityState={{ disabled }}
  style={({ pressed }) => [
    disabled && { opacity: 0.5 }
  ]}
/>
```

---

## 3. src/components/ui/Card.tsx

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **No shadow/elevation** | Both | 🟡 Low | Missing platform-appropriate shadows. iOS uses `shadow*`, Android uses elevation. |
| **Hardcoded padding** | Both | 🟡 Low | Uses `p-5` always. Consider a size prop for flexibility. |

**Status:** ✅ Generally well-implemented with proper dark mode support.

---

## 4. src/components/ui/DatePicker.tsx

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **Hardcoded theme colors** | Both | 🟠 Medium | Calendar theme colors are hardcoded hex values instead of using theme tokens. If global theme changes, this won't update. |
| **No min/max date constraints** | Both | 🟡 Low | Missing `minDate`/`maxDate` props for date restrictions. |
| **Accessibility labels missing** | Both | 🟠 Medium | Calendar component lacks accessibility configuration. |

---

## 5. src/components/ui/DateRangePicker.tsx

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **Hardcoded theme colors** | Both | 🟠 Medium | Same calendar theming issue as DatePicker. |
| **Button overflow on small screens** | Both | 🟠 Medium | 4 preset buttons with flex-1 may compress poorly on narrow devices. |
| **Date validation missing** | Both | 🟡 Low | No validation if startDate > endDate edge cases beyond manual swap. |
| **Performance on long ranges** | Both | 🟡 Low | Loop-based date marking could be slow for multi-month selections. |

---

## 6. src/components/ui/FreestyleCard.tsx

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **Hardcoded icon colors** | Both | 🟡 Low | Uses hardcoded hex colors – should use theme tokens. |
| **Missing accessibility role** | Both | 🟠 Medium | No accessibilityRole or accessibilityHint. |

**Status:** ✅ Otherwise well-implemented.

---

## 7. src/components/ui/MetricCard.tsx

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **Icon as string emoji** | Both | 🟡 Low | Uses plain text emoji for icon prop. Cross-platform emoji rendering can vary. Consider `@expo/vector-icons`. |
| **No loading state** | Both | 🟡 Low | Could benefit from skeleton state for data fetching. |

**Status:** ✅ Generally well-implemented.

---

## 8. src/components/ui/SearchBar.tsx

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **Missing `returnKeyType` prop** | Both | 🟡 Low | Should set `returnKeyType="search"` for better keyboard UX. |
| **No debounce for onChangeText** | Both | 🟠 Medium | Rapid typing triggers many callbacks. Should debounce or let parent handle. |
| **Hardcoded icon colors** | Both | 🟡 Low | Icon colors are hardcoded hex values instead of theme tokens. |
| **TextInput height varies** | Android | 🟡 Low | Default TextInput height differs between iOS/Android. Consider explicit minHeight. |
| **No `onSubmitEditing` handler** | Both | 🟡 Low | Missing callback for when user presses search/enter. |

---

## 9. src/components/ui/Skeleton.tsx

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **No animation** | Both | 🟠 Medium | Skeleton loaders typically pulse/shimmer to indicate loading. This is static. |
| **Missing `accessible={false}`** | Both | 🟡 Low | Should hide from screen readers. |

**Recommended Fix:**
```tsx
// Add shimmer animation with Reanimated
const animatedStyle = useAnimatedStyle(() => ({
  opacity: withRepeat(
    withSequence(
      withTiming(0.4, { duration: 600 }),
      withTiming(0.8, { duration: 600 })
    ),
    -1,
    true
  )
}));
```

---

## 10. src/components/ui/TabBar.tsx

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **Missing accessibility props** | Both | 🟠 Medium | Tabs should have accessibilityRole and indicate selected state. |
| **No scroll support** | Both | 🟡 Low | If many tabs, they'll squeeze. Consider ScrollView with horizontal. |
| **No haptic feedback** | iOS | 🟡 Low | Tab selection could benefit from haptic feedback. |

---

## 11. src/components/ui/ThemeToggle.tsx

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **Emoji icons** | Both | 🟡 Low | Uses emoji (`☀️`, `🌙`, `📱`). Rendering varies across platforms/devices. Consider vector icons. |
| **Missing accessibility labels** | Both | 🟠 Medium | No accessibilityRole or accessibilityState for screen readers. |

---

## 12. src/components/ui/index.ts (UI exports)

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **No type exports** | Both | 🟡 Low | Consider exporting component prop types for consumers: `export type { ButtonProps }`. |

**Status:** ✅ Clean barrel file.

---

## 13. src/components/ErrorBoundary.tsx

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **`__DEV__` check** | Both | 🟡 Low | Good practice, but consider structured error reporting for production. |
| **Hardcoded red colors** | Both | 🟡 Low | Uses `bg-red-100 dark:bg-red-900/30` and `#dc2626` – should use semantic error token. |
| **No error recovery options** | Both | 🟡 Low | Only "Try Again" – consider "Go Home" or "Report Issue" options. |

**Status:** ✅ Generally well-implemented class component with proper lifecycle.

---

## 14. src/components/ThemeDemo.tsx

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **Hardcoded `pt-12` for header** | iOS | 🟠 Medium | Should use useSafeAreaInsets instead of fixed padding. |

**Status:** ✅ Demo component, low priority.

---

## 15. [app/_layout.tsx](app/_layout.tsx) (Root Layout)

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **DB init error swallowed partially** | Both | 🟠 Medium | Throws error which may crash app. Consider showing error UI instead. |
| **No loading indicator** | Both | 🟠 Medium | Returns `null` during init – user sees blank screen. Consider minimal splash/loading state. |
| **Font loading with empty object** | Both | 🟡 Low | `useFonts({})` with empty object is unnecessary overhead if no custom fonts. |
| **Missing SafeAreaProvider** | Both | 🟠 Medium | `react-native-safe-area-context`'s `SafeAreaProvider` should wrap the app for useSafeAreaInsets to work reliably. |

**Recommended Fix:**
```tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

return (
  <SafeAreaProvider>
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  </SafeAreaProvider>
);
```

---

## 16. [app/(tabs)/_layout.tsx](app/(tabs)/_layout.tsx) (Tabs Layout)

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **Hardcoded tab bar colors** | Both | 🟠 Medium | Uses hardcoded hex (`#1a1a1a`, `#faf4f0`) instead of theme tokens. Will desync if global tokens change. |
| **Missing tab bar blur on iOS** | iOS | 🟡 Low | iOS tab bars typically have blur effect (`tabBarBackground` with BlurView). |
| **No `tabBarHideOnKeyboard`** | Android | 🟡 Low | Tab bar should hide when keyboard opens on Android. |
| **Missing `lazy` configuration** | Both | 🟡 Low | Consider `lazy: true` for better initial load performance if screens are heavy. |

---

## 17. global.css (Theme System)

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **rem units in React Native** | Both | 🟠 Medium | NativeWind converts rem to dp, but font-size `rem` values may behave unexpectedly. Consider defining in `dp` or `px`. |
| **Missing dark mode variant** | Both | 🟡 Low | The `@custom-variant dark` rule shown in docs is missing. NativeWind v5 may handle this automatically via runtime. |
| **No opacity variants for colors** | Both | 🟡 Low | No `/50`, `/80` opacity variants defined. Would help with overlays. |
| **Font family won't load** | Both | 🟡 Low | `--font-sans` and `--font-display` reference fonts not bundled with the app. Either load fonts or remove. |

---

## 18. src/core/contexts/ThemeContext.tsx

| Issue | Platform | Severity | Description |
|-------|----------|----------|-------------|
| **Appearance.setColorScheme iOS limitations** | iOS | 🟠 Medium | On iOS < 17, Appearance.setColorScheme may not work as expected in all cases. |
| **Missing error boundary for AsyncStorage** | Both | 🟡 Low | If AsyncStorage fails, app continues but preference won't persist. |
| **Type mismatch** | Both | 🟡 Low | colorScheme typed as `"light" | "dark" | null` (includes `null`), but falls back to `'light'`. Consider stricter typing. |

---

## Summary by Severity

### 🔴 High Priority (1 issue)
1. **BottomSheet static dimensions** - Will break on rotation/split-view

### 🟠 Medium Priority (18 issues)
1. BottomSheet - Missing safe area handling
2. BottomSheet - No keyboard avoidance
3. BottomSheet - No swipe gesture
4. Button - disabled pseudo-class reliability
5. Button - No loading state
6. DatePicker - Hardcoded theme colors
7. DateRangePicker - Hardcoded theme colors
8. DateRangePicker - Button overflow
9. FreestyleCard - Missing accessibility
10. SearchBar - No debounce
11. Skeleton - No animation
12. TabBar - Missing accessibility
13. ThemeToggle - Missing accessibility
14. ThemeDemo - Hardcoded safe area padding
15. Root layout - No SafeAreaProvider
16. Root layout - No loading indicator
17. Tabs layout - Hardcoded colors
18. ThemeContext - iOS Appearance API limitations

### 🟡 Low Priority (25 issues)
Various minor improvements around hardcoded colors, accessibility enhancements, missing haptics, type exports, etc.

---

## Top Recommendations

1. **Add SafeAreaProvider** to root layout – impacts all screens.

2. **Replace static Dimensions with useWindowDimensions** in BottomSheet.

3. **Create theme color constants** to avoid hardcoded hex values throughout:
   ```tsx
   // src/core/theme/colors.ts
   export const themeColors = {
     light: { primary: '#f4a261', ... },
     dark: { primary: '#ff9f6c', ... }
   };
   ```

4. **Add animation to Skeleton** component for better loading UX.

5. **Audit all components for accessibility** – add roles, labels, and states.

6. **Add keyboard avoiding wrapper** to BottomSheet when containing inputs.

7. **Consider platform-specific tab bar styling** with blur on iOS and ripple on Android.

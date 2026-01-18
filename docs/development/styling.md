## Complete Light & Dark Mode Color System

Based on the DriftLog design, here's the final implementation plan with both light and dark mode color palettes.[1]

### Complete Color Palettes

**Light Mode:**
- Background: Cream/Beige tones (#FAF4F0, #F9F5F1)
- Primary: Peach/Coral (#F4A261)
- Text: Dark Gray/Black (#2B2B2B)
- Surfaces: White cards with subtle shadows

**Dark Mode:**
- Background: Dark charcoal tones (#0F0F0F, #1A1A1A)
- Primary: Brighter Peach (#FF9F6C) for better contrast
- Text: Off-white (#F5F5F5)
- Surfaces: Elevated dark cards (#252525)

## Final Implementation Plan

### Step 1: Complete `global.css` Configuration

```css
@import 'tailwindcss';

/* ==============================================
   DRIFTLOG DESIGN SYSTEM - LIGHT & DARK MODE
   ============================================== */

@theme {
  /* === PRIMARY COLORS === */
  --color-primary-50: #fff5f0;
  --color-primary-100: #ffe8dc;
  --color-primary-200: #ffd1b9;
  --color-primary-300: #ffb996;
  --color-primary-400: #f89e7b;
  --color-primary-500: #f4a261;    /* Main brand color */
  --color-primary-600: #e8894a;
  --color-primary-700: #d17038;
  --color-primary-800: #b05628;
  --color-primary-900: #8f421a;
  
  /* === LIGHT MODE COLORS === */
  --color-light-bg-primary: #faf4f0;
  --color-light-bg-secondary: #ffffff;
  --color-light-bg-cream: #f9f5f1;
  --color-light-bg-light: #fff0e5;
  --color-light-surface: #ffffff;
  --color-light-surface-elevated: #ffffff;
  
  --color-light-text-primary: #2b2b2b;
  --color-light-text-secondary: #6b6b6b;
  --color-light-text-tertiary: #8e8e8e;
  --color-light-text-light: #b5b5b5;
  
  --color-light-border-light: #e8e4df;
  --color-light-border-medium: #d1cbc4;
  --color-light-border-dark: #b5afa8;
  
  /* === DARK MODE COLORS === */
  --color-dark-bg-primary: #0f0f0f;
  --color-dark-bg-secondary: #1a1a1a;
  --color-dark-bg-elevated: #212121;
  --color-dark-bg-accent: #2a2a2a;
  --color-dark-surface: #252525;
  --color-dark-surface-elevated: #2f2f2f;
  
  --color-dark-primary: #ff9f6c;      /* Brighter for dark bg */
  --color-dark-primary-light: #ffb18a;
  --color-dark-primary-dark: #e8814a;
  
  --color-dark-text-primary: #f5f5f5;
  --color-dark-text-secondary: #b5b5b5;
  --color-dark-text-tertiary: #8e8e8e;
  --color-dark-text-light: #6b6b6b;
  
  --color-dark-border-light: #2f2f2f;
  --color-dark-border-medium: #3a3a3a;
  --color-dark-border-dark: #454545;
  
  /* === SEMANTIC COLORS (Both Modes) === */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* === TYPOGRAPHY === */
  --font-sans: Inter, system-ui, -apple-system, sans-serif;
  --font-display: 'DM Sans', system-ui, -apple-system, sans-serif;
  
  --font-size-xs: 0.75rem;      /* 12px */
  --font-size-sm: 0.8125rem;    /* 13px */
  --font-size-base: 0.875rem;   /* 14px */
  --font-size-md: 0.9375rem;    /* 15px */
  --font-size-lg: 1rem;         /* 16px */
  --font-size-xl: 1.125rem;     /* 18px */
  --font-size-2xl: 1.5rem;      /* 24px */
  --font-size-3xl: 1.75rem;     /* 28px */
  --font-size-4xl: 2rem;        /* 32px */
  --font-size-5xl: 3rem;        /* 48px */
  
  --line-height-tight: 1.2;
  --line-height-normal: 1.4;
  --line-height-relaxed: 1.6;
  
  /* === SPACING === */
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  
  /* === BORDER RADIUS === */
  --radius-sm: 0.5rem;    /* 8px */
  --radius-md: 0.75rem;   /* 12px */
  --radius-lg: 1rem;      /* 16px */
  --radius-xl: 1.25rem;   /* 20px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;
  
  /* === SHADOWS === */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  
  --shadow-dark-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-dark-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --shadow-dark-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
}

/* === DARK MODE VARIANT === */
@custom-variant dark (&:is(.dark *));

/* === BASE STYLES === */
* {
  @apply border-light-border-light dark:border-dark-border-light;
}

/* === CUSTOM UTILITIES === */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .card-shadow {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  }
  
  .card-shadow-dark {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  }
}
```

### Step 2: Configure Dark Mode in `app.json`

```json
{
  "expo": {
    "name": "DriftLog",
    "slug": "driftlog",
    "userInterfaceStyle": "automatic",
    "ios": {
      "userInterfaceStyle": "automatic"
    },
    "android": {
      "userInterfaceStyle": "automatic"
    }
  }
}
```

### Step 3: Create Theme Context & Hook

**`lib/contexts/ThemeContext.tsx`:**

```tsx
import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorScheme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colorScheme: 'light' | 'dark';
  selectedScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@driftlog_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme: setNativeWindScheme } = useNativeWindColorScheme();
  const [selectedScheme, setSelectedScheme] = React.useState<ColorScheme>('system');

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setSelectedScheme(saved as ColorScheme);
        if (saved !== 'system') {
          setNativeWindScheme(saved as 'light' | 'dark');
        }
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const setColorScheme = async (scheme: ColorScheme) => {
    try {
      setSelectedScheme(scheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
      
      if (scheme === 'system') {
        // Reset to system preference
        setNativeWindScheme(colorScheme || 'light');
      } else {
        setNativeWindScheme(scheme);
      }
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleColorScheme = () => {
    const newScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newScheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        colorScheme: colorScheme || 'light',
        selectedScheme,
        setColorScheme,
        toggleColorScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### Step 4: Update Root Layout

**`app/_layout.tsx`:**

```tsx
import '../global.css';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#faf4f0',
          },
          headerTintColor: colorScheme === 'dark' ? '#f5f5f5' : '#2b2b2b',
          contentStyle: {
            backgroundColor: colorScheme === 'dark' ? '#0f0f0f' : '#faf4f0',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
```

### Step 5: Create UI Components with Dark Mode Support

**`components/ui/Card.tsx`:**

```tsx
import { View, Text, type ViewProps } from 'react-native';
import type { PropsWithChildren } from 'react';

interface CardProps extends PropsWithChildren, ViewProps {
  title?: string;
  className?: string;
}

export function Card({ title, children, className = '', ...props }: CardProps) {
  return (
    <View 
      className={`bg-light-surface dark:bg-dark-surface rounded-2xl p-5 shadow-md dark:shadow-dark-md border border-light-border-light dark:border-dark-border-medium ${className}`}
      {...props}
    >
      {title && (
        <Text className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
```

**`components/ui/Button.tsx`:**

```tsx
import { Pressable, Text } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  const baseClasses = "rounded-xl py-4 px-6 active:opacity-70 disabled:opacity-50";
  
  const variantClasses = {
    primary: "bg-primary-500 dark:bg-dark-primary",
    secondary: "bg-light-bg-cream dark:bg-dark-bg-elevated border border-light-border-medium dark:border-dark-border-medium",
    ghost: "bg-transparent"
  };
  
  const textClasses = {
    primary: "text-white dark:text-dark-bg-primary",
    secondary: "text-light-text-primary dark:text-dark-text-primary",
    ghost: "text-primary-500 dark:text-dark-primary"
  };

  return (
    <Pressable 
      onPress={onPress}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      <Text className={`text-base font-semibold text-center ${textClasses[variant]}`}>
        {title}
      </Text>
    </Pressable>
  );
}
```

**`components/ui/TabBar.tsx`:**

```tsx
import { View, Pressable, Text } from 'react-native';

interface TabBarProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <View className="flex-row gap-2 bg-light-bg-cream dark:bg-dark-bg-secondary p-1 rounded-full">
      {tabs.map((tab) => (
        <Pressable
          key={tab}
          onPress={() => onTabChange(tab)}
          className={`px-5 py-2 rounded-full transition-colors ${
            activeTab === tab 
              ? 'bg-primary-500 dark:bg-dark-primary' 
              : 'bg-transparent'
          }`}
        >
          <Text className={`text-base ${
            activeTab === tab 
              ? 'text-white dark:text-dark-bg-primary font-semibold' 
              : 'text-light-text-secondary dark:text-dark-text-secondary'
          }`}>
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
```

**`components/ui/MetricCard.tsx`:**

```tsx
import { View, Text } from 'react-native';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
}

export function MetricCard({ label, value, unit, icon }: MetricCardProps) {
  return (
    <View className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 border border-light-border-light dark:border-dark-border-medium">
      <View className="flex-row items-center gap-2 mb-1">
        {icon && <Text className="text-base">{icon}</Text>}
        <Text className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
          {label}
        </Text>
      </View>
      <View className="flex-row items-baseline gap-1">
        <Text className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
          {value}
        </Text>
        {unit && (
          <Text className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
}
```

### Step 6: Create Theme Toggle Component

**`components/ui/ThemeToggle.tsx`:**

```tsx
import { View, Pressable, Text } from 'react-native';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export function ThemeToggle() {
  const { colorScheme, selectedScheme, setColorScheme } = useTheme();

  const options: Array<{ value: 'light' | 'dark' | 'system'; icon: string; label: string }> = [
    { value: 'light', icon: 'sunny-outline', label: 'Light' },
    { value: 'dark', icon: 'moon-outline', label: 'Dark' },
    { value: 'system', icon: 'phone-portrait-outline', label: 'System' },
  ];

  return (
    <View className="flex-row gap-2 bg-light-bg-cream dark:bg-dark-bg-secondary p-1 rounded-xl">
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => setColorScheme(option.value)}
          className={`flex-1 flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg ${
            selectedScheme === option.value
              ? 'bg-primary-500 dark:bg-dark-primary'
              : 'bg-transparent'
          }`}
        >
          <Ionicons
            name={option.icon as any}
            size={18}
            color={
              selectedScheme === option.value
                ? '#ffffff'
                : colorScheme === 'dark'
                ? '#b5b5b5'
                : '#6b6b6b'
            }
          />
          <Text
            className={`text-sm font-medium ${
              selectedScheme === option.value
                ? 'text-white'
                : 'text-light-text-secondary dark:text-dark-text-secondary'
            }`}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
```

### Step 7: Example Screen Implementation

**`app/index.tsx`:**

```tsx
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TabBar } from '@/components/ui/TabBar';
import { MetricCard } from '@/components/ui/MetricCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Activity');
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const { colorScheme } = useTheme();

  return (
    <ScrollView className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
      <View className="p-5 gap-6">
        {/* Header */}
        <View className="pt-12 flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Good morning
            </Text>
            <Text className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">
              Harmony for Mind{'\n'}and Life
            </Text>
          </View>
          
          {/* Theme Toggle Button */}
          <Pressable
            onPress={() => setShowThemeSettings(!showThemeSettings)}
            className="w-10 h-10 items-center justify-center rounded-full bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium"
          >
            <Ionicons
              name={colorScheme === 'dark' ? 'moon' : 'sunny'}
              size={20}
              color={colorScheme === 'dark' ? '#ff9f6c' : '#f4a261'}
            />
          </Pressable>
        </View>

        {/* Theme Settings (Conditional) */}
        {showThemeSettings && (
          <Card>
            <Text className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
              Theme Settings
            </Text>
            <ThemeToggle />
          </Card>
        )}

        {/* Tabs */}
        <TabBar 
          tabs={['Activity', 'Mood', 'Food', 'Sleep']}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Stats Grid */}
        <View className="flex-row gap-4">
          <View className="flex-1">
            <MetricCard label="Heart Rate" value="100" unit="bpm" icon="❤️" />
          </View>
          <View className="flex-1">
            <MetricCard label="Calories" value="480" unit="kcal" icon="🔥" />
          </View>
        </View>

        {/* Wellness Score Card */}
        <Card title="Wellness Score">
          <View className="items-center py-6">
            <View className="relative">
              <Text className="text-5xl font-bold text-primary-500 dark:text-dark-primary">
                6.0
              </Text>
              <Text className="text-lg text-light-text-tertiary dark:text-dark-text-tertiary">
                /10
              </Text>
            </View>
            <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
              Great! Keep it up
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View className="gap-3">
          <Button 
            title="Start Challenge"
            onPress={() => console.log('Challenge started')}
            variant="primary"
          />
          <Button 
            title="View Progress"
            onPress={() => console.log('View progress')}
            variant="secondary"
          />
        </View>
      </View>
    </ScrollView>
  );
}
```

### Step 8: Install Required Dependencies

```bash
# AsyncStorage for theme persistence
pnpx expo install @react-native-async-storage/async-storage

# Vector Icons (if not already installed)
pnpx expo install @expo/vector-icons
```

### Step 9: Final Checks & Testing

```bash
# Clear cache and restart
pnpx expo start --clear

# Test on different devices
pnpx expo start --ios
pnpx expo start --android
```

## Complete File Structure

```
your-app/
├── app/
│   ├── _layout.tsx              ✅ Theme provider & StatusBar
│   └── index.tsx                ✅ Home screen with dark mode
├── components/
│   └── ui/
│       ├── Card.tsx             ✅ Dark mode support
│       ├── Button.tsx           ✅ Dark mode support
│       ├── TabBar.tsx           ✅ Dark mode support
│       ├── MetricCard.tsx       ✅ Dark mode support
│       └── ThemeToggle.tsx      ✅ Theme switcher
├── lib/
│   └── contexts/
│       └── ThemeContext.tsx     ✅ Theme management
├── global.css                   ✅ Complete design system
├── metro.config.js              ✅ NativeWind setup
├── postcss.config.mjs           ✅ Tailwind v4
├── nativewind-env.d.ts          ✅ TypeScript support
├── app.json                     ✅ Dark mode config
└── package.json                 ✅ lightningcss pinned
```

## Quick Reference: Using Colors in Components

```tsx
// Backgrounds
className="bg-light-bg-primary dark:bg-dark-bg-primary"
className="bg-light-surface dark:bg-dark-surface"

// Text
className="text-light-text-primary dark:text-dark-text-primary"
className="text-light-text-secondary dark:text-dark-text-secondary"

// Primary Color
className="bg-primary-500 dark:bg-dark-primary"
className="text-primary-500 dark:text-dark-primary"

// Borders
className="border-light-border-light dark:border-dark-border-medium"
```

## UI Patterns & Best Practices

### Status Badges
For status indicators (e.g., "Completed", "Active"), use the following pattern for high contrast and accessibility:
- **Container**: `bg-{color}/10` (10% opacity)
- **Text**: `text-{color}` (solid color)
- **Typography**: `text-xs font-bold` (minimum 12px)

Example (Success Badge):
```tsx
<View className="bg-success/10 px-2.5 py-1 rounded-full">
  <Text className="text-xs font-bold text-success">Completed</Text>
</View>
```

### Spacing & Sizing
- **Grid Compliance**: Always use the 4px grid (`1` = 4px). Avoid fractional spacing (e.g., `1.5`) unless fine-tuning alignment within an icon row or border.
- **Minimum Tap Targets**: Interactive elements must have a hit slop or size of at least 44x44 points. Use `hitSlop` or generous padding.
- **Typography Floor**: Avoid font sizes smaller than `text-xs` (12px) for any readable text. `text-[10px]` should only be used for very tight metadata labels or badges where space is strictly constrained.

### Card Standards
- **Standard Card**: `rounded-2xl`, `p-5`, `bg-surface`
- **Compact Card**: `rounded-2xl`, `p-4`, `bg-surface` (Use for dense lists or metadata sections)

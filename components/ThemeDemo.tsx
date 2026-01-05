import { View, Text, ScrollView, Pressable } from "react-native";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { TabBar } from "./ui/TabBar";
import { MetricCard } from "./ui/MetricCard";
import { ThemeToggle } from "./ui/ThemeToggle";
import { useTheme } from "../lib/contexts/ThemeContext";
import { useState } from "react";

export function ThemeDemo() {
  const [activeTab, setActiveTab] = useState("Activity");
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
              DriftLog Theme{"\n"}Demo
            </Text>
          </View>

          {/* Theme Toggle Button */}
          <Pressable
            onPress={() => setShowThemeSettings(!showThemeSettings)}
            className="w-10 h-10 items-center justify-center rounded-full bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium"
          >
            <Text className="text-lg">{colorScheme === "dark" ? "🌙" : "☀️"}</Text>
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
          tabs={["Activity", "Mood", "Food", "Sleep"]}
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
            onPress={() => console.log("Challenge started")}
            variant="primary"
          />
          <Button
            title="View Progress"
            onPress={() => console.log("View progress")}
            variant="secondary"
          />
          <Button title="Learn More" onPress={() => console.log("Learn more")} variant="ghost" />
        </View>

        {/* Color Palette Preview */}
        <Card title="Color Palette">
          <View className="gap-3">
            <View className="flex-row gap-2">
              <View className="flex-1 h-12 rounded-lg bg-primary-500 dark:bg-dark-primary" />
              <View className="flex-1 h-12 rounded-lg bg-light-bg-cream dark:bg-dark-bg-secondary" />
              <View className="flex-1 h-12 rounded-lg bg-light-surface dark:bg-dark-surface" />
            </View>
            <Text className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary text-center">
              Primary • Background • Surface
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

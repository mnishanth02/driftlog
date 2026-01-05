import { View, Pressable, Text } from "react-native";

interface TabBarProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function TabBar({ tabs, activeTab, onTabChange, className = "" }: TabBarProps) {
  return (
    <View
      className={`flex-row gap-2 bg-light-bg-cream dark:bg-dark-bg-secondary p-1 rounded-full ${className}`}
    >
      {tabs.map((tab) => (
        <Pressable
          key={tab}
          onPress={() => onTabChange(tab)}
          className={`px-5 py-2 rounded-full ${
            activeTab === tab ? "bg-primary-500 dark:bg-dark-primary" : "bg-transparent"
          }`}
        >
          <Text
            className={`text-base ${
              activeTab === tab
                ? "text-white dark:text-dark-bg-primary font-semibold"
                : "text-light-text-secondary dark:text-dark-text-secondary"
            }`}
          >
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

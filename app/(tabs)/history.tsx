import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SessionCard, SessionCardSkeleton } from "@/components/history";
import { DateRangePicker, SearchBar } from "@/components/ui";
import { useTheme } from "@/core/contexts/ThemeContext";
import { DATE_FORMATS, formatDate } from "@/core/utils/helpers";
import { type HistorySession, useHistoryStore } from "@/features/history";

const SEARCH_DEBOUNCE_MS = 250;

export default function HistoryScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();

  // Store hooks - use shallow selectors to prevent unnecessary re-renders
  const sessions = useHistoryStore((state) => state.sessions);
  const isLoading = useHistoryStore((state) => state.isLoading);
  const isLoadingMore = useHistoryStore((state) => state.isLoadingMore);
  const hasMore = useHistoryStore((state) => state.hasMore);
  const loadSessions = useHistoryStore((state) => state.loadSessions);
  const refreshSessions = useHistoryStore((state) => state.refreshSessions);
  const loadMoreSessions = useHistoryStore((state) => state.loadMoreSessions);
  const searchSessions = useHistoryStore((state) => state.searchSessions);
  const filterByDateRange = useHistoryStore((state) => state.filterByDateRange);

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeDateRange, setActiveDateRange] = useState<{ start: string; end: string } | null>(
    null,
  );

  const isSearching = searchQuery.trim().length > 0;

  const activeDateRangeLabel = useMemo(() => {
    if (!activeDateRange) return null;
    return `${formatDate(activeDateRange.start, DATE_FORMATS.SHORT_DATE)} – ${formatDate(activeDateRange.end, DATE_FORMATS.SHORT_DATE)}`;
  }, [activeDateRange]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions({ reset: true });
  }, [loadSessions]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Debounce search to avoid hammering SQLite while typing.
  useEffect(() => {
    const trimmed = searchQuery.trim();
    const timer = setTimeout(() => {
      if (!trimmed) {
        // If the user cleared the search, go back to the unfiltered/paginated list.
        loadSessions({ reset: true });
        return;
      }

      // Searching is a separate mode; it should not be combined with date-range filter for now.
      setIsFiltering(false);
      setActiveDateRange(null);
      void searchSessions(trimmed);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery, loadSessions, searchSessions]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    // Note: loadSessions reset happens from the debounce effect when query becomes empty.
  }, []);

  const handleClearDateRange = useCallback(() => {
    setIsFiltering(false);
    setActiveDateRange(null);
    // Only reset list if we are not currently searching.
    if (!searchQuery.trim()) {
      loadSessions({ reset: true });
    }
  }, [loadSessions, searchQuery]);

  const handleDateRangeSelected = useCallback(
    async (startDate: string, endDate: string) => {
      // Date-range filter is its own mode; clear any active search.
      setSearchQuery("");
      setIsFiltering(true);
      setActiveDateRange({ start: startDate, end: endDate });
      await filterByDateRange(startDate, endDate);
    },
    [filterByDateRange],
  );

  const handleRefresh = useCallback(async () => {
    // Keep the current filter context, if any.
    if (searchQuery.trim()) {
      await searchSessions(searchQuery);
      return;
    }

    if (activeDateRange) {
      await filterByDateRange(activeDateRange.start, activeDateRange.end);
      return;
    }

    await refreshSessions();
  }, [activeDateRange, filterByDateRange, refreshSessions, searchQuery, searchSessions]);

  const handleViewSession = useCallback(
    (sessionId: string) => {
      router.push(`/history/${sessionId}` as never);
    },
    [router],
  );

  // Stable keyExtractor to prevent FlashList re-renders
  const keyExtractor = useCallback((item: HistorySession) => item.id, []);

  const renderSessionItem = useCallback(
    ({ item }: { item: HistorySession }) => (
      <SessionCard session={item} onPress={() => handleViewSession(item.id)} />
    ),
    [handleViewSession],
  );

  const handleEndReached = useCallback(() => {
    // Only infinite-scroll when not filtering/searching.
    if (isFiltering || searchQuery.trim()) return;
    void loadMoreSessions();
  }, [isFiltering, loadMoreSessions, searchQuery]);

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
            <SessionCardSkeleton key={i} showRoutine={i % 2 === 0} showReflection={i % 3 === 0} />
          ))}
        </View>
      );
    }

    // Contextualize empty message based on current filter/search state
    const getEmptyMessage = () => {
      if (isSearching) {
        return {
          icon: "search-outline" as const,
          title: "No matching sessions",
          subtitle: `No workouts found for "${searchQuery.trim()}"`,
        };
      }
      if (isFiltering && activeDateRange) {
        return {
          icon: "calendar-outline" as const,
          title: "No sessions in range",
          subtitle: `No workouts between ${formatDate(activeDateRange.start, DATE_FORMATS.SHORT_DATE)} and ${formatDate(activeDateRange.end, DATE_FORMATS.SHORT_DATE)}`,
        };
      }
      return {
        icon: "barbell-outline" as const,
        title: "No workout history",
        subtitle: "Your completed workouts will appear here",
      };
    };

    const emptyMessage = getEmptyMessage();

    return (
      <View className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-light rounded-2xl p-8 items-center mx-5 mt-6">
        <Ionicons
          name={emptyMessage.icon}
          size={48}
          color={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
          style={{ marginBottom: 16 }}
        />
        <Text className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 text-center">
          {emptyMessage.title}
        </Text>
        <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center">
          {emptyMessage.subtitle}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <View style={{ paddingTop: insets.top + 12 }} className="">
        <Text className="text-3xl px-5 pb-3 font-bold text-light-text-primary dark:text-dark-text-primary">
          History
        </Text>

        <View className="flex-row items-center gap-3 px-5">
          <View className="flex-1">
            <SearchBar
              value={searchQuery}
              onChangeText={handleSearch}
              onClear={handleClearSearch}
              placeholder="Search sessions..."
            />
          </View>

          <Pressable
            onPress={() => setShowDateRangePicker(true)}
            accessibilityRole="button"
            accessibilityLabel={isFiltering ? "Change date filter" : "Filter by date range"}
            accessibilityHint="Opens date range picker to filter sessions"
            className={`min-w-11 min-h-11 w-12 h-12 rounded-xl items-center justify-center active:opacity-70 ${
              isFiltering
                ? "bg-primary-500 dark:bg-dark-primary"
                : "bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium"
            }`}
          >
            <Ionicons
              name="filter-outline"
              size={22}
              color={isFiltering ? "#ffffff" : colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
            />
          </Pressable>

          {isFiltering && (
            <Pressable
              onPress={handleClearDateRange}
              accessibilityRole="button"
              accessibilityLabel="Clear date filter"
              accessibilityHint="Removes date range filter"
              className="min-w-11 min-h-11 w-11 h-11 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium items-center justify-center active:opacity-70"
            >
              <Ionicons
                name="close"
                size={22}
                color={colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
              />
            </Pressable>
          )}
        </View>

        {(isFiltering || isSearching) && (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {isSearching && (
              <View className="flex-row items-center bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-full px-3 py-1.5">
                <Ionicons
                  name="search"
                  size={14}
                  color={colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
                  style={{ marginRight: 6 }}
                />
                <Text className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  {searchQuery.trim()}
                </Text>
                <Pressable
                  onPress={handleClearSearch}
                  hitSlop={8}
                  className="ml-2 active:opacity-70"
                >
                  <Ionicons
                    name="close"
                    size={14}
                    color={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
                  />
                </Pressable>
              </View>
            )}

            {isFiltering && activeDateRangeLabel && (
              <View className="flex-row items-center bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-full px-3 py-1.5">
                <Ionicons
                  name="calendar"
                  size={14}
                  color={colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
                  style={{ marginRight: 6 }}
                />
                <Text className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  {activeDateRangeLabel}
                </Text>
                <Pressable
                  onPress={handleClearDateRange}
                  hitSlop={8}
                  className="ml-2 active:opacity-70"
                >
                  <Ionicons
                    name="close"
                    size={14}
                    color={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
                  />
                </Pressable>
              </View>
            )}
          </View>
        )}

        {!isLoading && sessions.length > 0 && (
          <View className="my-1 mx-6">
            <Text className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
              {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
              {!isFiltering && !isSearching && hasMore ? " (more available)" : ""}
            </Text>
          </View>
        )}
      </View>

      <FlashList
        data={sessions}
        renderItem={renderSessionItem}
        keyExtractor={keyExtractor}
        drawDistance={300}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          !isFiltering && !searchQuery.trim() && hasMore ? (
            <View className="py-4 items-center">
              {isLoadingMore ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator
                    size="small"
                    color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
                  />
                  <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Loading more…
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View className="py-2" />
          )
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading && sessions.length > 0}
        onRefresh={handleRefresh}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />

      <DateRangePicker
        visible={showDateRangePicker}
        onClose={() => setShowDateRangePicker(false)}
        onApply={handleDateRangeSelected}
        onClear={handleClearDateRange}
      />
    </View>
  );
}

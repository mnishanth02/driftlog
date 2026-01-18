import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InProgressSessionCard, SessionCard, SessionCardSkeleton } from "@/components/history";
import { DateRangePicker, SearchBar } from "@/components/ui";
import { useTheme } from "@/core/contexts/ThemeContext";
import { DATE_FORMATS, formatDate } from "@/core/utils/helpers";
import { type HistorySession, useHistoryStore } from "@/features/history";
import { useSessionStore } from "@/features/session";

const SEARCH_DEBOUNCE_MS = 250;

export default function HistoryScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();

  // Store hooks - use shallow selectors to prevent unnecessary re-renders
  const sessions = useHistoryStore((state) => state.sessions);
  const inProgressSessions = useHistoryStore((state) => state.inProgressSessions);
  const isLoading = useHistoryStore((state) => state.isLoading);
  const isLoadingMore = useHistoryStore((state) => state.isLoadingMore);
  const hasMore = useHistoryStore((state) => state.hasMore);
  const loadSessions = useHistoryStore((state) => state.loadSessions);
  const loadInProgressSessions = useHistoryStore((state) => state.loadInProgressSessions);
  const refreshSessions = useHistoryStore((state) => state.refreshSessions);
  const loadMoreSessions = useHistoryStore((state) => state.loadMoreSessions);
  const searchSessions = useHistoryStore((state) => state.searchSessions);
  const filterByDateRange = useHistoryStore((state) => state.filterByDateRange);
  const discardSession = useHistoryStore((state) => state.discardSession);

  // Session store for resuming workouts
  const activeSessionId = useSessionStore((state) => state.activeSessionId);

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
    loadInProgressSessions();
  }, [loadSessions, loadInProgressSessions]);

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
    // Also refresh in-progress sessions
    await loadInProgressSessions();
  }, [
    activeDateRange,
    filterByDateRange,
    refreshSessions,
    searchQuery,
    searchSessions,
    loadInProgressSessions,
  ]);

  const handleResumeSession = useCallback(
    (sessionId: string) => {
      // Navigate to the session screen
      // The session orchestrator will handle resuming the session
      router.push(`/session/${sessionId}` as never);
    },
    [router],
  );

  const handleDiscardSession = useCallback(
    async (sessionId: string) => {
      try {
        await discardSession(sessionId);
      } catch (error) {
        console.error("Failed to discard session:", error);
      }
    },
    [discardSession],
  );

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
      <SessionCard session={ item } onPress={ () => handleViewSession(item.id) } />
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
          { Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
            <SessionCardSkeleton key={ i } showRoutine={ i % 2 === 0 } showReflection={ i % 3 === 0 } />
          )) }
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
          name={ emptyMessage.icon }
          size={ 48 }
          color={ colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5" }
          style={ { marginBottom: 16 } }
          accessible={ false }
        />
        <Text className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 text-center">
          { emptyMessage.title }
        </Text>
        <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center">
          { emptyMessage.subtitle }
        </Text>
      </View>
    );
  };

  // Render In-Progress section as list header (only when not searching/filtering)
  const renderInProgressSection = useCallback(() => {
    // Don't show in-progress section when searching or filtering
    if (isSearching || isFiltering) return null;

    // Don't show if no in-progress sessions (except the active one in Zustand)
    // Filter out the session that's currently active in Zustand (it's being worked on)
    const orphanedInProgress = inProgressSessions.filter((s) => s.id !== activeSessionId);

    if (orphanedInProgress.length === 0) return null;

    return (
      <View className="mb-4">
        <Text className="text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide mb-3">
          In Progress
        </Text>
        { orphanedInProgress.map((session) => (
          <InProgressSessionCard
            key={ session.id }
            session={ session }
            onResume={ () => handleResumeSession(session.id) }
            onDiscard={ () => handleDiscardSession(session.id) }
          />
        )) }

        {/* Completed section header */ }
        { sessions.length > 0 && (
          <Text className="text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide mt-4 mb-3">
            Completed
          </Text>
        ) }
      </View>
    );
  }, [
    isSearching,
    isFiltering,
    inProgressSessions,
    activeSessionId,
    sessions.length,
    handleResumeSession,
    handleDiscardSession,
  ]);

  return (
    <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
      <StatusBar style={ colorScheme === "dark" ? "light" : "dark" } />

      <View style={ { paddingTop: insets.top + 12 } } className="">
        <Text className="text-3xl px-5 pb-3 font-bold text-light-text-primary dark:text-dark-text-primary">
          History
        </Text>

        <View className="flex-row items-center gap-3 px-5">
          <View className="flex-1">
            <SearchBar
              value={ searchQuery }
              onChangeText={ handleSearch }
              onClear={ handleClearSearch }
              placeholder="Search sessions..."
            />
          </View>

          <Pressable
            onPress={ () => setShowDateRangePicker(true) }
            android_ripple={ {
              color: isFiltering ? "rgba(255, 255, 255, 0.3)" : "rgba(244, 162, 97, 0.3)",
            } }
            accessibilityRole="button"
            accessibilityLabel={ isFiltering ? "Change date filter" : "Filter by date range" }
            accessibilityHint="Opens date range picker to filter sessions"
            accessibilityState={ { selected: isFiltering } }
            hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
            className={ `min-w-11 min-h-11 w-12 h-12 rounded-xl items-center justify-center active:opacity-70 ${isFiltering
              ? "bg-primary-500 dark:bg-dark-primary"
              : "bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium"
              }` }
          >
            <Ionicons
              name="filter-outline"
              size={ 22 }
              color={ isFiltering ? "#ffffff" : colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b" }
              accessible={ false }
            />
          </Pressable>

          { isFiltering && (
            <Pressable
              onPress={ handleClearDateRange }
              android_ripple={ { color: "rgba(0, 0, 0, 0.1)" } }
              accessibilityRole="button"
              accessibilityLabel="Clear date filter"
              accessibilityHint="Removes date range filter"
              hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
              className="min-w-11 min-h-11 w-11 h-11 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium items-center justify-center active:opacity-70"
            >
              <Ionicons
                name="close"
                size={ 22 }
                color={ colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b" }
                accessible={ false }
              />
            </Pressable>
          ) }
        </View>

        { (isFiltering || isSearching) && (
          <View className="flex-row flex-wrap gap-2 mt-3 ml-5">
            { isSearching && (
              <View className="flex-row items-center bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-full p-2">
                <Ionicons
                  name="search"
                  size={ 14 }
                  color={ colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b" }
                  style={ { marginRight: 6 } }
                  accessible={ false }
                />
                <Text className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  { searchQuery.trim() }
                </Text>
                <Pressable
                  onPress={ handleClearSearch }
                  android_ripple={ { color: "rgba(0, 0, 0, 0.1)", radius: 14 } }
                  hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
                  className="ml-2 active:opacity-70"
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  accessibilityHint="Removes search filter"
                >
                  <Ionicons
                    name="close"
                    size={ 14 }
                    color={ colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5" }
                    accessible={ false }
                  />
                </Pressable>
              </View>
            ) }

            { isFiltering && activeDateRangeLabel && (
              <View className="flex-row items-center bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-full px-3 py-1.5">
                <Ionicons
                  name="calendar"
                  size={ 14 }
                  color={ colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b" }
                  style={ { marginRight: 6 } }
                />
                <Text className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  { activeDateRangeLabel }
                </Text>
                <Pressable
                  onPress={ handleClearDateRange }
                  android_ripple={ { color: "rgba(0, 0, 0, 0.1)", radius: 14 } }
                  hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
                  className="ml-2 active:opacity-70"
                >
                  <Ionicons
                    name="close"
                    size={ 14 }
                    color={ colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5" }
                  />
                </Pressable>
              </View>
            ) }
          </View>
        ) }

        { !isLoading && sessions.length > 0 && (
          <View className="py-3 px-5 bg-light-surface/50 dark:bg-dark-surface/30 border-light-border-light dark:border-dark-border-light">
            <Text className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide">
              { sessions.length } { sessions.length === 1 ? "session" : "sessions" }
              { !isFiltering && !isSearching && hasMore ? " • Scroll for more" : "" }
            </Text>
          </View>
        ) }
      </View>

      <FlashList
        data={ sessions }
        renderItem={ renderSessionItem }
        keyExtractor={ keyExtractor }
        drawDistance={ 300 }
        ListHeaderComponent={ renderInProgressSection }
        ListEmptyComponent={ renderEmpty }
        ListFooterComponent={
          !isFiltering && !searchQuery.trim() && hasMore ? (
            <View className="py-4 items-center">
              { isLoadingMore ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator
                    size="small"
                    color={ colorScheme === "dark" ? "#ff9f6c" : "#f4a261" }
                  />
                  <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Loading more…
                  </Text>
                </View>
              ) : null }
            </View>
          ) : (
            <View className="py-2" />
          )
        }
        contentContainerStyle={ { paddingHorizontal: 20, paddingBottom: 100 } }
        showsVerticalScrollIndicator={ false }
        refreshing={ isLoading && sessions.length > 0 }
        onRefresh={ handleRefresh }
        onEndReached={ handleEndReached }
        onEndReachedThreshold={ 0.3 }
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />

      <DateRangePicker
        visible={ showDateRangePicker }
        onClose={ () => setShowDateRangePicker(false) }
        onApply={ handleDateRangeSelected }
        onClear={ handleClearDateRange }
      />
    </View>
  );
}

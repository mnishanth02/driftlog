/**
 * Centralized navigation utilities for DriftLog
 *
 * Provides type-safe navigation functions that wrap Expo Router.
 * Prevents navigation bugs and provides consistent navigation throughout the app.
 */

import { router } from "expo-router";

export type TabRoute = "index" | "plan" | "history" | "settings";

/**
 * Navigation utility namespace
 * Provides type-safe wrappers for all navigation actions
 */
export const Navigation = {
  /**
   * Navigate to a specific tab
   */
  goToTab(tab: TabRoute) {
    // In Expo Router v6, groups like (tabs) are not part of the URL
    // Routes are: /, /plan, /history, /settings
    const route = tab === "index" ? "/" : `/${tab}`;
    router.push(route as never);
  },

  /**
   * Navigate to Today tab (home)
   * Uses push for normal navigation
   */
  goToHome() {
    router.push("/" as never);
  },

  /**
   * Navigate to home with stack replacement
   * Use this after session ends or when navigation stack is corrupted
   */
  goToHomeReplace() {
    router.replace("/" as never);
  },

  /**
   * Navigate to session screen with routine
   */
  goToSession(routineId: string) {
    router.push(`/session/${routineId}` as never);
  },

  /**
   * Navigate to routine detail screen
   */
  goToRoutine(routineId: string) {
    router.push(`/routines/${routineId}` as never);
  },

  /**
   * Navigate back
   */
  goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback to home if no history
      this.goToHome();
    }
  },

  /**
   * Replace current screen (no back navigation)
   */
  replace(route: string) {
    router.replace(route as never);
  },

  /**
   * Check if can go back
   */
  canGoBack(): boolean {
    return router.canGoBack();
  },

  /**
   * Navigate to session from Today tab
   * Special handler that ensures clean navigation
   */
  startSessionFromToday(routineId: string = "new") {
    // Use replace to prevent back navigation to loading state
    router.push(`/session/${routineId}` as never);
  },

  /**
   * Navigate back to Today after ending session
   * Uses replace() to fix corrupted navigation stack from auto-end
   * Ensures clean state transition without stack corruption
   */
  endSessionAndGoHome() {
    // Use replace instead of push to prevent stack corruption
    // This is critical when auto-end has already cleared session state
    router.replace("/" as never);
  },
};

export default Navigation;

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SettingsStore } from "./types";

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // State with defaults
      units: "kg",
      autoEndSession: false,
      autoEndTimeout: 60, // 60 minutes default

      // Actions
      setUnits: (units) => {
        set({ units });
      },

      setAutoEndSession: (enabled) => {
        set({ autoEndSession: enabled });
      },

      setAutoEndTimeout: (minutes) => {
        set({ autoEndTimeout: minutes });
      },
    }),
    {
      name: "driftlog-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

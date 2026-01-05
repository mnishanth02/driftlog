export type SettingsState = {
  units: "kg" | "lb";
  autoEndSession: boolean;
  autoEndTimeout: number; // minutes
};

export type SettingsActions = {
  setUnits: (units: "kg" | "lb") => void;
  setAutoEndSession: (enabled: boolean) => void;
  setAutoEndTimeout: (minutes: number) => void;
  loadSettings: () => Promise<void>;
};

export type SettingsStore = SettingsState & SettingsActions;

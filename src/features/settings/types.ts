export type SessionDuration = 15 | 30 | 60 | 90;

export type SettingsState = {
  units: "kg" | "lb";
  autoEndSession: boolean;
  autoEndTimeout: number; // minutes - for inactivity auto-end
  sessionDuration: SessionDuration; // Default session duration preset
};

export type SettingsActions = {
  setUnits: (units: "kg" | "lb") => void;
  setAutoEndSession: (enabled: boolean) => void;
  setAutoEndTimeout: (minutes: number) => void;
  setSessionDuration: (duration: SessionDuration) => void;
};

export type SettingsStore = SettingsState & SettingsActions;

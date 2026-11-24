export type GameMode = 'human-vs-agent' | 'agent-vs-agent';
export type AgentName = 'material-mobility' | 'king-safety-position';
export type HumanColor = 'white' | 'black';
export type Category = 'game' | 'gameplay' | 'appearance' | 'haptics';
export type ThemeMode = 'system' | 'light' | 'dark';

export type GameSettings = {
  gameMode: GameMode;
  humanColor: HumanColor;
  agent: AgentName;
};

export type GameplaySettings = {
  depths: Record<AgentName, number>;
};

export type AppearanceSettings = {
  themeMode: ThemeMode;
};

export type HapticsSettings = {
  on: boolean;
};

export type SettingsState = {
  haptics: HapticsSettings;
  appearance: AppearanceSettings;
};

export type SettingsScope = 'defaults' | 'game';

export type GameMode = 'human-vs-agent' | 'agent-vs-agent';
export type AgentName = 'material-mobility' | 'king-safety-position';
export type HumanColor = 'white' | 'black';
export type Category = 'game' | 'gameplay' | 'match' | 'appearance';
export type ThemeMode = 'system' | 'light' | 'dark';

export type GameSettings = {
  gameMode: GameMode;
  humanColor: HumanColor;
  agent: AgentName;
};

export type GameplaySettings = {
  depths: Record<AgentName, number>;
};

export type MatchSettings = {
  games: number;
  alternateColors: boolean;
};

export type AppearanceSettings = {
  themeMode: ThemeMode;
};

export type SettingsState = {
  game: GameSettings;
  gameplay: GameplaySettings;
  match: MatchSettings;
  appearance: AppearanceSettings;
};

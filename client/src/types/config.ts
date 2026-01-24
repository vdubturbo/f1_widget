export type CardId = 'schedule' | 'drivers' | 'constructors' | 'previousRace' | 'nextRace' | 'driverCard' | 'teamCard';

export interface CardConfig {
  id: CardId;
  label: string;
  enabled: boolean;
}

export interface AdminConfig {
  availableCards: CardConfig[];
  intervalRange: { min: number; max: number; default: number };
  itemsPerPage: { schedule: number; drivers: number; constructors: number };
  features: {
    allowReordering: boolean;
    allowIntervalChange: boolean;
    showUserConfigMenu: boolean;
  };
}

export interface UserConfig {
  selectedCards: CardId[];
  cardOrder: CardId[];
  interval: number;
  favoriteDriverNumber: number | null;
  favoriteTeam: string | null;
}

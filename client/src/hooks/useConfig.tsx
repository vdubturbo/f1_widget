import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { AdminConfig, UserConfig } from '../types/config';

const LOCAL_STORAGE_KEY = 'f1-dashboard-user-config';

interface ConfigContextValue {
  adminConfig: AdminConfig | null;
  userConfig: UserConfig;
  loading: boolean;
  error: Error | null;
  updateUserConfig: (updates: Partial<UserConfig>) => void;
  resetUserConfig: () => void;
}

const defaultAdminConfig: AdminConfig = {
  availableCards: [
    { id: 'schedule', label: 'Race Schedule', enabled: true },
    { id: 'drivers', label: 'Driver Standings', enabled: true },
    { id: 'constructors', label: 'Constructor Standings', enabled: true },
    { id: 'previousRace', label: 'Previous Race', enabled: true },
    { id: 'nextRace', label: 'Next Race', enabled: true },
    { id: 'driverCard', label: 'Driver Card', enabled: true },
    { id: 'teamCard', label: 'Team Card', enabled: true },
  ],
  intervalRange: { min: 5000, max: 60000, default: 10000 },
  itemsPerPage: { schedule: 10, drivers: 11, constructors: 11 },
  features: {
    allowReordering: true,
    allowIntervalChange: true,
    showUserConfigMenu: true,
  },
};

function getDefaultUserConfig(adminConfig: AdminConfig): UserConfig {
  const enabledCards = adminConfig.availableCards
    .filter(c => c.enabled)
    .map(c => c.id);
  return {
    selectedCards: enabledCards,
    cardOrder: enabledCards,
    interval: adminConfig.intervalRange.default,
    favoriteDriverNumber: null,
    favoriteTeam: null,
  };
}

function loadUserConfig(): UserConfig | null {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load user config from localStorage:', e);
  }
  return null;
}

function saveUserConfig(config: UserConfig): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save user config to localStorage:', e);
  }
}

function validateUserConfig(userConfig: UserConfig, adminConfig: AdminConfig): UserConfig {
  const enabledCardIds = new Set(
    adminConfig.availableCards.filter(c => c.enabled).map(c => c.id)
  );

  // Filter selectedCards to only include enabled cards
  const validSelectedCards = userConfig.selectedCards.filter(id => enabledCardIds.has(id));

  // Filter cardOrder to only include enabled cards, and add any missing enabled cards
  const validCardOrder = userConfig.cardOrder.filter(id => enabledCardIds.has(id));
  enabledCardIds.forEach(id => {
    if (!validCardOrder.includes(id)) {
      validCardOrder.push(id);
    }
  });

  // Clamp interval to admin-defined range
  const { min, max } = adminConfig.intervalRange;
  const validInterval = Math.max(min, Math.min(max, userConfig.interval));

  return {
    selectedCards: validSelectedCards.length > 0 ? validSelectedCards : [...enabledCardIds],
    cardOrder: validCardOrder,
    interval: validInterval,
    favoriteDriverNumber: userConfig.favoriteDriverNumber ?? null,
    favoriteTeam: userConfig.favoriteTeam ?? null,
  };
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [userConfig, setUserConfig] = useState<UserConfig>(() =>
    getDefaultUserConfig(defaultAdminConfig)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch admin config on mount
  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('/api/config');
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }
        const config: AdminConfig = await response.json();
        setAdminConfig(config);

        // Load and validate user config
        const storedUserConfig = loadUserConfig();
        if (storedUserConfig) {
          const validated = validateUserConfig(storedUserConfig, config);
          setUserConfig(validated);
          // Save validated config back if it changed
          if (JSON.stringify(validated) !== JSON.stringify(storedUserConfig)) {
            saveUserConfig(validated);
          }
        } else {
          const defaultUser = getDefaultUserConfig(config);
          setUserConfig(defaultUser);
          saveUserConfig(defaultUser);
        }
      } catch (e) {
        console.error('Failed to fetch admin config:', e);
        setError(e instanceof Error ? e : new Error('Unknown error'));
        // Use default config on error
        setAdminConfig(defaultAdminConfig);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  const updateUserConfig = useCallback((updates: Partial<UserConfig>) => {
    setUserConfig(prev => {
      const updated = { ...prev, ...updates };
      // Validate against admin config if available
      const validated = adminConfig ? validateUserConfig(updated, adminConfig) : updated;
      saveUserConfig(validated);
      return validated;
    });
  }, [adminConfig]);

  const resetUserConfig = useCallback(() => {
    const config = adminConfig || defaultAdminConfig;
    const defaultUser = getDefaultUserConfig(config);
    setUserConfig(defaultUser);
    saveUserConfig(defaultUser);
  }, [adminConfig]);

  const value: ConfigContextValue = {
    adminConfig,
    userConfig,
    loading,
    error,
    updateUserConfig,
    resetUserConfig,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): ConfigContextValue {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

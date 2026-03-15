import { useState, useEffect, useCallback } from 'react';

export interface UserConfig {
  owner: string;
  repo: string;
  token: string;
  username: string;
}

const CONFIG_KEY = 'study-tracker-config';

const DEFAULT_CONFIG: UserConfig = {
  owner: '',
  repo: '',
  token: '',
  username: '',
};

export function useGitHubConfig() {
  // Initialize state from localStorage or default
  const [config, setConfigState] = useState<UserConfig>(() => {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
    return DEFAULT_CONFIG;
  });

  // Save to localStorage whenever config changes
  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }, [config]);

  // Helper to update specific fields
  const updateConfig = useCallback((updates: Partial<UserConfig>) => {
    setConfigState(prev => ({ ...prev, ...updates }));
  }, []);

  return { config, updateConfig };
}

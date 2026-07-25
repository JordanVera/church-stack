import * as SecureStore from 'expo-secure-store';

const KEY = 'churchstack.appearance';

export type AppearancePreference = 'light' | 'dark' | 'system';

export const appearanceStore = {
  async get(): Promise<AppearancePreference | null> {
    try {
      const value = await SecureStore.getItemAsync(KEY);
      if (value === 'light' || value === 'dark' || value === 'system') return value;
      return null;
    } catch {
      return null;
    }
  },

  async set(value: AppearancePreference): Promise<void> {
    await SecureStore.setItemAsync(KEY, value);
  },
};

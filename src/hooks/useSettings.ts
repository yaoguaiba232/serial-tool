import { useState, useEffect } from 'react';
import { ARROW_STYLES, DEFAULT_BUFFER_SIZE } from '../utils/constants';

export interface Settings {
  theme: 'dark' | 'light';
  fontSize: string;
  timestampFormat: '12' | '24';
  showTimestamp: boolean;
  showSent: boolean;
  showReceived: boolean;
  arrowStyle: string;
  bufferSize: string;
}

const defaultSettings: Settings = {
  theme: 'dark',
  fontSize: '14',
  timestampFormat: '24',
  showTimestamp: true,
  showSent: true,
  showReceived: true,
  arrowStyle: 'arrow',
  bufferSize: DEFAULT_BUFFER_SIZE.toString(),
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = Object.keys(defaultSettings).reduce((acc, key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        acc[key as keyof Settings] = key === 'showTimestamp' || key === 'showSent' || key === 'showReceived'
          ? value === 'true'
          : value;
      }
      return acc;
    }, {} as Partial<Settings>);

    return { ...defaultSettings, ...savedSettings };
  });

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(key, value.toString());
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    Object.entries(defaultSettings).forEach(([key, value]) => {
      localStorage.setItem(key, value.toString());
    });
  };

  return {
    settings,
    updateSetting,
    resetSettings,
  };
}
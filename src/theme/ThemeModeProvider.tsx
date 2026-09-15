'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { applyThemeCssVariables } from './applyCssVariables';
import { createAppTheme } from './theme';
import type { ThemeMode } from './types';

export type { ThemeMode } from './types';

const STORAGE_KEY = 'markos-theme';

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

const listeners = new Set<() => void>();

function readModeFromDocument(): ThemeMode {
  const fromDataset = document.documentElement.dataset.theme;
  if (fromDataset === 'light' || fromDataset === 'dark') {
    return fromDataset;
  }

  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function resolveMode(): ThemeMode {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return 'light';
}

function applyMode(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.documentElement.classList.toggle('dark', mode === 'dark');
  document.documentElement.style.colorScheme = mode;
  window.localStorage.setItem(STORAGE_KEY, mode);
  applyThemeCssVariables(mode);
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function getSnapshot(): ThemeMode {
  return readModeFromDocument();
}

function getServerSnapshot(): ThemeMode {
  return 'light';
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function setThemeMode(nextMode: ThemeMode) {
  applyMode(nextMode);
  emitChange();
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const resolved = resolveMode();
    if (resolved !== readModeFromDocument()) {
      setThemeMode(resolved);
    } else {
      applyThemeCssVariables(resolved);
    }
  }, []);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setThemeMode(nextMode);
  }, []);

  const toggleMode = useCallback(() => {
    setThemeMode(mode === 'light' ? 'dark' : 'light');
  }, [mode]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo(
    () => ({ mode, setMode, toggleMode }),
    [mode, setMode, toggleMode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }

  return context;
}

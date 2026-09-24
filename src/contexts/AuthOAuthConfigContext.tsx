'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getAuthOAuthConfig, type AuthOAuthPublicConfig } from '@/lib/api/auth';

const defaultConfig: AuthOAuthPublicConfig = {
  google: { enabled: false, clientId: null },
  apple: { enabled: false, clientId: null },
};

interface AuthOAuthConfigContextValue {
  config: AuthOAuthPublicConfig;
  isLoading: boolean;
}

const AuthOAuthConfigContext =
  createContext<AuthOAuthConfigContextValue | null>(null);

export function AuthOAuthConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AuthOAuthPublicConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void getAuthOAuthConfig()
      .then((nextConfig) => {
        if (!cancelled) {
          setConfig(nextConfig);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setConfig(defaultConfig);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      config,
      isLoading,
    }),
    [config, isLoading],
  );

  return (
    <AuthOAuthConfigContext.Provider value={value}>
      {children}
    </AuthOAuthConfigContext.Provider>
  );
}

export function useAuthOAuthConfig(): AuthOAuthConfigContextValue {
  const context = useContext(AuthOAuthConfigContext);

  if (!context) {
    throw new Error('useAuthOAuthConfig must be used within AuthOAuthConfigProvider');
  }

  return context;
}

'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import type { ReactNode } from 'react';
import { useAuthOAuthConfig } from '@/contexts/AuthOAuthConfigContext';

interface AuthGoogleOAuthProviderProps {
  children: ReactNode;
}

export default function AuthGoogleOAuthProvider({
  children,
}: AuthGoogleOAuthProviderProps) {
  const { config } = useAuthOAuthConfig();

  if (!config.google.enabled || !config.google.clientId) {
    return children;
  }

  return (
    <GoogleOAuthProvider clientId={config.google.clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

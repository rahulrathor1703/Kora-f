'use client';

import type { ReactNode } from 'react';
import AuthGoogleOAuthProvider from '@/components/auth/AuthGoogleOAuthProvider';
import { AuthOAuthConfigProvider } from '@/contexts/AuthOAuthConfigContext';

export default function AuthProviders({ children }: { children: ReactNode }) {
  return (
    <AuthOAuthConfigProvider>
      <AuthGoogleOAuthProvider>{children}</AuthGoogleOAuthProvider>
    </AuthOAuthConfigProvider>
  );
}

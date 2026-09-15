import { Suspense } from 'react';
import AuthProviders from '@/components/auth/AuthProviders';
import LoginContent from '@/components/login/LoginContent';

export default function LoginPage() {
  return (
    <AuthProviders>
      <Suspense fallback={null}>
        <LoginContent />
      </Suspense>
    </AuthProviders>
  );
}

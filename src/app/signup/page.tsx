import { Suspense } from 'react';
import AuthProviders from '@/components/auth/AuthProviders';
import SignupContent from '@/components/signup/SignupContent';

export default function SignupPage() {
  return (
    <AuthProviders>
      <Suspense fallback={null}>
        <SignupContent />
      </Suspense>
    </AuthProviders>
  );
}

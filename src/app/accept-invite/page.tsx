import { Suspense } from 'react';
import AuthProviders from '@/components/auth/AuthProviders';
import AcceptInviteContent from '@/components/invitations/AcceptInviteContent';

export default function AcceptInvitePage() {
  return (
    <AuthProviders>
      <Suspense fallback={null}>
        <AcceptInviteContent />
      </Suspense>
    </AuthProviders>
  );
}

import { Suspense } from 'react';
import FixSpamContent from '@/components/email/mailboxes/FixSpamContent';

function FixSpamFallback() {
  return null;
}

export default function FixSpamPage() {
  return (
    <Suspense fallback={<FixSpamFallback />}>
      <FixSpamContent />
    </Suspense>
  );
}

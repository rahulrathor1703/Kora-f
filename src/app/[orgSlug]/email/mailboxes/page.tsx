import { Suspense } from 'react';
import MailboxesContent from '@/components/email/mailboxes/MailboxesContent';

function MailboxesFallback() {
  return null;
}

export default function MailboxesPage() {
  return (
    <Suspense fallback={<MailboxesFallback />}>
      <MailboxesContent />
    </Suspense>
  );
}

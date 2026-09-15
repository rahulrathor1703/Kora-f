import { Suspense } from 'react';
import MeetingsContent from '@/components/crm/meetings/MeetingsContent';

export default function MeetingsPage() {
  return (
    <Suspense fallback={null}>
      <MeetingsContent />
    </Suspense>
  );
}

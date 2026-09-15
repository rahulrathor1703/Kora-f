import ManualListBuilderContent from '@/components/lists/ManualListBuilderContent';
import EmailHubShell from '@/components/email/EmailHubShell';

export default function NewManualListPage() {
  return (
    <EmailHubShell hideHeader>
      <ManualListBuilderContent />
    </EmailHubShell>
  );
}

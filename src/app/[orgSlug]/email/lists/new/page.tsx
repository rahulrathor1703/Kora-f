import ListImportWizardShell from '@/components/email/lists/import/ListImportWizardShell';
import EmailHubShell from '@/components/email/EmailHubShell';

export default function NewListPage() {
  return (
    <EmailHubShell hideHeader>
      <ListImportWizardShell />
    </EmailHubShell>
  );
}

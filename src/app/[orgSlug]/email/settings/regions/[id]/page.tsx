import EmailHubShell from '@/components/email/EmailHubShell';
import EmailConfigOptionFormContent from '@/components/email/settings/EmailConfigOptionFormContent';

interface EditRegionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRegionPage({ params }: EditRegionPageProps) {
  const { id } = await params;

  return (
    <EmailHubShell>
      <EmailConfigOptionFormContent mode="edit" category="region" optionId={id} />
    </EmailHubShell>
  );
}

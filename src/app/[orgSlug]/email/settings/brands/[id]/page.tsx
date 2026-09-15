import EmailHubShell from '@/components/email/EmailHubShell';
import EmailConfigOptionFormContent from '@/components/email/settings/EmailConfigOptionFormContent';

interface EditBrandPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBrandPage({ params }: EditBrandPageProps) {
  const { id } = await params;

  return (
    <EmailHubShell>
      <EmailConfigOptionFormContent mode="edit" category="brand" optionId={id} />
    </EmailHubShell>
  );
}

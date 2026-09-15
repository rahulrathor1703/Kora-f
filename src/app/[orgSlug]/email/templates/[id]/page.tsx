import EmailHubShell from '@/components/email/EmailHubShell';
import EmailTemplateFormContent from '@/components/email/settings/EmailTemplateFormContent';

interface EditEmailTemplatePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmailTemplatePage({
  params,
}: EditEmailTemplatePageProps) {
  const { id } = await params;

  return (
    <EmailHubShell hideHeader>
      <EmailTemplateFormContent mode="edit" templateId={id} />
    </EmailHubShell>
  );
}

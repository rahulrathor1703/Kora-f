import EmailHubShell from '@/components/email/EmailHubShell';
import EmailTemplateFormContent from '@/components/email/settings/EmailTemplateFormContent';

export default function CreateEmailTemplatePage() {
  return (
    <EmailHubShell hideHeader>
      <EmailTemplateFormContent mode="create" />
    </EmailHubShell>
  );
}

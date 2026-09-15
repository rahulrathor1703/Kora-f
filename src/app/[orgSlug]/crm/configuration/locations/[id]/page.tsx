import CrmHubShell from '@/components/crm/CrmHubShell';
import CompanyConfigOptionFormContent from '@/components/crm/settings/CompanyConfigOptionFormContent';

interface EditCompanyLocationConfigurationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCompanyLocationConfigurationPage({
  params,
}: EditCompanyLocationConfigurationPageProps) {
  const { id } = await params;

  return (
    <CrmHubShell>
      <CompanyConfigOptionFormContent mode="edit" category="location" optionId={id} />
    </CrmHubShell>
  );
}

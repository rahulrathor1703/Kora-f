import CrmHubShell from '@/components/crm/CrmHubShell';
import CompanyConfigOptionFormContent from '@/components/crm/settings/CompanyConfigOptionFormContent';

interface EditCompanyCategoryConfigurationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCompanyCategoryConfigurationPage({
  params,
}: EditCompanyCategoryConfigurationPageProps) {
  const { id } = await params;

  return (
    <CrmHubShell>
      <CompanyConfigOptionFormContent mode="edit" category="category" optionId={id} />
    </CrmHubShell>
  );
}

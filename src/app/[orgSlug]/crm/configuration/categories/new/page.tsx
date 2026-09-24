import CrmHubShell from '@/components/crm/CrmHubShell';
import CompanyConfigOptionFormContent from '@/components/crm/settings/CompanyConfigOptionFormContent';

export default function CreateCompanyCategoryConfigurationPage() {
  return (
    <CrmHubShell>
      <CompanyConfigOptionFormContent mode="create" category="category" />
    </CrmHubShell>
  );
}

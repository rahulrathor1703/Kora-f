import CrmHubShell from '@/components/crm/CrmHubShell';
import CompanyConfigOptionFormContent from '@/components/crm/settings/CompanyConfigOptionFormContent';

export default function CreateCompanyLocationConfigurationPage() {
  return (
    <CrmHubShell>
      <CompanyConfigOptionFormContent mode="create" category="location" />
    </CrmHubShell>
  );
}

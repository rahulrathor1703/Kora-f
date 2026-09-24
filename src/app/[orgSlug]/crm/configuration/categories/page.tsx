import CrmHubShell from '@/components/crm/CrmHubShell';
import CompanyConfigOptionsListContent from '@/components/crm/settings/CompanyConfigOptionsListContent';

export default function CompanyCategoriesConfigurationPage() {
  return (
    <CrmHubShell>
      <CompanyConfigOptionsListContent category="category" />
    </CrmHubShell>
  );
}

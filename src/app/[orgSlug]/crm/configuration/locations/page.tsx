import CrmHubShell from '@/components/crm/CrmHubShell';
import CompanyConfigOptionsListContent from '@/components/crm/settings/CompanyConfigOptionsListContent';

export default function CompanyLocationsConfigurationPage() {
  return (
    <CrmHubShell>
      <CompanyConfigOptionsListContent category="location" />
    </CrmHubShell>
  );
}

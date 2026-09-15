import DashboardContent from '@/components/dashboard/DashboardContent';
import CrmHubLayout from '@/components/crm/CrmHubLayout';

interface CrmHubShellProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  hideHeader?: boolean;
}

export default function CrmHubShell({
  children,
  actions,
  hideHeader = false,
}: CrmHubShellProps) {
  return (
    <DashboardContent>
      <CrmHubLayout actions={actions} hideHeader={hideHeader}>
        {children}
      </CrmHubLayout>
    </DashboardContent>
  );
}

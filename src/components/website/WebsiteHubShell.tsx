import DashboardContent from '@/components/dashboard/DashboardContent';
import WebsiteHubLayout from '@/components/website/WebsiteHubLayout';

interface WebsiteHubShellProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  hideHeader?: boolean;
}

export default function WebsiteHubShell({
  children,
  actions,
  hideHeader = false,
}: WebsiteHubShellProps) {
  return (
    <DashboardContent>
      <WebsiteHubLayout actions={actions} hideHeader={hideHeader}>
        {children}
      </WebsiteHubLayout>
    </DashboardContent>
  );
}

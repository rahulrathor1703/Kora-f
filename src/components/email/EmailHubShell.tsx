import DashboardContent from '@/components/dashboard/DashboardContent';
import EmailHubLayout from '@/components/email/EmailHubLayout';

interface EmailHubShellProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  hideHeader?: boolean;
}

export default function EmailHubShell({
  children,
  actions,
  hideHeader = false,
}: EmailHubShellProps) {
  return (
    <DashboardContent>
      <EmailHubLayout actions={actions} hideHeader={hideHeader}>
        {children}
      </EmailHubLayout>
    </DashboardContent>
  );
}

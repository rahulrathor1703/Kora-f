import EmailDashboardContent from '@/components/email/dashboard/EmailDashboardContent';
import EmailHubShell from '@/components/email/EmailHubShell';

export default function AnalyticsPage() {
  return (
    <EmailHubShell hideHeader>
      <EmailDashboardContent />
    </EmailHubShell>
  );
}

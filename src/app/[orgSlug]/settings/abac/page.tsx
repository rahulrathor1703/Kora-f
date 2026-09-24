import DashboardContent from '@/components/dashboard/DashboardContent';
import PoliciesListContent from '@/components/settings/abac/PoliciesListContent';

export default function AbacSettingsPage() {
  return (
    <DashboardContent>
      <PoliciesListContent />
    </DashboardContent>
  );
}

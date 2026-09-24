import DashboardContent from '@/components/dashboard/DashboardContent';
import RolesListContent from '@/components/settings/rbac/RolesListContent';

export default function RbacSettingsPage() {
  return (
    <DashboardContent>
      <RolesListContent />
    </DashboardContent>
  );
}

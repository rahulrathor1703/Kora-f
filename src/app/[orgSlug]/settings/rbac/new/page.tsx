import DashboardContent from '@/components/dashboard/DashboardContent';
import RoleFormContent from '@/components/settings/rbac/RoleFormContent';

export default function CreateRolePage() {
  return (
    <DashboardContent>
      <RoleFormContent mode="create" />
    </DashboardContent>
  );
}

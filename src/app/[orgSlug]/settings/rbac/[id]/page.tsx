import DashboardContent from '@/components/dashboard/DashboardContent';
import RoleFormContent from '@/components/settings/rbac/RoleFormContent';

interface EditRolePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { id } = await params;

  return (
    <DashboardContent>
      <RoleFormContent mode="edit" roleId={id} />
    </DashboardContent>
  );
}

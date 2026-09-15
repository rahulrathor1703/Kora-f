import DashboardContent from '@/components/dashboard/DashboardContent';
import PolicyFormContent from '@/components/settings/abac/PolicyFormContent';

export default function CreateAbacPolicyPage() {
  return (
    <DashboardContent>
      <PolicyFormContent mode="create" />
    </DashboardContent>
  );
}

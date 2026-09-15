import DashboardContent from '@/components/dashboard/DashboardContent';
import PolicyFormContent from '@/components/settings/abac/PolicyFormContent';

interface EditAbacPolicyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAbacPolicyPage({ params }: EditAbacPolicyPageProps) {
  const { id } = await params;

  return (
    <DashboardContent>
      <PolicyFormContent mode="edit" policyId={id} />
    </DashboardContent>
  );
}

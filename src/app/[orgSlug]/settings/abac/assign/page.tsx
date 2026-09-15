import { Suspense } from 'react';
import DashboardContent from '@/components/dashboard/DashboardContent';
import AssignPoliciesContent from '@/components/settings/abac/assign/AssignPoliciesContent';

function AssignPoliciesFallback() {
  return null;
}

export default function AssignAbacPoliciesPage() {
  return (
    <DashboardContent>
      <Suspense fallback={<AssignPoliciesFallback />}>
        <AssignPoliciesContent />
      </Suspense>
    </DashboardContent>
  );
}

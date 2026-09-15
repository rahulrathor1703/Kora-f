'use client';

import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { useApiQuery } from '@/hooks/api';
import { getOrganizationEntitlements } from '@/lib/org-entitlements/api';
import OrgModuleLimitsEditor from './OrgModuleLimitsEditor';

export default function OrgModuleLimitsContent() {
  const entitlementsQuery = useApiQuery('organization.entitlements', () =>
    getOrganizationEntitlements(),
  );

  if (entitlementsQuery.isLoading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading module limits...
      </Typography>
    );
  }

  if (entitlementsQuery.error || !entitlementsQuery.data) {
    return (
      <Alert severity="error" className="rounded-2xl">
        {entitlementsQuery.error ?? 'Unable to load module limits'}
      </Alert>
    );
  }

  return (
    <OrgModuleLimitsEditor
      key={JSON.stringify(entitlementsQuery.data.orgLimits)}
      initialSnapshot={entitlementsQuery.data}
      onSaved={() => {
        void entitlementsQuery.refetch();
      }}
    />
  );
}

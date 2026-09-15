'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { useApiQuery } from '@/hooks/api';
import {
  getPlatformTenantEntitlements,
  getTenant,
} from '@/lib/api/platform';
import PlatformTenantEntitlementsEditor from './PlatformTenantEntitlementsEditor';

interface PlatformTenantEntitlementsContentProps {
  tenantId: string;
}

function ManageAccessSkeleton() {
  return (
    <Stack spacing={3} className="platform-chrome dashboard-chrome-x w-full">
      <Skeleton variant="rounded" height={44} width={220} />
      <Box>
        <Skeleton variant="text" width={140} height={18} />
        <Skeleton variant="text" width="min(420px, 80%)" height={40} className="mt-2" />
        <Skeleton variant="text" width="min(560px, 95%)" height={24} />
      </Box>
      <Skeleton variant="rounded" height={88} />
      {[0, 1, 2, 3].map((index) => (
        <Card key={index} className="dashboard-panel surface-panel rounded-2xl shadow-none">
          <CardContent className="space-y-3 p-4 md:p-6">
            <Skeleton variant="rounded" height={72} />
            <Skeleton variant="rounded" height={96} />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

export default function PlatformTenantEntitlementsContent({
  tenantId,
}: PlatformTenantEntitlementsContentProps) {
  const tenantQuery = useApiQuery(`platform.tenant.${tenantId}`, () =>
    getTenant(tenantId),
  );
  const entitlementsQuery = useApiQuery(
    `platform.tenant.${tenantId}.entitlements`,
    () => getPlatformTenantEntitlements(tenantId),
  );

  const isLoading = tenantQuery.isLoading || entitlementsQuery.isLoading;
  const loadError = tenantQuery.error ?? entitlementsQuery.error;

  if (isLoading) {
    return <ManageAccessSkeleton />;
  }

  if (loadError || !tenantQuery.data || !entitlementsQuery.data) {
    return (
      <Alert
        severity="error"
        className="rounded-2xl"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              void tenantQuery.refetch();
              void entitlementsQuery.refetch();
            }}
          >
            Retry
          </Button>
        }
      >
        {loadError ?? 'Unable to load organization access'}
      </Alert>
    );
  }

  return (
    <PlatformTenantEntitlementsEditor
      key={tenantId}
      tenant={tenantQuery.data}
      initialSnapshot={entitlementsQuery.data}
      onSaved={() => {
        void entitlementsQuery.refetch();
      }}
    />
  );
}

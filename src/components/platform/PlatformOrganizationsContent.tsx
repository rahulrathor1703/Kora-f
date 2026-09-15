'use client';

import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import DataTable from '@/components/data-table/DataTable';
import { startImpersonation, type TenantListItem } from '@/lib/api/platform';
import { setViewOrgCookie } from '@/lib/platform/impersonation-cookie';
import PlatformPageHeader from './PlatformPageHeader';
import { useTenantsRegistry } from './TenantsTable';

interface PlatformOrganizationsContentProps {
  initialTenants: TenantListItem[];
  initialErrorMessage: string | null;
}

function formatPlatformDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function statusChip(status: TenantListItem['status']) {
  if (status === 'suspended') {
    return <Chip label="Suspended" size="small" color="warning" />;
  }

  return <Chip label="Active" size="small" color="success" />;
}

export default function PlatformOrganizationsContent({
  initialTenants,
  initialErrorMessage,
}: PlatformOrganizationsContentProps) {
  const router = useRouter();
  const { tenants, loadState, errorMessage, loadTenants } = useTenantsRegistry(
    initialTenants,
    initialErrorMessage,
  );
  const [enteringOrgId, setEnteringOrgId] = useState<string | null>(null);
  const [enterError, setEnterError] = useState<string | null>(null);

  const handleEnterOrganization = useCallback(
    async (tenant: TenantListItem) => {
      if (tenant.status === 'suspended') {
        setEnterError('This organization is suspended and cannot be opened.');
        return;
      }

      if (enteringOrgId !== null) {
        return;
      }

      setEnteringOrgId(tenant.id);
      setEnterError(null);

      try {
        const response = await startImpersonation(tenant.id);

        setViewOrgCookie({
          organizationId: response.organizationId,
          slug: response.slug,
          name: response.name,
          status: response.status,
        });

        router.push(`/${response.slug}`);
        router.refresh();
      } catch (error) {
        setEnterError(
          error instanceof Error
            ? error.message
            : 'Unable to enter this organization',
        );
      } finally {
        setEnteringOrgId(null);
      }
    },
    [enteringOrgId, router],
  );

  return (
    <Box className="platform-chrome dashboard-chrome-x w-full">
      <Stack spacing={3}>
        <PlatformPageHeader
          overline="Platform administration"
          title="Organizations"
          description="Browse tenant workspaces. Select a row to open an organization, or use manage access to edit entitlements."
        />

        {enterError ? (
          <Alert severity="error" onClose={() => setEnterError(null)}>
            {enterError}
          </Alert>
        ) : null}

        {loadState === 'error' && errorMessage ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void loadTenants()}>
                Retry
              </Button>
            }
          >
            {errorMessage}
          </Alert>
        ) : null}

        <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
          <CardContent className="p-0 md:p-2">
            <DataTable<TenantListItem>
              tableId="platform-organizations"
              rows={tenants}
              getRowId={(row) => row.id}
              excludeFields={['id', 'slug']}
              isLoading={loadState === 'loading'}
              emptyMessage="No organizations yet. Tenants will appear here after signup."
              searchPlaceholder="Search organizations..."
              onRowClick={(row) => void handleEnterOrganization(row)}
              rowActions={(row) => (
                <Tooltip title="Manage access">
                  <IconButton
                    size="small"
                    aria-label={`Manage access for ${row.name}`}
                    onClick={() => router.push(`/platform/tenants/${row.id}`)}
                    className="rounded-xl"
                    sx={{ color: 'primary.main' }}
                  >
                    <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              columnOverrides={{
                name: {
                  label: 'Organization',
                  render: (row) => {
                    const isEntering = enteringOrgId === row.id;

                    return (
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        {isEntering ? (
                          <CircularProgress size={18} aria-label={`Opening ${row.name}`} />
                        ) : null}
                        <Stack spacing={0.25}>
                          <Typography variant="body2" className="font-semibold text-foreground">
                            {row.name}
                          </Typography>
                          <Typography variant="caption" className="text-muted">
                            /{row.slug}
                          </Typography>
                        </Stack>
                      </Stack>
                    );
                  },
                },
                memberCount: {
                  label: 'Members',
                  render: (row) => (
                    <Typography variant="body2" className="text-muted">
                      {row.memberCount}
                    </Typography>
                  ),
                },
                createdAt: {
                  label: 'Registered',
                  render: (row) => (
                    <Typography variant="body2" className="text-muted">
                      {formatPlatformDate(row.createdAt)}
                    </Typography>
                  ),
                },
                status: {
                  label: 'Status',
                  render: (row) => statusChip(row.status),
                },
              }}
            />
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

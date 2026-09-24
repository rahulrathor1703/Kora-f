'use client';

import AddIcon from '@mui/icons-material/Add';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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
import SettingsLink from '@/components/settings/SettingsLink';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DataTable from '@/components/data-table/DataTable';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAbacPolicies } from '@/hooks/useAbacPolicies';
import { useHasPermission } from '@/hooks/useHasPermission';
import type { AbacPolicy } from '@/lib/api';

function truncate(text: string | null, max = 60): string {
  if (!text) {
    return '—';
  }

  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function PoliciesListContent() {
  const router = useRouter();
  const canAssign = useHasPermission('abac:manage');
  const { policies, isLoading, isDeleting, error, deletePolicy } = useAbacPolicies();
  const [policyToDelete, setPolicyToDelete] = useState<AbacPolicy | null>(null);

  async function handleDeleteConfirm() {
    if (!policyToDelete) {
      return;
    }

    try {
      await deletePolicy(policyToDelete.id);
      setPolicyToDelete(null);
    } catch {
      // error surfaced via hook
    }
  }

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="Access control"
        title="ABAC Policies"
        description="Define attribute-based access rules and assign them to users for fine-grained control beyond roles."
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'flex-end' }}
      >
        {canAssign ? (
          <Button
            component={SettingsLink}
            href="/settings/abac/assign"
            variant="outlined"
            startIcon={<AssignmentIndOutlinedIcon />}
            className="shrink-0 rounded-2xl px-5 py-2.5"
          >
            Assign to members
          </Button>
        ) : null}
        <Button
          component={SettingsLink}
          href="/settings/abac/new"
          variant="contained"
          startIcon={<AddIcon />}
          className="shrink-0 rounded-2xl px-5 py-2.5 shadow-primary-soft"
        >
          Create policy
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
        <CardContent className="p-0 md:p-2">
          {!isLoading && policies.length === 0 ? (
            <Box className="px-6 py-14 text-center">
              <Typography variant="h6" className="font-bold">
                No ABAC policies yet
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-2">
                Create your first policy to add attribute-based access rules for users.
              </Typography>
              <Button
                component={SettingsLink}
                href="/settings/abac/new"
                variant="contained"
                startIcon={<AddIcon />}
                className="mt-6 rounded-2xl"
              >
                Create policy
              </Button>
            </Box>
          ) : (
            <DataTable<AbacPolicy>
              tableId="abac-policies"
              rows={policies}
              getRowId={(policy) => policy.id}
              excludeFields={['id']}
              isLoading={isLoading}
              searchPlaceholder="Search policies..."
              onRowClick={(policy) => router.push(`/settings/abac/${policy.id}`)}
              columnOverrides={{
                name: {
                  render: (policy) => (
                    <Typography variant="body2" className="font-semibold">
                      {policy.name}
                    </Typography>
                  ),
                },
                description: {
                  render: (policy) => (
                    <Typography variant="body2" color="text.secondary">
                      {truncate(policy.description)}
                    </Typography>
                  ),
                },
                resource: {
                  render: (policy) => (
                    <Chip label={policy.resource} size="small" variant="outlined" />
                  ),
                },
                action: {
                  render: (policy) => (
                    <Chip label={policy.action} size="small" variant="outlined" />
                  ),
                },
                effect: {
                  render: (policy) => (
                    <Chip
                      label={policy.effect}
                      size="small"
                      color={policy.effect === 'allow' ? 'success' : 'error'}
                      variant="outlined"
                      className="font-semibold capitalize"
                    />
                  ),
                },
                isEnabled: {
                  label: 'Status',
                  render: (policy) => (
                    <Chip
                      label={policy.isEnabled ? 'Enabled' : 'Disabled'}
                      size="small"
                      color={policy.isEnabled ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  ),
                },
                assignedUserCount: {
                  label: 'Users',
                  align: 'center',
                  render: (policy) => (
                    <Chip
                      label={policy.assignedUserCount}
                      size="small"
                      variant="outlined"
                    />
                  ),
                },
                updatedAt: {
                  label: 'Updated',
                  render: (policy) => formatDate(policy.updatedAt),
                },
              }}
              rowActions={(policy) => (
                <>
                  <Tooltip title="Edit policy">
                    <IconButton
                      component={SettingsLink}
                      href={`/settings/abac/${policy.id}`}
                      aria-label={`Edit ${policy.name}`}
                      size="small"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete policy">
                    <IconButton
                      aria-label={`Delete ${policy.name}`}
                      size="small"
                      color="error"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setPolicyToDelete(policy);
                      }}
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            />
          )}
        </CardContent>
      </Card>

      {isDeleting ? (
        <Box className="flex items-center gap-2 text-text-secondary">
          <CircularProgress size={18} />
          <Typography variant="body2">Deleting policy…</Typography>
        </Box>
      ) : null}

      <ConfirmDialog
        open={Boolean(policyToDelete)}
        onClose={() => setPolicyToDelete(null)}
        onConfirm={() => void handleDeleteConfirm()}
        variant="destructive"
        title="Delete ABAC policy"
        description={
          <>
            Delete policy <strong>{policyToDelete?.name}</strong>? This cannot be undone.
          </>
        }
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </Stack>
  );
}

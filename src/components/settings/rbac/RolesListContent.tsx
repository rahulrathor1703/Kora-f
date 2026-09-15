'use client';

import AddIcon from '@mui/icons-material/Add';
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DataTable from '@/components/data-table/DataTable';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useOrgPath } from '@/hooks/useOrgPath';
import { useRoles } from '@/hooks/useRoles';
import type { Role } from '@/lib/api';

function truncate(text: string | null, max = 60): string {
  if (!text) {
    return '—';
  }

  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function RolesListContent() {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { roles, isLoading, isDeleting, error, deleteRole } = useRoles();
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  async function handleDeleteConfirm() {
    if (!roleToDelete) {
      return;
    }

    try {
      await deleteRole(roleToDelete.id);
      setRoleToDelete(null);
    } catch {
      // error surfaced via hook
    }
  }

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="Access control"
        title="Roles"
        description="Manage roles and assign permissions to control who can access features across MarketNiti."
      />

      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <Button
          component={SettingsLink}
          href="/settings/rbac/new"
          variant="contained"
          startIcon={<AddIcon />}
          className="shrink-0 rounded-2xl px-5 py-2.5 shadow-primary-soft"
        >
          Create role
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
        <CardContent className="p-0 md:p-2">
          {!isLoading && roles.length === 0 ? (
            <Box className="px-6 py-14 text-center">
              <Typography variant="h6" className="font-bold">
                No roles yet
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-2">
                Create your first role to define workspace access.
              </Typography>
              <Button
                component={SettingsLink}
                href="/settings/rbac/new"
                variant="contained"
                startIcon={<AddIcon />}
                className="mt-6 rounded-2xl"
              >
                Create role
              </Button>
            </Box>
          ) : (
            <DataTable<Role>
              tableId="roles"
              rows={roles}
              getRowId={(role) => role.id}
              excludeFields={['id']}
              isLoading={isLoading}
              searchPlaceholder="Search roles..."
              onRowClick={(role) =>
                router.push(toOrgPath(`/settings/rbac/${role.id}`))
              }
              columnOverrides={{
                name: {
                  render: (role) => (
                    <>
                      <Typography variant="body2" className="font-semibold">
                        {role.name}
                      </Typography>
                      {role.isSystem ? (
                        <Chip
                          label="System"
                          size="small"
                          color="primary"
                          variant="outlined"
                          className="mt-1 font-semibold"
                        />
                      ) : null}
                    </>
                  ),
                },
                description: {
                  render: (role) => (
                    <Typography variant="body2" color="text.secondary">
                      {truncate(role.description)}
                    </Typography>
                  ),
                },
                permissionCount: {
                  label: 'Permissions',
                  align: 'center',
                  render: (role) => (
                    <Chip
                      label={role.permissionCount}
                      size="small"
                      variant="outlined"
                    />
                  ),
                },
                updatedAt: {
                  label: 'Updated',
                },
              }}
              rowActions={(role) => (
                <>
                  <Tooltip title="Edit role">
                    <IconButton
                      component={Link}
                      href={toOrgPath(`/settings/rbac/${role.id}`)}
                      aria-label={`Edit ${role.name}`}
                      size="small"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={
                      role.isSystem
                        ? 'System roles cannot be deleted'
                        : 'Delete role'
                    }
                  >
                    <span>
                      <IconButton
                        aria-label={`Delete ${role.name}`}
                        size="small"
                        color="error"
                        disabled={role.isSystem}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setRoleToDelete(role);
                        }}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </span>
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
          <Typography variant="body2">Deleting role…</Typography>
        </Box>
      ) : null}

      <ConfirmDialog
        open={Boolean(roleToDelete)}
        onClose={() => setRoleToDelete(null)}
        onConfirm={() => void handleDeleteConfirm()}
        variant="destructive"
        title="Delete role"
        description={
          <>
            Delete role <strong>{roleToDelete?.name}</strong>? This cannot be undone.
          </>
        }
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </Stack>
  );
}

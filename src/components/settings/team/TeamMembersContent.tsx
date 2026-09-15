'use client';

import AddIcon from '@mui/icons-material/Add';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import SettingsLink from '@/components/settings/SettingsLink';
import { useState } from 'react';
import DataTable from '@/components/data-table/DataTable';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import EditMemberDialog from '@/components/settings/team/EditMemberDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAssignUserAbacPolicies } from '@/hooks/useAbacPolicies';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useInvites } from '@/hooks/useInvitations';
import { useRoles } from '@/hooks/useRoles';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { getApiErrorMessage } from '@/lib/api';
import type { Invitation, TeamMember } from '@/lib/api';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TeamMembersContent() {
  const canInvite = useHasPermission('users:invite');
  const canManage = useHasPermission('users:manage');
  const { members, isLoading, isUpdating, error, updateMember, updateMemberStatus } =
    useTeamMembers();
  const { assignPolicies, isAssigning } = useAssignUserAbacPolicies();
  const { invites, isLoading: isLoadingInvites, isRevoking, revokeInvite } = useInvites();
  const { roles } = useRoles();

  const [invitesExpanded, setInvitesExpanded] = useState(true);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [inviteToRevoke, setInviteToRevoke] = useState<Invitation | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  async function handleEditSave(input: {
    roleId: string;
    hierarchyLevel: number;
    policyIds: string[];
  }) {
    if (!memberToEdit) {
      return;
    }

    try {
      await updateMember(memberToEdit.id, {
        roleId: input.roleId,
        hierarchyLevel: input.hierarchyLevel,
      });
      await assignPolicies(memberToEdit.id, { policyIds: input.policyIds });
      setMemberToEdit(null);
      setSnackbar('Team member updated');
    } catch {
      // error surfaced via hook
    }
  }

  async function handleToggleStatus(member: TeamMember) {
    try {
      await updateMemberStatus(member.id, {
        status: member.status === 'active' ? 'disabled' : 'active',
      });
      setSnackbar(
        member.status === 'active' ? 'Member disabled' : 'Member re-enabled',
      );
    } catch {
      // error surfaced via hook
    }
  }

  async function handleRevokeConfirm() {
    if (!inviteToRevoke) {
      return;
    }

    try {
      await revokeInvite(inviteToRevoke.id);
      setInviteToRevoke(null);
      setSnackbar('Invitation revoked');
    } catch {
      // error surfaced via hook
    }
  }

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="Team"
        title="Team members"
        description="Invite colleagues, assign roles and hierarchy levels, and manage workspace access."
      />

      {error ? (
        <Alert severity="error">
          {getApiErrorMessage(error, 'Failed to load team members')}
        </Alert>
      ) : null}

      {canInvite ? (
        <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
          <Button
            component={SettingsLink}
            href="/settings/team/invite"
            variant="contained"
            startIcon={<AddIcon />}
            className="shrink-0 rounded-2xl px-5 py-2.5 shadow-primary-soft"
          >
            Invite member
          </Button>
        </Stack>
      ) : null}

      <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
        <CardContent className="p-0 md:p-2">
          {!isLoading && members.length === 0 ? (
            <Box className="px-6 py-14 text-center">
              <Box className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary-soft text-primary">
                <GroupsOutlinedIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h6" className="font-bold">
                No team members yet
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mx-auto mt-2 max-w-md">
                Invite your first colleague to collaborate in MarketNiti.
              </Typography>
              {canInvite ? (
                <Button
                  component={SettingsLink}
                  href="/settings/team/invite"
                  variant="contained"
                  startIcon={<AddIcon />}
                  className="mt-6 rounded-2xl px-5 py-2.5 shadow-primary-soft"
                >
                  Invite member
                </Button>
              ) : null}
            </Box>
          ) : (
            <DataTable
              tableId="team-members"
              rows={members}
              getRowId={(row) => row.id}
              isLoading={isLoading}
              excludeFields={['id', 'roleId']}
              columnOverrides={{
                username: { label: 'Username' },
                email: { label: 'Email' },
                roleName: { label: 'Role' },
                hierarchyLevel: {
                  label: 'Level',
                  render: (row) => `L${row.hierarchyLevel}`,
                },
                status: { label: 'Status' },
                joinedAt: {
                  label: 'Joined',
                  render: (row) => formatDate(row.joinedAt),
                },
              }}
              rowActions={
                canManage
                  ? (row) => (
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit role and level">
                          <IconButton
                            size="small"
                            aria-label={`Edit ${row.username ?? row.email}`}
                            onClick={() => setMemberToEdit(row)}
                            className="rounded-xl"
                          >
                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={row.status === 'active' ? 'Disable member' : 'Enable member'}>
                          <IconButton
                            size="small"
                            aria-label={`Toggle status for ${row.username ?? row.email}`}
                            onClick={() => void handleToggleStatus(row)}
                            className="rounded-xl"
                          >
                            <BlockOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>

      <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
        <CardContent className="p-4 md:p-6">
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Box>
              <Typography variant="h6" className="font-bold">
                Pending invitations
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                Invites waiting to be accepted.
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => setInvitesExpanded((value) => !value)}
              className="rounded-xl"
            >
              {invitesExpanded ? 'Hide' : 'Show'}
            </Button>
          </Stack>

          <Collapse in={invitesExpanded}>
            <Box className="mt-4">
              {invites.length === 0 && !isLoadingInvites ? (
                <Typography variant="body2" color="text.secondary" className="py-4 text-center">
                  No pending invitations.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {invites.map((invite) => (
                    <Box
                      key={invite.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200/60 bg-white/40 px-4 py-3 dark:border-slate-700/60 dark:bg-slate-900/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <Box>
                        <Typography variant="body2" className="font-semibold">
                          {invite.email}
                        </Typography>
                        <Stack direction="row" spacing={1} className="mt-1 flex-wrap gap-y-1">
                          <Chip label={invite.roleName} size="small" className="rounded-lg" />
                          <Chip label={`L${invite.hierarchyLevel}`} size="small" className="rounded-lg" />
                          <Chip
                            label={`Expires ${formatDate(invite.expiresAt)}`}
                            size="small"
                            variant="outlined"
                            className="rounded-lg"
                          />
                        </Stack>
                      </Box>
                      {canManage ? (
                        <Tooltip title="Revoke invitation">
                          <IconButton
                            aria-label={`Revoke invite for ${invite.email}`}
                            onClick={() => setInviteToRevoke(invite)}
                            className="rounded-xl self-start sm:self-center"
                          >
                            <CancelOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      <EditMemberDialog
        member={memberToEdit}
        roles={roles}
        open={Boolean(memberToEdit)}
        isLoading={isUpdating || isAssigning}
        onClose={() => setMemberToEdit(null)}
        onSave={(input) => void handleEditSave(input)}
      />

      <ConfirmDialog
        open={Boolean(inviteToRevoke)}
        onClose={() => setInviteToRevoke(null)}
        onConfirm={() => void handleRevokeConfirm()}
        variant="destructive"
        title="Revoke invitation?"
        description={
          <>
            The invite link sent to <strong>{inviteToRevoke?.email}</strong> will no longer
            work.
          </>
        }
        confirmLabel="Revoke"
        isLoading={isRevoking}
      />

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Stack>
  );
}

'use client';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import HierarchyLevelSelector from '@/components/settings/team/HierarchyLevelSelector';
import { useAbacPolicies, useUserAbacPolicies } from '@/hooks/useAbacPolicies';
import type { AbacPolicy, Role, TeamMember } from '@/lib/api';

interface EditMemberDialogProps {
  member: TeamMember | null;
  roles: Role[];
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSave: (input: {
    roleId: string;
    hierarchyLevel: number;
    policyIds: string[];
  }) => void;
}

interface EditMemberFormProps {
  member: TeamMember;
  roles: Role[];
  initialPolicyIds: string[];
  isLoading: boolean;
  onClose: () => void;
  onSave: (input: {
    roleId: string;
    hierarchyLevel: number;
    policyIds: string[];
  }) => void;
}

function EditMemberForm({
  member,
  roles,
  initialPolicyIds,
  isLoading,
  onClose,
  onSave,
}: EditMemberFormProps) {
  const [roleId, setRoleId] = useState(member.roleId ?? '');
  const [hierarchyLevel, setHierarchyLevel] = useState(member.hierarchyLevel);
  const [policyIds, setPolicyIds] = useState(initialPolicyIds);
  const { policies, isLoading: isLoadingPolicies } = useAbacPolicies();

  const selectedRole = roles.find((role) => role.id === roleId) ?? null;
  const selectedPolicies = policies.filter((policy) => policyIds.includes(policy.id));

  return (
    <>
      <DialogContent>
        <Stack spacing={3} className="pt-1">
          <Box>
            <Typography variant="caption" color="text.secondary" className="block">
              Member
            </Typography>
            <Typography variant="body2" className="font-semibold">
              {member.username ?? member.email}
            </Typography>
          </Box>

          <Autocomplete
            options={roles}
            getOptionLabel={(option) => option.name}
            value={selectedRole}
            onChange={(_, value) => setRoleId(value?.id ?? '')}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => <TextField {...params} label="Role" />}
          />

          <HierarchyLevelSelector
            value={hierarchyLevel}
            onChange={setHierarchyLevel}
            disabled={isLoading}
          />

          <Autocomplete
            multiple
            options={policies}
            loading={isLoadingPolicies}
            disabled={isLoading}
            value={selectedPolicies}
            getOptionLabel={(policy) => policy.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, selected) =>
              setPolicyIds(selected.map((policy: AbacPolicy) => policy.id))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="ABAC policies"
                placeholder={policyIds.length === 0 ? 'No policies assigned' : undefined}
              />
            )}
            renderOption={(props, policy: AbacPolicy) => (
              <li {...props} key={policy.id}>
                <Stack>
                  <Typography variant="body2" className="font-medium">
                    {policy.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {policy.resource}:{policy.action} · {policy.effect}
                  </Typography>
                </Stack>
              </li>
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions className="px-6 pb-5">
        <Button onClick={onClose} disabled={isLoading} className="rounded-xl">
          Cancel
        </Button>
        <Button
          onClick={() => onSave({ roleId, hierarchyLevel, policyIds })}
          variant="contained"
          disabled={isLoading || !roleId || isLoadingPolicies}
          className="rounded-xl"
          startIcon={
            isLoading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {isLoading ? 'Saving…' : 'Save changes'}
        </Button>
      </DialogActions>
    </>
  );
}

function EditMemberFormLoader({
  member,
  roles,
  isLoading,
  onClose,
  onSave,
}: Omit<EditMemberFormProps, 'initialPolicyIds'>) {
  const { data: assignedPolicies, isLoading: isLoadingAssigned } =
    useUserAbacPolicies(member.id);

  if (isLoadingAssigned) {
    return (
      <DialogContent>
        <Box className="flex justify-center py-10">
          <CircularProgress size={28} aria-label="Loading member policies" />
        </Box>
      </DialogContent>
    );
  }

  return (
    <EditMemberForm
      member={member}
      roles={roles}
      initialPolicyIds={assignedPolicies?.map((policy) => policy.id) ?? []}
      isLoading={isLoading}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

export default function EditMemberDialog({
  member,
  roles,
  open,
  isLoading,
  onClose,
  onSave,
}: EditMemberDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold">Edit team member</DialogTitle>
      {member ? (
        <EditMemberFormLoader
          key={member.id}
          member={member}
          roles={roles}
          isLoading={isLoading}
          onClose={onClose}
          onSave={onSave}
        />
      ) : null}
    </Dialog>
  );
}

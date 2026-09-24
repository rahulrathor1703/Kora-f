'use client';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import type { TeamMember } from '@/lib/api';

interface UserAssignmentPickerProps {
  value: string[];
  onChange: (userIds: string[]) => void;
  disabled?: boolean;
}

export default function UserAssignmentPicker({
  value,
  onChange,
  disabled = false,
}: UserAssignmentPickerProps) {
  const { members, isLoading } = useTeamMembers();

  const selectedMembers = members.filter((member) => value.includes(member.id));

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="body2" className="font-semibold">
          Assigned users
        </Typography>
        <Typography variant="caption" color="text.secondary" className="mt-0.5 block">
          Select team members who should be evaluated against this policy.
        </Typography>
      </Box>

      <Autocomplete
        multiple
        options={members}
        loading={isLoading}
        disabled={disabled}
        value={selectedMembers}
        getOptionLabel={(member) => member.username ?? member.email}
        isOptionEqualToValue={(option, selected) => option.id === selected.id}
        onChange={(_, selected) => onChange(selected.map((member) => member.id))}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Users"
            placeholder={value.length === 0 ? 'Search team members…' : undefined}
          />
        )}
        renderOption={(props, member: TeamMember) => (
          <li {...props} key={member.id}>
            <Stack>
              <Typography variant="body2" className="font-medium">
                {member.username ?? member.email}
              </Typography>
              {member.username ? (
                <Typography variant="caption" color="text.secondary">
                  {member.email}
                </Typography>
              ) : null}
            </Stack>
          </li>
        )}
      />

      <Typography variant="caption" color="text.secondary">
        {value.length} user{value.length === 1 ? '' : 's'} assigned
      </Typography>
    </Stack>
  );
}

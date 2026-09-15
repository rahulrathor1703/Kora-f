'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useMemo, useState } from 'react';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import type { TeamMember } from '@/lib/api';

interface MemberMultiPickerProps {
  value: string[];
  onChange: (userIds: string[]) => void;
}

function MemberRow({
  member,
  selected,
  onToggle,
}: {
  member: TeamMember;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Box
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggle();
        }
      }}
      className={`permission-card cursor-pointer rounded-2xl px-3 py-2.5 ${
        selected ? 'permission-card-selected' : ''
      }`}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Checkbox
          checked={selected}
          tabIndex={-1}
          onChange={onToggle}
          onClick={(event) => event.stopPropagation()}
          slotProps={{
            input: {
              'aria-label': `Toggle ${member.username ?? member.email}`,
            },
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
          >
            <Typography variant="body2" className="font-semibold">
              {member.username ?? member.email}
            </Typography>
            {member.roleName ? (
              <Chip label={member.roleName} size="small" variant="outlined" className="h-6" />
            ) : null}
            <Chip
              label={`Level ${member.hierarchyLevel}`}
              size="small"
              variant="outlined"
              className="h-6"
            />
            {member.status === 'disabled' ? (
              <Chip label="Disabled" size="small" color="warning" variant="outlined" className="h-6" />
            ) : null}
          </Stack>
          {member.username ? (
            <Typography variant="caption" color="text.secondary" className="mt-0.5 block">
              {member.email}
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
}

function MemberMultiPickerSkeleton() {
  return (
    <Stack spacing={1}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={64} className="rounded-2xl" />
      ))}
    </Stack>
  );
}

export default function MemberMultiPicker({
  value,
  onChange,
}: MemberMultiPickerProps) {
  const { members, isLoading, error } = useTeamMembers();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const roleOptions = useMemo(() => {
    const roles = new Set<string>();

    for (const member of members) {
      if (member.roleName) {
        roles.add(member.roleName);
      }
    }

    return ['all', ...Array.from(roles).sort()];
  }, [members]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesRole =
        roleFilter === 'all' || member.roleName === roleFilter;
      const matchesSearch =
        !query ||
        member.email.toLowerCase().includes(query) ||
        member.username?.toLowerCase().includes(query) ||
        member.roleName?.toLowerCase().includes(query);

      return matchesRole && matchesSearch;
    });
  }, [members, roleFilter, search]);

  function toggleMember(memberId: string) {
    if (value.includes(memberId)) {
      onChange(value.filter((id) => id !== memberId));
      return;
    }

    onChange([...value, memberId]);
  }

  function toggleAllVisible(selectAll: boolean) {
    const visibleIds = filteredMembers.map((member) => member.id);

    if (selectAll) {
      onChange([...new Set([...value, ...visibleIds])]);
      return;
    }

    onChange(value.filter((id) => !visibleIds.includes(id)));
  }

  const allVisibleSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((member) => value.includes(member.id));
  const someVisibleSelected =
    filteredMembers.some((member) => value.includes(member.id)) &&
    !allVisibleSelected;

  if (isLoading) {
    return <MemberMultiPickerSkeleton />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (members.length === 0) {
    return (
      <Box className="rounded-2xl border border-dashed border-slate-200/60 px-4 py-8 text-center dark:border-slate-700/60">
        <Typography variant="body2" color="text.secondary">
          No team members available.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <TextField
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search members..."
        size="small"
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <SearchOutlinedIcon
                sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }}
              />
            ),
          },
        }}
        className="rounded-xl"
      />

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
        {roleOptions.map((role) => (
          <Chip
            key={role}
            label={role === 'all' ? 'All roles' : role}
            clickable
            color={roleFilter === role ? 'primary' : 'default'}
            variant={roleFilter === role ? 'filled' : 'outlined'}
            onClick={() => setRoleFilter(role)}
            className="font-semibold"
          />
        ))}
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Checkbox
            checked={allVisibleSelected}
            indeterminate={someVisibleSelected}
            onChange={() => toggleAllVisible(!allVisibleSelected)}
            slotProps={{
              input: {
                'aria-label': 'Select all visible members',
              },
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Select visible
          </Typography>
        </Stack>
        <Chip
          label={`${value.length} selected`}
          color="primary"
          variant="outlined"
          className="font-semibold"
          aria-live="polite"
        />
      </Stack>

      <Stack spacing={1}>
        {filteredMembers.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            selected={value.includes(member.id)}
            onToggle={() => toggleMember(member.id)}
          />
        ))}
      </Stack>

      {filteredMembers.length === 0 ? (
        <Box className="rounded-2xl border border-dashed border-slate-200/60 px-4 py-8 text-center dark:border-slate-700/60">
          <Typography variant="body2" color="text.secondary">
            No members match your filters.
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
}

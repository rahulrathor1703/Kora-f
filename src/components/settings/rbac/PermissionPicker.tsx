'use client';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useMemo, useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission, PermissionGroup } from '@/lib/api';
import {
  getMatchingPresetId,
  PERMISSION_PRESETS,
  resolvePresetPermissionIds,
} from '@/lib/rbac/permission-presets';
import {
  formatPermissionDescription,
  getActionBadgeColor,
  getActionLabel,
  getResourceIcon,
  getResourceLabel,
} from '@/lib/rbac/permission-ui';

interface PermissionPickerProps {
  value: string[];
  onChange: (permissionIds: string[]) => void;
  error?: string;
}

function PermissionCard({
  permission,
  selected,
  onToggle,
}: {
  permission: Permission;
  selected: boolean;
  onToggle: () => void;
}) {
  const badgeColor = getActionBadgeColor(permission.action);

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
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Checkbox
          checked={selected}
          tabIndex={-1}
          onChange={onToggle}
          onClick={(event) => event.stopPropagation()}
          className="mt-0.5 p-0"
          slotProps={{
            input: {
              'aria-label': `Toggle ${permission.key}`,
            },
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
          >
            <Chip
              label={getActionLabel(permission.action)}
              size="small"
              color={badgeColor}
              variant="outlined"
              className="h-6 font-semibold"
            />
            <Typography variant="body2" className="font-semibold">
              {formatPermissionDescription(permission.description, permission.action)}
            </Typography>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            className="mt-1 block font-mono"
          >
            {permission.key}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function PermissionPickerSkeleton() {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: 3 }).map((_, index) => (
        <Box
          key={index}
          className="dashboard-panel rounded-2xl border border-slate-200/60 p-4 dark:border-slate-700/60"
        >
          <Skeleton variant="text" width="40%" height={28} />
          <Stack spacing={1} className="mt-3">
            <Skeleton variant="rounded" height={56} className="rounded-2xl" />
            <Skeleton variant="rounded" height={56} className="rounded-2xl" />
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

export default function PermissionPicker({
  value,
  onChange,
  error,
}: PermissionPickerProps) {
  const { data, isLoading, error: fetchError } = usePermissions();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);

  const groups = useMemo(() => data?.groups ?? [], [data?.groups]);
  const allPermissionIds = useMemo(
    () => groups.flatMap((group) => group.permissions.map((p) => p.id)),
    [groups],
  );

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return groups;
    }

    return groups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (permission) =>
            permission.key.toLowerCase().includes(query) ||
            permission.description?.toLowerCase().includes(query) ||
            permission.action.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [groups, search]);

  const activePresetId = getMatchingPresetId(value, groups);

  function togglePermission(permissionId: string) {
    if (value.includes(permissionId)) {
      onChange(value.filter((id) => id !== permissionId));
      return;
    }

    onChange([...value, permissionId]);
  }

  function toggleGroup(group: PermissionGroup, selectAll: boolean) {
    const groupIds = group.permissions.map((p) => p.id);

    if (selectAll) {
      const merged = new Set([...value, ...groupIds]);
      onChange(Array.from(merged));
      return;
    }

    onChange(value.filter((id) => !groupIds.includes(id)));
  }

  function isGroupFullySelected(group: PermissionGroup): boolean {
    return group.permissions.every((p) => value.includes(p.id));
  }

  function isGroupPartiallySelected(group: PermissionGroup): boolean {
    const selectedCount = group.permissions.filter((p) =>
      value.includes(p.id),
    ).length;
    return selectedCount > 0 && selectedCount < group.permissions.length;
  }

  function handleSelectAll() {
    onChange(allPermissionIds);
  }

  function handleClearAll() {
    onChange([]);
  }

  function handleExpandAll() {
    setExpanded(filteredGroups.map((group) => group.resource));
  }

  function handleCollapseAll() {
    setExpanded([]);
  }

  function handlePresetSelect(presetId: string) {
    const preset = PERMISSION_PRESETS.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    onChange(resolvePresetPermissionIds(preset, groups));
    setExpanded(groups.map((group) => group.resource));
  }

  if (isLoading) {
    return <PermissionPickerSkeleton />;
  }

  if (fetchError) {
    return <Alert severity="error">{fetchError}</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        <Typography variant="caption" className="font-semibold uppercase tracking-wider text-text-secondary">
          Quick presets
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {PERMISSION_PRESETS.map((preset) => (
            <Chip
              key={preset.id}
              label={preset.label}
              clickable
              color={activePresetId === preset.id ? 'primary' : 'default'}
              variant={activePresetId === preset.id ? 'filled' : 'outlined'}
              onClick={() => handlePresetSelect(preset.id)}
              className="font-semibold transition-transform hover:scale-[1.02]"
              title={preset.description}
            />
          ))}
        </Stack>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search permissions..."
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
        <Chip
          label={`${value.length} selected`}
          color="primary"
          variant="outlined"
          className="shrink-0 font-semibold"
          aria-live="polite"
        />
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ flexWrap: 'wrap', gap: 0.5 }}
      >
        <Button size="small" onClick={handleSelectAll} className="font-semibold normal-case">
          Select all
        </Button>
        <Button size="small" onClick={handleClearAll} className="font-semibold normal-case">
          Clear all
        </Button>
        <Button size="small" onClick={handleExpandAll} className="font-semibold normal-case">
          Expand all
        </Button>
        <Button size="small" onClick={handleCollapseAll} className="font-semibold normal-case">
          Collapse all
        </Button>
      </Stack>

      {error ? (
        <Alert severity="error" icon={false}>
          {error}
        </Alert>
      ) : null}

      <Stack spacing={1}>
        {filteredGroups.map((group) => {
          const groupKey = group.resource;
          const fullySelected = isGroupFullySelected(group);
          const partiallySelected = isGroupPartiallySelected(group);
          const ResourceIcon = getResourceIcon(group.resource);

          return (
            <Accordion
              key={groupKey}
              expanded={expanded.includes(groupKey) || Boolean(search.trim())}
              onChange={(_, isExpanded) => {
                setExpanded((current) =>
                  isExpanded
                    ? [...current, groupKey]
                    : current.filter((key) => key !== groupKey),
                );
              }}
              className="dashboard-panel rounded-2xl shadow-none before:hidden"
              disableGutters
              elevation={0}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', width: '100%', pr: 1 }}
                >
                  <Checkbox
                    checked={fullySelected}
                    indeterminate={partiallySelected}
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => toggleGroup(group, !fullySelected)}
                    slotProps={{
                      input: {
                        'aria-label': `Select all ${getResourceLabel(group.resource)} permissions`,
                      },
                    }}
                  />
                  <Box
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"
                  >
                    <ResourceIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" className="font-bold">
                      {getResourceLabel(group.resource)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {group.permissions.filter((p) => value.includes(p.id)).length}
                      {' / '}
                      {group.permissions.length} selected
                    </Typography>
                  </Box>
                </Stack>
              </AccordionSummary>
              <AccordionDetails className="pt-0">
                <Stack spacing={1} className="pl-1">
                  {group.permissions.map((permission) => (
                    <PermissionCard
                      key={permission.id}
                      permission={permission}
                      selected={value.includes(permission.id)}
                      onToggle={() => togglePermission(permission.id)}
                    />
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>

      {filteredGroups.length === 0 ? (
        <Box className="rounded-2xl border border-dashed border-slate-200/60 px-4 py-8 text-center dark:border-slate-700/60">
          <Typography variant="body2" color="text.secondary">
            No permissions match your search.
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
}

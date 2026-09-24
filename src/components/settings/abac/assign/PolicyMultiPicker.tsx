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
import { useAbacPolicies } from '@/hooks/useAbacPolicies';
import type { AbacPolicy } from '@/lib/api';
import {
  getActionBadgeColor,
  getActionLabel,
  getResourceIcon,
  getResourceLabel,
} from '@/lib/rbac/permission-ui';

interface PolicyMultiPickerProps {
  value: string[];
  onChange: (policyIds: string[]) => void;
}

interface PolicyGroup {
  resource: string;
  policies: AbacPolicy[];
}

function PolicyCard({
  policy,
  selected,
  onToggle,
}: {
  policy: AbacPolicy;
  selected: boolean;
  onToggle: () => void;
}) {
  const badgeColor = getActionBadgeColor(policy.action);

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
              'aria-label': `Toggle ${policy.name}`,
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
              {policy.name}
            </Typography>
            <Chip
              label={getActionLabel(policy.action)}
              size="small"
              color={badgeColor}
              variant="outlined"
              className="h-6 font-semibold"
            />
            <Chip
              label={policy.effect}
              size="small"
              color={policy.effect === 'allow' ? 'success' : 'error'}
              variant="outlined"
              className="h-6 font-semibold capitalize"
            />
            {!policy.isEnabled ? (
              <Chip label="Disabled" size="small" variant="outlined" className="h-6" />
            ) : null}
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            className="mt-1 block font-mono"
          >
            {policy.resource}:{policy.action}
          </Typography>
          {policy.description ? (
            <Typography variant="caption" color="text.secondary" className="mt-0.5 block">
              {policy.description}
            </Typography>
          ) : null}
          <Typography variant="caption" color="text.secondary" className="mt-1 block">
            {policy.assignedUserCount} member{policy.assignedUserCount === 1 ? '' : 's'} assigned
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function PolicyMultiPickerSkeleton() {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: 3 }).map((_, index) => (
        <Box
          key={index}
          className="dashboard-panel rounded-2xl border border-slate-200/60 p-4 dark:border-slate-700/60"
        >
          <Skeleton variant="text" width="40%" height={28} />
          <Stack spacing={1} className="mt-3">
            <Skeleton variant="rounded" height={72} className="rounded-2xl" />
            <Skeleton variant="rounded" height={72} className="rounded-2xl" />
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

export default function PolicyMultiPicker({
  value,
  onChange,
}: PolicyMultiPickerProps) {
  const { policies, isLoading, error } = useAbacPolicies();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);

  const groups = useMemo<PolicyGroup[]>(() => {
    const byResource = new Map<string, AbacPolicy[]>();

    for (const policy of policies) {
      const current = byResource.get(policy.resource) ?? [];
      current.push(policy);
      byResource.set(policy.resource, current);
    }

    return Array.from(byResource.entries())
      .map(([resource, resourcePolicies]) => ({
        resource,
        policies: resourcePolicies.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.resource.localeCompare(b.resource));
  }, [policies]);

  const allPolicyIds = useMemo(
    () => policies.map((policy) => policy.id),
    [policies],
  );

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return groups;
    }

    return groups
      .map((group) => ({
        ...group,
        policies: group.policies.filter(
          (policy) =>
            policy.name.toLowerCase().includes(query) ||
            policy.description?.toLowerCase().includes(query) ||
            policy.resource.toLowerCase().includes(query) ||
            policy.action.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.policies.length > 0);
  }, [groups, search]);

  function togglePolicy(policyId: string) {
    if (value.includes(policyId)) {
      onChange(value.filter((id) => id !== policyId));
      return;
    }

    onChange([...value, policyId]);
  }

  function toggleGroup(group: PolicyGroup, selectAll: boolean) {
    const groupIds = group.policies.map((policy) => policy.id);

    if (selectAll) {
      onChange([...new Set([...value, ...groupIds])]);
      return;
    }

    onChange(value.filter((id) => !groupIds.includes(id)));
  }

  function isGroupFullySelected(group: PolicyGroup): boolean {
    return group.policies.every((policy) => value.includes(policy.id));
  }

  function isGroupPartiallySelected(group: PolicyGroup): boolean {
    const selectedCount = group.policies.filter((policy) =>
      value.includes(policy.id),
    ).length;
    return selectedCount > 0 && selectedCount < group.policies.length;
  }

  if (isLoading) {
    return <PolicyMultiPickerSkeleton />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (policies.length === 0) {
    return (
      <Box className="rounded-2xl border border-dashed border-slate-200/60 px-4 py-8 text-center dark:border-slate-700/60">
        <Typography variant="body2" color="text.secondary">
          No ABAC policies available. Create a policy first.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search policies..."
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

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        <Button
          size="small"
          onClick={() => onChange(allPolicyIds)}
          className="font-semibold normal-case"
        >
          Select all
        </Button>
        <Button
          size="small"
          onClick={() => onChange([])}
          className="font-semibold normal-case"
        >
          Clear all
        </Button>
        <Button
          size="small"
          onClick={() => setExpanded(filteredGroups.map((group) => group.resource))}
          className="font-semibold normal-case"
        >
          Expand all
        </Button>
        <Button
          size="small"
          onClick={() => setExpanded([])}
          className="font-semibold normal-case"
        >
          Collapse all
        </Button>
      </Stack>

      <Stack spacing={1}>
        {filteredGroups.map((group) => {
          const fullySelected = isGroupFullySelected(group);
          const partiallySelected = isGroupPartiallySelected(group);
          const ResourceIcon = getResourceIcon(group.resource);

          return (
            <Accordion
              key={group.resource}
              expanded={expanded.includes(group.resource) || Boolean(search.trim())}
              onChange={(_, isExpanded) => {
                setExpanded((current) =>
                  isExpanded
                    ? [...current, group.resource]
                    : current.filter((key) => key !== group.resource),
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
                        'aria-label': `Select all ${getResourceLabel(group.resource)} policies`,
                      },
                    }}
                  />
                  <Box className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <ResourceIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" className="font-bold">
                      {getResourceLabel(group.resource)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {group.policies.filter((policy) => value.includes(policy.id)).length}
                      {' / '}
                      {group.policies.length} selected
                    </Typography>
                  </Box>
                </Stack>
              </AccordionSummary>
              <AccordionDetails className="pt-0">
                <Stack spacing={1} className="pl-1">
                  {group.policies.map((policy) => (
                    <PolicyCard
                      key={policy.id}
                      policy={policy}
                      selected={value.includes(policy.id)}
                      onToggle={() => togglePolicy(policy.id)}
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
            No policies match your search.
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
}

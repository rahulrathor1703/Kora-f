'use client';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { getResourceLabel } from '@/lib/rbac/permission-ui';

const PREVIEW_PANEL_ID = 'role-live-preview';

interface RoleSummaryBaseProps {
  name: string;
  description: string;
  permissionIds: string[];
  hasValidName: boolean;
  hasPermissions: boolean;
  showValidation?: boolean;
  mode: 'create' | 'edit';
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

function truncate(text: string, max = 80): string {
  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, max)}…`;
}

export function RoleSummaryToggle({
  permissionIds,
  hasValidName,
  hasPermissions,
  expanded,
  onExpandedChange,
}: Pick<
  RoleSummaryBaseProps,
  'permissionIds' | 'hasValidName' | 'hasPermissions' | 'expanded' | 'onExpandedChange'
>) {
  const isReady = hasValidName && hasPermissions;

  return (
    <Tooltip title={expanded ? 'Hide live preview' : 'Show live preview'}>
      <IconButton
        aria-label={expanded ? 'Hide live preview' : 'Show live preview'}
        aria-expanded={expanded}
        aria-controls={PREVIEW_PANEL_ID}
        onClick={() => onExpandedChange(!expanded)}
        className={`rounded-xl border transition-colors ${
          expanded
            ? 'border-primary/30 bg-primary-soft text-primary'
            : 'border-slate-200/70 bg-white/70 dark:border-slate-700/70 dark:bg-slate-900/70'
        }`}
        size="small"
      >
        <Badge
          badgeContent={permissionIds.length > 0 ? permissionIds.length : undefined}
          color={isReady ? 'primary' : 'warning'}
          max={99}
        >
          <PreviewOutlinedIcon sx={{ fontSize: 20 }} />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}

interface RoleSummaryPreviewBodyProps {
  name: string;
  description: string;
  permissionIds: string[];
  hasValidName: boolean;
  hasPermissions: boolean;
  showValidation: boolean;
  mode: 'create' | 'edit';
  onCollapse: () => void;
}

function RoleSummaryPreviewBody({
  name,
  description,
  permissionIds,
  hasValidName,
  hasPermissions,
  showValidation,
  mode,
  onCollapse,
}: RoleSummaryPreviewBodyProps) {
  const { data } = usePermissions();

  const resourceBreakdown = useMemo(() => {
    const groups = data?.groups ?? [];
    const selectedSet = new Set(permissionIds);

    return groups
      .map((group) => {
        const selectedCount = group.permissions.filter((p) =>
          selectedSet.has(p.id),
        ).length;

        if (selectedCount === 0) {
          return null;
        }

        return {
          resource: group.resource,
          label: getResourceLabel(group.resource),
          selectedCount,
          totalCount: group.permissions.length,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [data?.groups, permissionIds]);

  const isReady = hasValidName && hasPermissions;
  const displayName = name.trim() || 'Untitled role';
  const displayDescription =
    description.trim() || 'No description provided yet.';

  return (
    <Box
      id={PREVIEW_PANEL_ID}
      className="rounded-2xl border border-slate-200/60 bg-white/40 p-4 dark:border-slate-700/60 dark:bg-slate-900/40"
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="overline" className="font-semibold tracking-wider text-primary">
          Live preview
        </Typography>
        <Button
          size="small"
          onClick={onCollapse}
          className="font-semibold normal-case"
        >
          Hide preview
        </Button>
      </Stack>

      <Typography variant="h6" className="font-bold">
        {displayName}
      </Typography>

      <Typography variant="body2" color="text.secondary" className="mt-1">
        {truncate(displayDescription)}
      </Typography>

      <Chip
        label={`${permissionIds.length} permission${permissionIds.length === 1 ? '' : 's'}`}
        color="primary"
        variant="outlined"
        className="mt-4 font-semibold"
        aria-live="polite"
      />

      {resourceBreakdown.length > 0 ? (
        <Stack spacing={2} className="mt-5">
          <Typography variant="caption" className="font-semibold uppercase tracking-wider text-text-secondary">
            By resource
          </Typography>
          {resourceBreakdown.map((item) => (
            <Box key={item.resource}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}
              >
                <Typography variant="body2" className="font-medium">
                  {item.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.selectedCount}/{item.totalCount}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(item.selectedCount / item.totalCount) * 100}
                className="h-1 rounded-full"
                aria-label={`${item.label} permissions selected`}
              />
            </Box>
          ))}
        </Stack>
      ) : (
        <Box className="mt-5 rounded-2xl border border-dashed border-slate-200/60 px-3 py-4 text-center dark:border-slate-700/60">
          <Typography variant="caption" color="text.secondary">
            Select permissions to see a breakdown by resource.
          </Typography>
        </Box>
      )}

      <Box className="mt-5 rounded-2xl border border-slate-200/60 px-3 py-3 dark:border-slate-700/60">
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {isReady ? (
            <CheckCircleOutlinedIcon color="primary" sx={{ fontSize: 20 }} />
          ) : (
            <ErrorOutlineOutlinedIcon color="warning" sx={{ fontSize: 20 }} />
          )}
          <Box>
            <Typography variant="body2" className="font-semibold">
              {isReady
                ? mode === 'create'
                  ? 'Ready to create'
                  : 'Ready to save'
                : 'Incomplete'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isReady
                ? 'All required fields are filled.'
                : !hasValidName && !hasPermissions
                  ? 'Add a role name and select permissions.'
                  : !hasValidName
                    ? 'Role name must be at least 2 characters.'
                    : 'Select at least one permission.'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {showValidation && !isReady ? (
        <Typography variant="caption" color="error" className="mt-3 block">
          Complete the required fields before {mode === 'create' ? 'creating' : 'saving'}.
        </Typography>
      ) : null}
    </Box>
  );
}

export default function RoleSummaryPanel({
  name,
  description,
  permissionIds,
  hasValidName,
  hasPermissions,
  showValidation = false,
  mode,
  expanded,
  onExpandedChange,
}: RoleSummaryBaseProps) {
  return (
    <Collapse in={expanded} unmountOnExit>
      <Box className="mt-4">
        <RoleSummaryPreviewBody
          name={name}
          description={description}
          permissionIds={permissionIds}
          hasValidName={hasValidName}
          hasPermissions={hasPermissions}
          showValidation={showValidation}
          mode={mode}
          onCollapse={() => onExpandedChange(false)}
        />
      </Box>
    </Collapse>
  );
}

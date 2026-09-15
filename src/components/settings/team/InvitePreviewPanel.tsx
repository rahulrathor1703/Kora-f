'use client';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRole } from '@/hooks/useRoles';
import { getResourceLabel } from '@/lib/rbac/permission-ui';
import type { Role } from '@/lib/api';

interface InvitePreviewPanelProps {
  email: string;
  role: Role | null;
  hierarchyLevel: number;
}

export default function InvitePreviewPanel({
  email,
  role,
  hierarchyLevel,
}: InvitePreviewPanelProps) {
  const { data: roleDetail } = useRole(role?.id ?? null);

  const permissions = roleDetail?.permissions ?? [];

  const groupedPermissions = (() => {
    if (!permissions.length) {
      return [];
    }

    const groups = new Map<string, string[]>();

    for (const permission of permissions) {
      const resource = permission.resource;
      const existing = groups.get(resource) ?? [];
      existing.push(permission.action);
      groups.set(resource, existing);
    }

    return Array.from(groups.entries()).map(([resource, actions]) => ({
      resource,
      label: getResourceLabel(resource),
      actions,
    }));
  })();

  const hasEmail = email.trim().length > 0;
  const hasRole = Boolean(role);

  return (
    <Card className="dashboard-panel surface-panel sticky top-6 rounded-2xl shadow-none">
      <CardContent className="p-6 md:p-8">
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" className="font-semibold tracking-[0.1em] text-primary">
              Live preview
            </Typography>
            <Typography variant="h6" className="mt-2 font-bold">
              Invitation summary
            </Typography>
          </Box>

          <Stack spacing={2}>
            <PreviewRow
              label="Email"
              value={hasEmail ? email : 'Enter an email address'}
              ready={hasEmail}
            />
            <PreviewRow
              label="Role"
              value={role?.name ?? 'Select a role'}
              ready={hasRole}
            />
            <PreviewRow label="Level" value={`Level ${hierarchyLevel}`} ready />
          </Stack>

          {hasEmail && hasRole ? (
            <Box className="rounded-2xl border border-primary/20 bg-primary-soft/40 px-4 py-3">
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                <MailOutlineOutlinedIcon className="mt-0.5 text-primary" sx={{ fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong className="text-slate-900 dark:text-slate-100">{email}</strong> will receive
                  an invite to join as <strong>{role?.name}</strong> at Level {hierarchyLevel}.
                </Typography>
              </Stack>
            </Box>
          ) : null}

          {groupedPermissions.length > 0 ? (
            <Stack spacing={1.5}>
              <Typography variant="body2" className="font-semibold">
                Permissions included
              </Typography>
              {groupedPermissions.map((group) => (
                <Box
                  key={group.resource}
                  className="rounded-2xl border border-slate-200/60 bg-white/40 px-4 py-3 dark:border-slate-700/60 dark:bg-slate-900/40"
                >
                  <Typography variant="caption" className="font-semibold uppercase tracking-wide">
                    {group.label}
                  </Typography>
                  <Stack direction="row" spacing={0.75} className="mt-2 flex-wrap gap-y-1">
                    {group.actions.map((action) => (
                      <Chip
                        key={`${group.resource}-${action}`}
                        label={action}
                        size="small"
                        className="rounded-lg capitalize"
                      />
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function PreviewRow({
  label,
  value,
  ready,
}: {
  label: string;
  value: string;
  ready: boolean;
}) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <CheckCircleOutlinedIcon
        sx={{ fontSize: 18 }}
        className={ready ? 'text-primary' : 'text-slate-300 dark:text-slate-600'}
      />
      <Box>
        <Typography variant="caption" color="text.secondary" className="block">
          {label}
        </Typography>
        <Typography variant="body2" className="font-semibold">
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

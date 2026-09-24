'use client';

import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import PlatformPageHeader from '@/components/platform/PlatformPageHeader';
import { useNotify } from '@/hooks/useNotify';
import { getApiErrorMessage } from '@/lib/api';
import {
  updatePlatformTenantEntitlements,
  type TenantDetailResponse,
} from '@/lib/api/platform';
import {
  formatLimitUsage,
  limitUsagePercent,
  ORG_MODULE_UI,
} from '@/lib/org-entitlements/module-ui';
import {
  getLimitsForModule,
  ORG_MODULES,
  type OrgEntitlementsSnapshot,
  type OrgLimitKey,
  type OrgLimitValue,
  type OrgModule,
} from '@/lib/org-entitlements/types';

interface PlatformTenantEntitlementsEditorProps {
  tenant: TenantDetailResponse;
  initialSnapshot: OrgEntitlementsSnapshot;
  onSaved: () => void;
}

interface EditorDraft {
  enabledModules: OrgModule[];
  platformCaps: Partial<Record<OrgLimitKey, OrgLimitValue>>;
  unlimitedCaps: Partial<Record<OrgLimitKey, boolean>>;
}

function buildUnlimitedCaps(
  caps: Partial<Record<OrgLimitKey, OrgLimitValue>>,
): Partial<Record<OrgLimitKey, boolean>> {
  const unlimited: Partial<Record<OrgLimitKey, boolean>> = {};

  for (const orgModule of ORG_MODULES) {
    for (const definition of getLimitsForModule(orgModule)) {
      unlimited[definition.key] = caps[definition.key] == null;
    }
  }

  return unlimited;
}

function buildDraft(snapshot: OrgEntitlementsSnapshot): EditorDraft {
  return {
    enabledModules: [...snapshot.enabledModules],
    platformCaps: { ...snapshot.platformCaps },
    unlimitedCaps: buildUnlimitedCaps(snapshot.platformCaps),
  };
}

function serializeDraft(draft: EditorDraft): string {
  return JSON.stringify({
    enabledModules: [...draft.enabledModules].sort(),
    platformCaps: draft.platformCaps,
    unlimitedCaps: draft.unlimitedCaps,
  });
}

function LimitCapRow({
  label,
  used,
  value,
  unlimited,
  disabled,
  onUnlimitedChange,
  onValueChange,
}: {
  label: string;
  used: number;
  value: number | null;
  unlimited: boolean;
  disabled: boolean;
  onUnlimitedChange: (unlimited: boolean) => void;
  onValueChange: (value: number | null) => void;
}) {
  const previewCap = unlimited ? null : value;
  const progressValue = limitUsagePercent(used, previewCap);
  const isNearLimit =
    previewCap != null && previewCap > 0 && used / previewCap >= 0.85;

  return (
    <Box
      className={`rounded-xl border border-border/60 px-4 py-4 transition-opacity ${
        disabled ? 'pointer-events-none opacity-45' : ''
      }`}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          className="items-start sm:items-center sm:justify-between"
        >
          <Box className="min-w-0 flex-1">
            <Typography variant="body2" className="font-semibold text-foreground">
              {label}
            </Typography>
            <Typography variant="caption" color="text.secondary" className="mt-0.5 block">
              {formatLimitUsage(used, previewCap)}
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            className="w-full items-stretch sm:w-auto sm:items-center"
          >
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={unlimited}
                  disabled={disabled}
                  onChange={(event) => onUnlimitedChange(event.target.checked)}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  Unlimited
                </Typography>
              }
              className="mx-0"
            />
            <TextField
              type="number"
              size="small"
              label="Platform cap"
              value={unlimited || value == null ? '' : value}
              disabled={disabled || unlimited}
              slotProps={{ htmlInput: { min: 0 } }}
              onChange={(event) => {
                const next = event.target.value.trim();
                onValueChange(next === '' ? null : Number.parseInt(next, 10));
              }}
              sx={{ width: { xs: '100%', sm: 140 } }}
            />
          </Stack>
        </Stack>

        {!unlimited && previewCap != null ? (
          <LinearProgress
            variant="determinate"
            value={progressValue}
            color={isNearLimit ? 'warning' : 'primary'}
            className="h-1.5 rounded-full"
          />
        ) : null}
      </Stack>
    </Box>
  );
}

function ModuleAccessCard({
  orgModule,
  enabled,
  limits,
  usageByKey,
  platformCaps,
  unlimitedCaps,
  onToggle,
  onUnlimitedChange,
  onCapChange,
}: {
  orgModule: OrgModule;
  enabled: boolean;
  limits: ReturnType<typeof getLimitsForModule>;
  usageByKey: OrgEntitlementsSnapshot['limits'];
  platformCaps: Partial<Record<OrgLimitKey, OrgLimitValue>>;
  unlimitedCaps: Partial<Record<OrgLimitKey, boolean>>;
  onToggle: () => void;
  onUnlimitedChange: (limitKey: OrgLimitKey, unlimited: boolean) => void;
  onCapChange: (limitKey: OrgLimitKey, value: OrgLimitValue) => void;
}) {
  const meta = ORG_MODULE_UI[orgModule];
  const Icon = meta.icon;

  return (
    <Card className="dashboard-panel surface-panel overflow-hidden rounded-2xl shadow-none">
      <CardContent className="p-0">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          className="items-start px-4 py-4 sm:items-center sm:justify-between md:px-6 md:py-5"
        >
          <Stack direction="row" spacing={2} className="min-w-0 flex-1 items-start">
            <Box
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.accentClass}`}
            >
              <Icon fontSize="small" />
            </Box>
            <Box className="min-w-0">
              <Typography variant="subtitle1" className="font-semibold text-foreground">
                {meta.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-0.5 leading-relaxed">
                {meta.description}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} className="w-full items-center sm:w-auto">
            <Chip
              size="small"
              label={enabled ? 'Enabled' : 'Disabled'}
              color={enabled ? 'success' : 'default'}
              variant={enabled ? 'filled' : 'outlined'}
            />
            <Switch
              checked={enabled}
              onChange={onToggle}
              slotProps={{
                input: {
                  'aria-label': `${enabled ? 'Disable' : 'Enable'} ${meta.label}`,
                },
              }}
            />
          </Stack>
        </Stack>

        <Divider />

        <Box className="space-y-3 px-4 py-4 md:px-6 md:py-5">
          {!enabled ? (
            <Box className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-center">
              <Typography variant="body2" color="text.secondary">
                Enable {meta.label} to configure platform caps for this organization.
              </Typography>
            </Box>
          ) : limits.length > 0 ? (
            limits.map((definition) => {
              const usage = usageByKey[definition.key];
              return (
                <LimitCapRow
                  key={definition.key}
                  label={definition.label}
                  used={usage.used}
                  value={platformCaps[definition.key] ?? null}
                  unlimited={unlimitedCaps[definition.key] ?? false}
                  disabled={!enabled}
                  onUnlimitedChange={(unlimited) =>
                    onUnlimitedChange(definition.key, unlimited)
                  }
                  onValueChange={(value) => onCapChange(definition.key, value)}
                />
              );
            })
          ) : (
            <Box className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-center">
              <Typography variant="body2" color="text.secondary">
                No platform caps for this module. Access is controlled by the
                enable switch only.
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function PlatformTenantEntitlementsEditor({
  tenant,
  initialSnapshot,
  onSaved,
}: PlatformTenantEntitlementsEditorProps) {
  const { notifyError, notifySuccess } = useNotify();
  const baselineDraft = useMemo(() => buildDraft(initialSnapshot), [initialSnapshot]);
  const [baseline, setBaseline] = useState(baselineDraft);
  const [draft, setDraft] = useState(baselineDraft);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = serializeDraft(draft) !== serializeDraft(baseline);
  const enabledCount = draft.enabledModules.length;

  function toggleModule(orgModule: OrgModule) {
    setDraft((current) => ({
      ...current,
      enabledModules: current.enabledModules.includes(orgModule)
        ? current.enabledModules.filter((entry) => entry !== orgModule)
        : [...current.enabledModules, orgModule],
    }));
  }

  function updateCap(limitKey: OrgLimitKey, value: OrgLimitValue) {
    setDraft((current) => ({
      ...current,
      platformCaps: { ...current.platformCaps, [limitKey]: value },
    }));
  }

  function updateUnlimited(limitKey: OrgLimitKey, unlimited: boolean) {
    setDraft((current) => {
      const nextUnlimited = { ...current.unlimitedCaps, [limitKey]: unlimited };
      const nextCaps = { ...current.platformCaps };

      if (unlimited) {
        nextCaps[limitKey] = null;
      }

      return {
        ...current,
        unlimitedCaps: nextUnlimited,
        platformCaps: nextCaps,
      };
    });
  }

  function handleReset() {
    setDraft(baseline);
  }

  async function handleSave() {
    setIsSaving(true);

    try {
      const normalizedCaps = Object.fromEntries(
        ORG_MODULES.flatMap((orgModule) =>
          getLimitsForModule(orgModule).map((definition) => {
            const limitKey = definition.key;
            if (draft.unlimitedCaps[limitKey]) {
              return [limitKey, null];
            }
            return [limitKey, draft.platformCaps[limitKey] ?? null];
          }),
        ),
      ) as Partial<Record<OrgLimitKey, OrgLimitValue>>;

      await updatePlatformTenantEntitlements(tenant.id, {
        enabledModules: draft.enabledModules,
        platformCaps: normalizedCaps,
      });

      const savedDraft: EditorDraft = {
        enabledModules: [...draft.enabledModules],
        platformCaps: normalizedCaps,
        unlimitedCaps: buildUnlimitedCaps(normalizedCaps),
      };
      setBaseline(savedDraft);
      setDraft(savedDraft);

      notifySuccess('Organization access updated');
      onSaved();
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to save organization access'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Box className="platform-chrome dashboard-chrome-x w-full pb-24">
      <Stack spacing={3}>
        <Link
          href="/platform/tenants"
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/50 px-3 py-2 no-underline backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-primary-soft dark:border-slate-700/70 dark:bg-slate-900/50"
        >
          <Box className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography
            variant="body2"
            component="span"
            className="font-semibold text-text-secondary"
          >
            Back to organizations
          </Typography>
        </Link>

        <PlatformPageHeader
          overline="Manage access"
          title={tenant.name}
          description="Control which workspace modules this organization can use and set the maximum platform caps for each resource."
          actions={
            <Stack direction="row" spacing={1} className="flex-wrap">
              <Chip
                size="small"
                label={tenant.status === 'active' ? 'Active' : 'Suspended'}
                color={tenant.status === 'active' ? 'success' : 'warning'}
              />
              <Chip
                size="small"
                icon={<GroupsOutlinedIcon />}
                label={`${tenant.memberCount} members`}
                variant="outlined"
              />
              <Chip
                size="small"
                icon={<LinkOutlinedIcon />}
                label={`/${tenant.slug}`}
                variant="outlined"
              />
            </Stack>
          }
        />

        <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
          <CardContent className="px-4 py-4 md:px-6 md:py-5">
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              className="items-start md:items-center md:justify-between"
            >
              <Box>
                <Typography variant="subtitle1" className="font-semibold">
                  Workspace overview
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mt-1">
                  {enabledCount} of {ORG_MODULES.length} modules enabled. The platform
                  owner can set organization limits within these caps when impersonating
                  a tenant.
                </Typography>
              </Box>
              <Chip
                label={`${enabledCount}/${ORG_MODULES.length} modules`}
                color={enabledCount === ORG_MODULES.length ? 'primary' : 'default'}
                variant="outlined"
              />
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={2.5}>
          {ORG_MODULES.map((orgModule) => (
            <ModuleAccessCard
              key={orgModule}
              orgModule={orgModule}
              enabled={draft.enabledModules.includes(orgModule)}
              limits={getLimitsForModule(orgModule)}
              usageByKey={initialSnapshot.limits}
              platformCaps={draft.platformCaps}
              unlimitedCaps={draft.unlimitedCaps}
              onToggle={() => toggleModule(orgModule)}
              onUnlimitedChange={updateUnlimited}
              onCapChange={updateCap}
            />
          ))}
        </Stack>
      </Stack>

      <Box
        className={`fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-background/90 backdrop-blur-md transition-transform duration-200 ${
          isDirty ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <Box className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <Typography variant="body2" color="text.secondary">
            You have unsaved changes to module access and platform caps.
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" disabled={isSaving} onClick={handleReset}>
              Reset
            </Button>
            <Button variant="contained" disabled={isSaving} onClick={() => void handleSave()}>
              {isSaving ? 'Saving…' : 'Save access settings'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

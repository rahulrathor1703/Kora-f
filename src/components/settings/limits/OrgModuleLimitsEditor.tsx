'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import { useNotify } from '@/hooks/useNotify';
import { getApiErrorMessage } from '@/lib/api';
import { updateOrganizationLimits } from '@/lib/org-entitlements/api';
import {
  getLimitsForModule,
  ORG_MODULE_LABELS,
  type OrgEntitlementsSnapshot,
  type OrgLimitKey,
  type OrgLimitValue,
} from '@/lib/org-entitlements/types';

interface OrgModuleLimitsEditorProps {
  initialSnapshot: OrgEntitlementsSnapshot;
  onSaved: () => void;
}

function LimitRow({
  label,
  used,
  platformCap,
  value,
  onChange,
}: {
  label: string;
  used: number;
  platformCap: number | null;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const capLabel =
    platformCap == null ? 'Unlimited platform cap' : `Platform cap: ${platformCap}`;

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      className="items-start rounded-xl border border-border/60 px-4 py-3 md:items-center"
    >
      <Box className="min-w-0 flex-1">
        <Typography variant="body2" className="font-medium text-foreground">
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {used} used · {capLabel}
        </Typography>
      </Box>
      <TextField
        type="number"
        size="small"
        label="Org limit"
        value={value ?? ''}
        placeholder={platformCap == null ? 'Unlimited' : String(platformCap)}
        slotProps={{
          htmlInput: { min: 0, max: platformCap ?? undefined },
        }}
        onChange={(event) => {
          const next = event.target.value.trim();
          onChange(next === '' ? null : Number.parseInt(next, 10));
        }}
        sx={{ width: 160 }}
      />
    </Stack>
  );
}

export default function OrgModuleLimitsEditor({
  initialSnapshot,
  onSaved,
}: OrgModuleLimitsEditorProps) {
  const { notifyError, notifySuccess } = useNotify();
  const [orgLimits, setOrgLimits] = useState<
    Partial<Record<OrgLimitKey, OrgLimitValue>>
  >({ ...initialSnapshot.orgLimits });
  const [isSaving, setIsSaving] = useState(false);

  const moduleSections = initialSnapshot.enabledModules
    .map((module) => ({
      module,
      label: ORG_MODULE_LABELS[module],
      limits: getLimitsForModule(module),
    }))
    .filter((section) => section.limits.length > 0);

  function updateLimit(limitKey: OrgLimitKey, value: OrgLimitValue) {
    setOrgLimits((current) => ({ ...current, [limitKey]: value }));
  }

  async function handleSave() {
    setIsSaving(true);

    try {
      await updateOrganizationLimits({ orgLimits });
      notifySuccess('Module limits saved');
      onSaved();
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to save module limits'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="Access control"
        title="Module limits"
        description="Set organization limits within the caps assigned by platform administration."
      />

      {moduleSections.length === 0 ? (
        <Alert severity="info" className="rounded-2xl">
          No modules are enabled for this organization.
        </Alert>
      ) : null}

      {moduleSections.map(({ module, label, limits }) => (
        <Card key={module} className="dashboard-panel surface-panel rounded-2xl shadow-none">
          <CardContent className="space-y-4 p-4 md:p-6">
            <Typography variant="subtitle1" className="font-semibold">
              {label}
            </Typography>
            <Stack spacing={1.5}>
              {limits.map((definition) => {
                const usage = initialSnapshot.limits[definition.key];
                return (
                  <LimitRow
                    key={definition.key}
                    label={definition.label}
                    used={usage.used}
                    platformCap={usage.platformCap}
                    value={
                      orgLimits[definition.key] ??
                      usage.orgLimit ??
                      usage.effective
                    }
                    onChange={(value) => updateLimit(definition.key, value)}
                  />
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      ))}

      <Stack direction="row" className="justify-end">
        <Button
          variant="contained"
          disabled={isSaving || moduleSections.length === 0}
          onClick={() => void handleSave()}
        >
          {isSaving ? 'Saving…' : 'Save limits'}
        </Button>
      </Stack>
    </Stack>
  );
}

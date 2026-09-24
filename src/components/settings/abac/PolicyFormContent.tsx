'use client';

import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import SettingsLink from '@/components/settings/SettingsLink';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormAlert from '@/components/ui/FormAlert';
import FormTextField from '@/components/ui/FormTextField';
import PolicyConditionEditor from '@/components/settings/abac/PolicyConditionEditor';
import UserAssignmentPicker from '@/components/settings/abac/UserAssignmentPicker';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import SettingsSubPageNav from '@/components/settings/SettingsSubPageNav';
import { useAbacPolicies, useAbacPolicy } from '@/hooks/useAbacPolicies';
import { useConfirm } from '@/hooks/useConfirm';
import {
  ABAC_ACTIONS,
  ABAC_RESOURCES,
  abacPolicyFormSchema,
  type AbacPolicyFormValues,
} from '@/lib/schemas/abac-policy';

const DESCRIPTION_MAX_LENGTH = 500;

interface PolicyFormContentProps {
  mode: 'create' | 'edit';
  policyId?: string;
}

function cleanConditions(
  conditions: AbacPolicyFormValues['conditions'],
): AbacPolicyFormValues['conditions'] {
  if (!conditions) {
    return {};
  }

  const cleaned: AbacPolicyFormValues['conditions'] = {};

  if (conditions.hierarchyLevel?.min !== undefined) {
    cleaned.hierarchyLevel = {
      ...cleaned.hierarchyLevel,
      min: conditions.hierarchyLevel.min,
    };
  }

  if (conditions.hierarchyLevel?.max !== undefined) {
    cleaned.hierarchyLevel = {
      ...cleaned.hierarchyLevel,
      max: conditions.hierarchyLevel.max,
    };
  }

  if (conditions.roleSlugs?.length) {
    cleaned.roleSlugs = conditions.roleSlugs;
  }

  if (conditions.status) {
    cleaned.status = conditions.status;
  }

  return cleaned;
}

export default function PolicyFormContent({ mode, policyId }: PolicyFormContentProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const [showValidation, setShowValidation] = useState(false);
  const { createPolicy, updatePolicy, isCreating, isUpdating, error: mutationError } =
    useAbacPolicies();
  const {
    data: policy,
    isLoading: isLoadingPolicy,
    error: fetchError,
  } = useAbacPolicy(mode === 'edit' ? (policyId ?? null) : null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AbacPolicyFormValues>({
    resolver: zodResolver(abacPolicyFormSchema),
    defaultValues: {
      name: '',
      description: '',
      resource: '',
      action: '',
      effect: 'allow',
      isEnabled: true,
      conditions: {},
      userIds: [],
    },
  });

  useEffect(() => {
    if (mode === 'edit' && policy) {
      reset({
        name: policy.name,
        description: policy.description ?? '',
        resource: policy.resource,
        action: policy.action,
        effect: policy.effect,
        isEnabled: policy.isEnabled,
        conditions: policy.conditions ?? {},
        userIds: policy.assignedUsers.map((user) => user.id),
      });
    }
  }, [mode, policy, reset]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  async function onSubmit(values: AbacPolicyFormValues) {
    setShowValidation(true);

    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      resource: values.resource,
      action: values.action,
      effect: values.effect,
      isEnabled: values.isEnabled,
      conditions: cleanConditions(values.conditions),
      userIds: values.userIds,
    };

    try {
      if (mode === 'create') {
        await createPolicy(payload);
      } else if (policyId) {
        await updatePolicy(policyId, payload);
      }

      router.push('/settings/abac');
    } catch {
      // error surfaced via hook
    }
  }

  async function handleCancelClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!isDirty) {
      return;
    }

    event.preventDefault();

    const confirmed = await confirm({
      title: 'Unsaved changes',
      description: 'You have unsaved changes. Leave without saving?',
      variant: 'warning',
      confirmLabel: 'Leave',
      cancelLabel: 'Stay',
    });

    if (confirmed) {
      router.push('/settings/abac');
    }
  }

  const isSaving = isCreating || isUpdating;
  const pageError = fetchError ?? mutationError;
  const submitLabel = mode === 'create' ? 'Create policy' : 'Save changes';

  if (mode === 'edit' && isLoadingPolicy) {
    return (
      <Box className="flex justify-center py-24">
        <CircularProgress size={36} aria-label="Loading policy" />
      </Box>
    );
  }

  if (mode === 'edit' && fetchError) {
    return (
      <Stack spacing={3}>
        <SettingsSubPageNav
          parentBack={{
            href: '/settings/abac',
            label: 'Back to policies',
            onClick: handleCancelClick,
          }}
        />
        <Alert severity="error">{fetchError}</Alert>
      </Stack>
    );
  }

  return (
    <Stack
      spacing={3}
      component="form"
      id="abac-policy-form"
      className="pb-28"
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
    >
      <Box>
        <SettingsSubPageHeader
          overline="Access control"
          title={mode === 'create' ? 'Create ABAC policy' : `Edit ${policy?.name ?? 'policy'}`}
          description={
            mode === 'create'
              ? 'Define a resource, action, effect, and optional attribute conditions.'
              : 'Update policy details, conditions, and assigned users.'
          }
          parentBack={{
            href: '/settings/abac',
            label: 'Back to policies',
            onClick: handleCancelClick,
          }}
        />
      </Box>

      {pageError ? <FormAlert message={pageError} /> : null}

      <Box className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Stack spacing={4}>
          <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
            <CardContent className="p-6 md:p-8">
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
                <Box className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <PolicyOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="h6" className="font-bold">
                    Policy details
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Name the policy and define what it applies to.
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={3}>
                <FormTextField name="name" control={control} label="Policy name" />

                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Box>
                      <TextField
                        {...field}
                        label="Description"
                        multiline
                        minRows={3}
                        fullWidth
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message}
                        placeholder="What does this policy control?"
                        className="rounded-xl"
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        className="mt-1 block text-right"
                      >
                        {(field.value ?? '').length}/{DESCRIPTION_MAX_LENGTH}
                      </Typography>
                    </Box>
                  )}
                />

                <Controller
                  name="resource"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={Boolean(errors.resource)}>
                      <InputLabel id="policy-resource-label">Resource</InputLabel>
                      <Select
                        {...field}
                        labelId="policy-resource-label"
                        label="Resource"
                      >
                        {ABAC_RESOURCES.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="action"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={Boolean(errors.action)}>
                      <InputLabel id="policy-action-label">Action</InputLabel>
                      <Select {...field} labelId="policy-action-label" label="Action">
                        {ABAC_ACTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="effect"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <Typography variant="body2" className="mb-2 font-semibold">
                        Effect
                      </Typography>
                      <ToggleButtonGroup
                        exclusive
                        value={field.value}
                        onChange={(_, value) => {
                          if (value) {
                            field.onChange(value);
                          }
                        }}
                        className="rounded-xl"
                      >
                        <ToggleButton value="allow" className="px-6 capitalize">
                          Allow
                        </ToggleButton>
                        <ToggleButton value="deny" className="px-6 capitalize">
                          Deny
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  )}
                />

                <Controller
                  name="isEnabled"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(event) => field.onChange(event.target.checked)}
                        />
                      }
                      label="Policy enabled"
                    />
                  )}
                />
              </Stack>
            </CardContent>
          </Card>

          <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
            <CardContent className="p-6 md:p-8">
              <Typography variant="h6" className="font-bold">
                Assigned users
              </Typography>
              <Typography variant="caption" color="text.secondary" className="mt-1 block">
                Users assigned to this policy will be evaluated against it at access time.
              </Typography>
              <Box className="mt-4">
                <Controller
                  name="userIds"
                  control={control}
                  render={({ field }) => (
                    <UserAssignmentPicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSaving}
                    />
                  )}
                />
              </Box>
            </CardContent>
          </Card>
        </Stack>

        <Card className="dashboard-panel surface-panel self-start rounded-2xl shadow-none">
          <CardContent className="p-6 md:p-8">
            <Typography variant="h6" className="font-bold">
              Conditions
            </Typography>
            <Typography variant="caption" color="text.secondary" className="mt-1 block">
              Optional attribute rules that must match for this policy to apply.
            </Typography>
            <Box className="mt-4">
              <PolicyConditionEditor
                control={control}
                errors={errors}
                disabled={isSaving}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box className="form-sticky-footer z-20">
        <Box className="dashboard-chrome-x w-full py-4">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Box className="min-h-5">
              {showValidation && Object.keys(errors).length > 0 ? (
                <Typography variant="caption" color="error">
                  Complete the required fields before {mode === 'create' ? 'creating' : 'saving'}.
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  RBAC is checked first; assigned ABAC policies refine access.
                </Typography>
              )}
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ alignItems: 'center' }}
            >
              <Button
                component={SettingsLink}
                href="/settings/abac"
                color="inherit"
                disabled={isSaving}
                onClick={handleCancelClick}
                className="font-semibold normal-case"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSaving}
                onClick={() => setShowValidation(true)}
                className="min-w-[160px] rounded-2xl px-6 py-2.5 shadow-primary-soft"
              >
                {isSaving ? (
                  <CircularProgress size={22} color="inherit" aria-label="Saving" />
                ) : (
                  submitLabel
                )}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}

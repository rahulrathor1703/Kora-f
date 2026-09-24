'use client';

import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SettingsLink from '@/components/settings/SettingsLink';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormAlert from '@/components/ui/FormAlert';
import FormTextField from '@/components/ui/FormTextField';
import PermissionPicker from '@/components/settings/rbac/PermissionPicker';
import RoleFormProgress from '@/components/settings/rbac/RoleFormProgress';
import RoleSummaryPanel, { RoleSummaryToggle } from '@/components/settings/rbac/RoleSummaryPanel';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import SettingsSubPageNav from '@/components/settings/SettingsSubPageNav';
import { useConfirm } from '@/hooks/useConfirm';
import { useOrgPath } from '@/hooks/useOrgPath';
import { useRole, useRoles } from '@/hooks/useRoles';
import { roleFormSchema, type RoleFormValues } from '@/lib/schemas/role';

const DESCRIPTION_MAX_LENGTH = 500;

interface RoleFormContentProps {
  mode: 'create' | 'edit';
  roleId?: string;
}

export default function RoleFormContent({ mode, roleId }: RoleFormContentProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const confirm = useConfirm();
  const [showValidation, setShowValidation] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const { createRole, updateRole, isCreating, isUpdating, error: mutationError } =
    useRoles();
  const {
    data: role,
    isLoading: isLoadingRole,
    error: fetchError,
  } = useRole(mode === 'edit' ? (roleId ?? null) : null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      permissionIds: [],
    },
  });

  const watchedName = useWatch({ control, name: 'name' }) ?? '';
  const watchedDescription = useWatch({ control, name: 'description' }) ?? '';
  const watchedPermissionIds = useWatch({ control, name: 'permissionIds' }) ?? [];

  const hasValidName = watchedName.trim().length >= 2;
  const hasPermissions = watchedPermissionIds.length > 0;
  const isFormReady = hasValidName && hasPermissions;

  useEffect(() => {
    if (mode === 'edit' && role) {
      reset({
        name: role.name,
        description: role.description ?? '',
        permissionIds: role.permissions.map((p) => p.id),
      });
    }
  }, [mode, role, reset]);

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

  async function onSubmit(values: RoleFormValues) {
    setShowValidation(true);

    try {
      if (mode === 'create') {
        await createRole({
          name: values.name.trim(),
          description: values.description?.trim() || undefined,
          permissionIds: values.permissionIds,
        });
      } else if (roleId) {
        await updateRole(roleId, {
          name: role?.isSystem ? undefined : values.name.trim(),
          description: values.description?.trim() || undefined,
          permissionIds: values.permissionIds,
        });
      }

      router.push(toOrgPath('/settings/rbac'));
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
      router.push(toOrgPath('/settings/rbac'));
    }
  }

  const isSaving = isCreating || isUpdating;
  const pageError = fetchError ?? mutationError;
  const hasDetailsError = Boolean(errors.name || errors.description);
  const submitLabel = mode === 'create' ? 'Create role' : 'Save changes';

  if (mode === 'edit' && isLoadingRole) {
    return (
      <Box className="flex justify-center py-24">
        <CircularProgress size={36} aria-label="Loading role" />
      </Box>
    );
  }

  if (mode === 'edit' && fetchError) {
    return (
      <Stack spacing={3}>
        <SettingsSubPageNav
          parentBack={{
            href: '/settings/rbac',
            label: 'Back to roles',
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
      id="role-form"
      className="pb-28"
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
    >
        <Box>
          <SettingsSubPageHeader
            overline="Access control"
            title={mode === 'create' ? 'Create role' : `Edit ${role?.name ?? 'role'}`}
            description={
              mode === 'create'
                ? 'Name your role, pick permissions, and review before saving.'
                : 'Update role details and adjust assigned permissions.'
            }
            parentBack={{
              href: '/settings/rbac',
              label: 'Back to roles',
              onClick: handleCancelClick,
            }}
          />
        </Box>

        {mode === 'create' ? (
          <RoleFormProgress
            hasValidName={hasValidName}
            hasPermissions={hasPermissions}
          />
        ) : null}

        {mode === 'edit' && role?.isSystem ? (
          <Alert severity="info">
            This is a system role — its name cannot be changed, but you can update
            its description and permissions.
          </Alert>
        ) : null}

        {pageError ? <FormAlert message={pageError} /> : null}

        <Box className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Card
            className={`dashboard-panel surface-panel self-start rounded-2xl shadow-none transition-colors ${
              hasDetailsError ? 'ring-2 ring-error/30' : ''
            }`}
          >
            <CardContent className="p-6 md:p-8">
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <BadgeOutlinedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" className="font-bold">
                      Role details
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Give this role a clear name and optional description.
                    </Typography>
                  </Box>
                </Stack>
                <RoleSummaryToggle
                  permissionIds={watchedPermissionIds}
                  hasValidName={hasValidName}
                  hasPermissions={hasPermissions}
                  expanded={previewExpanded}
                  onExpandedChange={setPreviewExpanded}
                />
              </Stack>

              <Stack spacing={3} className="mt-4">
                <FormTextField
                  name="name"
                  control={control}
                  label="Role name"
                  disabled={mode === 'edit' && Boolean(role?.isSystem)}
                />
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
                        placeholder="What can users with this role do?"
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
              </Stack>

              <RoleSummaryPanel
                name={watchedName}
                description={watchedDescription}
                permissionIds={watchedPermissionIds}
                hasValidName={hasValidName}
                hasPermissions={hasPermissions}
                showValidation={showValidation}
                mode={mode}
                expanded={previewExpanded}
                onExpandedChange={setPreviewExpanded}
              />
            </CardContent>
          </Card>

          <Card className="dashboard-panel surface-panel self-start rounded-2xl shadow-none">
            <CardContent className="p-6 md:p-8">
              <Typography variant="h6" className="font-bold">
                Permissions
              </Typography>
              <Typography variant="caption" color="text.secondary" className="mt-1 block">
                Choose what this role can access. Use presets or pick individually.
              </Typography>
              <Box className="mt-4">
                <Controller
                  name="permissionIds"
                  control={control}
                  render={({ field }) => (
                    <PermissionPicker
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.permissionIds?.message}
                    />
                  )}
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
              {showValidation && !isFormReady ? (
                <Typography variant="caption" color="error">
                  Complete the required fields before {mode === 'create' ? 'creating' : 'saving'}.
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  {isFormReady
                    ? `${watchedPermissionIds.length} permission${watchedPermissionIds.length === 1 ? '' : 's'} selected`
                    : 'Fill in the role name and select at least one permission.'}
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
                href="/settings/rbac"
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
                disabled={isSaving || !isFormReady}
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

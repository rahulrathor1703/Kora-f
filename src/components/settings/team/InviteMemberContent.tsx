'use client';

import AddIcon from '@mui/icons-material/Add';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SettingsLink from '@/components/settings/SettingsLink';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormAlert from '@/components/ui/FormAlert';
import FormTextField from '@/components/ui/FormTextField';
import HierarchyLevelSelector from '@/components/settings/team/HierarchyLevelSelector';
import InvitePreviewPanel from '@/components/settings/team/InvitePreviewPanel';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import SettingsSubPageNav from '@/components/settings/SettingsSubPageNav';
import { useInviteMember } from '@/hooks/useInvitations';
import { useRoles } from '@/hooks/useRoles';
import { getApiErrorMessage } from '@/lib/api';
import { inviteMemberSchema, type InviteMemberFormValues } from '@/lib/schemas/invitation';
import type { Role } from '@/lib/api';

export default function InviteMemberContent() {
  const router = useRouter();
  const { roles, isLoading: isLoadingRoles } = useRoles();
  const { inviteMember, isLoading, error } = useInviteMember();
  const [successInviteUrl, setSuccessInviteUrl] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      roleId: '',
      hierarchyLevel: 1,
    },
  });

  const watchedEmail = useWatch({ control, name: 'email' }) ?? '';
  const watchedRoleId = useWatch({ control, name: 'roleId' }) ?? '';
  const watchedLevel = useWatch({ control, name: 'hierarchyLevel' }) ?? 1;

  const selectedRole = roles.find((role) => role.id === watchedRoleId) ?? null;

  async function onSubmit(values: InviteMemberFormValues) {
    try {
      const result = await inviteMember({
        email: values.email.trim(),
        roleId: values.roleId,
        hierarchyLevel: values.hierarchyLevel,
      });
      setSuccessInviteUrl(result.inviteUrl);
    } catch {
      // error surfaced via hook
    }
  }

  if (successInviteUrl) {
    return (
      <Stack spacing={3}>
        <SettingsSubPageNav
          parentBack={{ href: '/settings/team', label: 'Back to team' }}
        />
        <Card className="dashboard-panel surface-panel max-w-2xl rounded-2xl shadow-none">
          <CardContent className="p-8 md:p-10">
            <Typography variant="h5" className="font-bold text-foreground">
              Invitation sent
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-2">
              The team member will receive an email with a link to set up their account.
              In development, you can also share this link directly:
            </Typography>
            <Box className="mt-4 rounded-2xl border border-slate-200/60 bg-white/40 px-4 py-3 break-all dark:border-slate-700/60 dark:bg-slate-900/40">
              <Typography variant="body2" className="font-mono text-sm">
                {successInviteUrl}
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} className="mt-6">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSuccessInviteUrl(null);
                }}
                className="rounded-2xl px-5 py-2.5 shadow-primary-soft"
              >
                Invite another
              </Button>
              <Button
                component={SettingsLink}
                href="/settings/team"
                variant="outlined"
                className="rounded-2xl px-5 py-2.5"
              >
                Back to team
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="Team"
        title="Invite member"
        description="Send an invitation with a role and hierarchy level. The invitee will set their username and password."
        parentBack={{ href: '/settings/team', label: 'Back to team' }}
      />

      {error ? (
        <FormAlert message={getApiErrorMessage(error, 'Failed to send invitation')} />
      ) : null}

      <Box className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
          <CardContent className="p-6 md:p-8">
            <Box
              component="form"
              noValidate
              onSubmit={(event) => void handleSubmit(onSubmit)(event)}
            >
              <Stack spacing={3}>
                <FormTextField
                  name="email"
                  control={control}
                  label="Email address"
                  type="email"
                  autoComplete="off"
                  disabled={isLoading}
                />

                <Controller
                  name="roleId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={roles}
                      loading={isLoadingRoles}
                      getOptionLabel={(option: Role) => option.name}
                      value={roles.find((role) => role.id === field.value) ?? null}
                      onChange={(_, value) => field.onChange(value?.id ?? '')}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Role"
                          error={Boolean(errors.roleId)}
                          helperText={errors.roleId?.message}
                          disabled={isLoading}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props} key={option.id}>
                          <Stack>
                            <Typography variant="body2" className="font-semibold">
                              {option.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.description ?? 'No description'}
                            </Typography>
                          </Stack>
                        </Box>
                      )}
                    />
                  )}
                />

                <Controller
                  name="hierarchyLevel"
                  control={control}
                  render={({ field }) => (
                    <HierarchyLevelSelector
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  )}
                />

                <Stack direction="row" spacing={1.5} className="pt-2">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    className="rounded-2xl px-5 py-2.5 shadow-primary-soft"
                  >
                    {isLoading ? 'Sending…' : 'Send invitation'}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => router.push('/settings/team')}
                    disabled={isLoading}
                    className="rounded-2xl px-5 py-2.5"
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <InvitePreviewPanel
          email={watchedEmail}
          role={selectedRole}
          hierarchyLevel={watchedLevel}
        />
      </Box>
    </Stack>
  );
}

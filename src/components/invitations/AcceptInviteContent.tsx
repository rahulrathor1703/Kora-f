'use client';

import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import AuthShell from '@/components/auth/AuthShell';
import {
  FormPasswordField,
  FormTextField,
  SubmitButton,
} from '@/components/ui';
import { env } from '@/config/env';
import { invalidateQuery } from '@/hooks/api';
import { useAcceptInvite, useValidateInvite } from '@/hooks/useInvitations';
import { useSession } from '@/hooks/useAuth';
import { authService } from '@/lib/api';
import { redirectAfterAuth } from '@/lib/auth/redirect';
import {
  acceptInviteSchema,
  type AcceptInviteFormValues,
} from '@/lib/schemas/invitation';

export default function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { data: session, isLoading: isSessionLoading } = useSession();
  const {
    data: invite,
    error: validateError,
    isLoading: isValidating,
  } = useValidateInvite(token);
  const { acceptInvite, isLoading: isAccepting, error: acceptError } =
    useAcceptInvite(token);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { control, handleSubmit } = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      await authService.logout();
    } catch {
      // Continue even if logout fails so the invitee can proceed.
    } finally {
      invalidateQuery('auth.session');
      window.location.reload();
    }
  }, []);

  async function onSubmit(values: AcceptInviteFormValues) {
    const response = await acceptInvite({
      username: values.username.trim(),
      password: values.password,
    });
    redirectAfterAuth(
      {
        ...response.user,
        organization: response.user.organization ?? undefined,
      },
      router,
    );
    router.refresh();
  }

  if (!token) {
    return (
      <AuthShell
        heroTitle="This invitation link is invalid."
        heroSubtitle="Ask your team admin to send a new invite."
      >
        <InviteAlert message="Invalid invitation link. The link is missing a token." />
      </AuthShell>
    );
  }

  if (isSessionLoading) {
    return (
      <AuthShell>
        <LoadingState />
      </AuthShell>
    );
  }

  if (session) {
    return (
      <AuthShell
        heroTitle="Sign out to accept this invitation."
        heroSubtitle="You're currently signed in to a different account."
      >
        <Stack spacing={3} className="w-full max-w-md">
          <Typography variant="h3" component="h1" className="font-bold text-foreground">
            Accept team invitation
          </Typography>
          <Alert severity="info">
            You&apos;re signed in as <strong>{session.email}</strong>. Log out to
            accept this invitation and set up the invited account.
          </Alert>
          <Button
            variant="contained"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Signing out…' : 'Sign out and continue'}
          </Button>
        </Stack>
      </AuthShell>
    );
  }

  if (isValidating) {
    return (
      <AuthShell>
        <LoadingState />
      </AuthShell>
    );
  }

  if (validateError || !invite) {
    return (
      <AuthShell
        heroTitle="This invitation is no longer valid."
        heroSubtitle="Invitations expire after seven days or can be revoked by an admin."
      >
        <InviteAlert
          message={
            validateError ??
            'This invitation link is invalid, expired, or has already been used.'
          }
        />
      </AuthShell>
    );
  }

  const isDisabled = isAccepting;

  return (
    <AuthShell
      heroTitle="Join your team on Markos."
      heroSubtitle="Set up your account to access your organization workspace."
    >
      <Stack spacing={4} className="w-full max-w-md">
        <Stack spacing={1.25}>
          <Typography
            variant="h3"
            component="h1"
            className="text-balance text-foreground"
            sx={{ fontWeight: 700, letterSpacing: '-0.03em' }}
          >
            Accept invitation
          </Typography>
          <Typography variant="body1" className="max-w-sm text-pretty text-muted">
            Create your {env.brandName} account to join the workspace you were
            invited to.
          </Typography>
        </Stack>

        <Box className="login-form-card p-6 md:p-7">
          <Box
            component="form"
            onSubmit={(event) => void handleSubmit(onSubmit)(event)}
            noValidate
          >
            <Stack spacing={2.5}>
              <FormTextField
                label="Email"
                value={invite.email}
                disabled
                onChange={() => undefined}
                startIcon={<EmailOutlinedIcon fontSize="small" />}
              />
              <FormTextField
                label="Role"
                value={invite.roleName}
                disabled
                onChange={() => undefined}
                startIcon={<BadgeOutlinedIcon fontSize="small" />}
                helperText={`Hierarchy level ${invite.hierarchyLevel}`}
              />
              <FormTextField
                name="username"
                control={control}
                label="Username"
                autoComplete="username"
                disabled={isDisabled}
                placeholder="Choose a username"
              />
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <FormPasswordField
                    label="Password"
                    autoComplete="new-password"
                    required
                    disabled={isDisabled}
                    placeholder="Create a password"
                    startIcon={<LockOutlinedIcon fontSize="small" />}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <FormPasswordField
                    label="Confirm password"
                    autoComplete="new-password"
                    required
                    disabled={isDisabled}
                    placeholder="Confirm your password"
                    startIcon={<LockOutlinedIcon fontSize="small" />}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              {acceptError && (
                <Alert severity="error" role="alert" aria-live="polite">
                  {acceptError}
                </Alert>
              )}

              <SubmitButton
                label="Create account"
                type="submit"
                loading={isAccepting}
                disabled={isDisabled}
              />
            </Stack>
          </Box>
        </Box>
      </Stack>
    </AuthShell>
  );
}

function LoadingState() {
  return (
    <Stack spacing={2} className="w-full max-w-md items-center py-8">
      <CircularProgress size={28} />
      <Typography variant="body2" color="text.secondary">
        Verifying invitation…
      </Typography>
    </Stack>
  );
}

function InviteAlert({ message }: { message: string }) {
  return (
    <Stack spacing={3} className="w-full max-w-md">
      <Typography variant="h3" component="h1" className="font-bold text-foreground">
        Unable to accept invitation
      </Typography>
      <Alert severity="error">{message}</Alert>
    </Stack>
  );
}

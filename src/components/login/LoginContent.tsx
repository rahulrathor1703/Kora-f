'use client';

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import AuthShell from '@/components/auth/AuthShell';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import {
  FormPasswordField,
  FormTextField,
  SubmitButton,
} from '@/components/ui';
import { env } from '@/config/env';
import { login } from '@/lib/api/auth';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const unauthorizedMessage =
    searchParams.get('error') === 'unauthorized'
      ? 'You do not have access to the platform console.'
      : null;
  const displayError = errorMessage ?? unauthorizedMessage;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState('loading');
    setErrorMessage(null);

    try {
      const response = await login(email, password);

      if (response.user.role === 'superadmin') {
        router.push('/platform/tenants');
        return;
      }

      if (response.user.role === 'admin') {
        const slug = response.user.organization?.slug;
        router.push(slug ? `/${slug}` : '/workspace');
        return;
      }

      setFormState('error');
      setErrorMessage('Your workspace is not available yet. Contact platform support.');
    } catch (error) {
      setFormState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to sign in',
      );
    }
  }

  const isDisabled = formState === 'loading';

  return (
    <AuthShell>
      <Stack spacing={4} className="w-full max-w-md">
        <Stack spacing={1.25}>
          <Typography
            variant="h3"
            component="h1"
            className="text-balance text-foreground"
            sx={{ fontWeight: 700, letterSpacing: '-0.03em' }}
          >
            Sign in to your workspace
          </Typography>
          <Typography
            variant="body1"
            className="max-w-sm text-pretty text-muted"
            sx={{ lineHeight: 1.65 }}
          >
            Use your organization email to access {env.brandName} tools and
            workflows.
          </Typography>
        </Stack>

        <Box className="login-form-card p-6 md:p-7">
          <Stack spacing={2.5}>
            <SocialAuthButtons
              mode="login"
              onNeedsSignup={(oauthSignupToken, signupEmail) => {
                const params = new URLSearchParams({
                  oauth: '1',
                  token: oauthSignupToken,
                  email: signupEmail,
                });
                router.push(`/signup?${params.toString()}`);
              }}
            />

            <Box
              component="form"
              onSubmit={(event) => void handleSubmit(event)}
              noValidate
            >
              <Stack spacing={2.5}>
              <FormTextField
                label="Work email"
                type="email"
                autoComplete="email"
                required
                value={email}
                disabled={isDisabled}
                onChange={(event) => setEmail(event.target.value)}
                startIcon={<EmailOutlinedIcon fontSize="small" />}
                placeholder="you@company.com"
              />
              <FormPasswordField
                label="Password"
                autoComplete="current-password"
                required
                value={password}
                disabled={isDisabled}
                onChange={(event) => setPassword(event.target.value)}
                startIcon={<LockOutlinedIcon fontSize="small" />}
                placeholder="Enter your password"
              />

              {(formState === 'error' || unauthorizedMessage) && displayError && (
                <Alert severity="error" role="alert" aria-live="polite">
                  {displayError}
                </Alert>
              )}

              <SubmitButton
                label="Sign in"
                type="submit"
                loading={formState === 'loading'}
              />
            </Stack>
          </Box>
          </Stack>
        </Box>

        <Typography variant="body2" className="text-muted">
          Don&apos;t have an account?{' '}
          <Link component={NextLink} href="/signup" underline="hover">
            Create one
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
}

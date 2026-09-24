'use client';

import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import AuthShell from '@/components/auth/AuthShell';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import {
  FormPasswordField,
  FormTextField,
  OtpInput,
  PasswordRequirements,
  SubmitButton,
} from '@/components/ui';
import {
  getOrganizationValidationError,
  isOrganizationSignupValid,
} from '@/lib/signup/organization-validation';
import { env } from '@/config/env';
import {
  resendSignupOtp,
  signupCompany,
  signupComplete,
  signupOAuthComplete,
  signupStart,
  slugifyOrganizationName,
  verifySignupOtp,
} from '@/lib/api/auth';
import { useSlugAvailability } from '@/hooks/useSlugAvailability';

type SignupStep = 'email' | 'company' | 'otp' | 'password';
type FormState = 'idle' | 'loading' | 'error';

const RESEND_COOLDOWN_SECONDS = 60;

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');

  if (!local || !domain) {
    return email;
  }

  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}

export default function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<SignupStep>(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    return searchParams.get('oauth') === '1' && token && emailParam
      ? 'company'
      : 'email';
  });
  const [signupToken, setSignupToken] = useState(() => searchParams.get('token') ?? '');
  const [isOAuthSignup, setIsOAuthSignup] = useState(
    () =>
      searchParams.get('oauth') === '1' &&
      Boolean(searchParams.get('token')) &&
      Boolean(searchParams.get('email')),
  );
  const [email, setEmail] = useState(() => searchParams.get('email') ?? '');
  const [companyName, setCompanyName] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const isDisabled = formState === 'loading';
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;
  const passwordMeetsRequirements =
    password.length >= 8 && passwordsMatch;
  const companySlug = slugifyOrganizationName(companyName);
  const { available: slugAvailable, isChecking: isCheckingSlug } =
    useSlugAvailability(companySlug);
  const organizationValidationError = useMemo(
    () => getOrganizationValidationError(companyName, companySlug),
    [companyName, companySlug],
  );
  const canSubmitStart =
    email.trim().length > 0 &&
    isOrganizationSignupValid(companyName) &&
    !isCheckingSlug;
  const canSubmitCompany =
    isOrganizationSignupValid(companyName) && !isCheckingSlug;

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  function handleOAuthNeedsSignup(oauthSignupToken: string, signupEmail: string) {
    setIsOAuthSignup(true);
    setSignupToken(oauthSignupToken);
    setEmail(signupEmail);
    setStep('company');
    setErrorMessage(null);
    setInfoMessage(null);
    setFormState('idle');
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmitStart) {
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedCompany = companyName.trim();

    setFormState('loading');
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const response = await signupStart(trimmedEmail);
      setSignupToken(response.signupToken);

      const companyResponse = await signupCompany(
        response.signupToken,
        trimmedCompany,
      );
      setEmail(companyResponse.email);
      setStep('otp');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setInfoMessage(
        `We sent a 6-digit code to ${maskEmail(companyResponse.email)}.`,
      );
      setFormState('idle');
    } catch (error) {
      setFormState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to continue sign-up',
      );
    }
  }

  async function handleCompanySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmitCompany) {
      return;
    }

    setFormState('loading');
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      if (isOAuthSignup) {
        const result = await signupOAuthComplete(
          signupToken,
          companyName.trim(),
        );
        router.push(`/${result.organization.slug}`);
        return;
      }

      const response = await signupCompany(signupToken, companyName.trim());
      setEmail(response.email);
      setStep('otp');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setInfoMessage(`We sent a 6-digit code to ${maskEmail(response.email)}.`);
      setFormState('idle');
    } catch (error) {
      setFormState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to continue sign-up',
      );
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState('loading');
    setErrorMessage(null);

    try {
      await verifySignupOtp(signupToken, otp);
      setStep('password');
      setInfoMessage(null);
      setFormState('idle');
    } catch (error) {
      setFormState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to verify code',
      );
    }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0) {
      return;
    }

    setFormState('loading');
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const response = await resendSignupOtp(signupToken);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setInfoMessage(`We sent a new code to ${maskEmail(response.email)}.`);
      setFormState('idle');
    } catch (error) {
      setFormState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to resend code',
      );
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match');
      setFormState('error');
      return;
    }

    setFormState('loading');
    setErrorMessage(null);

    try {
      const result = await signupComplete(signupToken, password, confirmPassword);
      router.push(`/${result.organization.slug}`);
    } catch (error) {
      setFormState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to create account',
      );
    }
  }

  function goBack() {
    setErrorMessage(null);
    setInfoMessage(null);
    setFormState('idle');

    if (step === 'company') {
      if (isOAuthSignup) {
        setIsOAuthSignup(false);
        setSignupToken('');
        setEmail('');
      }
      setStep('email');
      return;
    }

    if (step === 'otp') {
      setStep(isOAuthSignup ? 'company' : 'email');
      return;
    }

    if (step === 'password') {
      setStep('otp');
    }
  }

  const stepCopy = {
    email: {
      title: 'Start your organization workspace',
      subtitle: `Enter your work email and company name to create your ${env.brandName} workspace.`,
      highlight: 'We validate your workspace URL as you type so there are no surprises later.',
    },
    company: {
      title: 'What should we call your company?',
      subtitle: 'We’ll personalize your workspace and keep everything organized under one roof.',
      highlight: 'Most teams are up and running in under two minutes.',
    },
    otp: {
      title: 'Quick check — is this really you?',
      subtitle: `Enter the 6-digit code we sent to ${maskEmail(email)}. It keeps your account safe.`,
      highlight: 'Didn’t get it? Check spam, or resend a fresh code below.',
    },
    password: {
      title: 'You’re almost in',
      subtitle: 'Pick a password and your workspace opens immediately — no extra setup required.',
      highlight: 'Requirements update in real time as you type below.',
    },
  } as const;

  return (
    <AuthShell
      heroTitle="Your team’s command center, ready when you are."
      heroSubtitle="Spin up a secure workspace, invite your org, and ship with confidence — without the enterprise onboarding headache."
    >
      <Stack spacing={4} className="signup-panel w-full max-w-md">
        <Stack spacing={1.5}>
          <Typography
            variant="h3"
            component="h1"
            className="text-balance text-foreground"
            sx={{ fontWeight: 700, letterSpacing: '-0.03em' }}
          >
            {stepCopy[step].title}
          </Typography>
          <Typography
            variant="body1"
            className="max-w-sm text-pretty text-muted"
            sx={{ lineHeight: 1.65 }}
          >
            {stepCopy[step].subtitle}
          </Typography>
          <Typography
            variant="body2"
            className="signup-highlight max-w-sm text-pretty"
            sx={{ lineHeight: 1.6 }}
          >
            {stepCopy[step].highlight}
          </Typography>
        </Stack>

        <Box className="login-form-card p-6 md:p-7">
          <Box
            key={step}
            className="signup-step-content"
            sx={{ animation: 'signupStepIn 0.28s ease-out' }}
          >
            {step === 'email' && (
              <Stack spacing={2.5}>
                <SocialAuthButtons
                  mode="signup"
                  onNeedsSignup={handleOAuthNeedsSignup}
                />

                <Box
                  component="form"
                  onSubmit={(event) => void handleEmailSubmit(event)}
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

                  <FormTextField
                    label="Company name"
                    autoComplete="organization"
                    required
                    value={companyName}
                    disabled={isDisabled}
                    onChange={(event) => setCompanyName(event.target.value)}
                    startIcon={<BusinessOutlinedIcon fontSize="small" />}
                    placeholder="Acme Corporation"
                    error={Boolean(organizationValidationError)}
                    helperText={organizationValidationError ?? undefined}
                  />

                  {companyName.trim().length > 0 && !organizationValidationError ? (
                    <Alert
                      severity={
                        slugAvailable
                          ? 'success'
                          : slugAvailable === false
                            ? 'warning'
                            : 'info'
                      }
                    >
                      {isCheckingSlug
                        ? 'Checking workspace URL…'
                        : slugAvailable
                          ? `Your workspace URL will be /${companySlug}`
                          : slugAvailable === false
                            ? `/${companySlug} is taken — we'll assign a similar URL at signup`
                            : `Workspace URL preview: /${companySlug}`}
                    </Alert>
                  ) : null}

                  {formState === 'error' && errorMessage && (
                    <Alert severity="error" role="alert" aria-live="polite">
                      {errorMessage}
                    </Alert>
                  )}

                  <SubmitButton
                    label="Get started"
                    type="submit"
                    loading={formState === 'loading'}
                    disabled={!canSubmitStart}
                  />
                </Stack>
                </Box>
              </Stack>
            )}

            {step === 'company' && (
              <Box
                component="form"
                onSubmit={(event) => void handleCompanySubmit(event)}
                noValidate
              >
                <Stack spacing={2.5}>
                  <FormTextField
                    label="Company name"
                    autoComplete="organization"
                    required
                    value={companyName}
                    disabled={isDisabled}
                    onChange={(event) => setCompanyName(event.target.value)}
                    startIcon={<BusinessOutlinedIcon fontSize="small" />}
                    placeholder="Acme Corporation"
                    error={Boolean(organizationValidationError)}
                    helperText={organizationValidationError ?? undefined}
                  />

                  {companyName.trim().length > 0 && !organizationValidationError ? (
                    <Alert
                      severity={
                        slugAvailable
                          ? 'success'
                          : slugAvailable === false
                            ? 'warning'
                            : 'info'
                      }
                    >
                      {isCheckingSlug
                        ? 'Checking workspace URL…'
                        : slugAvailable
                          ? `Your workspace URL will be /${companySlug}`
                          : slugAvailable === false
                            ? `/${companySlug} is taken — we'll assign a similar URL at signup`
                            : `Workspace URL preview: /${companySlug}`}
                    </Alert>
                  ) : null}

                  {formState === 'error' && errorMessage && (
                    <Alert severity="error" role="alert" aria-live="polite">
                      {errorMessage}
                    </Alert>
                  )}

                  <SubmitButton
                    label="Set up my workspace"
                    type="submit"
                    loading={formState === 'loading'}
                    disabled={!canSubmitCompany}
                  />

                  <Button
                    type="button"
                    variant="text"
                    onClick={goBack}
                    disabled={isDisabled}
                    startIcon={<ArrowBackOutlinedIcon fontSize="small" />}
                    className="normal-case text-muted"
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Back
                  </Button>
                </Stack>
              </Box>
            )}

            {step === 'otp' && (
              <Box
                component="form"
                onSubmit={(event) => void handleOtpSubmit(event)}
                noValidate
              >
                <Stack spacing={2.5}>
                  <Box className="signup-otp-badge">
                    <MailOutlineOutlinedIcon fontSize="small" />
                  </Box>

                  <OtpInput value={otp} onChange={setOtp} disabled={isDisabled} />

                  {infoMessage && (
                    <Alert severity="info" aria-live="polite">
                      {infoMessage}
                    </Alert>
                  )}

                  {formState === 'error' && errorMessage && (
                    <Alert severity="error" role="alert" aria-live="polite">
                      {errorMessage}
                    </Alert>
                  )}

                  <SubmitButton
                    label="Verify and continue"
                    type="submit"
                    loading={formState === 'loading'}
                    disabled={otp.length < 6}
                  />

                  <Stack
                    direction="row"
                    sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Button
                      type="button"
                      variant="text"
                      onClick={goBack}
                      disabled={isDisabled}
                      startIcon={<ArrowBackOutlinedIcon fontSize="small" />}
                      className="normal-case text-muted"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => void handleResendOtp()}
                      disabled={isDisabled || resendCooldown > 0}
                      className="normal-case font-semibold text-primary"
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend code'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}

            {step === 'password' && (
              <Box
                component="form"
                onSubmit={(event) => void handlePasswordSubmit(event)}
                noValidate
              >
                <Stack spacing={2.5}>
                  <FormPasswordField
                    label="Password"
                    autoComplete="new-password"
                    required
                    value={password}
                    disabled={isDisabled}
                    onChange={(event) => setPassword(event.target.value)}
                    startIcon={<LockOutlinedIcon fontSize="small" />}
                    placeholder="At least 8 characters"
                  />
                  <FormPasswordField
                    label="Confirm password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    disabled={isDisabled}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    startIcon={<LockOutlinedIcon fontSize="small" />}
                    placeholder="Re-enter your password"
                    error={passwordMismatch}
                    helperText={
                      passwordMismatch ? 'Passwords do not match' : undefined
                    }
                  />

                  <PasswordRequirements
                    password={password}
                    confirmPassword={confirmPassword}
                  />

                  {formState === 'error' && errorMessage && (
                    <Alert severity="error" role="alert" aria-live="polite">
                      {errorMessage}
                    </Alert>
                  )}

                  <SubmitButton
                    label="Open my workspace"
                    type="submit"
                    loading={formState === 'loading'}
                    disabled={!passwordMeetsRequirements}
                  />

                  <Button
                    type="button"
                    variant="text"
                    onClick={goBack}
                    disabled={isDisabled}
                    startIcon={<ArrowBackOutlinedIcon fontSize="small" />}
                    className="normal-case text-muted"
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Back
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </Box>

        <Typography variant="body2" className="text-muted">
          Already have an account?{' '}
          <Link component={NextLink} href="/login" underline="hover">
            Sign in
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
}

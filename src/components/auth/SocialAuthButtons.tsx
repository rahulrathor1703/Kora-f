'use client';

import AppleIcon from '@mui/icons-material/Apple';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import GoogleBrandIcon from '@/components/auth/GoogleBrandIcon';
import SocialOAuthButton from '@/components/auth/SocialOAuthButton';
import { useAuthOAuthConfig } from '@/contexts/AuthOAuthConfigContext';
import {
  oauthLoginApple,
  oauthLoginGoogle,
  type OAuthAuthResponse,
  type OAuthLoginResponse,
} from '@/lib/api/auth';
import { signInWithApple } from '@/lib/auth/apple-sign-in';
import { redirectAfterAuth } from '@/lib/auth/redirect';

interface SocialAuthButtonsProps {
  mode: 'login' | 'signup';
  onNeedsSignup: (oauthSignupToken: string, email: string) => void;
}

function isOAuthLoginResponse(
  response: OAuthAuthResponse,
): response is OAuthLoginResponse {
  return 'user' in response;
}

export default function SocialAuthButtons({
  mode,
  onNeedsSignup,
}: SocialAuthButtonsProps) {
  const router = useRouter();
  const googleLoginRef = useRef<HTMLDivElement>(null);
  const { config, isLoading } = useAuthOAuthConfig();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(
    null,
  );

  const googleEnabled = config.google.enabled && Boolean(config.google.clientId);
  const appleEnabled = config.apple.enabled && Boolean(config.apple.clientId);
  const showSocial = googleEnabled || appleEnabled;

  async function handleOAuthSuccess(
    provider: 'google' | 'apple',
    idToken: string,
  ) {
    setLoadingProvider(provider);
    setErrorMessage(null);

    try {
      const response =
        provider === 'google'
          ? await oauthLoginGoogle(idToken)
          : await oauthLoginApple(idToken);

      if (!isOAuthLoginResponse(response)) {
        onNeedsSignup(response.oauthSignupToken, response.email);
        return;
      }

      redirectAfterAuth(response.user, router);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : `Unable to sign in with ${provider === 'google' ? 'Google' : 'Apple'}`,
      );
    } finally {
      setLoadingProvider(null);
    }
  }

  function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      setErrorMessage('Google sign-in did not return an identity token.');
      return;
    }

    void handleOAuthSuccess('google', idToken);
  }

  function triggerGoogleLogin() {
    if (loadingProvider !== null) {
      return;
    }

    const googleButton = googleLoginRef.current?.querySelector(
      '[role="button"]',
    ) as HTMLElement | null;

    googleButton?.click();
  }

  async function handleAppleSignIn() {
    if (!config.apple.clientId || loadingProvider !== null) {
      return;
    }

    await handleOAuthSuccess(
      'apple',
      await signInWithApple(config.apple.clientId),
    );
  }

  if (isLoading || !showSocial) {
    return null;
  }

  const actionLabel = mode === 'login' ? 'Sign in' : 'Sign up';

  return (
    <Stack spacing={2}>
      <Stack spacing={1.25}>
        {googleEnabled && (
          <>
            <SocialOAuthButton
              provider="google"
              label={`${actionLabel} with Google`}
              icon={<GoogleBrandIcon sx={{ fontSize: 20 }} />}
              loading={loadingProvider === 'google'}
              disabled={loadingProvider !== null && loadingProvider !== 'google'}
              onClick={triggerGoogleLogin}
            />

            <Box
              ref={googleLoginRef}
              aria-hidden="true"
              sx={{
                position: 'absolute',
                width: 1,
                height: 1,
                overflow: 'hidden',
                clip: 'rect(0 0 0 0)',
                clipPath: 'inset(50%)',
                whiteSpace: 'nowrap',
              }}
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setErrorMessage('Google sign-in was cancelled or failed.');
                }}
                theme="outline"
                size="large"
                text={mode === 'login' ? 'signin_with' : 'signup_with'}
                shape="rectangular"
              />
            </Box>
          </>
        )}

        {appleEnabled && (
          <SocialOAuthButton
            provider="apple"
            label={`${actionLabel} with Apple`}
            icon={<AppleIcon sx={{ fontSize: 20 }} />}
            loading={loadingProvider === 'apple'}
            disabled={loadingProvider !== null && loadingProvider !== 'apple'}
            onClick={() => void handleAppleSignIn()}
          />
        )}
      </Stack>

      {errorMessage && (
        <Alert severity="error" role="alert" aria-live="polite">
          {errorMessage}
        </Alert>
      )}

      <Box className="flex items-center gap-3">
        <Divider className="flex-1" />
        <Typography variant="body2" className="text-muted">
          or continue with email
        </Typography>
        <Divider className="flex-1" />
      </Box>
    </Stack>
  );
}

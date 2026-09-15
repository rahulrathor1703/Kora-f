'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import PlatformPageHeader from '@/components/platform/PlatformPageHeader';
import { FormTextField, SubmitButton } from '@/components/ui';
import { usePlatformAuthOAuthProviders } from '@/hooks/usePlatformAuthOAuthProviders';
import type { PlatformAuthOAuthProvider } from '@/lib/api/platform';

type ProviderKey = 'google' | 'apple';

const providerMeta: Record<
  ProviderKey,
  { title: string; description: string; placeholder: string }
> = {
  google: {
    title: 'Google',
    description:
      'Use a Google Cloud OAuth Web client for Sign in with Google on login and signup.',
    placeholder: '1234567890-abcdef.apps.googleusercontent.com',
  },
  apple: {
    title: 'Apple',
    description:
      'Use an Apple Services ID configured for Sign in with Apple on the web.',
    placeholder: 'com.markos.web',
  },
};

function buildDraft(
  providers: PlatformAuthOAuthProvider[],
): Record<ProviderKey, PlatformAuthOAuthProvider> {
  const google =
    providers.find((provider) => provider.provider === 'google') ?? {
      provider: 'google',
      enabled: false,
      clientId: null,
      updatedAt: new Date(0).toISOString(),
    };
  const apple =
    providers.find((provider) => provider.provider === 'apple') ?? {
      provider: 'apple',
      enabled: false,
      clientId: null,
      updatedAt: new Date(0).toISOString(),
    };

  return { google, apple };
}

export default function PlatformAuthOAuthContent() {
  const { providers, isLoading, error, saveProvider, isSaving } =
    usePlatformAuthOAuthProviders();
  const [draft, setDraft] = useState<Record<
    ProviderKey,
    PlatformAuthOAuthProvider
  > | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayProviders =
    draft ?? (providers ? buildDraft(providers) : null);

  async function handleSave(provider: ProviderKey) {
    if (!displayProviders) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await saveProvider(provider, {
        enabled: displayProviders[provider].enabled,
        clientId: displayProviders[provider].clientId,
      });
      setDraft(null);
      setSuccessMessage(`${providerMeta[provider].title} settings saved.`);
    } catch (saveError) {
      setErrorMessage(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save OAuth settings.',
      );
    }
  }

  return (
    <Box className="platform-chrome dashboard-chrome-x w-full">
      <Stack spacing={3}>
        <PlatformPageHeader
          overline="Platform administration"
          title="Sign-in OAuth"
          description="Configure platform-wide Google and Apple sign-in for login and signup. Tenants do not need their own client IDs."
        />

        {(errorMessage || error) && (
          <Alert severity="error" role="alert">
            {errorMessage ?? error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" role="status">
            {successMessage}
          </Alert>
        )}

        {displayProviders &&
          (Object.keys(providerMeta) as ProviderKey[]).map((provider) => (
            <Card key={provider} variant="outlined">
              <CardContent>
                <Stack spacing={2.5}>
                  <Stack spacing={0.75}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {providerMeta[provider].title}
                    </Typography>
                    <Typography variant="body2" className="text-muted">
                      {providerMeta[provider].description}
                    </Typography>
                  </Stack>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={displayProviders[provider].enabled}
                        onChange={(event) =>
                          setDraft((current) => {
                            const base =
                              current ??
                              (providers ? buildDraft(providers) : null);
                            if (!base) {
                              return current;
                            }

                            return {
                              ...base,
                              [provider]: {
                                ...base[provider],
                                enabled: event.target.checked,
                              },
                            };
                          })
                        }
                      />
                    }
                    label="Enabled on login and signup"
                  />

                  <FormTextField
                    label="Client ID"
                    value={displayProviders[provider].clientId ?? ''}
                    onChange={(event) =>
                      setDraft((current) => {
                        const base =
                          current ?? (providers ? buildDraft(providers) : null);
                        if (!base) {
                          return current;
                        }

                        return {
                          ...base,
                          [provider]: {
                            ...base[provider],
                            clientId: event.target.value,
                          },
                        };
                      })
                    }
                    placeholder={providerMeta[provider].placeholder}
                    disabled={isLoading || isSaving}
                  />

                  <Box>
                    <SubmitButton
                      label={`Save ${providerMeta[provider].title}`}
                      onClick={() => void handleSave(provider)}
                      loading={isSaving}
                      disabled={isLoading}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
      </Stack>
    </Box>
  );
}

'use client';

import Link from 'next/link';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useState } from 'react';
import { PageContainer, SubmitButton, ThemeToggle } from '@/components/ui';
import { fetchHealth, type HealthResponse } from '@/lib/api/health';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

interface LandingContentProps {
  initialHealth: HealthResponse | null;
}

export default function LandingContent({ initialHealth }: LandingContentProps) {
  const [loadState, setLoadState] = useState<LoadState>(
    initialHealth ? 'ready' : 'idle',
  );
  const [health, setHealth] = useState<HealthResponse | null>(initialHealth);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialHealth ? null : 'Backend unavailable at startup',
  );

  const loadHealth = useCallback(async () => {
    setLoadState('loading');
    setErrorMessage(null);

    try {
      const data = await fetchHealth();
      setHealth(data);
      setLoadState('ready');
    } catch (error) {
      setHealth(null);
      setLoadState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to reach backend',
      );
    }
  }, []);

  const statusClass =
    health?.status === 'ok'
      ? 'status-ok'
      : health?.status === 'degraded'
        ? 'status-degraded'
        : 'status-error';

  return (
    <Box className="app-mesh flex min-h-full flex-1 flex-col">
      <Box
        component="header"
        className="flex items-center justify-between px-6 py-4 md:px-10"
      >
        <Link
          href="/login"
          className="text-sm font-semibold text-primary transition-opacity hover:opacity-80"
        >
          Sign in
        </Link>
        <ThemeToggle />
      </Box>

      <PageContainer className="flex flex-1 flex-col justify-center py-16">
        <Stack spacing={4}>
          <Stack spacing={1.5}>
            <Chip
              label="Markos Platform"
              size="small"
              className="w-fit bg-primary-soft font-semibold text-primary"
            />
            <Typography
              variant="h2"
              component="h1"
              className="max-w-2xl text-balance text-foreground"
              sx={{ fontSize: { xs: '2rem', md: '2.75rem' } }}
            >
              Production-grade scaffold, ready for what comes next.
            </Typography>
            <Typography
              variant="body1"
              className="max-w-xl text-pretty text-muted"
              sx={{ fontSize: '1.0625rem', lineHeight: 1.7 }}
            >
              Next.js, MUI, and Tailwind — wired to a NestJS backend with strict
              quality gates and layered architecture.
            </Typography>
          </Stack>

          <Box className="surface-panel max-w-lg p-6">
            <Stack spacing={2}>
              <Typography
                variant="subtitle2"
                className="text-muted uppercase tracking-wider"
              >
                System health
              </Typography>

              {loadState === 'loading' && (
                <Typography variant="body2" className="text-muted">
                  Checking backend connection…
                </Typography>
              )}

              {loadState === 'idle' && (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <ErrorOutlinedIcon className="status-degraded" fontSize="small" />
                  <Typography variant="body2" className="status-degraded">
                    {errorMessage}
                  </Typography>
                </Stack>
              )}

              {loadState === 'error' && (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <ErrorOutlinedIcon className="status-error" fontSize="small" />
                  <Typography variant="body2" className="status-error">
                    {errorMessage}
                  </Typography>
                </Stack>
              )}

              {loadState === 'ready' && health && (
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <CheckCircleOutlinedIcon
                      className={statusClass}
                      fontSize="small"
                    />
                    <Typography
                      variant="body1"
                      className={statusClass}
                      sx={{ fontWeight: 600 }}
                    >
                      {health.service} — {health.status}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" className="text-muted">
                    Database: {health.checks.database}
                  </Typography>
                  <Typography variant="caption" className="text-muted">
                    {health.timestamp}
                  </Typography>
                </Stack>
              )}

              <SubmitButton
                label="Refresh health"
                loading={loadState === 'loading'}
                onClick={() => void loadHealth()}
              />
            </Stack>
          </Box>
        </Stack>
      </PageContainer>
    </Box>
  );
}

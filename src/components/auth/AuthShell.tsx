'use client';

import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/ui';
import { env } from '@/config/env';
import { getLoginHeroImageFromEnv } from '@/theme/brandEnv';

const heroImage = getLoginHeroImageFromEnv();

const defaultTrustPoints = [
  { icon: ShieldOutlinedIcon, label: 'Enterprise-grade security' },
  { icon: VerifiedUserOutlinedIcon, label: 'Organization-managed access' },
  { icon: SpeedOutlinedIcon, label: 'Fast, reliable sign-in' },
] as const;

interface AuthShellProps {
  children: ReactNode;
  heroTitle?: string;
  heroSubtitle?: string;
}

export default function AuthShell({
  children,
  heroTitle = 'Built for teams that ship with confidence.',
  heroSubtitle = 'Secure access to your B2B platform tools and workflows.',
}: AuthShellProps) {
  return (
    <Box className="login-shell flex min-h-full flex-1">
      <Box className="login-form-panel relative flex w-full flex-col lg:w-[48%]">
        <Box className="login-form-accent" aria-hidden="true" />

        <Box
          component="header"
          className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10"
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box className="login-brand-mark" aria-hidden="true">
              {env.brandName.charAt(0)}
            </Box>
            <Typography
              variant="h6"
              component="p"
              className="font-semibold tracking-tight text-foreground"
            >
              {env.brandName}
            </Typography>
          </Stack>
          <ThemeToggle />
        </Box>

        <Box className="relative z-10 flex flex-1 items-center px-6 pb-12 md:px-10 lg:px-14">
          {children}
        </Box>
      </Box>

      <Box
        aria-hidden="true"
        className="login-hero-panel relative hidden flex-1 overflow-hidden lg:block"
      >
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="52vw"
        />
        <Box className="login-hero-overlay absolute inset-0" />
        <Box className="login-hero-content absolute inset-0 flex flex-col justify-end p-10 xl:p-14">
          <Stack spacing={3} className="max-w-md">
            <Typography
              variant="h4"
              component="p"
              className="text-balance text-white"
              sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              {heroTitle}
            </Typography>
            <Typography variant="body2" className="text-white/80">
              {heroSubtitle}
            </Typography>
            <Stack spacing={1.5} className="pt-2">
              {defaultTrustPoints.map(({ icon: Icon, label }) => (
                <Stack
                  key={label}
                  direction="row"
                  spacing={1.25}
                  sx={{ alignItems: 'center' }}
                >
                  <Box className="login-trust-icon">
                    <Icon sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography variant="body2" className="text-white/90">
                    {label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

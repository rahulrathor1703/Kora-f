'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface MailboxFormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export default function MailboxFormSection({
  title,
  description,
  children,
}: MailboxFormSectionProps) {
  return (
    <Box component="section" className="mailbox-form-section">
      {title || description ? (
        <Stack spacing={0.5} className="mb-3">
          {title ? (
            <Typography variant="subtitle2" className="font-bold tracking-tight">
              {title}
            </Typography>
          ) : null}
          {description ? (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          ) : null}
        </Stack>
      ) : null}
      <Stack spacing={2.5}>{children}</Stack>
    </Box>
  );
}

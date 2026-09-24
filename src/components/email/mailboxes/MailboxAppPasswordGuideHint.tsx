'use client';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MAILBOX_APP_PASSWORD_GUIDES } from '@/lib/email/mailbox-app-password-guides';
import type { MailboxProvider } from '@/lib/email/mailbox-types';

interface MailboxAppPasswordGuideHintProps {
  provider: Extract<MailboxProvider, 'gmail' | 'outlook'>;
}

export default function MailboxAppPasswordGuideHint({
  provider,
}: MailboxAppPasswordGuideHintProps) {
  const guide = MAILBOX_APP_PASSWORD_GUIDES[provider];

  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ alignItems: 'center', flexShrink: 0 }}
    >
      <Typography variant="caption" color="text.secondary">
        How to get app password
      </Typography>
      <IconButton
        size="small"
        aria-label={guide.ariaLabel}
        onClick={() => window.open(guide.url, '_blank', 'noopener,noreferrer')}
        className="p-0.5 text-muted"
      >
        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Stack>
  );
}

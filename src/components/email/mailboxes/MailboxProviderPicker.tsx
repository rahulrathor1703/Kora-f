'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MailboxProviderLogo from '@/components/email/mailboxes/MailboxProviderLogo';
import {
  MAILBOX_PROVIDER_OPTIONS,
  type MailboxProviderOption,
} from '@/lib/email/mailbox-providers';
import type { MailboxProvider } from '@/lib/email/mailbox-types';

interface MailboxProviderPickerProps {
  value: MailboxProvider;
  onChange: (provider: MailboxProvider) => void;
  disabled?: boolean;
}

function ProviderCard({
  option,
  selected,
  disabled,
  onSelect,
}: {
  option: MailboxProviderOption;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={option.label}
      className={`mailbox-provider-card${selected ? ' mailbox-provider-card-selected' : ''}`}
    >
      <Box className="mailbox-provider-logo">
        <MailboxProviderLogo provider={option.id} className="mailbox-provider-logo-svg" />
      </Box>
      <Typography variant="subtitle2" className="text-center font-bold">
        {option.label}
      </Typography>
    </Box>
  );
}

export default function MailboxProviderPicker({
  value,
  onChange,
  disabled = false,
}: MailboxProviderPickerProps) {
  return (
    <Box
      role="radiogroup"
      aria-label="Mailbox provider"
      className="mailbox-provider-grid"
    >
      {MAILBOX_PROVIDER_OPTIONS.map((option) => (
        <ProviderCard
          key={option.id}
          option={option}
          selected={value === option.id}
          disabled={disabled}
          onSelect={() => onChange(option.id)}
        />
      ))}
    </Box>
  );
}

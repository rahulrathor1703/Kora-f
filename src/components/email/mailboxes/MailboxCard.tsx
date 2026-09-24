'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MailboxDeliverabilityBadge from '@/components/email/mailboxes/MailboxDeliverabilityBadge';
import MailboxProviderLogo from '@/components/email/mailboxes/MailboxProviderLogo';
import MailboxSpamRateDisplay from '@/components/email/mailboxes/MailboxSpamRateDisplay';
import MailboxTestConnectionButton from '@/components/email/mailboxes/MailboxTestConnectionButton';
import { deliverabilityItems } from '@/lib/email/mailbox-deliverability-config';
import { getMailboxDeliverability } from '@/lib/email/mailbox-deliverability';
import type { SenderMailbox } from '@/lib/email/mailbox-types';

interface MailboxCardProps {
  mailbox: SenderMailbox;
  onViewDetails: (mailbox: SenderMailbox) => void;
  onTestConnection?: (mailbox: SenderMailbox) => void;
  canTestConnection?: boolean;
  isTestConnectionPassed?: (mailbox: SenderMailbox) => boolean;
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (mailbox: SenderMailbox) => void;
}

export default function MailboxCard({
  mailbox,
  onViewDetails,
  onTestConnection,
  canTestConnection = false,
  isTestConnectionPassed,
  selectMode = false,
  isSelected = false,
  onToggleSelect,
}: MailboxCardProps) {
  const deliverability = getMailboxDeliverability(mailbox);
  const deliverabilityChecks = {
    spf: deliverability.spfEnabled,
    dkim: deliverability.dkimEnabled,
    dmarc: deliverability.dmarcEnabled,
  };
  const testPassed = isTestConnectionPassed?.(mailbox) ?? false;

  function handleCardClick() {
    if (selectMode) {
      onToggleSelect?.(mailbox);
      return;
    }

    onViewDetails(mailbox);
  }

  return (
    <Card
      className={[
        'mailbox-card dashboard-panel shadow-none',
        selectMode && isSelected ? 'mailbox-card-selected' : '',
        selectMode ? 'mailbox-card-select-mode' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CardActionArea
        onClick={handleCardClick}
        className="rounded-[inherit]"
        disableRipple
        aria-selected={selectMode ? isSelected : undefined}
      >
        <CardContent className="mailbox-card-inner">
          {selectMode ? (
            <Box
              className="mailbox-card-select-checkbox"
              onClick={(event) => event.stopPropagation()}
            >
              <Checkbox
                checked={isSelected}
                onChange={() => onToggleSelect?.(mailbox)}
                size="small"
                slotProps={{ input: { 'aria-label': `Select ${mailbox.email}` } }}
              />
            </Box>
          ) : null}

          <Box className="mailbox-card-header">
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', minWidth: 0, flex: 1, pr: 0.5 }}
            >
              <Box className="mailbox-card-logo">
                <MailboxProviderLogo provider={mailbox.provider} className="h-4 w-4" />
              </Box>
              <Box className="min-w-0">
                <Typography variant="subtitle1" className="mailbox-card-name">
                  {mailbox.displayName}
                </Typography>
                <Typography variant="body2" className="mailbox-card-email">
                  {mailbox.email}
                </Typography>
              </Box>
            </Stack>

            <Box onClick={(event) => event.stopPropagation()}>
              <MailboxSpamRateDisplay score={deliverability.spamScore} variant="gauge" />
            </Box>
          </Box>

          <Box className="mailbox-deliverability-row mailbox-deliverability-row-readonly">
            {deliverabilityItems.map((item) => (
              <MailboxDeliverabilityBadge
                key={item.key}
                item={item}
                enabled={deliverabilityChecks[item.key]}
              />
            ))}
          </Box>

          {canTestConnection && !selectMode ? (
            <Box className="mt-3 px-[0.85rem] pb-[0.85rem]" onClick={(event) => event.stopPropagation()}>
              <MailboxTestConnectionButton
                passed={testPassed}
                fullWidth
                onClick={() => onTestConnection?.(mailbox)}
              />
            </Box>
          ) : null}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

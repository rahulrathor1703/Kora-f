'use client';

import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  deliverabilityItems,
  type DeliverabilityKey,
} from '@/lib/email/mailbox-deliverability-config';

interface MailboxDeliverabilityPanelProps {
  checks: Record<DeliverabilityKey, boolean>;
}

export default function MailboxDeliverabilityPanel({
  checks,
}: MailboxDeliverabilityPanelProps) {
  const passingCount = deliverabilityItems.filter((item) => checks[item.key]).length;
  const allPassing = passingCount === deliverabilityItems.length;

  return (
    <Stack spacing={2.5} className="h-full min-h-0">
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Box className="min-w-0">
          <Typography variant="subtitle1" className="font-bold">
            Deliverability signals
          </Typography>
          <Typography variant="caption" color="text.secondary" className="mt-0.5 block">
            Authentication health from mailbox connection signals
          </Typography>
        </Box>
        <Chip
          label={`${passingCount}/${deliverabilityItems.length}`}
          size="small"
          className={`mailbox-deliverability-summary-chip shrink-0 rounded-lg font-semibold ${allPassing ? 'mailbox-deliverability-summary-chip-pass' : 'mailbox-deliverability-summary-chip-mixed'}`}
        />
      </Stack>

      <Box className="mailbox-deliverability-checklist mailbox-deliverability-checklist-fill min-h-0 flex-1">
        {deliverabilityItems.map((item, index) => {
          const enabled = checks[item.key];
          const isLast = index === deliverabilityItems.length - 1;

          return (
            <Box
              key={item.key}
              aria-label={`${item.label} ${enabled ? 'passing' : 'failing'}`}
              className={`mailbox-deliverability-check-row mailbox-deliverability-check-row-readonly ${enabled ? 'mailbox-deliverability-check-row-pass' : 'mailbox-deliverability-check-row-fail'} ${isLast ? 'mailbox-deliverability-check-row-last' : ''}`}
            >
              <Box
                className={`mailbox-deliverability-check-icon ${enabled ? 'mailbox-deliverability-check-icon-pass' : 'mailbox-deliverability-check-icon-fail'}`}
                aria-hidden="true"
              >
                {enabled ? (
                  <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                ) : (
                  <HighlightOffOutlinedIcon sx={{ fontSize: 20 }} />
                )}
              </Box>

              <Box className="mailbox-deliverability-check-copy min-w-0 flex-1">
                <Typography variant="body2" className="font-semibold leading-tight">
                  {item.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" className="mt-0.5 block leading-snug">
                  {item.fullName}
                </Typography>
              </Box>

              <Chip
                label={enabled ? 'Passing' : 'Missing'}
                size="small"
                className={`mailbox-deliverability-status-chip shrink-0 rounded-md font-semibold normal-case ${enabled ? 'mailbox-deliverability-status-chip-pass' : 'mailbox-deliverability-status-chip-fail'}`}
              />
            </Box>
          );
        })}
      </Box>

      <Typography variant="caption" color="text.secondary" className="leading-relaxed">
        These indicators are set when the mailbox is connected and cannot be changed manually.
      </Typography>
    </Stack>
  );
}

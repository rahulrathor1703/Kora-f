'use client';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { DomainDnsCheckResult } from '@/lib/email/mailbox-types';
import { deliverabilityItems } from '@/lib/email/mailbox-deliverability-config';

interface DomainDnsStatusPanelProps {
  domain: string;
  result: DomainDnsCheckResult | null;
  isLoading: boolean;
  error: string | null;
}

function getRecordStatus(
  result: DomainDnsCheckResult | null,
  key: 'spf' | 'dkim' | 'dmarc',
): boolean | null {
  if (!result) {
    return null;
  }

  return result[key];
}

export default function DomainDnsStatusPanel({
  domain,
  result,
  isLoading,
  error,
}: DomainDnsStatusPanelProps) {
  return (
    <Box className="mailbox-form-callout">
      <Stack spacing={1.5}>
        <Stack spacing={0.25}>
          <Typography variant="body2" className="font-semibold">
            Domain DNS records
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Live check for {domain} via Google Public DNS. These results are
            read-only.
          </Typography>
        </Stack>

        {isLoading ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              Checking SPF, DKIM, and DMARC…
            </Typography>
          </Stack>
        ) : null}

        {!isLoading && error ? (
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        ) : null}

        {!isLoading && !error ? (
          <Box className="mailbox-deliverability-row mailbox-deliverability-row-readonly">
            {deliverabilityItems.map((item) => {
              const status = getRecordStatus(result, item.key);
              const enabled = status === true;

              return (
                <Box key={item.key} className="mailbox-deliverability-tile">
                  <Tooltip title={item.fullName} placement="top" arrow>
                    <span
                      aria-label={`${item.label} ${enabled ? 'configured' : 'missing'}`}
                      className={`mailbox-deliverability-status mailbox-deliverability-status-readonly ${enabled ? 'mailbox-deliverability-status-pass' : 'mailbox-deliverability-status-fail'}`}
                    >
                      {enabled ? (
                        <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <CancelOutlinedIcon sx={{ fontSize: 16 }} />
                      )}
                    </span>
                  </Tooltip>
                  <Tooltip title={item.fullName} placement="top" arrow>
                    <span className="mailbox-deliverability-label">{item.label}</span>
                  </Tooltip>
                </Box>
              );
            })}
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
}

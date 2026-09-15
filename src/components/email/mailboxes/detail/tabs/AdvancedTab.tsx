'use client';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import MailboxConnectionDetails from '@/components/email/mailboxes/MailboxConnectionDetails';
import {
  getDnsSetupGuides,
  type DnsSetupGuide,
} from '@/lib/email/mailbox-dns-setup-guides';
import type { DeliverabilityKey } from '@/lib/email/mailbox-deliverability-config';
import type { SenderMailboxDetail } from '@/lib/email/mailbox-types';

interface AdvancedTabProps {
  mailbox: SenderMailboxDetail;
}

function SetupSteps({ guide }: { guide: DnsSetupGuide }) {
  return (
    <Stack spacing={2}>
      {guide.steps.map((step, index) => (
        <Stack key={step.title} direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Box
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
          >
            {index + 1}
          </Box>
          <Box className="min-w-0 flex-1">
            <Typography variant="body2" className="font-semibold">
              {step.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-0.5">
              {step.description}
            </Typography>
          </Box>
        </Stack>
      ))}

      {guide.learnMoreUrl ? (
        <Link
          href={guide.learnMoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 self-start text-sm font-medium no-underline"
        >
          Official documentation
          <OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />
        </Link>
      ) : null}
    </Stack>
  );
}

export default function AdvancedTab({ mailbox }: AdvancedTabProps) {
  const guides = getDnsSetupGuides(mailbox);
  const [selectedKey, setSelectedKey] = useState<DeliverabilityKey>('spf');
  const [expanded, setExpanded] = useState(false);
  const selectedGuide = guides.find((guide) => guide.key === selectedKey) ?? guides[0];

  function handleChipClick(key: DeliverabilityKey) {
    setSelectedKey(key);
  }

  return (
    <Stack spacing={3}>
      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="p-6">
          <Stack spacing={2.5}>
            <Typography variant="h6" className="font-bold">
              Connection settings
            </Typography>
            <MailboxConnectionDetails mailbox={mailbox} showIntro={false} />
          </Stack>
        </CardContent>
      </Card>

      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="p-6">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" className="font-bold">
                How to setup
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                Configure DNS authentication records for {mailbox.email.split('@')[1]} to
                improve deliverability. Choose a record type below to see setup steps.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} className="flex-wrap">
              {guides.map((guide) => {
                const selected = selectedKey === guide.key;

                return (
                  <Chip
                    key={guide.key}
                    label={guide.label}
                    clickable
                    onClick={() => handleChipClick(guide.key)}
                    aria-pressed={selected}
                    aria-label={`${guide.label} setup steps`}
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    className="rounded-lg font-semibold"
                  />
                );
              })}
            </Stack>

            {selectedGuide ? (
              <Accordion
                expanded={expanded}
                onChange={(_event, isExpanded) => setExpanded(isExpanded)}
                disableGutters
                className="dashboard-panel rounded-2xl shadow-none before:hidden"
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${selectedGuide.key}-setup-content`}
                  id={`${selectedGuide.key}-setup-header`}
                >
                  <Stack spacing={0.25}>
                    <Typography variant="subtitle2" className="font-bold">
                      {selectedGuide.label} — {selectedGuide.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedGuide.summary}
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails className="px-4 pb-4 md:px-6 md:pb-6">
                  <SetupSteps guide={selectedGuide} />
                </AccordionDetails>
              </Accordion>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

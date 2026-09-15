'use client';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { renderSanitizedEmailPreview } from '@/components/email/campaigns/create/sequence/RichTextEmailEditor';
import { getPlainTextFromHtml } from '@/lib/email/campaigns/email-body-html';
import type { SequenceStepPreview } from '@/lib/email/campaigns/sequence-preview-utils';

const BODY_PREVIEW_LENGTH = 200;

interface SequenceStepReadOnlyProps {
  step: SequenceStepPreview;
}

function formatDelayLabel(step: SequenceStepPreview): string {
  if (step.stepOrder === 1) {
    return 'Day 0';
  }

  if (step.delayMode === 'absolute' && step.scheduledDate) {
    return DateTime.fromISO(step.scheduledDate).toFormat('MMM d, yyyy');
  }

  return `+${step.delayDays}d`;
}

export default function SequenceStepReadOnly({ step }: SequenceStepReadOnlyProps) {
  const [expanded, setExpanded] = useState(false);
  const isInitial = step.stepOrder === 1;
  const delayLabel = formatDelayLabel(step);
  const plainBody = getPlainTextFromHtml(step.body);
  const isLongBody = plainBody.length > BODY_PREVIEW_LENGTH;
  const previewHtml = useMemo(
    () => renderSanitizedEmailPreview(step.body),
    [step.body],
  );

  return (
    <Box className="rounded-2xl border border-surface-border bg-surface p-4 md:p-5">
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}
      >
        <Typography variant="subtitle1" component="h3" className="font-bold tracking-tight text-foreground">
          Step {step.stepOrder}
          {isInitial ? ' — Initial Outreach' : ' — Follow-up'}
        </Typography>
        <Chip
          label={delayLabel}
          size="small"
          variant="outlined"
          className="rounded-lg font-medium text-foreground"
        />
      </Stack>

      <Stack spacing={1.5}>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            className="font-semibold uppercase tracking-[0.06em] text-foreground/55"
          >
            Subject
          </Typography>
          <Typography variant="body2" className="mt-1 font-medium text-foreground">
            {step.subject || '—'}
          </Typography>
        </Box>

        <Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              className="font-semibold uppercase tracking-[0.06em] text-foreground/55"
            >
              Body
            </Typography>
            {isLongBody ? (
              <IconButton
                size="small"
                aria-label={expanded ? 'Collapse body' : 'Expand body'}
                aria-expanded={expanded}
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </IconButton>
            ) : null}
          </Stack>
          {isLongBody && !expanded ? (
            <Typography variant="body2" color="text.secondary" className="mt-0.5">
              {`${plainBody.slice(0, BODY_PREVIEW_LENGTH).trim()}…`}
            </Typography>
          ) : (
            <Box
              className="email-body-content mt-0.5 max-w-none text-text-secondary"
              dangerouslySetInnerHTML={{ __html: previewHtml || '—' }}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
}

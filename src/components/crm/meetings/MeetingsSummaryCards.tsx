'use client';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MEETING_SUMMARY_LABELS } from '@/lib/crm/meetings/status-config';
import type { MeetingsSummary } from '@/lib/crm/meetings/types';

interface MeetingsSummaryCardsProps {
  summary: MeetingsSummary | undefined;
  isLoading: boolean;
}

const SUMMARY_KEYS = ['total', 'upcoming', 'past', 'cancelled'] as const;

export default function MeetingsSummaryCards({
  summary,
  isLoading,
}: MeetingsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {SUMMARY_KEYS.map((key) => (
        <Paper key={key} className="rounded-2xl border border-border/60 p-4">
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary" className="uppercase tracking-wide">
              {MEETING_SUMMARY_LABELS[key]}
            </Typography>
            <Typography variant="h5" className="font-bold">
              {isLoading ? '—' : (summary?.[key] ?? 0)}
            </Typography>
          </Stack>
        </Paper>
      ))}
    </div>
  );
}

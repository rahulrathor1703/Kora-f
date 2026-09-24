'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatDetailDate } from '@/lib/email/campaigns/detail-utils';
import {
  formatActiveWeekdays,
  formatMinutesAsTime,
  formatTimezoneLabel,
} from '@/lib/email/campaigns/schedule-utils';
import type { EmailCampaign } from '@/lib/email/campaigns/types';

interface ScheduleCellProps {
  label: string;
  value: string;
  hint?: string;
}

function ScheduleCell({ label, value, hint }: ScheduleCellProps) {
  return (
    <Box className="min-w-0 md:px-4 md:first:pl-0 md:last:pr-0">
      <Typography
        variant="caption"
        component="p"
        className="font-semibold uppercase tracking-[0.06em] text-foreground/55"
        sx={{ fontSize: '0.6875rem', lineHeight: 1.35, mb: 0.75 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        component="p"
        className="font-semibold tracking-tight text-foreground"
        sx={{ fontSize: '0.9375rem', lineHeight: 1.4 }}
      >
        {value}
      </Typography>
      {hint ? (
        <Typography
          variant="caption"
          component="p"
          color="text.secondary"
          className="mt-1 truncate"
          sx={{ lineHeight: 1.35 }}
        >
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}

function formatWindowValue(startMinutes: number, endMinutes: number): string {
  return `${formatMinutesAsTime(startMinutes)} – ${formatMinutesAsTime(endMinutes)}`;
}

function formatTimezoneValue(timezone: string): { value: string; hint?: string } {
  const formatted = formatTimezoneLabel(timezone);
  const offsetMatch = formatted.match(/\(([^)]+)\)$/);
  const value = offsetMatch?.[1] ?? formatted;
  const hint = formatted.replace(/\s*\([^)]+\)$/, '').replace(/_/g, ' ');

  return hint && hint !== value ? { value, hint } : { value };
}

function formatDaysValue(activeWeekdays: number[]): string {
  const formatted = formatActiveWeekdays(activeWeekdays);
  return formatted === 'Every day' ? 'Daily' : formatted;
}

interface CampaignDetailsPanelProps {
  campaign: EmailCampaign;
}

export default function CampaignDetailsPanel({
  campaign,
}: CampaignDetailsPanelProps) {
  const scheduledDate = formatDetailDate(campaign.scheduledAt);
  const hasSchedule = scheduledDate !== '—';
  const hasSendingWindow =
    campaign.sendingWindowStartMinutes !== null &&
    campaign.sendingWindowEndMinutes !== null;
  const timezone = campaign.timezone ? formatTimezoneValue(campaign.timezone) : null;

  return (
    <Box className="dashboard-panel rounded-2xl p-4 md:p-5">
      <Box className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4 md:gap-y-0 md:divide-x md:divide-surface-border">
        <ScheduleCell
          label="Scheduled"
          value={hasSchedule ? scheduledDate : 'Not set'}
        />
        <ScheduleCell
          label="Window"
          value={
            hasSendingWindow
              ? formatWindowValue(
                  campaign.sendingWindowStartMinutes!,
                  campaign.sendingWindowEndMinutes!,
                )
              : '—'
          }
        />
        <ScheduleCell
          label="Timezone"
          value={timezone?.value ?? '—'}
          hint={timezone?.hint}
        />
        <ScheduleCell label="Active days" value={formatDaysValue(campaign.activeWeekdays)} />
      </Box>
    </Box>
  );
}

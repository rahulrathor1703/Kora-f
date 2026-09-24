import { formatStatusLabel, STATUS_COLORS } from '@/lib/email/campaigns/detail-utils';
import {
  canPauseCampaign,
  canResumeCampaign,
  canStopCampaign,
} from '@/lib/email/campaigns/campaign-action-utils';
import { isManualCampaignStatusTransition } from '@/lib/email/campaigns/status-transitions';
import type {
  EmailCampaignStatus,
  EmailCampaignStatusBeforePause,
} from '@/lib/email/campaigns/types';

export type CampaignStatusSelectAction =
  | { kind: 'status'; value: EmailCampaignStatus }
  | { kind: 'pause' }
  | { kind: 'stop' }
  | { kind: 'resume' };

export type CampaignStatusSelectOptionValue =
  | EmailCampaignStatus
  | '__pause__'
  | '__stop__'
  | '__resume__';

export interface CampaignStatusSelectOption {
  value: CampaignStatusSelectOptionValue;
  label: string;
  color: 'default' | 'success' | 'warning' | 'info' | 'error';
  isCurrent?: boolean;
}

function resumeLabel(
  statusBeforePause: EmailCampaignStatusBeforePause | null | undefined,
): string {
  if (statusBeforePause) {
    return `Resume (${formatStatusLabel(statusBeforePause)})`;
  }

  return 'Resume';
}

export function getCampaignStatusSelectOptions(
  status: EmailCampaignStatus,
  statusBeforePause?: EmailCampaignStatusBeforePause | null,
): CampaignStatusSelectOption[] {
  const current: CampaignStatusSelectOption = {
    value: status,
    label: formatStatusLabel(status),
    color: STATUS_COLORS[status],
    isCurrent: true,
  };

  const options: CampaignStatusSelectOption[] = [current];

  if (status === 'draft') {
    options.push({
      value: 'scheduled',
      label: formatStatusLabel('scheduled'),
      color: STATUS_COLORS.scheduled,
    });
    return options;
  }

  if (status === 'scheduled') {
    options.push(
      {
        value: 'draft',
        label: formatStatusLabel('draft'),
        color: STATUS_COLORS.draft,
      },
      {
        value: '__pause__',
        label: formatStatusLabel('paused'),
        color: STATUS_COLORS.paused,
      },
      {
        value: '__stop__',
        label: formatStatusLabel('stopped'),
        color: STATUS_COLORS.stopped,
      },
    );
    return options;
  }

  if (status === 'sending') {
    options.push(
      {
        value: '__pause__',
        label: formatStatusLabel('paused'),
        color: STATUS_COLORS.paused,
      },
      {
        value: '__stop__',
        label: formatStatusLabel('stopped'),
        color: STATUS_COLORS.stopped,
      },
    );
    return options;
  }

  if (status === 'paused') {
    options.push(
      {
        value: '__resume__',
        label: resumeLabel(statusBeforePause),
        color: STATUS_COLORS[statusBeforePause ?? 'scheduled'],
      },
      {
        value: '__stop__',
        label: formatStatusLabel('stopped'),
        color: STATUS_COLORS.stopped,
      },
    );
    return options;
  }

  return options;
}

export function hasCampaignStatusTransitions(
  status: EmailCampaignStatus,
): boolean {
  return (
    isManualCampaignStatusTransition(status, 'draft') ||
    isManualCampaignStatusTransition(status, 'scheduled') ||
    canPauseCampaign(status) ||
    canStopCampaign(status) ||
    canResumeCampaign(status)
  );
}

export function getCampaignStatusSelectReadOnlyReason(
  canUpdate: boolean,
): string | null {
  if (!canUpdate) {
    return 'You do not have permission to change campaign status.';
  }

  return null;
}

export function getCampaignStatusLockedReason(
  status: EmailCampaignStatus,
): string | null {
  if (status === 'sent') {
    return 'Sent campaigns are complete — status cannot be changed manually.';
  }

  if (status === 'failed') {
    return 'Failed campaigns cannot be changed manually.';
  }

  if (status === 'stopped') {
    return 'Stopped campaigns cannot be changed manually.';
  }

  return null;
}

export function resolveCampaignStatusSelectAction(
  fromStatus: EmailCampaignStatus,
  selected: CampaignStatusSelectOptionValue,
): CampaignStatusSelectAction | null {
  if (selected === fromStatus) {
    return null;
  }

  if (selected === '__pause__') {
    return { kind: 'pause' };
  }

  if (selected === '__stop__') {
    return { kind: 'stop' };
  }

  if (selected === '__resume__') {
    return { kind: 'resume' };
  }

  if (isManualCampaignStatusTransition(fromStatus, selected)) {
    return { kind: 'status', value: selected };
  }

  return null;
}

import {
  CAMPAIGN_WIZARD_DEFAULT_VALUES,
  CAMPAIGN_WIZARD_STEPS,
} from '@/lib/email/campaigns/wizard-types';
import {
  DEFAULT_ACTIVE_WEEKDAYS,
  DEFAULT_DAILY_BATCH_SIZE,
  DEFAULT_SENDING_WINDOW_END_MINUTES,
  DEFAULT_SENDING_WINDOW_START_MINUTES,
  getDefaultTimezone,
  resolveActiveWeekdays,
} from '@/lib/email/campaigns/schedule-utils';
import type { EmailCampaign } from '@/lib/email/campaigns/types';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

function formatLaunchAtToDateInput(
  launchAt: string | null,
  timezone: string | null,
): string {
  if (!launchAt || !timezone) {
    return '';
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(new Date(launchAt));
}

export function mapCampaignToWizardForm(
  campaign: EmailCampaign,
): CampaignWizardFormValues {
  const sortedSteps = [...campaign.steps].sort(
    (left, right) => left.stepOrder - right.stepOrder,
  );
  const initialStep = sortedSteps[0];
  const followUpSteps = sortedSteps.slice(1);
  const timezone = campaign.timezone ?? getDefaultTimezone();

  return {
    name: campaign.name,
    type: campaign.campaignTypeId ?? '',
    brand: campaign.brandId ?? '',
    region: campaign.regionId ?? '',
    customFieldValues: campaign.customFieldValues ?? {},
    goal: campaign.goal ?? '',
    initialOutreach: {
      subject: initialStep?.subject ?? '',
      body: initialStep?.body ?? CAMPAIGN_WIZARD_DEFAULT_VALUES.initialOutreach.body,
    },
    followUps: followUpSteps.map((step) => ({
      subject: step.subject,
      body: step.body,
      includeSignature: step.includeSignature ?? true,
      delayMode: step.delayMode,
      delayDays: step.delayMode === 'relative' ? step.delayDays : undefined,
      scheduledDate: step.scheduledDate ?? undefined,
    })),
    campaignId: campaign.id,
    selectedSequenceTemplateId: '',
    sequenceSetupMode: undefined,
    templateAttachmentsCopied: false,
    audienceListType: campaign.audienceListType ?? 'contact',
    audienceListId: campaign.audienceListId ?? '',
    launchDate: formatLaunchAtToDateInput(campaign.launchAt, timezone),
    dailyBatchSize: campaign.dailyBatchSize || DEFAULT_DAILY_BATCH_SIZE,
    sendingWindowStartMinutes:
      campaign.sendingWindowStartMinutes ?? DEFAULT_SENDING_WINDOW_START_MINUTES,
    sendingWindowEndMinutes:
      campaign.sendingWindowEndMinutes ?? DEFAULT_SENDING_WINDOW_END_MINUTES,
    timezone,
    activeWeekdays: resolveActiveWeekdays(
      campaign.activeWeekdays.length > 0
        ? campaign.activeWeekdays
        : [...DEFAULT_ACTIVE_WEEKDAYS],
    ),
    mailboxSenders: campaign.mailboxSenders.map((sender) => ({
      mailboxId: sender.mailboxId,
      senderName: sender.senderName,
      senderEmail: sender.senderEmail,
      signature: sender.signature ?? undefined,
      dailySendQuota: sender.dailySendQuota ?? 1,
    })),
  };
}

function migrateLegacyWizardStepIndex(savedIndex: number): number {
  if (savedIndex >= 4) {
    return 4;
  }

  // Legacy order: details (0), emails (1), audience (2), launch (3)
  const LEGACY_TO_CURRENT: Record<number, number> = {
    0: 0,
    1: 2,
    2: 1,
    3: 3,
  };

  return LEGACY_TO_CURRENT[savedIndex] ?? savedIndex;
}

/** Old 4-step wizard index 3 combined schedule + review on one screen. */
function migrateFourStepLaunchIndex(
  savedIndex: number,
  campaign: EmailCampaign,
): number {
  if (savedIndex === 3 && campaign.launchAt) {
    return 4;
  }

  return savedIndex;
}

function shouldMigrateLegacyWizardStepIndex(campaign: EmailCampaign): boolean {
  // Emails were saved before audience — only possible in the legacy wizard order.
  return campaign.steps.length > 0 && !campaign.audienceListId;
}

export function resolveWizardStepIndex(campaign: EmailCampaign): number {
  if (campaign.wizardStepIndex != null && campaign.wizardStepIndex >= 0) {
    const rawIndex =
      campaign.wizardStepIndex >= 5
        ? 4
        : shouldMigrateLegacyWizardStepIndex(campaign)
          ? migrateLegacyWizardStepIndex(campaign.wizardStepIndex)
          : campaign.wizardStepIndex;

    const savedIndex = migrateFourStepLaunchIndex(rawIndex, campaign);

    if (savedIndex < CAMPAIGN_WIZARD_STEPS.length) {
      return savedIndex;
    }
  }

  if (!campaign.audienceListId) {
    return 1;
  }

  if (campaign.steps.length === 0) {
    return 2;
  }

  if (!campaign.launchAt) {
    return 3;
  }

  return 4;
}

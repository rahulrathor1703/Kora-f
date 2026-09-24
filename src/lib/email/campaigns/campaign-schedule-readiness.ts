import { DRAFT_PLACEHOLDER_SUBJECT } from '@/lib/email/campaigns/campaign-wizard-payload';
import { hasEmailBodyContent } from '@/lib/email/campaigns/email-body-html';
import {
  getManualCampaignStatusTransitionError,
} from '@/lib/email/campaigns/status-transitions';
import type {
  EmailCampaign,
  EmailCampaignStatus,
} from '@/lib/email/campaigns/types';

function sortedSteps(campaign: EmailCampaign) {
  return [...campaign.steps].sort(
    (left, right) => left.stepOrder - right.stepOrder,
  );
}

function isCompleteSequenceStep(
  step: EmailCampaign['steps'][number],
): boolean {
  if (!step.subject.trim() || step.subject === DRAFT_PLACEHOLDER_SUBJECT) {
    return false;
  }

  if (!hasEmailBodyContent(step.body)) {
    return false;
  }

  if (step.delayMode === 'absolute' && !step.scheduledDate) {
    return false;
  }

  return true;
}

/** Validates draft campaign data before allowing a move to Scheduled. */
export function getCampaignDraftToScheduledReadinessError(
  campaign: EmailCampaign,
): string | null {
  if (!campaign.name.trim()) {
    return 'Enter a campaign name before scheduling this campaign.';
  }

  if (campaign.mailboxSenders.length === 0) {
    return 'Add at least one sender mailbox before scheduling this campaign.';
  }

  const hasIncompleteSender = campaign.mailboxSenders.some(
    (sender) =>
      !sender.senderName.trim() || !sender.senderEmail.trim(),
  );

  if (hasIncompleteSender) {
    return 'Complete sender mailbox details before scheduling this campaign.';
  }

  if (!campaign.audienceListType || !campaign.audienceListId) {
    return 'Select an audience list before scheduling this campaign.';
  }

  const steps = sortedSteps(campaign);

  if (steps.length === 0) {
    return 'Add at least one email in the sequence before scheduling this campaign.';
  }

  if (steps.some((step) => !isCompleteSequenceStep(step))) {
    return 'Complete every email in the sequence before scheduling this campaign.';
  }

  if (!campaign.launchAt) {
    return 'Set a launch date and schedule before scheduling this campaign.';
  }

  if (
    campaign.timezone == null ||
    campaign.sendingWindowStartMinutes == null ||
    campaign.sendingWindowEndMinutes == null
  ) {
    return 'Set the sending window and timezone before scheduling this campaign.';
  }

  if (
    campaign.sendingWindowStartMinutes >= campaign.sendingWindowEndMinutes
  ) {
    return 'Sending window end must be after the start time.';
  }

  if (!campaign.dailyBatchSize || campaign.dailyBatchSize <= 0) {
    return 'Set a daily send batch size before scheduling this campaign.';
  }

  return null;
}

export function getCampaignManualStatusChangeError(
  campaign: EmailCampaign,
  fromStatus: EmailCampaignStatus,
  toStatus: EmailCampaignStatus,
): string | null {
  const transitionError = getManualCampaignStatusTransitionError(
    fromStatus,
    toStatus,
  );

  if (transitionError) {
    return transitionError;
  }

  if (fromStatus === 'draft' && toStatus === 'scheduled') {
    return getCampaignDraftToScheduledReadinessError(campaign);
  }

  return null;
}

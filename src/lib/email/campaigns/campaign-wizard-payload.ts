import { hasEmailBodyContent } from '@/lib/email/campaigns/email-body-html';
import type {
  CreateEmailCampaignInput,
  CreateEmailCampaignStepInput,
  UpdateEmailCampaignInput,
} from '@/lib/email/campaigns/types';
import {
  DEFAULT_FOLLOW_UP_DELAY_DAYS,
  DEFAULT_INITIAL_OUTREACH_BODY,
} from '@/lib/email/campaigns/sequence-defaults';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

export const DRAFT_PLACEHOLDER_SUBJECT = '(Draft subject)';

function normalizeCustomFieldValues(
  values: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (!values) {
    return undefined;
  }

  const normalized = Object.fromEntries(
    Object.entries(values).filter(([, value]) => value.trim().length > 0),
  );

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

export function canSaveBasicInfoDraft(
  values: CampaignWizardFormValues,
): boolean {
  if (values.name.trim().length === 0) {
    return false;
  }

  if (values.mailboxSenders.length === 0) {
    return false;
  }

  return values.mailboxSenders.every(
    (sender) =>
      sender.senderName.trim().length > 0 &&
      sender.senderEmail.trim().length > 0,
  );
}

function buildInitialOutreachStep(
  values: CampaignWizardFormValues,
  allowPlaceholder: boolean,
): CreateEmailCampaignStepInput {
  const subject = values.initialOutreach.subject.trim();
  const body = values.initialOutreach.body;
  const hasBody = hasEmailBodyContent(body);

  if (!allowPlaceholder && (!subject || !hasBody)) {
    throw new Error('Initial outreach subject and body are required');
  }

  return {
    stepOrder: 1,
    subject: subject || DRAFT_PLACEHOLDER_SUBJECT,
    body: hasBody ? body : DEFAULT_INITIAL_OUTREACH_BODY,
    delayDays: 0,
    delayMode: 'relative',
  };
}

function isCompleteFollowUp(
  followUp: CampaignWizardFormValues['followUps'][number],
): boolean {
  return (
    followUp.subject.trim().length > 0 &&
    hasEmailBodyContent(followUp.body)
  );
}

function buildFollowUpStep(
  followUp: CampaignWizardFormValues['followUps'][number],
  index: number,
): CreateEmailCampaignStepInput {
  return {
    stepOrder: index + 2,
    subject: followUp.subject.trim(),
    body: followUp.body,
    delayMode: followUp.delayMode ?? 'relative',
    delayDays:
      followUp.delayMode === 'absolute'
        ? 0
        : (followUp.delayDays ?? DEFAULT_FOLLOW_UP_DELAY_DAYS),
    scheduledDate:
      followUp.delayMode === 'absolute' ? followUp.scheduledDate : undefined,
    includeSignature: followUp.includeSignature,
  };
}

function buildFollowUpSteps(
  values: CampaignWizardFormValues,
  allowIncomplete: boolean,
): CreateEmailCampaignStepInput[] {
  if (
    !allowIncomplete &&
    values.followUps.some((followUp) => !isCompleteFollowUp(followUp))
  ) {
    throw new Error('Follow-up subject and body are required');
  }

  return values.followUps.flatMap((followUp, index) => {
    if (!isCompleteFollowUp(followUp)) {
      return [];
    }

    return [buildFollowUpStep(followUp, index)];
  });
}

function mapBasicInfoFields(values: CampaignWizardFormValues) {
  return {
    name: values.name,
    goal: values.goal || undefined,
    campaignTypeId: values.type || undefined,
    brandId: values.brand || undefined,
    regionId: values.region || undefined,
    customFieldValues: normalizeCustomFieldValues(values.customFieldValues),
    ...(values.mailboxSenders.length > 0
      ? { mailboxSenders: values.mailboxSenders }
      : {}),
  };
}

export function mapBasicInfoToCampaignPayload(
  values: CampaignWizardFormValues,
): CreateEmailCampaignInput {
  return {
    ...mapBasicInfoFields(values),
    steps: [buildInitialOutreachStep(values, true)],
  };
}

export function mapBasicInfoUpdatePayload(
  values: CampaignWizardFormValues,
): UpdateEmailCampaignInput {
  return mapBasicInfoFields(values);
}

export function mapWizardFormToCampaignPayload(
  values: CampaignWizardFormValues,
): CreateEmailCampaignInput {
  return {
    ...mapBasicInfoFields(values),
    steps: [
      buildInitialOutreachStep(values, false),
      ...buildFollowUpSteps(values, false),
    ],
  };
}

export function mapWizardFormToDraftUpdatePayload(
  values: CampaignWizardFormValues,
): UpdateEmailCampaignInput {
  return {
    ...mapBasicInfoFields(values),
    steps: [
      buildInitialOutreachStep(values, true),
      ...buildFollowUpSteps(values, true),
    ],
  };
}

export function mapWizardFormToDraftCreatePayload(
  values: CampaignWizardFormValues,
): CreateEmailCampaignInput {
  return {
    ...mapBasicInfoFields(values),
    steps: [
      buildInitialOutreachStep(values, true),
      ...buildFollowUpSteps(values, true),
    ],
  };
}

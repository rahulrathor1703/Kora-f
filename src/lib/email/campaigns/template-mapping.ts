import type { CreateEmailTemplateInput, EmailTemplate } from '@/lib/api';
import {
  DEFAULT_FOLLOW_UP_BODY,
  DEFAULT_FOLLOW_UP_DELAY_DAYS,
  DEFAULT_FOLLOW_UP_SUBJECT,
  DEFAULT_INITIAL_OUTREACH_BODY,
} from '@/lib/email/campaigns/sequence-defaults';
import {
  followUpSchema,
  sequenceEmailSchema,
  type CampaignWizardFormValues,
  type FollowUpFormValues,
} from '@/lib/schemas/campaign-wizard';

export type SaveTemplateScope = 'sequence' | 'single';

export function mapSingleTemplateToStepContent(template: EmailTemplate): {
  subject: string;
  body: string;
} {
  const step = template.steps[0];
  return {
    subject: step?.subject ?? '',
    body: step?.body ?? '',
  };
}

export function mapSequenceTemplateToWizardSteps(template: EmailTemplate): {
  initialOutreach: { subject: string; body: string };
  followUps: FollowUpFormValues[];
} {
  const sorted = [...template.steps].sort((a, b) => a.stepOrder - b.stepOrder);
  const initial = sorted[0];

  return {
    initialOutreach: {
      subject: initial?.subject ?? '',
      body: initial?.body ?? DEFAULT_INITIAL_OUTREACH_BODY,
    },
    followUps: sorted.slice(1).map((step) => ({
      subject: step.subject,
      body: step.body,
      includeSignature: true,
      delayMode: step.delayMode ?? 'relative',
      delayDays:
        step.delayMode === 'relative'
          ? (step.delayDays ?? DEFAULT_FOLLOW_UP_DELAY_DAYS)
          : undefined,
      scheduledDate:
        step.delayMode === 'absolute'
          ? (step.scheduledDate ?? undefined)
          : undefined,
    })),
  };
}

export function getScratchInitialOutreach(): {
  subject: string;
  body: string;
} {
  return {
    subject: '',
    body: DEFAULT_INITIAL_OUTREACH_BODY,
  };
}

export function getScratchFollowUpDefaults(): FollowUpFormValues {
  return {
    includeSignature: true,
    delayMode: 'relative',
    delayDays: DEFAULT_FOLLOW_UP_DELAY_DAYS,
    subject: DEFAULT_FOLLOW_UP_SUBJECT,
    body: DEFAULT_FOLLOW_UP_BODY,
  };
}

export function hasSequenceContent(values: {
  initialOutreach: { subject: string; body: string };
  followUps: Array<{ subject: string; body: string }>;
}): boolean {
  const hasInitial =
    Boolean(values.initialOutreach.subject.trim()) ||
    values.initialOutreach.body.trim() !== DEFAULT_INITIAL_OUTREACH_BODY.trim();

  const hasFollowUps = values.followUps.some(
    (followUp) =>
      Boolean(followUp.subject.trim()) || Boolean(followUp.body.trim()),
  );

  return hasInitial || hasFollowUps;
}

export function mapWizardFormToCreateTemplateInput(
  values: Pick<CampaignWizardFormValues, 'initialOutreach' | 'followUps'>,
  options: { name: string; scope: SaveTemplateScope },
): CreateEmailTemplateInput {
  const trimmedName = options.name.trim();

  if (options.scope === 'single') {
    return {
      name: trimmedName,
      type: 'single',
      visibility: 'private',
      isActive: true,
      steps: [
        {
          stepOrder: 1,
          subject: values.initialOutreach.subject.trim(),
          body: values.initialOutreach.body.trim(),
          delayMode: 'relative',
          delayDays: 0,
        },
      ],
    };
  }

  return {
    name: trimmedName,
    type: 'sequence',
    visibility: 'private',
    isActive: true,
    steps: [
      {
        stepOrder: 1,
        subject: values.initialOutreach.subject.trim(),
        body: values.initialOutreach.body.trim(),
        delayMode: 'relative',
        delayDays: 0,
      },
      ...values.followUps.map((followUp, index) => ({
        stepOrder: index + 2,
        subject: followUp.subject.trim(),
        body: followUp.body.trim(),
        delayMode: followUp.delayMode ?? 'relative',
        delayDays:
          followUp.delayMode === 'absolute'
            ? 0
            : (followUp.delayDays ?? DEFAULT_FOLLOW_UP_DELAY_DAYS),
        scheduledDate:
          followUp.delayMode === 'absolute'
            ? followUp.scheduledDate
            : undefined,
      })),
    ],
  };
}

export function canSaveWizardAsTemplate(
  values: Pick<CampaignWizardFormValues, 'initialOutreach' | 'followUps'>,
  options: { name: string; scope: SaveTemplateScope },
): boolean {
  return getSaveTemplateValidationError(values, options) === null;
}

export function getSaveTemplateValidationError(
  values: Pick<CampaignWizardFormValues, 'initialOutreach' | 'followUps'>,
  options: { name: string; scope: SaveTemplateScope },
): string | null {
  if (!options.name.trim()) {
    return 'Enter a template name';
  }

  const initialResult = sequenceEmailSchema.safeParse(values.initialOutreach);
  if (!initialResult.success) {
    return 'Step 1 needs a subject line and email body';
  }

  if (options.scope === 'single') {
    return null;
  }

  for (let index = 0; index < values.followUps.length; index += 1) {
    const followUpResult = followUpSchema.safeParse(values.followUps[index]);
    if (!followUpResult.success) {
      return `Follow-up ${index + 1} has incomplete or invalid fields`;
    }
  }

  return null;
}

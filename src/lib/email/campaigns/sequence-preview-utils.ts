import type { FollowUpFormValues } from '@/lib/schemas/campaign-wizard';

export interface SequenceStepPreview {
  id?: string;
  stepOrder: number;
  subject: string;
  body: string;
  delayMode: 'relative' | 'absolute';
  delayDays: number;
  scheduledDate: string | null;
}

export function mapWizardFormToPreviewSteps(values: {
  initialOutreach: { subject: string; body: string };
  followUps: FollowUpFormValues[];
}): SequenceStepPreview[] {
  const initial: SequenceStepPreview = {
    stepOrder: 1,
    subject: values.initialOutreach.subject,
    body: values.initialOutreach.body,
    delayMode: 'relative',
    delayDays: 0,
    scheduledDate: null,
  };

  const followUps = values.followUps.map((followUp, index) => ({
    stepOrder: index + 2,
    subject: followUp.subject,
    body: followUp.body,
    delayMode: followUp.delayMode,
    delayDays: followUp.delayDays ?? 0,
    scheduledDate: followUp.scheduledDate ?? null,
  }));

  return [initial, ...followUps];
}

import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';
import { DEFAULT_INITIAL_OUTREACH_BODY } from '@/lib/email/campaigns/sequence-defaults';
import {
  DEFAULT_ACTIVE_WEEKDAYS,
  DEFAULT_DAILY_BATCH_SIZE,
  DEFAULT_SENDING_WINDOW_END_MINUTES,
  DEFAULT_SENDING_WINDOW_START_MINUTES,
  getDefaultTimezone,
} from '@/lib/email/campaigns/schedule-utils';

export type CampaignWizardStepId =
  | 'basic-info'
  | 'sequence'
  | 'audience'
  | 'schedule'
  | 'review';

export interface CampaignWizardStep {
  id: CampaignWizardStepId;
  label: string;
  subtitle: string;
}

export const CAMPAIGN_WIZARD_STEPS: CampaignWizardStep[] = [
  {
    id: 'basic-info',
    label: 'Details',
    subtitle: 'Name your campaign and choose sending mailboxes.',
  },
  {
    id: 'audience',
    label: 'Audience',
    subtitle: 'Choose who receives this campaign.',
  },
  {
    id: 'sequence',
    label: 'Emails',
    subtitle: 'Choose a template or write your emails.',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    subtitle: 'Set launch date, batch size, and sending window.',
  },
  {
    id: 'review',
    label: 'Review',
    subtitle: 'Check mailbox capacity and confirm before scheduling.',
  },
];

export type { CampaignWizardFormValues };

export const CAMPAIGN_WIZARD_DEFAULT_VALUES: CampaignWizardFormValues = {
  name: '',
  type: '',
  brand: '',
  region: '',
  customFieldValues: {},
  goal: '',
  mailboxSenders: [],
  initialOutreach: {
    subject: '',
    body: DEFAULT_INITIAL_OUTREACH_BODY,
  },
  followUps: [],
  campaignId: undefined,
  selectedSequenceTemplateId: '',
  sequenceSetupMode: undefined,
  sequenceCustomized: false,
  templateAttachmentsCopied: false,
  audienceListType: 'contact',
  audienceListId: '',
  launchDate: '',
  dailyBatchSize: DEFAULT_DAILY_BATCH_SIZE,
  sendingWindowStartMinutes: DEFAULT_SENDING_WINDOW_START_MINUTES,
  sendingWindowEndMinutes: DEFAULT_SENDING_WINDOW_END_MINUTES,
  timezone: getDefaultTimezone(),
  activeWeekdays: [...DEFAULT_ACTIVE_WEEKDAYS],
};

export const STEP1_FIELD_NAMES = ['name', 'mailboxSenders'] as const;

export const STEP2_FIELD_NAMES = [
  'audienceListType',
  'audienceListId',
] as const;

export const STEP3_FIELD_NAMES = [
  'initialOutreach',
  'followUps',
] as const;

export const STEP4_FIELD_NAMES = [
  'launchDate',
  'dailyBatchSize',
  'sendingWindowStartMinutes',
  'sendingWindowEndMinutes',
  'timezone',
  'activeWeekdays',
] as const;

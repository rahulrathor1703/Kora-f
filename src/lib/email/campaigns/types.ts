export type EmailCampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'paused'
  | 'stopped';

export type EmailCampaignStatusBeforePause = 'scheduled' | 'sending';

export type AudienceListType = 'contact' | 'manual';

export interface EmailCampaignSequenceStep {
  id: string;
  stepOrder: number;
  subject: string;
  body: string;
  delayMode: 'relative' | 'absolute';
  delayDays: number;
  scheduledDate: string | null;
  includeSignature: boolean;
}

export type EmailCampaignMailboxSenderStatus =
  | 'active'
  | 'paused'
  | 'stopped';

export interface EmailCampaignMailboxSender {
  id: string;
  mailboxId: string;
  senderName: string;
  senderEmail: string;
  signature: string | null;
  dailySendQuota: number | null;
  status: EmailCampaignMailboxSenderStatus;
  sendsTodayCount: number;
  sendsTodayDate: string | null;
}

export interface EmailCampaign {
  id: string;
  publicCampaignId: string | null;
  name: string;
  goal: string | null;
  status: EmailCampaignStatus;
  campaignTypeId: string | null;
  brandId: string | null;
  regionId: string | null;
  customFieldValues: Record<string, string>;
  audienceListType: AudienceListType | null;
  audienceListId: string | null;
  audienceCount: number;
  launchAt: string | null;
  dailyBatchSize: number;
  sendingWindowStartMinutes: number | null;
  sendingWindowEndMinutes: number | null;
  timezone: string | null;
  activeWeekdays: number[];
  estimatedEndAt: string | null;
  scheduledAt: string | null;
  pausedUntil: string | null;
  statusBeforePause: EmailCampaignStatusBeforePause | null;
  wizardStepIndex: number | null;
  steps: EmailCampaignSequenceStep[];
  mailboxSenders: EmailCampaignMailboxSender[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailCampaignStepInput {
  stepOrder: number;
  subject: string;
  body: string;
  delayDays: number;
  delayMode?: 'relative' | 'absolute';
  scheduledDate?: string;
  includeSignature?: boolean;
}

export interface CreateEmailCampaignMailboxSenderInput {
  mailboxId: string;
  senderName: string;
  senderEmail: string;
  signature?: string;
  dailySendQuota: number;
}

export interface CreateEmailCampaignInput {
  name: string;
  goal?: string;
  campaignTypeId?: string;
  brandId?: string;
  regionId?: string;
  customFieldValues?: Record<string, string>;
  steps: CreateEmailCampaignStepInput[];
  mailboxSenders?: CreateEmailCampaignMailboxSenderInput[];
}

export interface UpdateEmailCampaignInput {
  name?: string;
  goal?: string;
  campaignTypeId?: string | null;
  brandId?: string | null;
  regionId?: string | null;
  customFieldValues?: Record<string, string>;
  steps?: CreateEmailCampaignStepInput[];
  mailboxSenders?: CreateEmailCampaignMailboxSenderInput[];
  audienceListType?: AudienceListType;
  audienceListId?: string;
  wizardStepIndex?: number;
  launchAt?: string;
  dailyBatchSize?: number;
  sendingWindowStartMinutes?: number;
  sendingWindowEndMinutes?: number;
  timezone?: string;
  activeWeekdays?: number[];
}

export interface ScheduleEmailCampaignInput {
  launchAt: string;
  dailyBatchSize: number;
  sendingWindowStartMinutes: number;
  sendingWindowEndMinutes: number;
  timezone: string;
  activeWeekdays: number[];
}

export interface UpdateEmailCampaignAudienceInput {
  audienceListType: AudienceListType;
  audienceListId: string;
}

export interface UpdateEmailCampaignStatusInput {
  status: EmailCampaignStatus;
}

export interface PauseEmailCampaignInput {
  pausedUntil: string;
}

export interface StopCampaignMailboxSenderInput {
  pauseCampaign?: boolean;
}

export interface ResumeEmailCampaignInput {
  resumePausedMailboxSenders?: boolean;
}

export interface PauseCampaignMailboxSenderInput {
  pauseCampaign?: boolean;
  pausedUntil?: string;
}

export interface UpdateCampaignMailboxSenderInput {
  mailboxId?: string;
  senderName?: string;
  senderEmail?: string;
  signature?: string;
  dailySendQuota?: number;
}

export type CampaignViewMode = 'table' | 'pipeline';

export type CampaignDeleteRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface CampaignDeleteRequest {
  id: string;
  campaignId: string | null;
  campaignName: string;
  campaignStatus: string;
  reason: string;
  status: CampaignDeleteRequestStatus;
  requestedByUserId: string;
  requestedByName: string;
  requestedByEmail: string;
  reviewedByUserId: string | null;
  reviewedByName: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignDeleteRequestInput {
  campaignId: string;
  reason: string;
}

export interface CampaignDeleteRequestsQuery {
  status?: CampaignDeleteRequestStatus;
  campaignId?: string;
}

export interface RejectCampaignDeleteRequestInput {
  reviewNote?: string;
}

export interface CampaignDeleteRequestSummaryCounts {
  pendingReviewCount: number;
  myRaisedCount: number;
  myRaisedPendingCount: number;
}

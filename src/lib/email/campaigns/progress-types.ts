import type { EmailCampaignProgressRecipientStatus } from './recipient-types';

export interface EmailCampaignProgressTimeline {
  launchAt: string | null;
  estimatedEndAt: string | null;
  daysRunning: number;
  contactsLeft: number;
  totalContacts: number;
  sentCount: number;
  completedCount: number;
  percentComplete: number;
  isComplete: boolean;
  todayPercent: number | null;
}

export interface EmailCampaignProgressFunnelStep {
  stepOrder: number;
  label: string;
  count: number;
  percent: number;
}

export interface EmailCampaignProgressReplyBreakdown {
  category: string;
  label: string;
  count: number;
  percent: number;
}

export interface EmailCampaignProgressDisposition {
  disposition: string;
  label: string;
  description: string;
  count: number;
}

export interface EmailCampaignProgressEngagement {
  sent: number;
  opened: number;
  openRate: number;
  clicked: number;
  ctr: number;
  replied: number;
  replyRate: number;
  bounced: number;
  bounceRate: number;
  unsubscribed: number;
  unsubscribeRate: number;
  spamReports: number;
}

export interface CampaignTrackingStatus {
  trackingBaseUrl: string;
  recommendedTrackingBaseUrl: string;
  isPubliclyReachable: boolean;
  trackingEndpointVerified: boolean;
  trackingEndpointError: string | null;
  bounceMonitoringEnabled: boolean;
  oauthSendSupported: boolean;
  mailboxesNeedingReauth: string[];
}

export interface CampaignMailboxTrackingHealth {
  id: string;
  email: string;
  lastSyncedAt: string | null;
  syncStatus: string | null;
  monitoringEnabled: boolean;
}

export interface CampaignTrackingHealth extends CampaignTrackingStatus {
  messagesMissingProviderMessageId: number;
  mailboxes: CampaignMailboxTrackingHealth[];
}

export interface CampaignDailyActivityPoint {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
}

export interface CampaignDailyActivityResponse {
  points: CampaignDailyActivityPoint[];
}

export interface SyncTrackingResult {
  repliesDetected: number;
  bouncesDetected: number;
  opensInferred: number;
  mailboxesPolled: number;
  skipped: boolean;
  started: boolean;
}

export interface EmailCampaignProgress {
  timeline: EmailCampaignProgressTimeline;
  sequenceFunnel: EmailCampaignProgressFunnelStep[];
  replyBreakdown: EmailCampaignProgressReplyBreakdown[];
  dispositionSummary: EmailCampaignProgressDisposition[];
  engagement: EmailCampaignProgressEngagement;
  recipientStatusBreakdown: EmailCampaignProgressRecipientStatus[];
}

export interface UpdateEmailCampaignRecipientInput {
  replyCategory?:
    | 'interested'
    | 'not_now'
    | 'no'
    | 'ooo'
    | 'wrong_person'
    | null;
  contactDisposition?: 'eligible' | 'excluded' | 'paused' | 'stopped' | 'unsubscribed';
}

export interface EmailCampaignRecipient {
  id: string;
  campaignId: string;
  email: string;
  currentStepOrder: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  replyCategory:
    | 'interested'
    | 'not_now'
    | 'no'
    | 'ooo'
    | 'wrong_person'
    | null;
  contactDisposition:
    | 'eligible'
    | 'excluded'
    | 'paused'
    | 'stopped'
    | 'unsubscribed'
    | 'done';
  lastSentAt: string | null;
  createdAt: string;
}

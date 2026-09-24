export type MailboxProvider = 'gmail' | 'outlook' | 'smtp';

export type MailboxStatus = 'active' | 'inactive';

export type MailboxSyncStatus = 'connected' | 'error' | 'pending';

export interface MailboxConfig {
  syncStatus: MailboxSyncStatus;
  lastSyncedAt: string | null;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpSecure?: boolean;
  providerLabel?: string;
}

export interface SenderMailbox {
  id: string;
  displayName: string;
  email: string;
  provider: MailboxProvider;
  status: MailboxStatus;
  fromName: string;
  dailySendLimit: number;
  dailySendsUsed: number;
  warmupEnabled: boolean;
  config: MailboxConfig;
  updatedAt?: string;
  createdAt?: string;
}

export type SenderMailboxDetail = SenderMailbox & {
  createdAt: string;
  updatedAt: string;
};

export type MailboxCampaignSenderStatus = 'active' | 'paused' | 'stopped';

export interface MailboxCampaignSenderDetail {
  id: string;
  status: MailboxCampaignSenderStatus;
  dailySendQuota: number | null;
  sendsTodayCount: number;
  sendsTodayDate: string | null;
  signature: string | null;
}

export interface MailboxCampaignAssignment {
  campaignId: string;
  campaignName: string;
  campaignStatus: string;
  sender: MailboxCampaignSenderDetail;
  isLocking: boolean;
}

export interface MailboxCampaignsResponse {
  campaigns: MailboxCampaignAssignment[];
  activeLock: { campaignId: string; campaignName: string } | null;
}

export interface CreateMailboxInput {
  displayName: string;
  email: string;
  provider: MailboxProvider;
  fromName: string;
  dailySendLimit: number;
  warmupEnabled: boolean;
  appPassword?: string;
  oauthToken?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
}

export type UpdateMailboxInput = Partial<CreateMailboxInput>;

export interface OAuthPrefill {
  provider: 'gmail' | 'outlook';
  email: string;
  oauthToken: string;
}

export interface DomainDnsCheckResult {
  domain: string;
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
}

export interface MailboxTestSendResult {
  success: true;
  messageId: string | null;
}

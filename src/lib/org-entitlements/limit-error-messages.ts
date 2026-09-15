import type { OrgLimitKey } from './types';

const LIMIT_MESSAGES: Record<OrgLimitKey, (limit: number) => string> = {
  'email.mailboxes': (limit) =>
    `You've reached your organization's mailbox limit (${limit}).`,
  'email.campaigns': (limit) =>
    `You've reached your organization's campaign limit (${limit}).`,
  'crm.prospects': (limit) =>
    `You've reached your organization's prospect limit (${limit}).`,
  'crm.companies': (limit) =>
    `You've reached your organization's company limit (${limit}).`,
  'website.projects': (limit) =>
    `You've reached your organization's website project limit (${limit}).`,
  'settings.members': (limit) =>
    `You've reached your organization's team member limit (${limit}).`,
};

export function getOrgLimitErrorMessage(
  limitKey: OrgLimitKey,
  effectiveLimit: number,
  fallbackMessage?: string,
): string {
  const formatter = LIMIT_MESSAGES[limitKey];

  if (formatter) {
    return formatter(effectiveLimit);
  }

  return (
    fallbackMessage ??
    `You've reached your organization's limit (${effectiveLimit}). Contact your administrator.`
  );
}

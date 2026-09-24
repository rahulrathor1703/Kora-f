import { API_BASE_URL } from '@/lib/api/config';

export function startMailboxOAuth(
  provider: 'gmail' | 'outlook',
  orgSlug: string,
): void {
  const path =
    provider === 'gmail'
      ? '/mailboxes/oauth/google/start'
      : '/mailboxes/oauth/microsoft/start';

  const url = `${API_BASE_URL}${path}?orgSlug=${encodeURIComponent(orgSlug)}`;
  // OAuth must leave the Next.js app to hit the backend redirect endpoint.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- backend OAuth start requires full navigation
  window.location.href = url;
}

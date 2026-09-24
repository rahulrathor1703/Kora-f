import { API_BASE_URL } from '@/lib/api/config';
import type { CalendarConnectionProvider } from '@/lib/crm/meetings/types';

export function startCalendarConnectionOAuth(
  provider: CalendarConnectionProvider,
  orgSlug: string,
): void {
  const pathByProvider: Record<CalendarConnectionProvider, string> = {
    google: '/calendar-connections/oauth/google/start',
    outlook: '/calendar-connections/oauth/microsoft/start',
    zoom: '/calendar-connections/oauth/zoom/start',
  };

  const url = `${API_BASE_URL}${pathByProvider[provider]}?orgSlug=${encodeURIComponent(orgSlug)}`;
  // OAuth must leave the Next.js app to hit the backend redirect endpoint.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- backend OAuth start requires full navigation
  window.location.href = url;
}

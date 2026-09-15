import { API_BASE_URL } from '@/lib/api/config';

export function startOrganizationGoogleOAuth(
  orgSlug: string,
  oauthAppId: string,
): void {
  const params = new URLSearchParams({ orgSlug, oauthAppId });
  const url = `${API_BASE_URL}/website/google-connections/oauth/start?${params.toString()}`;
  // OAuth requires a full browser navigation (fetch cannot follow cross-origin redirects).
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- backend OAuth start requires full navigation
  window.location.href = url;
}

export function startWebsiteGoogleOAuth(
  orgSlug: string,
  propertyId: string,
  oauthAppId: string,
): void {
  const params = new URLSearchParams({ orgSlug, oauthAppId });
  const url = `${API_BASE_URL}/website/properties/${encodeURIComponent(propertyId)}/google-connection/oauth/start?${params.toString()}`;
  // OAuth requires a full browser navigation (fetch cannot follow cross-origin redirects).
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- backend OAuth start requires full navigation
  window.location.href = url;
}

/** Single source for API base URL — read from env once. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '/api';

/** Public backend URL for OAuth callback defaults (not the /api proxy). */
export const PUBLIC_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') ?? '';

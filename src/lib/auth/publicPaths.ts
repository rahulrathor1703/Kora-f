/**
 * Auth/session public paths stub for future route protection.
 * Wire up in proxy.ts or middleware when auth is implemented.
 */
export const AUTH_PUBLIC_PATHS = ['/', '/login', '/signup', '/accept-invite'] as const;

export function isPublicPath(pathname: string): boolean {
  return AUTH_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

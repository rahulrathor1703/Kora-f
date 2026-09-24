import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RESERVED_ORGANIZATION_SLUGS } from '@/lib/org-path';

const PUBLIC_PATHS = new Set(['', 'login', 'signup', 'accept-invite']);

function isOrgWorkspacePath(pathname: string): boolean {
  const segment = pathname.split('/').filter(Boolean)[0];
  return Boolean(segment && !PUBLIC_PATHS.has(segment) && !RESERVED_ORGANIZATION_SLUGS.has(segment));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token');
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  if (pathname.startsWith('/platform') || pathname.startsWith('/workspace')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (isOrgWorkspacePath(pathname) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/platform/:path*', '/workspace/:path*', '/((?!_next/static|_next/image|favicon.ico|api|images).*)'],
};

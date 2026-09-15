import { cookies } from 'next/headers';
import { env } from '@/config/env';
import type { AuthUser } from '@/lib/api/auth';

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${env.backendInternalUrl}/auth/me`, {
      headers: {
        Cookie: `access_token=${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return response.json() as Promise<AuthUser>;
  } catch {
    return null;
  }
}

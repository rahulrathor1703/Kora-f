import LandingContent from '@/components/landing/LandingContent';
import { env } from '@/config/env';
import type { HealthResponse } from '@/lib/api/health';

async function fetchInitialHealth(): Promise<HealthResponse | null> {
  try {
    const response = await fetch(`${env.backendInternalUrl}/health`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return response.json() as Promise<HealthResponse>;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const initialHealth = await fetchInitialHealth();

  return <LandingContent initialHealth={initialHealth} />;
}

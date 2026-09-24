export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  checks: {
    database: 'ok' | 'error';
  };
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/health', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json() as Promise<HealthResponse>;
}

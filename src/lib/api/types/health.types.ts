export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  checks: { database: 'ok' | 'error' };
}

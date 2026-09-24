'use client';

import { useEffect, useMemo, useState } from 'react';
import { useApiQuery } from '@/hooks/api';
import { mailboxService } from '@/lib/api';
import { extractDomainFromEmail } from '@/lib/email/extract-domain-from-email';
import type { DomainDnsCheckResult } from '@/lib/email/mailbox-types';

const DEBOUNCE_MS = 450;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export interface DomainDnsCheckState {
  domain: string | null;
  result: DomainDnsCheckResult | null;
  isLoading: boolean;
  error: string | null;
}

export function useDomainDnsCheck(
  email: string,
  enabled: boolean,
): DomainDnsCheckState {
  const debouncedEmail = useDebouncedValue(email, DEBOUNCE_MS);
  const domain = useMemo(
    () => (enabled ? extractDomainFromEmail(debouncedEmail) : null),
    [debouncedEmail, enabled],
  );
  const trimmedEmail = debouncedEmail.trim();

  const query = useApiQuery(
    `mailboxes.domainDns.${domain ?? 'none'}`,
    () => mailboxService.checkDomainDns(trimmedEmail),
    { enabled: enabled && Boolean(domain && trimmedEmail) },
  );

  return {
    domain,
    result: query.data,
    isLoading: enabled && Boolean(domain) && (query.isLoading || query.isFetching),
    error: query.error,
  };
}

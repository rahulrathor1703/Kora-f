'use client';

import { useCallback, useEffect, useState } from 'react';
import { checkSignupSlug } from '@/lib/api/auth';
import { RESERVED_ORGANIZATION_SLUGS } from '@/lib/org-path';

export function useSlugAvailability(slug: string) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const check = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setAvailable(null);
      return;
    }

    if (RESERVED_ORGANIZATION_SLUGS.has(value)) {
      setAvailable(false);
      return;
    }

    setIsChecking(true);
    try {
      const result = await checkSignupSlug(value);
      setAvailable(result.available);
    } catch {
      setAvailable(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void check(slug.trim().toLowerCase());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [check, slug]);

  return { available, isChecking };
}

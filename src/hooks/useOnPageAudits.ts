'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { onPageSeoService } from '@/lib/api/services/on-page-seo.service';
import type {
  OnPageAuditRun,
  OnPagePageResult,
  OnPagePageResultsQuery,
} from '@/lib/website/on-page-seo/types';

const POLL_INTERVAL_MS = 3_000;

export function useOnPageAudits(websitePropertyId?: string) {
  const queryKey = websitePropertyId
    ? `website.on-page.audits.${websitePropertyId}`
    : 'website.on-page.audits';

  const {
    data,
    error,
    isLoading,
    refetch,
  } = useApiQuery(queryKey, () =>
    onPageSeoService.listAudits({
      websitePropertyId,
      page: 1,
      pageSize: 20,
    }),
  );

  const audits = useMemo(() => data?.items ?? [], [data?.items]);
  const latestAudit = audits[0] ?? null;
  const hasRunningAudit = audits.some(
    (audit) => audit.status === 'pending' || audit.status === 'running',
  );

  useEffect(() => {
    if (!hasRunningAudit) {
      return;
    }

    const interval = window.setInterval(() => {
      void refetch();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [hasRunningAudit, refetch]);

  const { mutate: triggerMutate, isLoading: isTriggering } = useApiMutation(
    (propertyId?: string) => onPageSeoService.triggerAudit(propertyId),
  );

  const triggerAudit = useCallback(
    async (propertyId?: string) => {
      const result = await triggerMutate(propertyId);
      await refetch();
      return result;
    },
    [refetch, triggerMutate],
  );

  return {
    audits,
    latestAudit,
    hasRunningAudit,
    isLoading,
    error: error ? String(error) : null,
    refetch,
    triggerAudit,
    isTriggering,
  };
}

export function useOnPagePageResults(
  auditRun: OnPageAuditRun | null,
  filters: OnPagePageResultsQuery = {},
) {
  const auditId = auditRun?.id;
  const shouldPoll =
    auditRun?.status === 'pending' || auditRun?.status === 'running';

  const {
    data,
    error,
    isLoading,
    refetch,
  } = useApiQuery(
    auditId ? `website.on-page.pages.${auditId}` : 'website.on-page.pages.none',
    () =>
      auditId
        ? onPageSeoService.listPageResults(auditId, {
            page: 1,
            pageSize: 200,
            ...filters,
          })
        : Promise.resolve({ items: [], total: 0, page: 1, pageSize: 200 }),
    { enabled: Boolean(auditId) },
  );

  useEffect(() => {
    if (!shouldPoll || !auditId) {
      return;
    }

    const interval = window.setInterval(() => {
      void refetch();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [auditId, refetch, shouldPoll]);

  const pages = useMemo(() => data?.items ?? [], [data?.items]);

  return {
    pages,
    total: data?.total ?? 0,
    isLoading,
    error: error ? String(error) : null,
    refetch,
  };
}

export function exportPageResultsCsv(pages: OnPagePageResult[], filename: string): void {
  const headers = [
    'URL',
    'SEO Score',
    'Issues',
    'Meta Title',
    'Meta Description',
    'H1 Count',
    'Word Count',
    'HTTP Status',
  ];

  const rows = pages.map((page) => [
    page.url,
    String(page.seoScore),
    String(page.issueCount),
    page.metaTitle.replace(/"/g, '""'),
    page.metaDesc.replace(/"/g, '""'),
    String(page.h1s.length),
    String(page.wordCount),
    page.httpStatus !== null ? String(page.httpStatus) : '',
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

'use client';

import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import DataTable from '@/components/data-table/DataTable';
import OnPagePageDetailDrawer from '@/components/website/on-page/OnPagePageDetailDrawer';
import OnPageSummaryCards, {
  IssueCategoryBreakdown,
} from '@/components/website/on-page/OnPageSummaryCards';
import {
  exportPageResultsCsv,
  useOnPageAudits,
  useOnPagePageResults,
} from '@/hooks/useOnPageAudits';
import { useOrgPath } from '@/hooks/useOrgPath';
import { useWebsiteProperties } from '@/hooks/useWebsiteProperties';
import type { OnPageAuditRun, OnPagePageResult } from '@/lib/website/on-page-seo/types';
import { getSeoScoreColor } from '@/lib/website/on-page-seo/types';

function formatAuditDate(audit: OnPageAuditRun): string {
  const date = audit.completedAt ?? audit.startedAt ?? audit.createdAt;
  return new Date(date).toLocaleString();
}

function auditStatusChip(audit: OnPageAuditRun) {
  if (audit.status === 'completed') {
    return <Chip label="Completed" size="small" color="success" variant="outlined" />;
  }

  if (audit.status === 'failed') {
    return <Chip label="Failed" size="small" color="error" variant="outlined" />;
  }

  return <Chip label="Running" size="small" color="info" variant="outlined" />;
}

export default function OnPageSeoContent() {
  const toOrgPath = useOrgPath();
  const { activeProperties, isLoading: isPropertiesLoading } = useWebsiteProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedPage, setSelectedPage] = useState<OnPagePageResult | null>(null);
  const [hasIssuesOnly, setHasIssuesOnly] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const effectivePropertyId = selectedPropertyId || activeProperties[0]?.id;

  const {
    audits,
    latestAudit,
    hasRunningAudit,
    isLoading: isAuditsLoading,
    error: auditsError,
    triggerAudit,
    isTriggering,
  } = useOnPageAudits(effectivePropertyId);

  const {
    pages,
    isLoading: isPagesLoading,
    error: pagesError,
  } = useOnPagePageResults(latestAudit, {
    hasIssuesOnly,
  });

  const filteredPages = useMemo(() => pages, [pages]);

  async function handleRunAudit() {
    if (!effectivePropertyId) {
      return;
    }

    setActionError(null);

    try {
      await triggerAudit(effectivePropertyId);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to start audit');
    }
  }

  if (!isPropertiesLoading && activeProperties.length === 0) {
    return (
      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="px-6 py-14 text-center">
          <Typography variant="h6" className="font-bold">
            Configure a website first
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-2">
            Add at least one active website in Website Config before running on-page audits.
          </Typography>
          <Button
            component={Link}
            href={toOrgPath('/website/configuration')}
            variant="contained"
            className="mt-6 rounded-2xl"
          >
            Go to Website Config
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isLoading = isPropertiesLoading || isAuditsLoading;

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
      >
        <FormControl size="small" className="min-w-[220px]">
          <InputLabel id="website-property-select-label">Website</InputLabel>
          <Select
            labelId="website-property-select-label"
            label="Website"
            value={effectivePropertyId ?? ''}
            onChange={(event) => setSelectedPropertyId(event.target.value)}
          >
            {activeProperties.map((property) => (
              <MenuItem key={property.id} value={property.id}>
                {property.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {latestAudit ? (
            <Typography variant="caption" color="text.secondary">
              Last audit: {formatAuditDate(latestAudit)}
            </Typography>
          ) : null}
          <Button
            variant="contained"
            startIcon={
              isTriggering || hasRunningAudit ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PlayArrowOutlinedIcon />
              )
            }
            disabled={!effectivePropertyId || isTriggering || hasRunningAudit}
            onClick={() => void handleRunAudit()}
            className="rounded-2xl"
          >
            {hasRunningAudit ? 'Audit running…' : 'Run audit'}
          </Button>
        </Stack>
      </Stack>

      {auditsError ? <Alert severity="error">{auditsError}</Alert> : null}
      {pagesError ? <Alert severity="error">{pagesError}</Alert> : null}
      {actionError ? <Alert severity="error">{actionError}</Alert> : null}

      {isLoading ? (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      ) : null}

      {!isLoading && !latestAudit ? (
        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="px-6 py-14 text-center">
            <Typography variant="h6" className="font-bold">
              No audits yet
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-2">
              Run your first on-page SEO audit for this website.
            </Typography>
            <Button
              variant="contained"
              startIcon={<PlayArrowOutlinedIcon />}
              className="mt-6 rounded-2xl"
              disabled={isTriggering}
              onClick={() => void handleRunAudit()}
            >
              Run first audit
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {latestAudit ? (
        <>
          <OnPageSummaryCards audit={latestAudit.status === 'completed' ? latestAudit : null} />
          <IssueCategoryBreakdown audit={latestAudit.status === 'completed' ? latestAudit : null} />

          <Card className="dashboard-panel rounded-2xl shadow-none">
            <CardContent className="p-0 md:p-2">
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                className="px-4 pt-4"
                sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
              >
                <Typography variant="subtitle1" className="font-semibold">
                  Page results
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant={hasIssuesOnly ? 'contained' : 'outlined'}
                    onClick={() => setHasIssuesOnly((current) => !current)}
                  >
                    Issues only
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadOutlinedIcon />}
                    disabled={filteredPages.length === 0}
                    onClick={() =>
                      exportPageResultsCsv(
                        filteredPages,
                        `on-page-audit-${latestAudit.id}.csv`,
                      )
                    }
                  >
                    Export CSV
                  </Button>
                </Stack>
              </Stack>

              <DataTable<OnPagePageResult>
                tableId="on-page-page-results"
                rows={filteredPages}
                getRowId={(page) => page.id}
                excludeFields={[
                  'id',
                  'auditRunId',
                  'metaDesc',
                  'metaDescLength',
                  'h2s',
                  'h3s',
                  'sentenceCaseViolations',
                  'issues',
                  'checks',
                  'createdAt',
                  'scrapeFailed',
                  'isThinContent',
                  'imageCount',
                  'missingAltCount',
                  'internalLinkCount',
                  'genericAnchorCount',
                  'metaTitleLength',
                  'httpStatus',
                ]}
                isLoading={isPagesLoading || latestAudit.status === 'running' || latestAudit.status === 'pending'}
                searchPlaceholder="Search URLs..."
                onRowClick={(page) => setSelectedPage(page)}
                columnOverrides={{
                  url: {
                    render: (page) => (
                      <Typography variant="body2" className="max-w-md truncate font-medium">
                        {page.url}
                      </Typography>
                    ),
                  },
                  seoScore: {
                    label: 'Score',
                    render: (page) => (
                      <Chip
                        label={page.seoScore}
                        size="small"
                        color={getSeoScoreColor(page.seoScore)}
                      />
                    ),
                  },
                  issueCount: {
                    label: 'Issues',
                  },
                  metaTitle: {
                    label: 'Meta title',
                    render: (page) => (
                      <Typography variant="body2" color="text.secondary" className="max-w-xs truncate">
                        {page.metaTitle || '—'}
                      </Typography>
                    ),
                  },
                  h1s: {
                    label: 'H1 count',
                    render: (page) => page.h1s.length,
                  },
                  wordCount: {
                    label: 'Words',
                  },
                }}
              />
            </CardContent>
          </Card>

          {audits.length > 1 ? (
            <Card className="dashboard-panel rounded-2xl shadow-none">
              <CardContent>
                <Typography variant="subtitle1" className="mb-3 font-semibold">
                  Audit history
                </Typography>
                <Stack spacing={1.5}>
                  {audits.slice(0, 8).map((audit) => (
                    <Stack
                      key={audit.id}
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                      className="rounded-xl border border-border px-4 py-3"
                    >
                      <Box>
                        <Typography variant="body2" className="font-medium">
                          {formatAuditDate(audit)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {audit.pagesAudited} pages · score {audit.summary.avgSeoScore}
                          {audit.scoreTrend !== null
                            ? ` (${audit.scoreTrend >= 0 ? '+' : ''}${audit.scoreTrend})`
                            : ''}
                        </Typography>
                      </Box>
                      {auditStatusChip(audit)}
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}

      <OnPagePageDetailDrawer page={selectedPage} onClose={() => setSelectedPage(null)} />
    </Stack>
  );
}

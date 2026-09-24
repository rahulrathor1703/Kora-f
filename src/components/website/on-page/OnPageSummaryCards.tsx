'use client';

import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { OnPageAuditRun } from '@/lib/website/on-page-seo/types';
import { ISSUE_CATEGORY_LABELS, getSeoScoreColor } from '@/lib/website/on-page-seo/types';

interface OnPageSummaryCardsProps {
  audit: OnPageAuditRun | null;
}

interface SummaryCardProps {
  label: string;
  value: string | number;
  helper?: string;
  chip?: React.ReactNode;
}

function SummaryCard({ label, value, helper, chip }: SummaryCardProps) {
  return (
    <Card className="dashboard-panel h-full rounded-2xl shadow-none">
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="h4" className="font-bold">
              {value}
            </Typography>
            {chip}
          </Stack>
          {helper ? (
            <Typography variant="caption" color="text.secondary">
              {helper}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function OnPageSummaryCards({ audit }: OnPageSummaryCardsProps) {
  if (!audit || audit.status !== 'completed') {
    return null;
  }

  const summary = audit.summary;
  const scoreColor = getSeoScoreColor(summary.avgSeoScore);

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(5, 1fr)',
        },
      }}
    >
      <SummaryCard
          label="Avg SEO score"
          value={summary.avgSeoScore}
          chip={
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Chip label={scoreColor === 'success' ? 'Good' : scoreColor === 'warning' ? 'Fair' : 'Poor'} color={scoreColor} size="small" />
              {audit.scoreTrend !== null ? (
                audit.scoreTrend >= 0 ? (
                  <Chip
                    icon={<ArrowUpwardOutlinedIcon />}
                    label={`+${audit.scoreTrend}`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                ) : (
                  <Chip
                    icon={<ArrowDownwardOutlinedIcon />}
                    label={String(audit.scoreTrend)}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                )
              ) : null}
            </Stack>
          }
        />
      <SummaryCard
          label="Pages audited"
          value={summary.pagesAudited}
          helper={summary.pagesFailed > 0 ? `${summary.pagesFailed} failed` : 'All pages scraped'}
        />
      <SummaryCard
          label="Missing meta titles"
          value={summary.missingMetaTitles}
        />
      <SummaryCard
          label="Thin content pages"
          value={summary.thinContentPages}
        />
      <SummaryCard
          label="Total issues"
          value={summary.totalIssues}
        />
    </Box>
  );
}

interface IssueCategoryBreakdownProps {
  audit: OnPageAuditRun | null;
}

export function IssueCategoryBreakdown({ audit }: IssueCategoryBreakdownProps) {
  if (!audit || audit.status !== 'completed') {
    return null;
  }

  const categories = Object.entries(audit.summary.issueCategories ?? {}).filter(
    ([, count]) => count > 0,
  );

  if (categories.length === 0) {
    return null;
  }

  return (
    <Card className="dashboard-panel rounded-2xl shadow-none">
      <CardContent>
        <Typography variant="subtitle1" className="mb-3 font-semibold">
          Issues by category
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {categories.map(([category, count]) => (
            <Chip
              key={category}
              label={`${ISSUE_CATEGORY_LABELS[category] ?? category}: ${count}`}
              variant="outlined"
              size="small"
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

'use client';

import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { OnPagePageResult } from '@/lib/website/on-page-seo/types';
import {
  getIssueFixHint,
  getIssueSeverity,
  getSeoScoreColor,
} from '@/lib/website/on-page-seo/types';

interface OnPagePageDetailDrawerProps {
  page: OnPagePageResult | null;
  onClose: () => void;
}

function CheckRow({ label, passed }: { label: string; passed: boolean }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <CheckCircleOutlineOutlinedIcon
        fontSize="small"
        color={passed ? 'success' : 'disabled'}
      />
      <Typography variant="body2" color={passed ? 'text.primary' : 'text.secondary'}>
        {label}
      </Typography>
    </Stack>
  );
}

function severityColor(severity: ReturnType<typeof getIssueSeverity>) {
  if (severity === 'critical') {
    return 'error' as const;
  }

  if (severity === 'warning') {
    return 'warning' as const;
  }

  return 'default' as const;
}

export default function OnPagePageDetailDrawer({
  page,
  onClose,
}: OnPagePageDetailDrawerProps) {
  return (
    <Drawer anchor="right" open={page !== null} onClose={onClose}>
      {page ? (
        <Box className="flex h-full w-full max-w-lg flex-col">
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
            className="border-b border-border px-5 py-4"
          >
            <Box className="min-w-0 flex-1">
              <Typography variant="h6" className="font-bold">
                Page details
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1 break-all">
                {page.url}
              </Typography>
            </Box>
            <IconButton aria-label="Close page details" onClick={onClose}>
              <CloseOutlinedIcon />
            </IconButton>
          </Stack>

          <Box className="flex-1 overflow-y-auto px-5 py-4">
            <Stack spacing={3}>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Chip
                  label={`SEO score: ${page.seoScore}`}
                  color={getSeoScoreColor(page.seoScore)}
                  size="small"
                />
                <Chip label={`${page.issueCount} issues`} size="small" variant="outlined" />
                {page.httpStatus !== null ? (
                  <Chip label={`HTTP ${page.httpStatus}`} size="small" variant="outlined" />
                ) : null}
              </Stack>

              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold">
                  Meta
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Title:</strong> {page.metaTitle || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {page.metaTitleLength} characters
                  </Typography>
                  <Typography variant="body2">
                    <strong>Description:</strong> {page.metaDesc || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {page.metaDescLength} characters
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold">
                  Content
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2">H1s: {page.h1s.length > 0 ? page.h1s.join(' · ') : 'None'}</Typography>
                  <Typography variant="body2">Word count: {page.wordCount}</Typography>
                  <Typography variant="body2">Internal links: {page.internalLinkCount}</Typography>
                  <Typography variant="body2">Images missing alt: {page.missingAltCount}</Typography>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold">
                  Technical checks
                </Typography>
                <Stack spacing={1}>
                  <CheckRow label="Canonical tag" passed={page.checks.hasCanonical} />
                  <CheckRow label="Viewport meta" passed={page.checks.hasViewport} />
                  <CheckRow label="Open Graph title" passed={page.checks.hasOgTitle} />
                  <CheckRow label="Open Graph description" passed={page.checks.hasOgDescription} />
                  <CheckRow label="Open Graph image" passed={page.checks.hasOgImage} />
                  <CheckRow label="JSON-LD structured data" passed={page.checks.hasJsonLd} />
                  <CheckRow label="Indexable (no noindex)" passed={!page.checks.isNoindex} />
                </Stack>
              </Box>

              {page.issues.length > 0 ? (
                <Box>
                  <Typography variant="subtitle2" className="mb-2 font-semibold">
                    Issues & fixes
                  </Typography>
                  <Stack spacing={2} divider={<Divider flexItem />}>
                    {page.issues.map((issue) => {
                      const severity = getIssueSeverity(issue);
                      return (
                        <Box key={issue}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} className="mb-1">
                            <Chip label={severity} size="small" color={severityColor(severity)} />
                            <Typography variant="body2" className="font-medium">
                              {issue}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {getIssueFixHint(issue)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              ) : null}

              {page.sentenceCaseViolations.length > 0 ? (
                <Box>
                  <Typography variant="subtitle2" className="mb-2 font-semibold">
                    Sentence case violations
                  </Typography>
                  <Stack spacing={1}>
                    {page.sentenceCaseViolations.map((violation) => (
                      <Typography key={`${violation.element}-${violation.text}`} variant="body2">
                        [{violation.element}] {violation.text}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              ) : null}
            </Stack>
          </Box>
        </Box>
      ) : null}
    </Drawer>
  );
}

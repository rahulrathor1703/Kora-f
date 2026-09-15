export interface WebsiteProperty {
  id: string;
  organizationId: string;
  name: string;
  domain: string;
  sitemapUrl: string;
  maxPages: number;
  isActive: boolean;
  ga4Enabled: boolean;
  ga4PropertyId: string | null;
  ga4PropertyName: string | null;
  gscEnabled: boolean;
  gscSiteUrl: string | null;
  psiEnabled: boolean;
  googleEmail: string | null;
  googleConnectionId: string | null;
  googleConnectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type OnPageAuditRunStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed';

export interface SentenceCaseViolation {
  element: string;
  text: string;
}

export interface OnPageExtendedChecks {
  hasCanonical: boolean;
  hasViewport: boolean;
  hasOgTitle: boolean;
  hasOgDescription: boolean;
  hasOgImage: boolean;
  hasJsonLd: boolean;
  isNoindex: boolean;
}

export interface OnPageAuditSummary {
  pagesAudited: number;
  pagesFailed: number;
  avgSeoScore: number;
  missingMetaTitles: number;
  missingMetaDescs: number;
  totalMissingAlt: number;
  sentenceCaseViolations: number;
  thinContentPages: number;
  totalIssues: number;
  issueCategories: Record<string, number>;
}

export interface OnPageAuditRun {
  id: string;
  organizationId: string;
  websitePropertyId: string;
  websitePropertyName: string;
  status: OnPageAuditRunStatus;
  startedAt: string | null;
  completedAt: string | null;
  pagesAudited: number;
  pagesFailed: number;
  summary: OnPageAuditSummary;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  scoreTrend: number | null;
}

export interface OnPagePageResult {
  id: string;
  auditRunId: string;
  url: string;
  httpStatus: number | null;
  scrapeFailed: boolean;
  metaTitle: string;
  metaDesc: string;
  metaTitleLength: number;
  metaDescLength: number;
  h1s: string[];
  h2s: string[];
  h3s: string[];
  wordCount: number;
  isThinContent: boolean;
  imageCount: number;
  missingAltCount: number;
  internalLinkCount: number;
  genericAnchorCount: number;
  sentenceCaseViolations: SentenceCaseViolation[];
  issues: string[];
  issueCount: number;
  seoScore: number;
  checks: OnPageExtendedChecks;
  createdAt: string;
}

export interface PaginatedOnPageAudits {
  items: OnPageAuditRun[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginatedOnPagePageResults {
  items: OnPagePageResult[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateWebsitePropertyInput {
  name: string;
  domain: string;
  sitemapUrl: string;
  googleConnectionId: string;
  maxPages?: number;
  isActive?: boolean;
  ga4Enabled?: boolean;
  ga4PropertyId?: string;
  ga4PropertyName?: string;
  gscEnabled?: boolean;
  gscSiteUrl?: string;
  psiEnabled?: boolean;
}

export interface UpdateWebsitePropertyInput {
  name?: string;
  domain?: string;
  sitemapUrl?: string;
  maxPages?: number;
  isActive?: boolean;
  ga4Enabled?: boolean;
  ga4PropertyId?: string;
  ga4PropertyName?: string;
  gscEnabled?: boolean;
  gscSiteUrl?: string;
  psiEnabled?: boolean;
}

export interface OnPageAuditsQuery {
  websitePropertyId?: string;
  page?: number;
  pageSize?: number;
}

export interface OnPagePageResultsQuery {
  page?: number;
  pageSize?: number;
  hasIssuesOnly?: boolean;
  thinContentOnly?: boolean;
  minScore?: number;
  maxScore?: number;
}

export const ISSUE_CATEGORY_LABELS: Record<string, string> = {
  meta: 'Meta tags',
  headings: 'Headings',
  content: 'Content',
  links: 'Links',
  images: 'Images',
  social: 'Social & technical',
  copy: 'Copy style',
  other: 'Other',
};

export function getSeoScoreColor(score: number): 'success' | 'warning' | 'error' {
  if (score >= 80) {
    return 'success';
  }

  if (score >= 60) {
    return 'warning';
  }

  return 'error';
}

export function getIssueSeverity(
  issue: string,
): 'critical' | 'warning' | 'info' {
  const lower = issue.toLowerCase();

  if (
    lower.includes('missing meta title') ||
    lower.includes('missing h1') ||
    lower.includes('noindex') ||
    lower.startsWith('http') ||
    lower.includes('scrape failed') ||
    lower.includes('empty page')
  ) {
    return 'critical';
  }

  if (
    lower.includes('meta title') ||
    lower.includes('meta desc') ||
    lower.includes('alt text') ||
    lower.includes('thin content') ||
    lower.includes('multiple h1') ||
    lower.includes('missing meta description') ||
    lower.includes('missing canonical') ||
    lower.includes('missing viewport') ||
    lower.includes('missing og:') ||
    lower.includes('missing json-ld') ||
    lower.includes('internal links')
  ) {
    return 'warning';
  }

  return 'info';
}

export function getIssueFixHint(issue: string): string {
  const lower = issue.toLowerCase();

  if (lower.includes('meta title too long')) {
    return 'Shorten the title to 30–60 characters for best display in search results.';
  }

  if (lower.includes('meta title too short')) {
    return 'Expand the title to at least 30 characters with a clear keyword and brand.';
  }

  if (lower.includes('missing meta title')) {
    return 'Add a unique <title> tag describing this page.';
  }

  if (lower.includes('meta desc too long')) {
    return 'Trim the meta description to 70–160 characters.';
  }

  if (lower.includes('meta desc too short')) {
    return 'Write a compelling meta description of at least 70 characters.';
  }

  if (lower.includes('missing meta description')) {
    return 'Add a meta description summarizing the page content.';
  }

  if (lower.includes('missing h1')) {
    return 'Add one clear H1 heading that matches the page topic.';
  }

  if (lower.includes('multiple h1')) {
    return 'Use a single H1 per page; demote extra headings to H2.';
  }

  if (lower.includes('alt text')) {
    return 'Add descriptive alt attributes to all meaningful images.';
  }

  if (lower.includes('thin content')) {
    return 'Add more substantive copy — aim for at least 300 words.';
  }

  if (lower.includes('generic anchor')) {
    return 'Replace generic link text with descriptive phrases.';
  }

  if (lower.includes('internal links')) {
    return 'Link to related pages on your site to improve crawl paths.';
  }

  if (lower.includes('canonical')) {
    return 'Add a canonical link pointing to the preferred URL for this page.';
  }

  if (lower.includes('viewport')) {
    return 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.';
  }

  if (lower.includes('og:')) {
    return 'Add Open Graph tags so links preview well on social platforms.';
  }

  if (lower.includes('json-ld')) {
    return 'Add structured data (JSON-LD) for rich search results.';
  }

  if (lower.includes('noindex')) {
    return 'Remove noindex if this page should appear in search results.';
  }

  if (lower.includes('sentence case')) {
    return 'Use sentence case for headings and meta text instead of Title Case.';
  }

  return 'Review and fix this issue to improve on-page SEO.';
}

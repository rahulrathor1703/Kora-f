const HTML_TAG_PATTERN = /<[a-z][\s\S]*>/i;

export const EMAIL_BODY_ALLOWED_HTML_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'a',
  'ul',
  'ol',
  'li',
  'span',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
] as const;

export const EMAIL_BODY_ALLOWED_HTML_ATTR = ['href', 'target', 'rel'] as const;

export function isHtmlEmailBody(body: string): boolean {
  return HTML_TAG_PATTERN.test(body);
}

export function plainTextToHtml(body: string): string {
  const trimmed = body.trim();

  if (!trimmed) {
    return '';
  }

  if (isHtmlEmailBody(trimmed)) {
    return trimmed;
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => {
      const withBreaks = paragraph
        .split('\n')
        .map((line) => line.trim())
        .join('<br>');
      return `<p>${withBreaks}</p>`;
    })
    .join('');
}

export function normalizeEmailBodyHtml(body: string): string {
  return plainTextToHtml(body);
}

export function getPlainTextFromHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function hasEmailBodyContent(body: string): boolean {
  return getPlainTextFromHtml(body).length > 0;
}

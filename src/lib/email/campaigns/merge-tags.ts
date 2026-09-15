export const SYSTEM_MERGE_TAG_TOKENS = ['sender_name', 'unsubscribe'] as const;

export const MERGE_TAG_PREVIEW_VALUES: Record<string, string> = {
  first_name: 'Alex',
  last_name: 'Rivera',
  full_name: 'Alex Rivera',
  company: 'Acme Insurance',
  role: 'Operations Manager',
  email: 'alex@acme.com',
  phone: '+1 555 0100',
  city: 'Mumbai',
  country: 'India',
  sender_name: 'Jordan Lee',
  unsubscribe: '[Unsubscribe link]',
};

export function formatMergeToken(token: string): string {
  return `{{${token}}}`;
}

export function insertAtCursor(
  value: string,
  insertion: string,
  selectionStart: number,
  selectionEnd: number,
): { nextValue: string; nextCursor: number } {
  const nextValue =
    value.slice(0, selectionStart) + insertion + value.slice(selectionEnd);
  const nextCursor = selectionStart + insertion.length;

  return { nextValue, nextCursor };
}

function humanizeMergeToken(token: string): string {
  return token
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function renderMergeTagPreview(content: string): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, token: string) => {
    return MERGE_TAG_PREVIEW_VALUES[token] ?? `[${humanizeMergeToken(token)}]`;
  });
}

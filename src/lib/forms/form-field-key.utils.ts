export function slugifyFormFieldKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

/** Assign a unique snake_case key from the field label. */
export function allocateUniqueFormFieldKey(
  label: string,
  usedKeys: ReadonlySet<string>,
): string {
  const base = slugifyFormFieldKey(label) || 'field';

  if (!usedKeys.has(base)) {
    return base;
  }

  let suffix = 2;
  while (usedKeys.has(`${base}_${suffix}`)) {
    suffix += 1;
  }

  return `${base}_${suffix}`;
}

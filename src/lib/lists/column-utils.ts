export function slugifyManualListLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_+|_+$/g, '');
}

export function resolveManualListColumnKeys(
  labels: string[],
): Array<{ label: string; key: string }> {
  const usedKeys = new Set<string>();
  const columns: Array<{ label: string; key: string }> = [];

  for (const rawLabel of labels) {
    const label = rawLabel.trim();
    const baseKey = slugifyManualListLabel(label);

    if (!baseKey) {
      columns.push({ label, key: '' });
      continue;
    }

    let key = baseKey;
    if (usedKeys.has(key)) {
      let suffix = 2;
      while (usedKeys.has(`${baseKey}_${suffix}`)) {
        suffix += 1;
      }
      key = `${baseKey}_${suffix}`;
    }

    usedKeys.add(key);
    columns.push({ label, key });
  }

  return columns;
}

import { describe, expect, it } from 'vitest';
import { mergeColumnPrefs } from './mergeColumnPrefs';

describe('mergeColumnPrefs', () => {
  it('does not add saved columns that are absent from the current field list', () => {
    const columns = mergeColumnPrefs({
      inferredFields: ['fullName', 'email'],
      savedColumns: [
        { field: 'fullName', label: 'Name', visible: true, order: 0 },
        { field: 'removed_field', label: 'Old', visible: true, order: 1 },
      ],
    });

    expect(columns.map((column) => column.field)).toEqual(['fullName', 'email']);
  });
});

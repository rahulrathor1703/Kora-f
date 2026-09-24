import {
  getMainSectionBlockRange,
  getSubSectionBlockRange,
  listMainSectionIds,
  listSiblingSubSectionIds,
  moveLayoutSection,
} from '@/lib/crm/fields/section-field.utils';

type TestField = {
  id: string;
  key: string;
  label: string;
  type: string;
  sortOrder: number;
  sectionId?: string;
  sectionTier?: 'main' | 'sub';
};

function field(partial: Omit<TestField, 'key' | 'label'> & Partial<TestField>): TestField {
  return {
    key: partial.id,
    label: partial.id,
    ...partial,
  };
}

describe('moveLayoutSection', () => {
  it('swaps main section blocks and preserves sectionId on child fields', () => {
    const fields: TestField[] = [
      field({ id: 'main-a', type: 'section', sectionTier: 'main', sortOrder: 0 }),
      field({ id: 'f-a', type: 'text', sectionId: 'main-a', sortOrder: 1 }),
      field({ id: 'main-b', type: 'section', sectionTier: 'main', sortOrder: 2 }),
      field({ id: 'f-b', type: 'text', sectionId: 'main-b', sortOrder: 3 }),
    ];

    const moved = moveLayoutSection(fields, 'main-b', 'up');

    expect(moved.map((item) => item.id)).toEqual([
      'main-b',
      'f-b',
      'main-a',
      'f-a',
    ]);
    expect(moved.find((item) => item.id === 'f-a')?.sectionId).toBe('main-a');
    expect(moved.find((item) => item.id === 'f-b')?.sectionId).toBe('main-b');
    expect(moved.map((item, index) => ({ ...item, sortOrder: index }))).toEqual(
      moved.map((item, sortOrder) => ({ ...item, sortOrder })),
    );
  });

  it('swaps sibling sub-sections within the same main section', () => {
    const fields: TestField[] = [
      field({ id: 'main', type: 'section', sectionTier: 'main', sortOrder: 0 }),
      field({
        id: 'sub-a',
        type: 'section',
        sectionTier: 'sub',
        sectionId: 'main',
        sortOrder: 1,
      }),
      field({ id: 'f-a', type: 'text', sectionId: 'sub-a', sortOrder: 2 }),
      field({
        id: 'sub-b',
        type: 'section',
        sectionTier: 'sub',
        sectionId: 'main',
        sortOrder: 3,
      }),
      field({ id: 'f-b', type: 'text', sectionId: 'sub-b', sortOrder: 4 }),
    ];

    const moved = moveLayoutSection(fields, 'sub-b', 'up');

    expect(moved.map((item) => item.id)).toEqual([
      'main',
      'sub-b',
      'f-b',
      'sub-a',
      'f-a',
    ]);
  });

  it('does not move a sub-section across main section boundaries', () => {
    const fields: TestField[] = [
      field({ id: 'main-a', type: 'section', sectionTier: 'main', sortOrder: 0 }),
      field({
        id: 'sub-a',
        type: 'section',
        sectionTier: 'sub',
        sectionId: 'main-a',
        sortOrder: 1,
      }),
      field({ id: 'main-b', type: 'section', sectionTier: 'main', sortOrder: 2 }),
    ];

    const moved = moveLayoutSection(fields, 'sub-a', 'down');
    expect(moved.map((item) => item.id)).toEqual(fields.map((item) => item.id));
  });

  it('moves nested sub-section blocks as a unit', () => {
    const fields: TestField[] = [
      field({ id: 'main', type: 'section', sectionTier: 'main', sortOrder: 0 }),
      field({
        id: 'sub-a',
        type: 'section',
        sectionTier: 'sub',
        sectionId: 'main',
        sortOrder: 1,
      }),
      field({ id: 'f-a', type: 'text', sectionId: 'sub-a', sortOrder: 2 }),
      field({
        id: 'sub-b',
        type: 'section',
        sectionTier: 'sub',
        sectionId: 'main',
        sortOrder: 3,
      }),
      field({
        id: 'sub-b-nested',
        type: 'section',
        sectionTier: 'sub',
        sectionId: 'sub-b',
        sortOrder: 4,
      }),
      field({ id: 'f-nested', type: 'text', sectionId: 'sub-b-nested', sortOrder: 5 }),
    ];

    expect(getSubSectionBlockRange(fields, 'sub-b')).toEqual({ start: 3, end: 6 });
    expect(listSiblingSubSectionIds(fields, 'main')).toEqual(['sub-a', 'sub-b']);

    const moved = moveLayoutSection(fields, 'sub-b', 'up');
    expect(moved.map((item) => item.id)).toEqual([
      'main',
      'sub-b',
      'sub-b-nested',
      'f-nested',
      'sub-a',
      'f-a',
    ]);
  });
});

describe('section block helpers', () => {
  it('lists main sections in sort order', () => {
    const fields: TestField[] = [
      field({ id: 'main-2', type: 'section', sectionTier: 'main', sortOrder: 2 }),
      field({ id: 'main-1', type: 'section', sectionTier: 'main', sortOrder: 0 }),
    ];

    expect(listMainSectionIds(fields)).toEqual(['main-1', 'main-2']);
    expect(getMainSectionBlockRange(fields, 'main-1')).toEqual({ start: 0, end: 1 });
  });
});

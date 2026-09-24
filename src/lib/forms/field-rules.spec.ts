import {
  canRemoveFieldFromLayoutCanvas,
  isFormFieldLayoutDraggable,
  isFormFieldOptionColorsEditable,
  isFormFieldOptionsEditable,
  isFormFieldPropertiesEditable,
} from '@/lib/forms/field-rules';
import type { FormFieldDefinition } from '@/lib/forms/types';

function field(
  partial: Partial<FormFieldDefinition> &
    Pick<FormFieldDefinition, 'key' | 'label'>,
): FormFieldDefinition {
  return {
    id: partial.id ?? '00000000-0000-4000-8000-000000000099',
    type: partial.type ?? 'text',
    sortOrder: partial.sortOrder ?? 0,
    showInTable: partial.showInTable ?? false,
    showInForm: partial.showInForm ?? true,
    ...partial,
  };
}

describe('platform system fields (e.g. company brokerName)', () => {
  const brokerName = field({
    key: 'brokerName',
    label: 'Company Name',
    system: true,
    sectionId: 'section-identity',
  });

  it('allows superadmin to drag on the layout canvas', () => {
    expect(isFormFieldLayoutDraggable(brokerName, 'platform')).toBe(true);
    expect(isFormFieldLayoutDraggable(brokerName, 'org')).toBe(false);
  });

  it('allows superadmin to edit properties', () => {
    expect(
      isFormFieldPropertiesEditable(
        { ...brokerName, layoutLocked: true },
        'platform',
      ),
    ).toBe(true);
  });

  it('allows superadmin to remove from canvas without hard delete', () => {
    expect(
      canRemoveFieldFromLayoutCanvas(brokerName, 'platform', ['brokerName'], [
        brokerName,
      ]),
    ).toBe(true);
  });
});

describe('org platform select option colors', () => {
  const chipPlatformSelect = field({
    key: 'emailStatus',
    label: 'Email Status',
    type: 'select',
    source: 'platform',
    displayOptionsAsChips: true,
  });

  const plainPlatformSelect = field({
    key: 'bantTier',
    label: 'BANT Tier',
    type: 'select',
    source: 'platform',
  });

  it('allows color edits for chip-display platform selects', () => {
    expect(isFormFieldOptionColorsEditable(chipPlatformSelect, 'org')).toBe(
      true,
    );
    expect(isFormFieldOptionsEditable(chipPlatformSelect, 'org')).toBe(true);
  });

  it('does not allow color edits without displayOptionsAsChips', () => {
    expect(isFormFieldOptionColorsEditable(plainPlatformSelect, 'org')).toBe(
      false,
    );
    expect(isFormFieldOptionsEditable(plainPlatformSelect, 'org')).toBe(false);
  });
});

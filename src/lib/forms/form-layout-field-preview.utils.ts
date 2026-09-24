import type { FormFieldDefinition, FormFieldType } from '@/lib/forms/types';

export function formLayoutPreviewPlaceholder(field: FormFieldDefinition): string {
  if (field.placeholder?.trim()) {
    return field.placeholder.trim();
  }

  const name = field.label.trim().toLowerCase();

  switch (field.type as FormFieldType) {
    case 'select':
    case 'multiselect':
      return `Select ${name}`;
    case 'date':
      return 'MM/DD/YYYY';
    case 'email':
      return 'Enter email';
    case 'phone':
      return 'Enter phone number';
    case 'number':
      return 'Enter number';
    case 'textarea':
      return `Enter ${name}`;
    case 'location':
      return 'Enter address';
    default:
      return `Enter ${name}`;
  }
}

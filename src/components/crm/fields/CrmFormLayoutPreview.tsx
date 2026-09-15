'use client';

import type { CompanyFieldDefinition } from '@/lib/crm/companies/types';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';
import FormLayoutBuilder from '@/components/forms/FormLayoutBuilder';
import type { FormFieldDefinition } from '@/lib/forms/types';

type PreviewField = ProspectFieldDefinition | CompanyFieldDefinition;

interface CrmFormLayoutPreviewProps<T extends PreviewField> {
  entity: 'company' | 'prospect';
  fields: T[];
  selectedFieldId: string | null;
  onSelectField: (fieldId: string | null) => void;
  onFieldsChange: (fields: T[]) => void;
}

export default function CrmFormLayoutPreview<T extends PreviewField>({
  fields,
  selectedFieldId,
  onSelectField,
  onFieldsChange,
}: CrmFormLayoutPreviewProps<T>) {
  return (
    <FormLayoutBuilder
      fields={fields as FormFieldDefinition[]}
      mode="platform"
      selectedFieldId={selectedFieldId}
      onSelectField={onSelectField}
      onFieldsChange={(nextFields) => onFieldsChange(nextFields as T[])}
    />
  );
}

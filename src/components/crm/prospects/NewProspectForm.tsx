'use client';

import DynamicFormRenderer, {
  type DynamicFormSubmitPayload,
} from '@/components/forms/DynamicFormRenderer';
import type { CreateProspectInput, ProspectFieldDefinition } from '@/lib/crm/prospects/types';

interface NewProspectFormProps {
  fields: ProspectFieldDefinition[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: CreateProspectInput) => Promise<void>;
}

export default function NewProspectForm({
  fields,
  isSubmitting,
  onCancel,
  onSubmit,
}: NewProspectFormProps) {
  async function handleSubmit(payload: DynamicFormSubmitPayload) {
    await onSubmit({ values: payload.values });
  }

  return (
    <DynamicFormRenderer
      fields={fields}
      isSubmitting={isSubmitting}
      submitLabel="Create Prospect"
      onCancel={onCancel}
      onSubmit={handleSubmit}
    />
  );
}

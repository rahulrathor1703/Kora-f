'use client';

import { useFormSchema } from '@/hooks/useForms';
import DynamicFormRenderer, {
  type DynamicFormSubmitPayload,
} from '@/components/forms/DynamicFormRenderer';
import DynamicWizardRenderer, {
  type WizardWidgetRenderer,
} from '@/components/forms/DynamicWizardRenderer';
import type { FormWizardStepDefinition } from '@/lib/forms/types';
import type { FieldStoredValue } from '@/lib/crm/location/types';

interface SchemaDrivenFormProps {
  formKey: string;
  isSubmitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (values: Record<string, FieldStoredValue>) => Promise<void>;
  initialValues?: Record<string, FieldStoredValue>;
  renderWidget?: WizardWidgetRenderer;
}

export default function SchemaDrivenForm({
  formKey,
  isSubmitting,
  submitLabel,
  onCancel,
  onSubmit,
  initialValues,
  renderWidget,
}: SchemaDrivenFormProps) {
  const { data, isLoading } = useFormSchema(formKey);

  if (isLoading || !data) {
    return null;
  }

  async function handleSubmit(payload: DynamicFormSubmitPayload) {
    await onSubmit(payload.values);
  }

  const steps = (data.steps ?? []) as FormWizardStepDefinition[];

  if (steps.length > 0) {
    return (
      <DynamicWizardRenderer
        fields={data.fields}
        steps={steps}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        initialValues={initialValues}
        renderWidget={renderWidget}
      />
    );
  }

  return (
    <DynamicFormRenderer
      fields={data.fields}
      isSubmitting={isSubmitting}
      submitLabel={submitLabel}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      initialValues={initialValues}
    />
  );
}

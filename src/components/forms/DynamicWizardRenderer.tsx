'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { useMemo, useState, type ReactNode } from 'react';
import DynamicFormRenderer, {
  type DynamicFormSubmitPayload,
} from '@/components/forms/DynamicFormRenderer';
import type { FormFieldDefinition, FormWizardStepDefinition } from '@/lib/forms/types';
import type { FieldStoredValue } from '@/lib/crm/location/types';

export type WizardWidgetRenderer = (
  step: FormWizardStepDefinition,
  values: Record<string, FieldStoredValue>,
  onChange: (values: Record<string, FieldStoredValue>) => void,
) => ReactNode;

interface DynamicWizardRendererProps {
  fields: FormFieldDefinition[];
  steps: FormWizardStepDefinition[];
  isSubmitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (payload: DynamicFormSubmitPayload) => Promise<void>;
  renderWidget?: WizardWidgetRenderer;
  initialValues?: Record<string, FieldStoredValue>;
}

export default function DynamicWizardRenderer({
  fields,
  steps,
  isSubmitting = false,
  submitLabel = 'Save',
  onCancel,
  onSubmit,
  renderWidget,
  initialValues = {},
}: DynamicWizardRendererProps) {
  const orderedSteps = useMemo(
    () => [...steps].sort((left, right) => left.sortOrder - right.sortOrder),
    [steps],
  );
  const [activeStep, setActiveStep] = useState(0);
  const [values, setValues] = useState<Record<string, FieldStoredValue>>(initialValues);

  const currentStep = orderedSteps[activeStep];
  const isLastStep = activeStep === orderedSteps.length - 1;

  const stepFields = useMemo(() => {
    if (!currentStep?.fieldKeys?.length) {
      return fields;
    }

    const keys = new Set(currentStep.fieldKeys);
    return fields.filter((field) => keys.has(field.key));
  }, [currentStep, fields]);

  async function handleStepSubmit(payload: DynamicFormSubmitPayload) {
    const merged = { ...values, ...payload.values };
    setValues(merged);

    if (isLastStep) {
      await onSubmit({ values: merged });
      return;
    }

    setActiveStep((current) => current + 1);
  }

  return (
    <Stack spacing={3}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {orderedSteps.map((step) => (
          <Step key={step.id}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper className="rounded-2xl p-4 sm:p-5">
        <Typography variant="h6" className="mb-4 font-semibold">
          {currentStep?.label}
        </Typography>

        {currentStep?.widget && renderWidget ? (
          renderWidget(currentStep, values, setValues)
        ) : (
          <DynamicFormRenderer
            fields={stepFields}
            isSubmitting={isSubmitting}
            submitLabel={isLastStep ? submitLabel : 'Continue'}
            cancelLabel="Back"
            onCancel={
              activeStep === 0
                ? onCancel
                : () => setActiveStep((current) => Math.max(0, current - 1))
            }
            onSubmit={handleStepSubmit}
            initialValues={values}
            showActions
          />
        )}
      </Paper>

      {currentStep?.widget && renderWidget ? (
        <Box className="flex justify-end gap-2">
          {activeStep > 0 ? (
            <Button onClick={() => setActiveStep((current) => current - 1)}>
              Back
            </Button>
          ) : onCancel ? (
            <Button onClick={onCancel}>Cancel</Button>
          ) : null}
          {!isLastStep ? (
            <Button variant="contained" onClick={() => setActiveStep((current) => current + 1)}>
              Continue
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={isSubmitting}
              onClick={() => void onSubmit({ values })}
            >
              {submitLabel}
            </Button>
          )}
        </Box>
      ) : null}
    </Stack>
  );
}

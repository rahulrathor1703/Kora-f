'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import ChartNameStep from '@/components/email/analytics/wizard/steps/ChartNameStep';
import FiltersStep from '@/components/email/analytics/wizard/steps/FiltersStep';
import MetricGroupStep from '@/components/email/analytics/wizard/steps/MetricGroupStep';
import WidgetWizardStepper from '@/components/email/analytics/wizard/WidgetWizardStepper';
import {
  useAnalyticsFilterOptions,
} from '@/hooks/useAnalyticsDashboards';
import type { AnalyticsWidget } from '@/lib/email/analytics/types';
import {
  WIDGET_WIZARD_DEFAULT_VALUES,
  WIDGET_WIZARD_STEPS,
  widgetWizardSchema,
  widgetWizardStep1Schema,
  widgetWizardStep3Schema,
  type WidgetWizardFormValues,
} from '@/lib/schemas/analytics-widget';

interface AddWidgetWizardProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialWidget?: AnalyticsWidget | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (values: WidgetWizardFormValues) => Promise<void>;
}

const STEP_SUBTITLES = [
  'Step 1 of 3 — Choose Metric & Group',
  'Step 2 of 3 — Set Filters',
  'Step 3 of 3 — Chart Type & Name',
] as const;

function toFormValues(widget: AnalyticsWidget): WidgetWizardFormValues {
  return {
    metric: widget.metric,
    groupBy: widget.groupBy,
    filters: {
      brandId: widget.filters.brandId ?? null,
      regionId: widget.filters.regionId ?? null,
      campaignTypeId: widget.filters.campaignTypeId ?? null,
      status: widget.filters.status ?? null,
    },
    chartType: widget.chartType,
    name: widget.name,
  };
}

export default function AddWidgetWizard({
  open,
  mode,
  initialWidget,
  isSaving,
  onClose,
  onSubmit,
}: AddWidgetWizardProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { data: filterOptions } = useAnalyticsFilterOptions();

  const form = useForm<WidgetWizardFormValues>({
    resolver: zodResolver(widgetWizardSchema),
    defaultValues: initialWidget
      ? toFormValues(initialWidget)
      : WIDGET_WIZARD_DEFAULT_VALUES,
    mode: 'onTouched',
  });

  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === WIDGET_WIZARD_STEPS.length - 1;

  async function handleNext() {
    setSaveError(null);

    if (activeStepIndex === 0) {
      const valid = await form.trigger(['metric', 'groupBy']);
      const stepValues = form.getValues();
      const parsed = widgetWizardStep1Schema.safeParse(stepValues);
      if (!valid || !parsed.success) {
        return;
      }
      setActiveStepIndex(1);
      return;
    }

    if (activeStepIndex === 1) {
      setActiveStepIndex(2);
      return;
    }

    const valid = await form.trigger(['chartType', 'name']);
    const stepValues = form.getValues();
    const parsed = widgetWizardStep3Schema.safeParse(stepValues);
    if (!valid || !parsed.success) {
      return;
    }

    try {
      await onSubmit(form.getValues());
      onClose();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Failed to save widget',
      );
    }
  }

  function handleBack() {
    setSaveError(null);
    setActiveStepIndex((current) => Math.max(current - 1, 0));
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6 }}>
        {mode === 'create' ? 'Add Widget' : 'Edit Widget'}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {STEP_SUBTITLES[activeStepIndex]}
        </Typography>
        <IconButton
          aria-label="Close widget wizard"
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <WidgetWizardStepper activeStepIndex={activeStepIndex} />

          {saveError ? <Alert severity="error">{saveError}</Alert> : null}

          <FormProvider {...form}>
            {activeStepIndex === 0 ? <MetricGroupStep /> : null}
            {activeStepIndex === 1 ? (
              <FiltersStep filterOptions={filterOptions} />
            ) : null}
            {activeStepIndex === 2 ? <ChartNameStep /> : null}
          </FormProvider>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Box>
          {!isFirstStep ? (
            <Button
              type="button"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              disabled={isSaving}
            >
              Back
            </Button>
          ) : (
            <Button type="button" variant="outlined" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
          )}
        </Box>

        <Button
          type="button"
          variant="contained"
          endIcon={isLastStep ? undefined : <ArrowForwardIcon />}
          onClick={() => void handleNext()}
          disabled={isSaving}
        >
          {isLastStep ? (mode === 'create' ? 'Add Widget' : 'Save Widget') : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

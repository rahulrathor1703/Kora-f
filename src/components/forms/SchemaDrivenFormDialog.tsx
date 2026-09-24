'use client';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import DynamicFormRenderer, {
  type DynamicFormSubmitPayload,
} from '@/components/forms/DynamicFormRenderer';
import { useFormSchema } from '@/hooks/useForms';
import type { FieldStoredValue } from '@/lib/crm/location/types';

interface SchemaDrivenFormDialogProps {
  formKey: string;
  open: boolean;
  title?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, FieldStoredValue>) => Promise<void>;
  initialValues?: Record<string, FieldStoredValue>;
}

export default function SchemaDrivenFormDialog({
  formKey,
  open,
  title,
  submitLabel = 'Save',
  isSubmitting = false,
  onClose,
  onSubmit,
  initialValues,
}: SchemaDrivenFormDialogProps) {
  const { data, isLoading } = useFormSchema(open ? formKey : null);

  async function handleSubmit(payload: DynamicFormSubmitPayload) {
    await onSubmit(payload.values);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title ?? data?.formKey ?? 'Form'}</DialogTitle>
      <DialogContent>
        {isLoading || !data ? (
          <Typography variant="body2" color="text.secondary" className="py-4">
            Loading form...
          </Typography>
        ) : (
          <DynamicFormRenderer
            fields={data.fields}
            isSubmitting={isSubmitting}
            submitLabel={submitLabel}
            onCancel={onClose}
            onSubmit={handleSubmit}
            initialValues={initialValues}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

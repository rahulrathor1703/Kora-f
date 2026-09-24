'use client';

import SchemaDrivenFormDialog from '@/components/forms/SchemaDrivenFormDialog';

interface RenameDashboardDialogProps {
  open: boolean;
  initialName: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

export default function RenameDashboardDialog({
  open,
  initialName,
  isSaving,
  onClose,
  onSave,
}: RenameDashboardDialogProps) {
  return (
    <SchemaDrivenFormDialog
      formKey="email.analytics.dashboard.rename"
      open={open}
      title="Rename Dashboard"
      submitLabel="Save"
      isSubmitting={isSaving}
      onClose={onClose}
      initialValues={{ name: initialName }}
      onSubmit={async (values) => {
        const name = values.name;
        if (typeof name === 'string') {
          await onSave(name.trim());
        }
      }}
    />
  );
}

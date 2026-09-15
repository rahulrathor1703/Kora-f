'use client';

import SchemaDrivenFormDialog from '@/components/forms/SchemaDrivenFormDialog';
import type { AnalyticsDashboardVisibility } from '@/lib/email/analytics/types';

interface NewDashboardDialogProps {
  open: boolean;
  isSaving: boolean;
  onClose: () => void;
  onCreate: (input: {
    name: string;
    visibility: AnalyticsDashboardVisibility;
  }) => Promise<void>;
}

export default function NewDashboardDialog({
  open,
  isSaving,
  onClose,
  onCreate,
}: NewDashboardDialogProps) {
  return (
    <SchemaDrivenFormDialog
      formKey="email.analytics.dashboard.new"
      open={open}
      title="New Dashboard"
      submitLabel="Create"
      isSubmitting={isSaving}
      onClose={onClose}
      onSubmit={async (values) => {
        const name = typeof values.name === 'string' ? values.name.trim() : '';
        const visibility =
          typeof values.visibility === 'string'
            ? (values.visibility as AnalyticsDashboardVisibility)
            : 'private';
        await onCreate({ name, visibility });
      }}
    />
  );
}

'use client';

import Box from '@mui/material/Box';
import SchemaDrivenForm from '@/components/forms/SchemaDrivenForm';
import type { CreateProspectEngagementInput } from '@/lib/crm/prospects/types';

interface FollowupMarkDoneFormProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: CreateProspectEngagementInput) => Promise<void>;
}

export default function FollowupMarkDoneForm({
  isSubmitting,
  onCancel,
  onSubmit,
}: FollowupMarkDoneFormProps) {
  return (
    <Box className="mt-4 border-t border-border/60 pt-4">
      <SchemaDrivenForm
        formKey="crm.followup.mark-done"
        isSubmitting={isSubmitting}
        submitLabel="Confirm & Close Follow-up"
        onCancel={onCancel}
        initialValues={{ type: 'call', outcome: 'positive' }}
        onSubmit={async (values) => {
          await onSubmit({
            type: String(values.type ?? 'call') as CreateProspectEngagementInput['type'],
            outcome: String(values.outcome ?? 'positive') as CreateProspectEngagementInput['outcome'],
            discussion: String(values.discussion ?? '').trim(),
          });
        }}
      />
    </Box>
  );
}

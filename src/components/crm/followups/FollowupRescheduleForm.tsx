'use client';

import Box from '@mui/material/Box';
import SchemaDrivenForm from '@/components/forms/SchemaDrivenForm';
import { toDateInputValue } from '@/lib/crm/followups/date-utils';

interface FollowupRescheduleFormProps {
  currentDate: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (newDate: string) => Promise<void>;
}

export default function FollowupRescheduleForm({
  currentDate,
  isSubmitting,
  onCancel,
  onSubmit,
}: FollowupRescheduleFormProps) {
  return (
    <Box className="mt-4 border-t border-border/60 pt-4">
      <SchemaDrivenForm
        formKey="crm.followup.reschedule"
        isSubmitting={isSubmitting}
        submitLabel="Confirm Reschedule"
        onCancel={onCancel}
        initialValues={{ followUpDue: toDateInputValue(currentDate) }}
        onSubmit={async (values) => {
          const nextDate = values.followUpDue;
          if (typeof nextDate === 'string' && nextDate.trim()) {
            await onSubmit(nextDate);
          }
        }}
      />
    </Box>
  );
}

'use client';

import Stack from '@mui/material/Stack';
import { useFieldArray, useFormContext } from 'react-hook-form';
import AddFollowUpButton from '@/components/email/campaigns/create/sequence/AddFollowUpButton';
import FollowUpCard from '@/components/email/campaigns/create/sequence/FollowUpCard';
import InitialOutreachCard from '@/components/email/campaigns/create/sequence/InitialOutreachCard';
import SaveAsTemplateBar from '@/components/email/campaigns/create/sequence/SaveAsTemplateBar';
import WizardFormSection from '@/components/email/campaigns/create/WizardFormSection';
import { useConfirm } from '@/hooks/useConfirm';
import {
  DEFAULT_FOLLOW_UP_BODY,
  DEFAULT_FOLLOW_UP_DELAY_DAYS,
  DEFAULT_FOLLOW_UP_SUBJECT,
} from '@/lib/email/campaigns/sequence-defaults';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

interface SequenceEditorProps {
  onTemplateSaved?: () => Promise<unknown>;
}

export default function SequenceEditor({ onTemplateSaved }: SequenceEditorProps) {
  const confirm = useConfirm();
  const { control, getValues } = useFormContext<CampaignWizardFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'followUps',
  });

  async function handleRemove(index: number) {
    const followUp = getValues(`followUps.${index}`);
    const hasContent =
      Boolean(followUp?.subject?.trim()) || Boolean(followUp?.body?.trim());

    if (hasContent) {
      const shouldRemove = await confirm({
        title: 'Remove follow-up?',
        description:
          'This follow-up has content that will be lost if you remove it.',
        variant: 'warning',
        confirmLabel: 'Remove',
        cancelLabel: 'Keep follow-up',
      });

      if (!shouldRemove) {
        return;
      }
    }

    remove(index);
  }

  function handleAddFollowUp() {
    append({
      includeSignature: true,
      delayMode: 'relative',
      delayDays: DEFAULT_FOLLOW_UP_DELAY_DAYS,
      subject: DEFAULT_FOLLOW_UP_SUBJECT,
      body: DEFAULT_FOLLOW_UP_BODY,
    });
  }

  return (
    <Stack spacing={4}>
      <InitialOutreachCard />

      {fields.map((field, index) => (
        <FollowUpCard
          key={field.id}
          index={index}
          stepNumber={index + 2}
          onRemove={() => void handleRemove(index)}
          divided
        />
      ))}

      <AddFollowUpButton onClick={handleAddFollowUp} />

      <WizardFormSection
        title="Save as template"
        description="Reuse this sequence in future campaigns."
        divided
      >
        <SaveAsTemplateBar onTemplateSaved={onTemplateSaved} />
      </WizardFormSection>
    </Stack>
  );
}

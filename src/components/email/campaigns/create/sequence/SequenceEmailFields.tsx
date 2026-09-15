'use client';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import WizardFieldLabel from '@/components/email/campaigns/create/WizardFieldLabel';
import EmailBodyEditor, {
  type EmailBodyEditorHandle,
} from '@/components/email/campaigns/create/sequence/EmailBodyEditor';
import EmailStepAttachments from '@/components/email/campaigns/create/sequence/EmailStepAttachments';
import MergeTagPicker from '@/components/email/campaigns/create/sequence/MergeTagPicker';
import { insertAtCursor } from '@/lib/email/campaigns/merge-tags';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

interface SequenceEmailFieldsProps {
  subjectName: 'initialOutreach.subject' | `followUps.${number}.subject`;
  bodyName: 'initialOutreach.body' | `followUps.${number}.body`;
  subjectHtmlId: string;
  bodyHtmlId: string;
  stepOrder: number;
}

export default function SequenceEmailFields({
  subjectName,
  bodyName,
  subjectHtmlId,
  bodyHtmlId,
  stepOrder,
}: SequenceEmailFieldsProps) {
  const { control, setValue, getValues, watch } =
    useFormContext<CampaignWizardFormValues>();
  const subjectRef = useRef<HTMLInputElement | null>(null);
  const bodyEditorRef = useRef<EmailBodyEditorHandle | null>(null);
  const campaignId = watch('campaignId');

  function insertIntoSubject(token: string) {
    const input = subjectRef.current;
    const currentValue = String(getValues(subjectName) ?? '');
    const selectionStart = input?.selectionStart ?? currentValue.length;
    const selectionEnd = input?.selectionEnd ?? currentValue.length;
    const { nextValue, nextCursor } = insertAtCursor(
      currentValue,
      token,
      selectionStart,
      selectionEnd,
    );

    setValue(subjectName, nextValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function insertIntoBody(token: string) {
    bodyEditorRef.current?.insertAtCursor(token);
    bodyEditorRef.current?.focus();
  }

  return (
    <Stack spacing={2.5}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <WizardFieldLabel required htmlFor={subjectHtmlId}>
            Subject line
          </WizardFieldLabel>
          <MergeTagPicker onInsert={insertIntoSubject} />
        </Stack>
        <Controller
          name={subjectName}
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              id={subjectHtmlId}
              inputRef={subjectRef}
              fullWidth
              placeholder="e.g. Quick question about {{company}}'s insurance ops"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              onSelect={(event) => {
                void event;
              }}
              className="rounded-xl"
            />
          )}
        />
      </Stack>

      <Stack spacing={1}>
        <Controller
          name={bodyName}
          control={control}
          render={({ field, fieldState }) => (
            <EmailBodyEditor
              ref={bodyEditorRef}
              id={bodyHtmlId}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              headerAction={<MergeTagPicker onInsert={insertIntoBody} />}
            />
          )}
        />
      </Stack>

      <EmailStepAttachments
        ownerType="campaign"
        ownerId={campaignId}
        stepOrder={stepOrder}
      />
    </Stack>
  );
}

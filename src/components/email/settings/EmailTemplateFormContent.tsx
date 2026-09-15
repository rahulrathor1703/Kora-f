'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type UseFormGetValues,
  type UseFormSetValue,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AddFollowUpButton from '@/components/email/campaigns/create/sequence/AddFollowUpButton';
import EmailBodyEditor, {
  type EmailBodyEditorHandle,
} from '@/components/email/campaigns/create/sequence/EmailBodyEditor';
import {
  EmailAttachmentStagingProvider,
  useEmailAttachmentStaging,
} from '@/components/email/campaigns/create/sequence/EmailAttachmentStagingContext';
import EmailStepAttachments from '@/components/email/campaigns/create/sequence/EmailStepAttachments';
import MergeTagPicker from '@/components/email/campaigns/create/sequence/MergeTagPicker';
import FollowUpTimingFields from '@/components/email/campaigns/shared/FollowUpTimingFields';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import FormAlert from '@/components/ui/FormAlert';
import WizardFieldLabel from '@/components/email/campaigns/create/WizardFieldLabel';
import {
  useEmailTemplate,
  useEmailTemplates,
} from '@/hooks/useEmailTemplates';
import { useOrgPath } from '@/hooks/useOrgPath';
import {
  DEFAULT_FOLLOW_UP_BODY,
  DEFAULT_FOLLOW_UP_DELAY_DAYS,
  DEFAULT_FOLLOW_UP_SUBJECT,
  DEFAULT_INITIAL_OUTREACH_BODY,
} from '@/lib/email/campaigns/sequence-defaults';
import { getTodayDateInputValue } from '@/lib/email/campaigns/schedule-utils';
import { emailTemplateMeta } from '@/lib/email/navigation';
import { insertAtCursor } from '@/lib/email/campaigns/merge-tags';
import {
  emailTemplateFormSchema,
  type EmailTemplateFormValues,
} from '@/lib/schemas/email-template';

interface EmailTemplateFormContentProps {
  mode: 'create' | 'edit';
  templateId?: string;
}

function buildDefaultValues(type: 'single' | 'sequence'): EmailTemplateFormValues {
  if (type === 'single') {
    return {
      name: '',
      description: '',
      type: 'single',
      visibility: 'private',
      isActive: true,
      steps: [
        {
          stepOrder: 1,
          subject: '',
          body: DEFAULT_INITIAL_OUTREACH_BODY,
          delayMode: 'relative',
        },
      ],
    };
  }

  return {
    name: '',
    description: '',
    type: 'sequence',
    visibility: 'private',
    isActive: true,
    steps: [
      {
        stepOrder: 1,
        subject: '',
        body: DEFAULT_INITIAL_OUTREACH_BODY,
        delayMode: 'relative',
        delayDays: 0,
      },
    ],
  };
}

export default function EmailTemplateFormContent(props: EmailTemplateFormContentProps) {
  return (
    <EmailAttachmentStagingProvider>
      <EmailTemplateFormContentInner {...props} />
    </EmailAttachmentStagingProvider>
  );
}

function EmailTemplateFormContentInner({
  mode,
  templateId,
}: EmailTemplateFormContentProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { flushStagedAttachments } = useEmailAttachmentStaging();
  const {
    createTemplate,
    updateTemplate,
    isCreating,
    isUpdating,
    error: mutationError,
  } = useEmailTemplates({ includeInactive: true });
  const {
    data: template,
    isLoading: isLoadingTemplate,
    error: fetchError,
  } = useEmailTemplate(mode === 'edit' ? (templateId ?? null) : null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateFormSchema),
    defaultValues: buildDefaultValues('single'),
  });

  const templateType = useWatch({ control, name: 'type' }) ?? 'single';
  const { fields, append, remove } = useFieldArray({ control, name: 'steps' });

  useEffect(() => {
    if (mode === 'edit' && template) {
      reset({
        name: template.name,
        description: template.description ?? '',
        type: template.type,
        visibility: template.visibility,
        isActive: template.isActive,
        steps: template.steps.map((step) => ({
          stepOrder: step.stepOrder,
          subject: step.subject,
          body: step.body,
          delayMode: step.delayMode ?? 'relative',
          delayDays: step.delayDays || undefined,
          scheduledDate: step.scheduledDate ?? undefined,
        })),
      });
    }
  }, [mode, reset, template]);

  async function onSubmit(values: EmailTemplateFormValues) {
    const payload = {
      name: values.name,
      description: values.description?.trim() || undefined,
      type: values.type,
      visibility: values.visibility,
      isActive: values.isActive,
      steps: values.steps.map((step, index) => ({
        stepOrder: index + 1,
        subject: step.subject,
        body: step.body,
        delayMode: index === 0 ? 'relative' : step.delayMode,
        delayDays: index === 0 ? 0 : step.delayDays,
        scheduledDate:
          index > 0 && step.delayMode === 'absolute'
            ? step.scheduledDate
            : undefined,
      })),
    };

    if (mode === 'edit' && templateId) {
      await updateTemplate(templateId, payload);
      await flushStagedAttachments(
        'template',
        templateId,
        values.steps.map((_, index) => index + 1),
      );
      router.push(toOrgPath(emailTemplateMeta.href));
      return;
    }

    const created = await createTemplate(payload);
    await flushStagedAttachments(
      'template',
      created.id,
      values.steps.map((_, index) => index + 1),
    );
    router.push(toOrgPath(emailTemplateMeta.href));
  }

  function handleTypeChange(nextType: 'single' | 'sequence') {
    setValue('type', nextType, { shouldDirty: true });
    reset(buildDefaultValues(nextType), { keepDirty: true });
  }

  function handleAddFollowUp() {
    append({
      stepOrder: fields.length + 1,
      subject: DEFAULT_FOLLOW_UP_SUBJECT,
      body: DEFAULT_FOLLOW_UP_BODY,
      delayMode: 'relative',
      delayDays: DEFAULT_FOLLOW_UP_DELAY_DAYS,
    });
  }

  if (mode === 'edit' && isLoadingTemplate) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress />
      </Box>
    );
  }

  if (mode === 'edit' && fetchError) {
    return <Alert severity="error">{fetchError}</Alert>;
  }

  const followUpSteps = templateType === 'sequence' ? fields.slice(1) : [];

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline={emailTemplateMeta.pluralLabel}
        title={mode === 'create' ? 'Create email template' : 'Edit email template'}
        description={emailTemplateMeta.description}
        parentBack={{
          href: emailTemplateMeta.href,
          label: emailTemplateMeta.pluralLabel,
        }}
        showPlatformBackLink={false}
      />

      {mutationError ? <FormAlert message={mutationError} /> : null}

      <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
        <CardContent className="p-4 md:p-6">
          <Stack
            component="form"
            spacing={3}
            onSubmit={(event) => void handleSubmit(onSubmit)(event)}
          >
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Template name"
                  required
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  minRows={2}
                />
              )}
            />

            {mode === 'create' ? (
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Template type"
                    fullWidth
                    onChange={(event) =>
                      handleTypeChange(event.target.value as 'single' | 'sequence')
                    }
                  >
                    <MenuItem value="single">Single email</MenuItem>
                    <MenuItem value="sequence">Full sequence</MenuItem>
                  </TextField>
                )}
              />
            ) : (
              <TextField
                label="Template type"
                value={templateType === 'single' ? 'Single email' : 'Full sequence'}
                fullWidth
                disabled
              />
            )}

            <Controller
              name="visibility"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Visibility" fullWidth>
                  <MenuItem value="private">Private — only you</MenuItem>
                  <MenuItem value="org">Shared with organization</MenuItem>
                </TextField>
              )}
            />

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                    />
                  }
                  label="Active (visible in campaign wizard dropdowns)"
                />
              )}
            />

            <Box className="rounded-2xl border border-surface-border bg-surface p-4 md:p-5">
              <Typography variant="subtitle1" className="mb-4 font-bold">
                {templateType === 'single'
                  ? 'Email content'
                  : 'Step 1 — Initial outreach'}
              </Typography>

              <TemplateStepEditor
                control={control}
                stepIndex={0}
                stepOrder={1}
                templateId={templateId}
                subjectId="template-step-0-subject"
                bodyId="template-step-0-body"
                getValues={getValues}
                setValue={setValue}
              />
            </Box>

            {templateType === 'sequence'
              ? followUpSteps.map((field, index) => {
                  const stepIndex = index + 1;
                  return (
                    <Box
                      key={field.id}
                      className="rounded-2xl border border-surface-border bg-surface p-4 md:p-5"
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        sx={{
                          alignItems: { sm: 'center' },
                          justifyContent: 'space-between',
                          mb: 3,
                        }}
                      >
                        <Typography variant="subtitle1" className="font-bold">
                          Step {stepIndex + 1} — Follow-up {index + 1}
                        </Typography>
                        <Stack direction="row" spacing={1.5}>
                          <FollowUpTimingFields
                            control={control}
                            delayModeName={`steps.${stepIndex}.delayMode`}
                            delayDaysName={`steps.${stepIndex}.delayDays`}
                            scheduledDateName={`steps.${stepIndex}.scheduledDate`}
                            minDate={getTodayDateInputValue()}
                          />
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => remove(stepIndex)}
                            className="rounded-xl"
                          >
                            Remove
                          </Button>
                        </Stack>
                      </Stack>

                      <TemplateStepEditor
                        control={control}
                        stepIndex={stepIndex}
                        stepOrder={stepIndex + 1}
                        templateId={templateId}
                        subjectId={`template-step-${stepIndex}-subject`}
                        bodyId={`template-step-${stepIndex}-body`}
                        getValues={getValues}
                        setValue={setValue}
                      />
                    </Box>
                  );
                })
              : null}

            {templateType === 'sequence' ? (
              <AddFollowUpButton onClick={handleAddFollowUp} />
            ) : null}

            {errors.steps?.message ? (
              <Alert severity="error">{errors.steps.message}</Alert>
            ) : null}

            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
              <Button
                component={Link}
                href={toOrgPath(emailTemplateMeta.href)}
                color="inherit"
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!isDirty || isCreating || isUpdating}
                className="rounded-xl"
              >
                {isCreating || isUpdating ? 'Saving…' : 'Save template'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

interface TemplateStepEditorProps {
  control: Control<EmailTemplateFormValues>;
  stepIndex: number;
  stepOrder: number;
  templateId?: string;
  subjectId: string;
  bodyId: string;
  getValues: UseFormGetValues<EmailTemplateFormValues>;
  setValue: UseFormSetValue<EmailTemplateFormValues>;
}

function TemplateStepEditor({
  control,
  stepIndex,
  stepOrder,
  templateId,
  subjectId,
  bodyId,
  getValues,
  setValue,
}: TemplateStepEditorProps) {
  const subjectRef = useRef<HTMLInputElement | null>(null);
  const bodyEditorRef = useRef<EmailBodyEditorHandle | null>(null);

  function insertToken(field: 'subject' | 'body', token: string) {
    if (field === 'body') {
      bodyEditorRef.current?.insertAtCursor(token);
      bodyEditorRef.current?.focus();
      return;
    }

    const input = subjectRef.current;
    const current = String(getValues(`steps.${stepIndex}.${field}`) ?? '');
    const selectionStart = input?.selectionStart ?? current.length;
    const selectionEnd = input?.selectionEnd ?? current.length;
    const { nextValue, nextCursor } = insertAtCursor(
      current,
      token,
      selectionStart,
      selectionEnd,
    );
    setValue(`steps.${stepIndex}.${field}`, nextValue, {
      shouldDirty: true,
      shouldValidate: true,
    });

    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(nextCursor, nextCursor);
    });
  }

  return (
    <Stack spacing={2.5}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <WizardFieldLabel required htmlFor={subjectId}>
            Subject line
          </WizardFieldLabel>
          <MergeTagPicker onInsert={(token) => insertToken('subject', token)} />
        </Stack>
        <Controller
          name={`steps.${stepIndex}.subject`}
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              id={subjectId}
              inputRef={subjectRef}
              fullWidth
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              className="rounded-xl"
            />
          )}
        />
      </Stack>

      <Stack spacing={1}>
        <Controller
          name={`steps.${stepIndex}.body`}
          control={control}
          render={({ field, fieldState }) => (
            <EmailBodyEditor
              ref={bodyEditorRef}
              id={bodyId}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              headerAction={
                <MergeTagPicker onInsert={(token) => insertToken('body', token)} />
              }
            />
          )}
        />
      </Stack>

      <EmailStepAttachments
        ownerType="template"
        ownerId={templateId}
        stepOrder={stepOrder}
      />
    </Stack>
  );
}

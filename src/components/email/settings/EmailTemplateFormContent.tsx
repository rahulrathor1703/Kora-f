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
import { useEffect, useRef, useState } from 'react';
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type FieldErrors,
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
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import {
  DEFAULT_FOLLOW_UP_BODY,
  DEFAULT_FOLLOW_UP_DELAY_DAYS,
  DEFAULT_FOLLOW_UP_SUBJECT,
  DEFAULT_INITIAL_OUTREACH_BODY,
} from '@/lib/email/campaigns/sequence-defaults';
import { getTodayDateInputValue } from '@/lib/email/campaigns/schedule-utils';
import {
  collectEmailTemplateValidationIssues,
  getEmailTemplateValidationToast,
  getFirstEmailTemplateErrorElementId,
} from '@/lib/email/email-template-form-validation';
import { inferEmailTemplateType } from '@/lib/email/infer-email-template-type';
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

function buildDefaultValues(): EmailTemplateFormValues {
  return {
    name: '',
    description: '',
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
  const { notifyError } = useNotify();
  const [validationIssues, setValidationIssues] = useState<string[] | null>(
    null,
  );
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
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateFormSchema),
    defaultValues: buildDefaultValues(),
    shouldFocusError: true,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'steps' });

  useEffect(() => {
    if (mode === 'edit' && template) {
      reset({
        name: template.name,
        description: template.description ?? '',
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
    setValidationIssues(null);
    const steps = values.steps.map((step, index) => ({
      stepOrder: index + 1,
      subject: step.subject,
      body: step.body,
      delayMode: index === 0 ? ('relative' as const) : step.delayMode,
      delayDays: index === 0 ? 0 : step.delayDays,
      scheduledDate:
        index > 0 && step.delayMode === 'absolute'
          ? step.scheduledDate
          : undefined,
    }));

    const sharedPayload = {
      name: values.name,
      description: values.description?.trim() || undefined,
      visibility: values.visibility,
      isActive: values.isActive,
      steps,
    };

    try {
      if (mode === 'edit' && templateId) {
        await updateTemplate(templateId, sharedPayload);
        await flushStagedAttachments(
          'template',
          templateId,
          values.steps.map((_, index) => index + 1),
        );
        router.push(toOrgPath(emailTemplateMeta.href));
        return;
      }

      const created = await createTemplate({
        ...sharedPayload,
        type: inferEmailTemplateType(steps.length),
      });
      await flushStagedAttachments(
        'template',
        created.id,
        values.steps.map((_, index) => index + 1),
      );
      router.push(toOrgPath(emailTemplateMeta.href));
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to save template'));
    }
  }

  function handleInvalidSubmit(
    fieldErrors: FieldErrors<EmailTemplateFormValues>,
  ) {
    const issues = collectEmailTemplateValidationIssues(fieldErrors);
    setValidationIssues(issues);
    notifyError(getEmailTemplateValidationToast(fieldErrors));

    const elementId = getFirstEmailTemplateErrorElementId(fieldErrors);
    if (!elementId) {
      return;
    }

    requestAnimationFrame(() => {
      const element = document.getElementById(elementId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (element instanceof HTMLElement) {
        element.focus({ preventScroll: true });
      }
    });
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

  const followUpSteps = fields.slice(1);

  const activeToggle = (
    <Box className="rounded-[12px] border border-surface-border px-3 py-1">
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
            label="Active"
            title="Visible in campaign wizard dropdowns"
            className="mr-0"
          />
        )}
      />
    </Box>
  );

  return (
    <Stack
      spacing={3}
      component="form"
      onSubmit={(event) =>
        void handleSubmit(onSubmit, handleInvalidSubmit)(event)
      }
    >
      <SettingsSubPageHeader
        overline={emailTemplateMeta.pluralLabel}
        title={mode === 'create' ? 'Create email template' : 'Edit email template'}
        description={emailTemplateMeta.description}
        titleAction={activeToggle}
        parentBack={{
          href: emailTemplateMeta.href,
          label: emailTemplateMeta.pluralLabel,
        }}
        showPlatformBackLink={false}
      />

      {mutationError ? <FormAlert message={mutationError} /> : null}

      {validationIssues && validationIssues.length > 0 ? (
        <Alert severity="error" className="rounded-xl">
          <Typography variant="body2" className="font-semibold">
            Complete these items to save your template:
          </Typography>
          <Box component="ul" className="mt-2 list-disc space-y-1 pl-5">
            {validationIssues.map((issue, index) => (
              <Typography
                key={`${index}-${issue}`}
                component="li"
                variant="body2"
              >
                {issue}
              </Typography>
            ))}
          </Box>
        </Alert>
      ) : null}

      <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
        <CardContent className="p-4 md:p-6">
          <Stack spacing={3}>
            <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    id="email-template-name"
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
                    minRows={1}
                  />
                )}
              />

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
            </Box>

            <Box className="rounded-2xl border border-surface-border bg-surface p-4 md:p-5">
              <Typography variant="subtitle1" className="mb-4 font-bold">
                Step 1 — Initial outreach
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

            {followUpSteps.map((field, index) => {
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
                })}

            <AddFollowUpButton onClick={handleAddFollowUp} />

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
                disabled={
                  isSubmitting ||
                  isCreating ||
                  isUpdating ||
                  (mode === 'edit' && !isDirty)
                }
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

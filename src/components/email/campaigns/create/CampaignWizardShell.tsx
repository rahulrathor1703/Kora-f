'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FormProvider,
  useForm,
  useWatch,
  type FieldPath,
} from 'react-hook-form';
import CampaignWizardStepper from '@/components/email/campaigns/create/CampaignWizardStepper';
import AudienceStep from '@/components/email/campaigns/create/steps/AudienceStep';
import ReviewLaunchStep from '@/components/email/campaigns/create/steps/ReviewLaunchStep';
import ScheduleLaunchStep from '@/components/email/campaigns/create/steps/ScheduleLaunchStep';
import BasicInfoStep from '@/components/email/campaigns/create/steps/BasicInfoStep';
import SequenceStep from '@/components/email/campaigns/create/steps/SequenceStep';
import {
  SequenceStepProvider,
  useSequenceStepContext,
} from '@/components/email/campaigns/create/sequence/SequenceStepContext';
import { EmailAttachmentStagingProvider, useEmailAttachmentStaging } from '@/components/email/campaigns/create/sequence/EmailAttachmentStagingContext';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import RequestCampaignDeleteDialog from '@/components/email/campaigns/RequestCampaignDeleteDialog';
import SettingsNavButton from '@/components/settings/SettingsNavButton';
import { useCampaignDeleteRequests } from '@/hooks/useCampaignDeleteRequests';
import { useCampaignWizardAutoSave } from '@/hooks/useCampaignWizardAutoSave';
import { useConfirm } from '@/hooks/useConfirm';
import { useDeleteEmailCampaign } from '@/hooks/useEmailCampaigns';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import { emailCampaignService } from '@/lib/api/services/email-campaign.service';
import { emailAttachmentService } from '@/lib/api/services/email-attachment.service';
import { emailTemplateService } from '@/lib/api/services/email-template.service';
import {
  canSaveBasicInfoDraft,
  mapBasicInfoToCampaignPayload,
  mapBasicInfoUpdatePayload,
  mapWizardFormToCampaignPayload,
} from '@/lib/email/campaigns/campaign-wizard-payload';
import {
  buildWizardProgressPayload,
  saveCampaignWizardDraftAsync,
} from '@/lib/email/campaigns/campaign-wizard-draft-save';
import {
  CAMPAIGN_WIZARD_DEFAULT_VALUES,
  CAMPAIGN_WIZARD_STEPS,
  STEP1_FIELD_NAMES,
  STEP2_FIELD_NAMES,
  STEP3_FIELD_NAMES,
  STEP4_FIELD_NAMES,
} from '@/lib/email/campaigns/wizard-types';
import {
  campaignWizardSchema,
  campaignWizardStep1Schema,
  type CampaignWizardFormValues,
} from '@/lib/schemas/campaign-wizard';

const STEP_COUNT = CAMPAIGN_WIZARD_STEPS.length;

interface CampaignWizardShellProps {
  mode?: 'create' | 'resume';
  initialValues?: CampaignWizardFormValues;
  initialStepIndex?: number;
}

function getContinueLabel(isSaving: boolean): string {
  return isSaving ? 'Saving…' : 'Continue';
}

export default function CampaignWizardShell(props: CampaignWizardShellProps) {
  return (
    <SequenceStepProvider>
      <EmailAttachmentStagingProvider>
        <CampaignWizardShellContent {...props} />
      </EmailAttachmentStagingProvider>
    </SequenceStepProvider>
  );
}

function CampaignWizardShellContent({
  mode = 'create',
  initialValues,
  initialStepIndex = 0,
}: CampaignWizardShellProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { notifyError, notifySuccess } = useNotify();
  const confirm = useConfirm();
  const canDirectDelete = useHasPermission('email-campaigns:delete');
  const canRequestDelete = useHasPermission('email-campaigns:request-delete');
  const { deleteCampaign, isDeleting } = useDeleteEmailCampaign();
  const {
    createDeleteRequest,
    isCreating: isCreatingDeleteRequest,
  } = useCampaignDeleteRequests({ status: 'pending' });
  const [activeStepIndex, setActiveStepIndex] = useState(initialStepIndex);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRequestOpen, setDeleteRequestOpen] = useState(false);
  const isResumeMode = mode === 'resume';
  const isCreateMode = mode === 'create';
  const { canContinue: sequenceCanContinue, setCanContinue } =
    useSequenceStepContext();
  const { flushStagedAttachments } = useEmailAttachmentStaging();

  const form = useForm<CampaignWizardFormValues>({
    resolver: zodResolver(campaignWizardSchema),
    defaultValues: initialValues ?? CAMPAIGN_WIZARD_DEFAULT_VALUES,
    mode: 'onTouched',
  });

  const activeStep = CAMPAIGN_WIZARD_STEPS[activeStepIndex];
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === CAMPAIGN_WIZARD_STEPS.length - 1;
  const isSequenceStep = activeStep.id === 'sequence';
  const isAudienceStep = activeStep.id === 'audience';
  const isScheduleStep = activeStep.id === 'schedule';
  const campaignId = useWatch({ control: form.control, name: 'campaignId' });

  const { disableAutoSave } = useCampaignWizardAutoSave({
    form,
    stepIndex: activeStepIndex,
    enabled: !isSaving && !isDeleting,
  });

  useEffect(() => {
    if (!isSequenceStep) {
      setCanContinue(true);
    }
  }, [isSequenceStep, setCanContinue]);

  const showDirectDelete =
    !isCreateMode && Boolean(campaignId) && canDirectDelete;
  const showRequestDelete =
    !isCreateMode && Boolean(campaignId) && canRequestDelete;

  async function persistWizardProgress(
    stepIndex: number,
    values: CampaignWizardFormValues,
    includeSchedule = false,
  ) {
    if (!values.campaignId) {
      return;
    }

    await emailCampaignService.update(
      values.campaignId,
      buildWizardProgressPayload(stepIndex, values, includeSchedule),
    );
  }

  async function saveBasicInfoDraft(values: CampaignWizardFormValues) {
    if (values.campaignId) {
      return emailCampaignService.update(
        values.campaignId,
        mapBasicInfoUpdatePayload(values),
      );
    }

    return emailCampaignService.create(mapBasicInfoToCampaignPayload(values));
  }

  async function saveDraftProgress(
    stepIndex: number,
    values: CampaignWizardFormValues,
  ) {
    const savedCampaignId = await saveCampaignWizardDraftAsync(stepIndex, values);

    if (!savedCampaignId) {
      return null;
    }

    if (!values.campaignId) {
      form.setValue('campaignId', savedCampaignId, { shouldDirty: false });
    }

    form.reset(form.getValues(), { keepValues: true });

    return savedCampaignId;
  }

  async function handleCancel() {
    if (form.formState.isDirty) {
      const shouldLeave = await confirm({
        title: 'Leave campaign?',
        description:
          'Changes that have not been auto-saved yet will be lost. Already auto-saved drafts remain in your campaigns list.',
        variant: 'warning',
        confirmLabel: 'Leave',
        cancelLabel: 'Keep editing',
      });

      if (!shouldLeave) {
        return;
      }
    }

    disableAutoSave();
    router.push(toOrgPath('/email/campaigns'));
  }

  async function handleExit() {
    if (isCreateMode) {
      await handleCancel();
      return;
    }

    const values = form.getValues();
    const hasSavedDraft = Boolean(values.campaignId);
    const canSaveDraft = canSaveBasicInfoDraft(values);
    const hasUnsavedProgress =
      form.formState.isDirty || (!hasSavedDraft && canSaveDraft);

    if (hasUnsavedProgress) {
      const shouldLeave = await confirm({
        title: canSaveDraft
          ? 'Save and leave campaign?'
          : hasSavedDraft
            ? 'Leave campaign editor?'
            : 'Discard campaign draft?',
        description: canSaveDraft
          ? 'Your progress will be saved as a draft so you can continue later from the campaigns list.'
          : hasSavedDraft
            ? 'You have unsaved changes that cannot be saved yet. Your last saved draft will stay in the campaigns list.'
            : 'You have unsaved changes. Leaving now will discard your progress on this campaign.',
        variant: 'warning',
        confirmLabel: canSaveDraft ? 'Save & leave' : hasSavedDraft ? 'Leave' : 'Discard',
        cancelLabel: 'Keep editing',
      });

      if (!shouldLeave) {
        return;
      }

      if (canSaveDraft) {
        setIsSaving(true);

        try {
          await saveDraftProgress(activeStepIndex, values);
          notifySuccess('Campaign saved as draft');
        } catch (error) {
          setSaveError(
            error instanceof Error
              ? error.message
              : 'Unable to save campaign draft. Please try again.',
          );
          setIsSaving(false);
          return;
        }

        setIsSaving(false);
      }
    }

    router.push(toOrgPath('/email/campaigns'));
  }

  async function handleDeleteCampaign() {
    const currentCampaignId = form.getValues('campaignId');

    if (!currentCampaignId) {
      return;
    }

    try {
      await deleteCampaign(currentCampaignId);
      notifySuccess('Campaign deleted');
      router.push(toOrgPath('/email/campaigns'));
    } catch {
      notifyError('Unable to delete this campaign. Please try again.');
    } finally {
      setDeleteOpen(false);
    }
  }

  async function handleCreateDeleteRequest(reason: string) {
    const currentCampaignId = form.getValues('campaignId');

    if (!currentCampaignId) {
      return;
    }

    try {
      await createDeleteRequest({ campaignId: currentCampaignId, reason });
      notifySuccess('Delete request submitted');
      setDeleteRequestOpen(false);
      router.push(toOrgPath('/email/campaigns'));
    } catch {
      notifyError('Unable to submit delete request');
      throw new Error('Unable to submit delete request');
    }
  }

  async function handleBackToCampaigns(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    await handleExit();
  }

  async function saveDraft(values: CampaignWizardFormValues) {
    const payload = mapWizardFormToCampaignPayload(values);

    if (values.campaignId) {
      return emailCampaignService.update(values.campaignId, payload);
    }

    return emailCampaignService.create(payload);
  }

  function validateFirstStep(): boolean {
    const values = form.getValues();

    form.clearErrors([...STEP1_FIELD_NAMES]);
    values.mailboxSenders.forEach((_, index) => {
      form.clearErrors([
        `mailboxSenders.${index}.senderName`,
        `mailboxSenders.${index}.senderEmail`,
        `mailboxSenders.${index}.dailySendQuota`,
      ]);
    });

    const parsed = campaignWizardStep1Schema.safeParse({
      name: values.name,
      type: values.type,
      brand: values.brand,
      region: values.region,
      customFieldValues: values.customFieldValues,
      goal: values.goal,
      mailboxSenders: values.mailboxSenders,
    });

    if (parsed.success) {
      return true;
    }

    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.') as FieldPath<CampaignWizardFormValues>;
      form.setError(path, { type: 'manual', message: issue.message });
    }

    const firstIssue = parsed.error.issues[0];
    if (firstIssue) {
      form.setFocus(
        firstIssue.path.join('.') as FieldPath<CampaignWizardFormValues>,
      );
    }

    return false;
  }

  async function handleNext() {
    setSaveError(null);

    if (isFirstStep) {
      const values = form.getValues();

      if (!validateFirstStep()) {
        return;
      }

      setIsSaving(true);

      try {
        const saved = await saveBasicInfoDraft(values);
        form.setValue('campaignId', saved.id, { shouldDirty: false });
        await persistWizardProgress(1, { ...values, campaignId: saved.id });
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : 'Unable to save campaign draft. Please try again.',
        );
        setIsSaving(false);
        return;
      }

      setIsSaving(false);
    }

    if (isSequenceStep) {
      const isValid = await form.trigger([...STEP3_FIELD_NAMES]);

      if (!isValid) {
        return;
      }

      setIsSaving(true);

      try {
        const values = form.getValues();
        const saved = await saveDraft(values);
        form.setValue('campaignId', saved.id, { shouldDirty: false });

        const stepOrders = [
          1,
          ...values.followUps.map((_, index) => index + 2),
        ];
        await flushStagedAttachments('campaign', saved.id, stepOrders);

        if (
          values.selectedSequenceTemplateId &&
          !values.templateAttachmentsCopied
        ) {
          const template = await emailTemplateService.getById(
            values.selectedSequenceTemplateId,
          );
          const sortedTemplateSteps = [...template.steps].sort(
            (left, right) => left.stepOrder - right.stepOrder,
          );

          for (const templateStep of sortedTemplateSteps) {
            await emailAttachmentService.copyTemplateAttachmentsToCampaignStep(
              saved.id,
              templateStep.stepOrder,
              templateStep.id,
            );
          }

          form.setValue('templateAttachmentsCopied', true, {
            shouldDirty: false,
          });
        }
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : 'Unable to save campaign draft. Please try again.',
        );
        setIsSaving(false);
        return;
      }

      setIsSaving(false);
    }

    if (isAudienceStep) {
      const isValid = await form.trigger([...STEP2_FIELD_NAMES]);

      if (!isValid) {
        return;
      }

      const currentCampaignId = form.getValues('campaignId');
      if (!currentCampaignId) {
        setSaveError('Complete the details step before selecting an audience.');
        return;
      }

      setIsSaving(true);

      try {
        const values = form.getValues();
        await emailCampaignService.updateAudience(currentCampaignId, {
          audienceListType: values.audienceListType,
          audienceListId: values.audienceListId,
        });
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : 'Unable to save audience selection. Please try again.',
        );
        setIsSaving(false);
        return;
      }

      setIsSaving(false);
    }

    if (isScheduleStep) {
      const isValid = await form.trigger([...STEP4_FIELD_NAMES]);

      if (!isValid) {
        return;
      }

      const currentCampaignId = form.getValues('campaignId');
      if (!currentCampaignId) {
        setSaveError('Complete the earlier wizard steps before scheduling.');
        return;
      }

      setIsSaving(true);

      try {
        const values = form.getValues();
        await persistWizardProgress(activeStepIndex + 1, values, true);
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : 'Unable to save schedule. Please try again.',
        );
        setIsSaving(false);
        return;
      }

      setIsSaving(false);
    }

    if (!isLastStep) {
      const nextStepIndex = activeStepIndex + 1;
      const values = form.getValues();

      if (values.campaignId && !isScheduleStep) {
        setIsSaving(true);

        try {
          await persistWizardProgress(nextStepIndex, values);
        } catch (error) {
          setSaveError(
            error instanceof Error
              ? error.message
              : 'Unable to save wizard progress. Please try again.',
          );
          setIsSaving(false);
          return;
        }

        setIsSaving(false);
      }

      setActiveStepIndex(nextStepIndex);
    }
  }

  async function handleFinish() {
    setSaveError(null);

    const values = form.getValues();
    const quotaFieldPaths = values.mailboxSenders.map(
      (_, index) => `mailboxSenders.${index}.dailySendQuota` as const,
    );

    const isLaunchValid = await form.trigger([
      ...STEP4_FIELD_NAMES,
      'mailboxSenders',
      ...quotaFieldPaths,
    ]);

    if (!isLaunchValid) {
      return;
    }

    const currentCampaignId = values.campaignId;

    if (!currentCampaignId) {
      setSaveError('Complete the earlier wizard steps before scheduling.');
      return;
    }

    setIsSaving(true);

    try {
      await emailCampaignService.update(currentCampaignId, {
        mailboxSenders: values.mailboxSenders,
      });

      await emailCampaignService.schedule(currentCampaignId, {
        launchAt: values.launchDate,
        dailyBatchSize: values.dailyBatchSize,
        sendingWindowStartMinutes: values.sendingWindowStartMinutes,
        sendingWindowEndMinutes: values.sendingWindowEndMinutes,
        timezone: values.timezone,
        activeWeekdays: values.activeWeekdays,
      });

      router.push(toOrgPath('/email/campaigns'));
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Unable to schedule this campaign. Please try again.',
      );
      setIsSaving(false);
    }
  }

  function handleBack() {
    setSaveError(null);

    if (!isFirstStep) {
      setActiveStepIndex((current) => current - 1);
    }
  }

  function renderStepContent() {
    switch (activeStep.id) {
      case 'basic-info':
        return (
          <Stack spacing={2}>
            {saveError ? (
              <Alert severity="error" className="rounded-2xl">
                {saveError}
              </Alert>
            ) : null}
            <BasicInfoStep />
          </Stack>
        );
      case 'sequence':
        return (
          <Stack spacing={2}>
            {saveError ? (
              <Alert severity="error" className="rounded-2xl">
                {saveError}
              </Alert>
            ) : null}
            <SequenceStep isResumeMode={isResumeMode} />
          </Stack>
        );
      case 'audience':
        return (
          <Stack spacing={2}>
            {saveError ? (
              <Alert severity="error" className="rounded-2xl">
                {saveError}
              </Alert>
            ) : null}
            <AudienceStep />
          </Stack>
        );
      case 'schedule':
        return (
          <Stack spacing={2}>
            {saveError ? (
              <Alert severity="error" className="rounded-2xl">
                {saveError}
              </Alert>
            ) : null}
            <ScheduleLaunchStep />
          </Stack>
        );
      case 'review':
        return (
          <Stack spacing={2}>
            {saveError ? (
              <Alert severity="error" className="rounded-2xl">
                {saveError}
              </Alert>
            ) : null}
            <ReviewLaunchStep />
          </Stack>
        );
      default:
        return null;
    }
  }

  return (
    <FormProvider {...form}>
      <Stack spacing={3} className="pb-28">
        <SettingsNavButton
          href="/email/campaigns"
          label="Back to campaigns"
          onClick={(event) => void handleBackToCampaigns(event)}
        />

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            className="mb-1 block font-medium"
          >
            Step {activeStepIndex + 1} of {STEP_COUNT}
          </Typography>
          <Typography variant="h4" component="h1" className="font-bold">
            {isResumeMode ? 'Continue Campaign' : 'New Campaign'}
          </Typography>
          <Typography variant="body1" color="text.secondary" className="mt-1">
            {activeStep.subtitle}
          </Typography>
        </Box>

        <CampaignWizardStepper activeStepIndex={activeStepIndex} />

        <Card className="dashboard-panel rounded-2xl shadow-none">
          <CardContent className="p-4 md:p-6">{renderStepContent()}</CardContent>
        </Card>
      </Stack>

      <Box className="dashboard-fixed-footer">
        <Box className="dashboard-chrome-x flex w-full items-center justify-between gap-4 py-4">
          <Typography variant="body2" color="text.secondary" className="hidden sm:block">
            Step {activeStepIndex + 1} of {STEP_COUNT} · {activeStep.label}
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', ml: { xs: 'auto', sm: 0 } }}
          >
            {!isFirstStep ? (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                disabled={isSaving || isDeleting}
                className="rounded-2xl px-4"
              >
                Back
              </Button>
            ) : null}

            {showDirectDelete ? (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeleteOpen(true)}
                disabled={isSaving || isDeleting}
                className="rounded-2xl px-4"
              >
                Delete
              </Button>
            ) : null}

            {showRequestDelete ? (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeleteRequestOpen(true)}
                disabled={isSaving || isCreatingDeleteRequest}
                className="rounded-2xl px-4"
              >
                Request delete
              </Button>
            ) : null}

            <Button
              variant="outlined"
              onClick={() => void handleCancel()}
              disabled={isSaving || isDeleting}
              className="rounded-2xl px-4"
            >
              Cancel
            </Button>

            {isLastStep ? (
              <Button
                variant="contained"
                onClick={() => void handleFinish()}
                disabled={isSaving || isDeleting}
                className="rounded-2xl px-5 shadow-primary-soft"
              >
                {isSaving ? 'Scheduling…' : 'Schedule campaign'}
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => void handleNext()}
                disabled={
                  isSaving ||
                  isDeleting ||
                  (isSequenceStep && !sequenceCanContinue)
                }
                className="rounded-2xl px-5 shadow-primary-soft"
              >
                {getContinueLabel(isSaving)}
              </Button>
            )}
          </Stack>
        </Box>
      </Box>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete campaign"
        description={
          <>Delete this campaign permanently? This action cannot be undone.</>
        }
        variant="destructive"
        confirmLabel="Delete"
        isLoading={isDeleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void handleDeleteCampaign()}
      />

      <RequestCampaignDeleteDialog
        open={deleteRequestOpen}
        campaignName={form.getValues('name') || 'this campaign'}
        isSubmitting={isCreatingDeleteRequest}
        onClose={() => setDeleteRequestOpen(false)}
        onSubmit={handleCreateDeleteRequest}
      />
    </FormProvider>
  );
}

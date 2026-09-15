'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import SequenceEditor from '@/components/email/campaigns/create/sequence/SequenceEditor';
import SequenceSetupChoice, {
  type SequenceSetupMode,
} from '@/components/email/campaigns/create/sequence/SequenceSetupChoice';
import SequenceTemplatePreview from '@/components/email/campaigns/create/sequence/SequenceTemplatePreview';
import { useSequenceStepContext } from '@/components/email/campaigns/create/sequence/SequenceStepContext';
import WizardFormSection from '@/components/email/campaigns/create/WizardFormSection';
import TemplateSelectField from '@/components/email/campaigns/shared/TemplateSelectField';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import {
  getScratchInitialOutreach,
  hasSequenceContent,
  mapSequenceTemplateToWizardSteps,
} from '@/lib/email/campaigns/template-mapping';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

export type SequencePhase =
  | 'choice'
  | 'template-select'
  | 'template-preview'
  | 'editor';

interface SequenceStepProps {
  isResumeMode?: boolean;
}

function resolveInitialPhase(
  values: CampaignWizardFormValues,
  isResumeMode: boolean,
): SequencePhase {
  if (isResumeMode && hasSequenceContent(values)) {
    return 'editor';
  }

  if (values.sequenceSetupMode === 'scratch') {
    return 'editor';
  }

  if (values.sequenceSetupMode === 'template') {
    if (!values.selectedSequenceTemplateId) {
      return 'template-select';
    }

    return values.sequenceCustomized ? 'editor' : 'template-preview';
  }

  return 'choice';
}

function canContinueForPhase(phase: SequencePhase): boolean {
  return phase === 'template-preview' || phase === 'editor';
}

export default function SequenceStep({ isResumeMode = false }: SequenceStepProps) {
  const { setCanContinue } = useSequenceStepContext();
  const { control, getValues, setValue, watch } =
    useFormContext<CampaignWizardFormValues>();
  const { templates, isLoading, refetch } = useEmailTemplates({ type: 'sequence' });
  const selectedSequenceTemplateId = watch('selectedSequenceTemplateId') ?? '';
  const sequenceSetupMode = watch('sequenceSetupMode');
  const { replace } = useFieldArray({
    control,
    name: 'followUps',
  });

  const [phase, setPhase] = useState<SequencePhase>(() =>
    resolveInitialPhase(getValues(), isResumeMode),
  );
  const [skippedChoiceOnResume] = useState(
    () => isResumeMode && hasSequenceContent(getValues()),
  );

  const selectedTemplate = templates.find(
    (template) => template.id === selectedSequenceTemplateId,
  );

  useEffect(() => {
    setCanContinue(canContinueForPhase(phase));
  }, [phase, setCanContinue]);

  function handleSetupChoice(mode: SequenceSetupMode) {
    setValue('sequenceSetupMode', mode, { shouldDirty: true });
    setValue('sequenceCustomized', false, { shouldDirty: true });

    if (mode === 'template') {
      setPhase('template-select');
      return;
    }

    const scratch = getScratchInitialOutreach();
    setValue('initialOutreach', scratch, { shouldDirty: true });
    setValue('selectedSequenceTemplateId', '', { shouldDirty: true });
    replace([]);
    setPhase('editor');
  }

  function handleTemplateSelect(templateId: string) {
    if (!templateId) {
      return;
    }

    const template = templates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }

    setValue('selectedSequenceTemplateId', templateId, { shouldDirty: true });
    setValue('sequenceCustomized', false, { shouldDirty: true });
    setValue('templateAttachmentsCopied', false, { shouldDirty: true });

    const mapped = mapSequenceTemplateToWizardSteps(template);
    setValue('initialOutreach', mapped.initialOutreach, { shouldDirty: true });
    replace(mapped.followUps);
    setPhase('template-preview');
  }

  function handleCustomize() {
    setValue('sequenceCustomized', true, { shouldDirty: true });
    setPhase('editor');
  }

  function handleInnerBack() {
    if (phase === 'editor') {
      if (sequenceSetupMode === 'template') {
        setValue('sequenceCustomized', false, { shouldDirty: true });
        setPhase('template-preview');
        return;
      }

      setValue('sequenceSetupMode', undefined, { shouldDirty: true });
      setValue('selectedSequenceTemplateId', '', { shouldDirty: true });
      setValue('sequenceCustomized', false, { shouldDirty: true });
      setPhase('choice');
      return;
    }

    if (phase === 'template-preview') {
      setValue('selectedSequenceTemplateId', '', { shouldDirty: true });
      setValue('sequenceCustomized', false, { shouldDirty: true });
      setPhase('template-select');
      return;
    }

    if (phase === 'template-select') {
      setValue('sequenceSetupMode', undefined, { shouldDirty: true });
      setPhase('choice');
    }
  }

  const showInnerBack = phase !== 'choice' && !skippedChoiceOnResume;

  function renderPhaseIntro() {
    switch (phase) {
      case 'choice':
        return {
          title: 'How do you want to start?',
          description: 'Choose a saved template or write your own emails.',
        };
      case 'template-select':
        return {
          title: 'Pick a template',
          description: 'Select a saved sequence to use as-is.',
        };
      case 'template-preview':
        return null;
      case 'editor':
        return {
          title: 'Email sequence',
          description:
            'Write your opening email below, then add follow-ups for people who do not reply.',
        };
      default:
        return null;
    }
  }

  const intro = renderPhaseIntro();

  return (
    <Stack spacing={4}>
      {showInnerBack ? (
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleInnerBack}
          className="self-start rounded-2xl px-4"
        >
          Back
        </Button>
      ) : null}

      {intro ? (
        <Stack spacing={0.75}>
          <Typography variant="h6" component="h2" className="font-bold">
            {intro.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {intro.description}
          </Typography>
        </Stack>
      ) : null}

      {phase === 'choice' ? (
        <SequenceSetupChoice onSelect={handleSetupChoice} />
      ) : null}

      {phase === 'template-select' ? (
        <WizardFormSection
          title="Sequence template"
          description="Pick a saved sequence to pre-fill your campaign emails."
        >
          <TemplateSelectField
            type="sequence"
            value={selectedSequenceTemplateId}
            onChange={handleTemplateSelect}
            label="Sequence template"
            templates={templates}
            isLoading={isLoading}
            includeScratchOption={false}
          />
        </WizardFormSection>
      ) : null}

      {phase === 'template-preview' && selectedTemplate ? (
        <SequenceTemplatePreview
          templateName={selectedTemplate.name}
          onCustomize={handleCustomize}
        />
      ) : null}

      {phase === 'editor' ? (
        <SequenceEditor onTemplateSaved={refetch} />
      ) : null}
    </Stack>
  );
}

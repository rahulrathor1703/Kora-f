'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { canSaveBasicInfoDraft } from '@/lib/email/campaigns/campaign-wizard-payload';
import {
  flushCampaignWizardDraftKeepalive,
  saveCampaignWizardDraftAsync,
} from '@/lib/email/campaigns/campaign-wizard-draft-save';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

const DEFAULT_DEBOUNCE_MS = 2_000;

interface UseCampaignWizardAutoSaveOptions {
  form: UseFormReturn<CampaignWizardFormValues>;
  stepIndex: number;
  enabled?: boolean;
  debounceMs?: number;
}

export function useCampaignWizardAutoSave({
  form,
  stepIndex,
  enabled = true,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: UseCampaignWizardAutoSaveOptions) {
  const saveInFlightRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepIndexRef = useRef(stepIndex);
  const enabledRef = useRef(enabled);
  const skipFlushOnUnmountRef = useRef(false);
  const latestValuesRef = useRef(form.getValues());

  const cancelPendingSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const disableAutoSave = useCallback(() => {
    enabledRef.current = false;
    skipFlushOnUnmountRef.current = true;
    cancelPendingSave();
  }, [cancelPendingSave]);

  useEffect(() => {
    stepIndexRef.current = stepIndex;
    enabledRef.current = enabled;
  }, [enabled, stepIndex]);

  const flushSave = useCallback(async (options?: { keepalive?: boolean }) => {
    if (!enabledRef.current) {
      return;
    }

    const values = latestValuesRef.current;
    const currentStepIndex = stepIndexRef.current;

    if (!canSaveBasicInfoDraft(values)) {
      return;
    }

    if (options?.keepalive) {
      flushCampaignWizardDraftKeepalive(currentStepIndex, values);
      return;
    }

    const hasUnsavedChanges = form.formState.isDirty || !values.campaignId;

    if (!hasUnsavedChanges) {
      return;
    }

    if (saveInFlightRef.current) {
      return;
    }

    saveInFlightRef.current = true;

    try {
      const savedCampaignId = await saveCampaignWizardDraftAsync(
        currentStepIndex,
        values,
      );

      if (!savedCampaignId) {
        return;
      }

      if (!values.campaignId) {
        form.setValue('campaignId', savedCampaignId, { shouldDirty: false });
        latestValuesRef.current = {
          ...latestValuesRef.current,
          campaignId: savedCampaignId,
        };
      }

      form.reset(form.getValues(), { keepValues: true });
    } catch {
      // Auto-save is best effort; explicit save paths still show errors.
    } finally {
      saveInFlightRef.current = false;
    }
  }, [form]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const subscription = form.watch((values) => {
      latestValuesRef.current = values as CampaignWizardFormValues;

      if (!canSaveBasicInfoDraft(latestValuesRef.current)) {
        return;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        void flushSave();
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [debounceMs, enabled, flushSave, form]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handlePageHide() {
      void flushSave({ keepalive: true });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        void flushSave({ keepalive: true });
      }
    }

    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (!skipFlushOnUnmountRef.current) {
        void flushSave({ keepalive: true });
      }
    };
  }, [enabled, flushSave]);

  return { cancelPendingSave, disableAutoSave };
}

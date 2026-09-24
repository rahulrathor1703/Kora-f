'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { useMemo, useState } from 'react';
import WebsiteWizardDetailsStep from '@/components/website/config/wizard/WebsiteWizardDetailsStep';
import WebsiteWizardGoogleStep from '@/components/website/config/wizard/WebsiteWizardGoogleStep';
import WebsiteWizardIntegrationsStep from '@/components/website/config/wizard/WebsiteWizardIntegrationsStep';
import { useGooglePropertySuggestions } from '@/hooks/useGooglePropertySuggestions';
import { onPageSeoService } from '@/lib/api/services/on-page-seo.service';
import { websiteService } from '@/lib/api/services/website.service';
import type {
  CreateWebsitePropertyInput,
  UpdateWebsitePropertyInput,
  WebsiteProperty,
} from '@/lib/website/on-page-seo/types';
import type { WebsiteWizardDraft } from '@/lib/website/wizard-session';
import {
  clearWebsiteWizardDraft,
  readWebsiteWizardDraft,
  writeWebsiteWizardDraft,
} from '@/lib/website/wizard-session';

interface WebsitePropertyFormDialogProps {
  open: boolean;
  property?: WebsiteProperty | null;
  isSaving: boolean;
  canManageIntegrations?: boolean;
  initialConnectionId?: string | null;
  initialOAuthAppId?: string | null;
  initialStep?: number;
  onClose: () => void;
  onSubmit: (
    input: CreateWebsitePropertyInput | UpdateWebsitePropertyInput,
  ) => Promise<void>;
  onPropertyUpdated?: (property: WebsiteProperty) => void;
  onRefreshProperties?: () => void;
}

const STEPS = ['Sign in with Google', 'Website details', 'Integrations'];
const DEFAULT_MAX_PAGES = 20;

function createDraftFromProperty(
  property: WebsiteProperty | null | undefined,
  overrides?: Partial<WebsiteWizardDraft>,
): WebsiteWizardDraft {
  return {
    mode: property?.id ? 'edit' : 'add',
    activeStep: 0,
    selectedOAuthAppId: null,
    selectedConnectionId: property?.googleConnectionId ?? null,
    propertyId: property?.id ?? null,
    name: property?.name ?? '',
    domain: property?.domain ?? '',
    sitemapUrl: property?.sitemapUrl ?? '',
    maxPages: property?.maxPages ?? DEFAULT_MAX_PAGES,
    isActive: property?.isActive ?? true,
    ga4Enabled: property?.ga4Enabled ?? false,
    ga4PropertyId: property?.ga4PropertyId ?? '',
    ga4PropertyName: property?.ga4PropertyName ?? '',
    gscEnabled: property?.gscEnabled ?? false,
    gscSiteUrl: property?.gscSiteUrl ?? '',
    psiEnabled: property?.psiEnabled ?? false,
    ...overrides,
  };
}

function WebsitePropertyWizard({
  property,
  isSaving,
  canManageIntegrations = false,
  initialConnectionId,
  initialOAuthAppId,
  initialStep,
  onClose,
  onSubmit,
  onPropertyUpdated,
  onRefreshProperties,
}: Omit<WebsitePropertyFormDialogProps, 'open'>) {
  const [draft, setDraft] = useState<WebsiteWizardDraft>(() => {
    const restored = readWebsiteWizardDraft();
    if (restored && (!property?.id || restored.propertyId === property.id)) {
      return {
        ...restored,
        selectedOAuthAppId:
          initialOAuthAppId ?? restored.selectedOAuthAppId,
        selectedConnectionId:
          initialConnectionId ?? restored.selectedConnectionId,
        activeStep: initialStep ?? restored.activeStep,
      };
    }

    return createDraftFromProperty(property, {
      selectedOAuthAppId: initialOAuthAppId ?? null,
      selectedConnectionId: initialConnectionId ?? property?.googleConnectionId ?? null,
      activeStep: initialStep ?? 0,
    });
  });
  const [stepError, setStepError] = useState<string | null>(null);

  const { suggestions } = useGooglePropertySuggestions(draft.domain, {
    propertyId: draft.propertyId,
    connectionId: draft.selectedConnectionId,
    enabled:
      draft.activeStep === 2 &&
      Boolean(draft.selectedConnectionId) &&
      draft.domain.trim().length >= 3,
  });

  function updateDraft(patch: Partial<WebsiteWizardDraft>) {
    setDraft((current) => {
      const next = { ...current, ...patch };
      writeWebsiteWizardDraft(next);
      return next;
    });
  }

  const resolvedGa4PropertyId = useMemo(() => {
    return (
      draft.ga4PropertyId ||
      (draft.ga4Enabled ? (suggestions?.ga4.suggested?.propertyId ?? '') : '')
    );
  }, [draft.ga4Enabled, draft.ga4PropertyId, suggestions?.ga4.suggested?.propertyId]);

  const resolvedGa4PropertyName = useMemo(() => {
    return (
      draft.ga4PropertyName ||
      (draft.ga4Enabled ? (suggestions?.ga4.suggested?.propertyName ?? '') : '')
    );
  }, [
    draft.ga4Enabled,
    draft.ga4PropertyName,
    suggestions?.ga4.suggested?.propertyName,
  ]);

  const resolvedGscSiteUrl = useMemo(() => {
    return (
      draft.gscSiteUrl ||
      (draft.gscEnabled ? (suggestions?.gsc.suggested?.siteUrl ?? '') : '')
    );
  }, [draft.gscEnabled, draft.gscSiteUrl, suggestions?.gsc.suggested?.siteUrl]);

  const canProceedFromGoogle = Boolean(draft.selectedConnectionId);
  const canProceedFromDetails =
    draft.name.trim() &&
    draft.domain.trim() &&
    draft.sitemapUrl.trim();

  const canSaveIntegrations =
    (!draft.ga4Enabled || resolvedGa4PropertyId) &&
    (!draft.gscEnabled || resolvedGscSiteUrl);

  async function persistDetailsStep(): Promise<WebsiteProperty | null> {
    if (!draft.selectedConnectionId) {
      throw new Error('Select a Google account before continuing.');
    }

    if (draft.propertyId) {
      await websiteService.assignPropertyGoogleConnection(
        draft.propertyId,
        draft.selectedConnectionId,
      );

      await onSubmit({
        name: draft.name.trim(),
        domain: draft.domain.trim(),
        sitemapUrl: draft.sitemapUrl.trim(),
        maxPages: draft.maxPages,
        isActive: draft.isActive,
      });

      const properties = await onPageSeoService.getProperties();
      const updated = properties.find((item) => item.id === draft.propertyId) ?? null;
      if (updated) {
        onPropertyUpdated?.(updated);
      }
      await onRefreshProperties?.();
      return updated;
    }

    const created = await onPageSeoService.createProperty({
      name: draft.name.trim(),
      domain: draft.domain.trim(),
      sitemapUrl: draft.sitemapUrl.trim(),
      googleConnectionId: draft.selectedConnectionId,
      maxPages: draft.maxPages,
      isActive: draft.isActive,
    });

    updateDraft({ propertyId: created.id });
    onPropertyUpdated?.(created);
    await onRefreshProperties?.();
    return created;
  }

  async function handleNext() {
    setStepError(null);

    try {
      if (draft.activeStep === 0) {
        if (!canProceedFromGoogle) {
          setStepError('Connect or select a Google account to continue.');
          return;
        }

        updateDraft({ activeStep: 1 });
        return;
      }

      if (draft.activeStep === 1) {
        if (!canProceedFromDetails) {
          setStepError('Fill in all required website details.');
          return;
        }

        await persistDetailsStep();
        updateDraft({ activeStep: 2 });
        return;
      }
    } catch (error) {
      setStepError(error instanceof Error ? error.message : 'Unable to continue.');
    }
  }

  async function handleSave() {
    setStepError(null);

    if (!draft.propertyId || !canSaveIntegrations) {
      setStepError('Complete the integration settings before saving.');
      return;
    }

    try {
      const updated = await onPageSeoService.updateProperty(draft.propertyId, {
        ga4Enabled: canManageIntegrations ? draft.ga4Enabled : undefined,
        ga4PropertyId:
          canManageIntegrations && draft.ga4Enabled
            ? resolvedGa4PropertyId
            : undefined,
        ga4PropertyName:
          canManageIntegrations && draft.ga4Enabled
            ? resolvedGa4PropertyName
            : undefined,
        gscEnabled: canManageIntegrations ? draft.gscEnabled : undefined,
        gscSiteUrl:
          canManageIntegrations && draft.gscEnabled
            ? resolvedGscSiteUrl
            : undefined,
        psiEnabled: canManageIntegrations ? draft.psiEnabled : undefined,
      });

      onPropertyUpdated?.(updated);
      await onRefreshProperties?.();
      clearWebsiteWizardDraft();
      onClose();
    } catch (error) {
      setStepError(error instanceof Error ? error.message : 'Failed to save website');
    }
  }

  function handleBack() {
    setStepError(null);
    updateDraft({ activeStep: Math.max(0, draft.activeStep - 1) });
  }

  function handleClose() {
    clearWebsiteWizardDraft();
    onClose();
  }

  return (
    <>
      <DialogContent>
        <Stepper activeStep={draft.activeStep} alternativeLabel className="mb-6">
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {stepError ? (
          <div className="mb-4 rounded-xl bg-error-main/10 px-4 py-3 text-sm text-error-main">
            {stepError}
          </div>
        ) : null}

        {draft.activeStep === 0 ? (
          <WebsiteWizardGoogleStep
            draft={draft}
            canManageIntegrations={canManageIntegrations}
            onSelectOAuthApp={(oauthAppId) =>
              updateDraft({ selectedOAuthAppId: oauthAppId })
            }
            onSelectConnection={(connectionId) =>
              updateDraft({ selectedConnectionId: connectionId })
            }
            onGoogleConnected={() => updateDraft({ activeStep: 1 })}
          />
        ) : null}

        {draft.activeStep === 1 ? (
          <WebsiteWizardDetailsStep draft={draft} onChange={updateDraft} />
        ) : null}

        {draft.activeStep === 2 ? (
          <WebsiteWizardIntegrationsStep
            draft={draft}
            canManageIntegrations={canManageIntegrations}
            onChange={updateDraft}
          />
        ) : null}
      </DialogContent>

      <DialogActions className="px-6 pb-5">
        <Button onClick={handleClose} disabled={isSaving}>
          Cancel
        </Button>
        {draft.activeStep > 0 ? (
          <Button onClick={handleBack} disabled={isSaving}>
            Back
          </Button>
        ) : null}
        {draft.activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => void handleNext()}
            disabled={
              isSaving ||
              (draft.activeStep === 0 && !canProceedFromGoogle) ||
              (draft.activeStep === 1 && !canProceedFromDetails)
            }
            className="rounded-2xl"
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={isSaving || !canSaveIntegrations}
            className="rounded-2xl"
          >
            Save website
          </Button>
        )}
      </DialogActions>
    </>
  );
}

export default function WebsitePropertyFormDialog({
  open,
  property,
  isSaving,
  canManageIntegrations,
  initialConnectionId,
  initialOAuthAppId,
  initialStep,
  onClose,
  onSubmit,
  onPropertyUpdated,
  onRefreshProperties,
}: WebsitePropertyFormDialogProps) {
  const dialogKey = `${property?.id ?? 'new'}-${initialConnectionId ?? 'none'}-${initialOAuthAppId ?? 'none'}-${initialStep ?? 0}-${open}`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{property?.id ? 'Edit website' : 'Add website'}</DialogTitle>
      {open ? (
        <WebsitePropertyWizard
          key={dialogKey}
          property={property}
          isSaving={isSaving}
          canManageIntegrations={canManageIntegrations}
          initialConnectionId={initialConnectionId}
          initialOAuthAppId={initialOAuthAppId}
          initialStep={initialStep}
          onClose={onClose}
          onSubmit={onSubmit}
          onPropertyUpdated={onPropertyUpdated}
          onRefreshProperties={onRefreshProperties}
        />
      ) : null}
    </Dialog>
  );
}

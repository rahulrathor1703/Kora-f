import { API_BASE_URL } from '@/lib/api/config';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { emailCampaignService } from '@/lib/api/services/email-campaign.service';
import {
  canSaveBasicInfoDraft,
  mapBasicInfoToCampaignPayload,
  mapBasicInfoUpdatePayload,
  mapWizardFormToDraftCreatePayload,
  mapWizardFormToDraftUpdatePayload,
} from '@/lib/email/campaigns/campaign-wizard-payload';
import type { UpdateEmailCampaignInput } from '@/lib/email/campaigns/types';
import { CAMPAIGN_WIZARD_STEPS } from '@/lib/email/campaigns/wizard-types';
import { getOrganizationContextHeaders } from '@/lib/platform/impersonation-cookie';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function buildWizardProgressPayload(
  stepIndex: number,
  values: CampaignWizardFormValues,
  includeSchedule: boolean,
): UpdateEmailCampaignInput {
  const payload: UpdateEmailCampaignInput = {
    wizardStepIndex: stepIndex,
  };

  if (includeSchedule) {
    if (values.launchDate) {
      payload.launchAt = values.launchDate;
    }

    payload.dailyBatchSize = values.dailyBatchSize;
    payload.sendingWindowStartMinutes = values.sendingWindowStartMinutes;
    payload.sendingWindowEndMinutes = values.sendingWindowEndMinutes;
    payload.timezone = values.timezone;
    payload.activeWeekdays = values.activeWeekdays;
  }

  return payload;
}

export function buildAutoSaveUpdatePayload(
  stepIndex: number,
  values: CampaignWizardFormValues,
): UpdateEmailCampaignInput {
  const stepId = CAMPAIGN_WIZARD_STEPS[stepIndex]?.id;
  const includeSchedule = stepId === 'schedule' || stepId === 'review';

  const payload: UpdateEmailCampaignInput =
    stepId === 'basic-info'
      ? mapBasicInfoUpdatePayload(values)
      : mapWizardFormToDraftUpdatePayload(values);

  Object.assign(
    payload,
    buildWizardProgressPayload(stepIndex, values, includeSchedule),
  );

  const audienceListId = values.audienceListId.trim();

  if (
    (stepId === 'audience' ||
      stepId === 'schedule' ||
      stepId === 'review') &&
    audienceListId &&
    UUID_PATTERN.test(audienceListId)
  ) {
    payload.audienceListType = values.audienceListType;
    payload.audienceListId = audienceListId;
  }

  return payload;
}

function sendKeepaliveRequest(
  path: string,
  method: 'POST' | 'PATCH',
  body: unknown,
): void {
  try {
    void fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: 'include',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        ...getOrganizationContextHeaders(),
      },
      body: JSON.stringify(body),
    });
  } catch {
    // Best-effort save during page unload.
  }
}

export function flushCampaignWizardDraftKeepalive(
  stepIndex: number,
  values: CampaignWizardFormValues,
): void {
  if (!canSaveBasicInfoDraft(values)) {
    return;
  }

  const stepId = CAMPAIGN_WIZARD_STEPS[stepIndex]?.id;

  if (!values.campaignId) {
    const createPayload =
      stepId === 'basic-info'
        ? mapBasicInfoToCampaignPayload(values)
        : mapWizardFormToDraftCreatePayload(values);

    sendKeepaliveRequest(ENDPOINTS.emailCampaigns.list, 'POST', createPayload);
    return;
  }

  sendKeepaliveRequest(
    ENDPOINTS.emailCampaigns.byId(values.campaignId),
    'PATCH',
    buildAutoSaveUpdatePayload(stepIndex, values),
  );
}

export async function saveCampaignWizardDraftAsync(
  stepIndex: number,
  values: CampaignWizardFormValues,
): Promise<string | null> {
  if (!canSaveBasicInfoDraft(values)) {
    return null;
  }

  const stepId = CAMPAIGN_WIZARD_STEPS[stepIndex]?.id;
  let campaignId = values.campaignId;

  if (!campaignId) {
    const created = await emailCampaignService.create(
      stepId === 'basic-info'
        ? mapBasicInfoToCampaignPayload(values)
        : mapWizardFormToDraftCreatePayload(values),
    );
    campaignId = created.id;
  }

  await emailCampaignService.update(
    campaignId,
    buildAutoSaveUpdatePayload(stepIndex, values),
  );

  return campaignId;
}

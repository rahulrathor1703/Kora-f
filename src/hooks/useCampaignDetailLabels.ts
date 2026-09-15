'use client';

import { useMemo } from 'react';
import { useCampaignCustomFields } from '@/hooks/useCampaignCustomFields';
import { useContactLists } from '@/hooks/useContactLists';
import { useEmailConfigOptions } from '@/hooks/useEmailConfigOptions';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useManualLists } from '@/hooks/useManualLists';
import type { EmailCampaign } from '@/lib/email/campaigns/types';

export interface CampaignCustomFieldLabel {
  label: string;
  value: string;
}

export interface CampaignDetailLabels {
  typeLabel: string;
  brandLabel: string;
  regionLabel: string;
  customFieldLabels: CampaignCustomFieldLabel[];
  audienceSummary: string;
  audienceListName: string;
}

export function useCampaignDetailLabels(
  campaign: EmailCampaign | null,
): CampaignDetailLabels {
  const { lists: contactLists } = useContactLists();
  const { lists: manualLists } = useManualLists();
  const canViewManualLists = useHasPermission('manual-lists:read');
  const { options: typeOptions } = useEmailConfigOptions('campaign-type');
  const { options: brandOptions } = useEmailConfigOptions('brand');
  const { options: regionOptions } = useEmailConfigOptions('region');
  const { definitions: customFieldDefinitions } = useCampaignCustomFields();

  return useMemo(() => {
    if (!campaign) {
      return {
        typeLabel: '—',
        brandLabel: '—',
        regionLabel: '—',
        customFieldLabels: [],
        audienceSummary: '—',
        audienceListName: '—',
      };
    }

    const typeLabel =
      typeOptions.find((option) => option.id === campaign.campaignTypeId)?.label ??
      '—';
    const brandLabel =
      brandOptions.find((option) => option.id === campaign.brandId)?.label ?? '—';
    const regionLabel =
      regionOptions.find((option) => option.id === campaign.regionId)?.label ?? '—';

    const customFieldLabels = customFieldDefinitions
      .map((definition) => {
        const rawValue = campaign.customFieldValues?.[definition.id];
        if (!rawValue?.trim()) {
          return null;
        }

        if (definition.type === 'select') {
          const optionLabel =
            definition.options.find((option) => option.id === rawValue)?.label ??
            rawValue;

          return {
            label: definition.label,
            value: optionLabel,
          };
        }

        return {
          label: definition.label,
          value: rawValue,
        };
      })
      .filter((item): item is CampaignCustomFieldLabel => item !== null);

    let audienceSummary = '—';
    let audienceListName = '—';

    if (campaign.audienceListId) {
      if (campaign.audienceListType === 'contact') {
        const list = contactLists.find(
          (item) => item.id === campaign.audienceListId,
        );
        if (list) {
          audienceListName = list.name;
          audienceSummary = `${list.name} (${list.contactCount.toLocaleString()} contacts)`;
        }
      } else if (canViewManualLists) {
        const list = manualLists.find(
          (item) => item.id === campaign.audienceListId,
        );
        if (list) {
          audienceListName = list.name;
          audienceSummary = `${list.name} (${list.rowCount.toLocaleString()} rows)`;
        }
      }
    }

    return {
      typeLabel,
      brandLabel,
      regionLabel,
      customFieldLabels,
      audienceSummary,
      audienceListName,
    };
  }, [
    campaign,
    canViewManualLists,
    contactLists,
    customFieldDefinitions,
    manualLists,
    brandOptions,
    regionOptions,
    typeOptions,
  ]);
}

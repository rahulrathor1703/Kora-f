'use client';

import Grid from '@mui/material/Grid';
import ReviewSectionBox from '@/components/email/campaigns/create/ReviewSectionBox';
import {
  ReviewSummaryRow,
  ReviewSummaryRows,
} from '@/components/email/campaigns/create/ReviewSummaryRows';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useContactLists } from '@/hooks/useContactLists';
import { useCampaignCustomFields } from '@/hooks/useCampaignCustomFields';
import { useEmailConfigOptions } from '@/hooks/useEmailConfigOptions';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useManualLists } from '@/hooks/useManualLists';
import {
  computeEstimatedEndDateLabel,
  formatActiveWeekdays,
  formatSendingWindowDuration,
  formatTimezoneLabel,
} from '@/lib/email/campaigns/schedule-utils';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

export default function CampaignSummaryCard() {
  const { watch } = useFormContext<CampaignWizardFormValues>();
  const values = watch();
  const { lists: contactLists } = useContactLists();
  const { lists: manualLists } = useManualLists();
  const canViewManualLists = useHasPermission('manual-lists:read');
  const { options: typeOptions } = useEmailConfigOptions('campaign-type');
  const { options: brandOptions } = useEmailConfigOptions('brand');
  const { options: regionOptions } = useEmailConfigOptions('region');
  const { definitions: customFieldDefinitions } = useCampaignCustomFields();

  const audienceSummary = useMemo(() => {
    if (!values.audienceListId) {
      return '—';
    }

    if (values.audienceListType === 'contact') {
      const list = contactLists.find((item) => item.id === values.audienceListId);
      if (!list) {
        return '—';
      }

      return `${list.name} (${list.contactCount.toLocaleString()} contacts)`;
    }

    if (!canViewManualLists) {
      return '—';
    }

    const list = manualLists.find((item) => item.id === values.audienceListId);
    if (!list) {
      return '—';
    }

    return `${list.name} (${list.rowCount.toLocaleString()} rows)`;
  }, [
    canViewManualLists,
    contactLists,
    manualLists,
    values.audienceListId,
    values.audienceListType,
  ]);

  const audienceCount = useMemo(() => {
    if (!values.audienceListId) {
      return 0;
    }

    if (values.audienceListType === 'contact') {
      const list = contactLists.find((item) => item.id === values.audienceListId);
      return list?.contactCount ?? 0;
    }

    if (!canViewManualLists) {
      return 0;
    }

    const list = manualLists.find((item) => item.id === values.audienceListId);
    return list?.rowCount ?? 0;
  }, [
    canViewManualLists,
    contactLists,
    manualLists,
    values.audienceListId,
    values.audienceListType,
  ]);

  const typeLabel = values.type
    ? (typeOptions.find((option) => option.id === values.type)?.label ?? 'Not set')
    : 'Not set';
  const brandLabel = values.brand
    ? (brandOptions.find((option) => option.id === values.brand)?.label ?? 'Not set')
    : 'Not set';
  const regionLabel = values.region
    ? (regionOptions.find((option) => option.id === values.region)?.label ??
      'Not set')
    : 'Not set';
  const customFieldRows = customFieldDefinitions
    .map((definition) => {
      const rawValue = values.customFieldValues?.[definition.id]?.trim();
      if (!rawValue) {
        return null;
      }

      const displayValue =
        definition.type === 'select'
          ? (definition.options.find((option) => option.id === rawValue)?.label ??
            rawValue)
          : rawValue;

      return {
        label: definition.label,
        value: displayValue,
      };
    })
    .filter((row): row is { label: string; value: string } => row !== null);
  const sequenceSummary = `${values.followUps.length + 1} emails (${values.followUps.length} follow-ups)`;
  const launchSummary = values.launchDate
    ? new Date(`${values.launchDate}T00:00:00`).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  const endDateSummary = useMemo(() => {
    if (!values.launchDate || audienceCount <= 0 || values.dailyBatchSize <= 0) {
      return '—';
    }

    return computeEstimatedEndDateLabel(
      values.launchDate,
      audienceCount,
      values.dailyBatchSize,
      values.sendingWindowEndMinutes,
      values.timezone,
      values.activeWeekdays,
    );
  }, [
    audienceCount,
    values.activeWeekdays,
    values.dailyBatchSize,
    values.launchDate,
    values.sendingWindowEndMinutes,
    values.timezone,
  ]);

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <ReviewSectionBox title="Campaign">
          <ReviewSummaryRows>
            <ReviewSummaryRow label="Name" value={values.name || '—'} />
            <ReviewSummaryRow label="Brand" value={brandLabel} />
            <ReviewSummaryRow label="Type" value={typeLabel} />
            <ReviewSummaryRow label="Region" value={regionLabel} />
            {customFieldRows.map((row) => (
              <ReviewSummaryRow key={row.label} label={row.label} value={row.value} />
            ))}
          </ReviewSummaryRows>
        </ReviewSectionBox>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ReviewSectionBox title="Audience">
          <ReviewSummaryRows>
            <ReviewSummaryRow label="List" value={audienceSummary} />
          </ReviewSummaryRows>
        </ReviewSectionBox>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ReviewSectionBox title="Sequence">
          <ReviewSummaryRows>
            <ReviewSummaryRow label="Emails" value={sequenceSummary} />
          </ReviewSummaryRows>
        </ReviewSectionBox>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <ReviewSectionBox title="Schedule">
          <ReviewSummaryRows>
            <ReviewSummaryRow label="Launch" value={launchSummary} />
            <ReviewSummaryRow label="End Date" value={endDateSummary} />
            <ReviewSummaryRow
              label="Timezone"
              value={values.timezone ? formatTimezoneLabel(values.timezone) : '—'}
            />
            <ReviewSummaryRow
              label="Sending Window"
              value={formatSendingWindowDuration(
                values.sendingWindowStartMinutes,
                values.sendingWindowEndMinutes,
              )}
            />
            <ReviewSummaryRow
              label="Active Days"
              value={formatActiveWeekdays(values.activeWeekdays)}
            />
          </ReviewSummaryRows>
        </ReviewSectionBox>
      </Grid>
    </>
  );
}

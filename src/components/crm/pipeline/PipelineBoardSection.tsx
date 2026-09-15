'use client';

import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import AddStageDialog, {
  slugifyLabel,
} from '@/components/crm/pipeline/AddStageDialog';
import EditStageColorDialog from '@/components/crm/pipeline/EditStageColorDialog';
import PipelineBoard from '@/components/crm/pipeline/PipelineBoard';
import ProspectsToolbar from '@/components/crm/prospects/ProspectsToolbar';
import { useConfirm } from '@/hooks/useConfirm';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import {
  usePipelineSummary,
  useProspectFieldSchema,
  useProspectMutations,
} from '@/hooks/useProspects';
import { useFollowUps } from '@/hooks/useFollowUps';
import { getApiErrorMessage } from '@/lib/api';
import { splitPipelineFilterableFields } from '@/lib/crm/pipeline/filter-config';
import {
  PIPELINE_STAGE_FIELD_KEY,
  PROTECTED_PIPELINE_STAGE_VALUE,
} from '@/lib/crm/pipeline/constants';
import type { Prospect, ProspectFieldDefinition } from '@/lib/crm/prospects/types';
import { useOrgPath } from '@/hooks/useOrgPath';

export function PipelineBoardSection() {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { notifyError, notifySuccess } = useNotify();
  const confirm = useConfirm();
  const canUpdate = useHasPermission('prospects:update');
  const canManageFields = useHasPermission('prospects:manage-fields');

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showTodayFollowUps, setShowTodayFollowUps] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [addStageOpen, setAddStageOpen] = useState(false);
  const [editColorStage, setEditColorStage] = useState<{
    value: string;
    label: string;
    color: string;
  } | null>(null);

  const pipelineSummaryQuery = showTodayFollowUps
    ? { followUpRange: 'today' as const }
    : {};

  const {
    data: fieldSchema,
    isLoading: isSchemaLoading,
    refetch: refetchSchema,
  } = useProspectFieldSchema();
  const { data: pipelineSummary, isLoading: isSummaryLoading } =
    usePipelineSummary(refreshToken, pipelineSummaryQuery);
  const { data: todayFollowUpsPage } = useFollowUps(
    'today',
    1,
    1,
    refreshToken,
  );
  const { updateProspect, updateFieldSchema, isUpdatingSchema, isUpdatingProspect } =
    useProspectMutations();

  const fields = useMemo(() => fieldSchema?.fields ?? [], [fieldSchema]);
  const { primary: primaryFields, secondary: secondaryFields } = useMemo(
    () => splitPipelineFilterableFields(fields),
    [fields],
  );

  const stageField = useMemo(
    () => fields.find((field) => field.key === PIPELINE_STAGE_FIELD_KEY),
    [fields],
  );

  const stages = useMemo(() => stageField?.options ?? [], [stageField]);

  const activeFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value.trim().length > 0),
      ),
    [filters],
  );

  const columnResetKey = `${search}-${showTodayFollowUps}-${JSON.stringify(activeFilters)}`;

  const todayFollowUpCount = todayFollowUpsPage?.total ?? 0;

  function bumpRefresh() {
    setRefreshToken((current) => current + 1);
  }

  async function handleMoveProspect(
    prospect: Prospect,
    _fromStage: string,
    toStage: string,
  ) {
    if (!canUpdate) {
      notifyError('You do not have permission to move prospects');
      return;
    }

    try {
      await updateProspect(prospect.id, {
        values: { [PIPELINE_STAGE_FIELD_KEY]: toStage },
      });
      notifySuccess('Prospect moved');
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Failed to move prospect'));
      throw error;
    }
  }

  async function handleAddStage(input: { label: string; color: string }) {
    if (!canManageFields) {
      notifyError('You do not have permission to manage pipeline stages');
      return;
    }

    if (!stageField) {
      return;
    }

    const value = slugifyLabel(input.label);
    if (!value) {
      notifyError('Stage name must include letters or numbers');
      return;
    }

    const duplicate = stages.some((stage) => stage.value === value);
    if (duplicate) {
      notifyError('A stage with this key already exists');
      return;
    }

    const nextFields: ProspectFieldDefinition[] = fields.map((field) => {
      if (field.key !== PIPELINE_STAGE_FIELD_KEY) {
        return field;
      }

      return {
        ...field,
        options: [
          ...(field.options ?? []),
          { value, label: input.label.trim(), color: input.color },
        ],
      };
    });

    try {
      await updateFieldSchema({ fields: nextFields });
      await refetchSchema();
      notifySuccess('Stage added');
      setAddStageOpen(false);
      bumpRefresh();
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Failed to add stage'));
    }
  }

  async function handleEditStageColor(stageValue: string, color: string) {
    if (!canManageFields) {
      notifyError('You do not have permission to manage pipeline stages');
      return;
    }

    const nextFields: ProspectFieldDefinition[] = fields.map((field) => {
      if (field.key !== PIPELINE_STAGE_FIELD_KEY) {
        return field;
      }

      return {
        ...field,
        options: (field.options ?? []).map((option) =>
          option.value === stageValue ? { ...option, color } : option,
        ),
      };
    });

    try {
      await updateFieldSchema({ fields: nextFields });
      await refetchSchema();
      notifySuccess('Stage color updated');
      setEditColorStage(null);
      bumpRefresh();
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Failed to update stage color'));
    }
  }

  async function handleDeleteStage(stageValue: string, stageLabel: string) {
    if (!canManageFields) {
      notifyError('You do not have permission to manage pipeline stages');
      return;
    }

    if (!stageField || stageValue === PROTECTED_PIPELINE_STAGE_VALUE) {
      return;
    }

    const confirmed = await confirm({
      title: 'Delete pipeline stage?',
      description: (
        <>
          Delete stage <strong>{stageLabel}</strong>? This is only allowed when no
          prospects remain in this stage.
        </>
      ),
      variant: 'destructive',
      confirmLabel: 'Delete stage',
      cancelLabel: 'Cancel',
    });

    if (!confirmed) {
      return;
    }

    const nextFields: ProspectFieldDefinition[] = fields.map((field) => {
      if (field.key !== PIPELINE_STAGE_FIELD_KEY) {
        return field;
      }

      return {
        ...field,
        options: (field.options ?? []).filter(
          (option) => option.value !== stageValue,
        ),
      };
    });

    try {
      await updateFieldSchema({ fields: nextFields });
      await refetchSchema();
      notifySuccess('Stage deleted');
      bumpRefresh();
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Failed to delete stage'));
    }
  }

  function handleFilterChange(key: string, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function handleSecondaryFiltersApply(secondaryFilters: Record<string, string>) {
    setFilters((current) => {
      const secondaryKeys = new Set(secondaryFields.map((field) => field.key));
      const preserved = Object.fromEntries(
        Object.entries(current).filter(([key]) => !secondaryKeys.has(key)),
      );

      return { ...preserved, ...secondaryFilters };
    });
  }

  function handleClearAllFilters() {
    setFilters({});
  }

  function handleSearchChange(value: string) {
    setSearch(value);
  }

  const isInitialLoading =
    (isSchemaLoading && !fieldSchema) ||
    (isSummaryLoading && !pipelineSummary);

  return (
    <>
      <Stack spacing={2.5} className="flex min-h-0 flex-1 flex-col">
        <ProspectsToolbar
          search={search}
          filters={filters}
          primaryFields={primaryFields}
          secondaryFields={secondaryFields}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onSecondaryFiltersApply={handleSecondaryFiltersApply}
          onClearAllFilters={handleClearAllFilters}
        />

        {isInitialLoading ? (
          <Stack className="items-center py-16">
            <CircularProgress />
          </Stack>
        ) : stages.length === 0 ? (
          <Alert severity="info">
            No pipeline stages configured. Add stages to get started.
          </Alert>
        ) : (
          <PipelineBoard
            stages={stages}
            stageCounts={pipelineSummary?.stages ?? []}
            fields={fields}
            search={search}
            filters={activeFilters}
            followUpRange={showTodayFollowUps ? 'today' : undefined}
            showTodayFollowUps={showTodayFollowUps}
            todayFollowUpCount={todayFollowUpCount}
            onTodayFollowUpsToggle={() => setShowTodayFollowUps((current) => !current)}
            refreshToken={refreshToken}
            canDrag={canUpdate && !isUpdatingProspect}
            canManageStages={canManageFields && !isUpdatingSchema}
            onMoveProspect={handleMoveProspect}
            onAddStageClick={() => {
              if (!canManageFields) {
                return;
              }

              setAddStageOpen(true);
            }}
            onEditStageColor={(stageValue, stageLabel, color) => {
              if (!canManageFields) {
                return;
              }

              setEditColorStage({ value: stageValue, label: stageLabel, color });
            }}
            onDeleteStage={(stageValue, stageLabel) =>
              void handleDeleteStage(stageValue, stageLabel)
            }
            columnResetKey={columnResetKey}
            onOpenProspect={(prospect) =>
              router.push(toOrgPath(`/crm/prospects/${prospect.id}?from=pipeline`))
            }
          />
        )}
      </Stack>

      {canManageFields ? (
        <>
          <AddStageDialog
            open={addStageOpen}
            isSubmitting={isUpdatingSchema}
            onClose={() => setAddStageOpen(false)}
            onSubmit={handleAddStage}
          />

          <EditStageColorDialog
            open={editColorStage !== null}
            stageLabel={editColorStage?.label ?? ''}
            initialColor={editColorStage?.color ?? '#64748b'}
            isSubmitting={isUpdatingSchema}
            onClose={() => setEditColorStage(null)}
            onSubmit={async (color) => {
              if (!editColorStage) {
                return;
              }

              await handleEditStageColor(editColorStage.value, color);
            }}
          />
        </>
      ) : null}
    </>
  );
}

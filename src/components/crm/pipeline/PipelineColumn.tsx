'use client';

import { useDroppable } from '@dnd-kit/core';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useRef } from 'react';
import type { FollowUpRange } from '@/lib/crm/followups/types';
import ManageStageMenu from '@/components/crm/pipeline/ManageStageMenu';
import PipelineCard from '@/components/crm/pipeline/PipelineCard';
import { usePipelineColumnProspects } from '@/hooks/usePipelineColumnProspects';
import { getPipelineColumnId } from '@/lib/crm/pipeline/constants';
import {
  DEFAULT_STAGE_COLOR,
  normalizeStageColor,
  withAlpha,
} from '@/lib/crm/pipeline/stage-color';
import type {
  Prospect,
  ProspectFieldDefinition,
  ProspectFieldOption,
} from '@/lib/crm/prospects/types';

interface PipelineColumnProps {
  stage: ProspectFieldOption;
  count: number;
  search: string;
  filters: Record<string, string>;
  followUpRange?: FollowUpRange;
  refreshToken: number;
  productField?: ProspectFieldDefinition;
  canDrag: boolean;
  canManageStages: boolean;
  optimisticIncoming: Prospect[];
  optimisticOutgoingIds: ReadonlySet<string>;
  onEditStageColor: (stageValue: string, stageLabel: string, color: string) => void;
  onDeleteStage: (stageValue: string, stageLabel: string) => void;
  onOpenProspect?: (prospect: Prospect) => void;
}

export default function PipelineColumn({
  stage,
  count,
  search,
  filters,
  followUpRange,
  refreshToken,
  productField,
  canDrag,
  canManageStages,
  optimisticIncoming,
  optimisticOutgoingIds,
  onEditStageColor,
  onDeleteStage,
  onOpenProspect,
}: PipelineColumnProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const columnId = getPipelineColumnId(stage.value);
  const stageColor =
    normalizeStageColor(stage.color ?? '') ?? DEFAULT_STAGE_COLOR;

  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { stage: stage.value },
  });

  const {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = usePipelineColumnProspects({
    stageValue: stage.value,
    search,
    filters,
    followUpRange,
    refreshToken,
    excludedProspectIds: optimisticOutgoingIds,
  });

  const displayItems = useMemo(() => {
    const merged = [...optimisticIncoming, ...items];
    const seen = new Set<string>();

    return merged.filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }

      seen.add(item.id);
      return true;
    });
  }, [items, optimisticIncoming]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    function handleScroll() {
      if (!container) {
        return;
      }

      const remaining =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      if (remaining < 120 && hasMore && !isLoading && !isLoadingMore) {
        loadMore();
      }
    }

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  return (
    <Box
      ref={setNodeRef}
      className="flex h-full w-[18.5rem] shrink-0 flex-col overflow-hidden rounded-2xl border shadow-sm transition-[border-color,box-shadow] duration-200"
      sx={{
        borderColor: isOver
          ? stageColor
          : withAlpha(stageColor, 0.22),
        boxShadow: isOver
          ? `0 0 0 2px ${withAlpha(stageColor, 0.25)}, 0 12px 32px ${withAlpha(stageColor, 0.12)}`
          : `0 1px 2px ${withAlpha(stageColor, 0.08)}`,
        bgcolor: withAlpha(stageColor, 0.04),
      }}
    >
      <Stack
        spacing={0}
        className="border-b"
        sx={{
          borderColor: withAlpha(stageColor, 0.16),
          bgcolor: withAlpha(stageColor, 0.08),
        }}
      >
        <Box
          className="h-1 w-full"
          sx={{ bgcolor: stageColor }}
          aria-hidden
        />
        <Stack
          direction="row"
          spacing={1}
          className="px-3 py-3"
          sx={{ alignItems: 'center' }}
        >
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background"
            style={{ backgroundColor: stageColor }}
          />
          <Typography variant="subtitle2" className="min-w-0 flex-1 font-semibold">
            {stage.label}
          </Typography>
          <Chip
            label={count}
            size="small"
            className="h-6 min-w-8 font-semibold"
            sx={{
              bgcolor: withAlpha(stageColor, 0.14),
              color: stageColor,
              border: `1px solid ${withAlpha(stageColor, 0.28)}`,
            }}
          />
          <ManageStageMenu
            stageLabel={stage.label}
            stageValue={stage.value}
            canManage={canManageStages}
            onEditColor={() =>
              onEditStageColor(stage.value, stage.label, stageColor)
            }
            onDelete={() => onDeleteStage(stage.value, stage.label)}
          />
        </Stack>
      </Stack>

      <Box
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2.5 py-2.5"
        sx={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${withAlpha(stageColor, 0.35)} transparent`,
        }}
      >
        <Stack spacing={1.25}>
          {displayItems.map((prospect) => (
            <PipelineCard
              key={prospect.id}
              prospect={prospect}
              stageValue={stage.value}
              stageColor={stageColor}
              productField={productField}
              draggable={canDrag}
              onOpen={onOpenProspect}
            />
          ))}

          {isLoading && displayItems.length === 0 ? (
            <Box className="flex justify-center py-10">
              <CircularProgress size={24} sx={{ color: stageColor }} />
            </Box>
          ) : null}

          {!isLoading && displayItems.length === 0 ? (
            <Box
              className="rounded-xl border border-dashed px-3 py-8 text-center"
              sx={{ borderColor: withAlpha(stageColor, 0.25) }}
            >
              <Typography variant="body2" color="text.secondary">
                No prospects in this stage
              </Typography>
            </Box>
          ) : null}

          {isLoadingMore && displayItems.length > 0 ? (
            <Box className="flex justify-center py-2">
              <CircularProgress size={20} sx={{ color: stageColor }} />
            </Box>
          ) : null}

          {hasMore && !isLoading && !isLoadingMore ? (
            <Button
              size="small"
              variant="text"
              onClick={loadMore}
              sx={{ color: stageColor }}
            >
              Load more
            </Button>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}

'use client';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import type { FollowUpRange } from '@/lib/crm/followups/types';
import PipelineCard from '@/components/crm/pipeline/PipelineCard';
import PipelineColumn from '@/components/crm/pipeline/PipelineColumn';
import {
  PIPELINE_STAGE_FIELD_KEY,
  parsePipelineColumnId,
} from '@/lib/crm/pipeline/constants';
import {
  DEFAULT_STAGE_COLOR,
  normalizeStageColor,
} from '@/lib/crm/pipeline/stage-color';
import type {
  Prospect,
  ProspectFieldDefinition,
  ProspectFieldOption,
  PipelineStageSummary,
} from '@/lib/crm/prospects/types';

interface OptimisticMove {
  prospectId: string;
  fromStage: string;
  toStage: string;
  prospect: Prospect;
}

interface PipelineBoardProps {
  stages: ProspectFieldOption[];
  stageCounts: PipelineStageSummary[];
  fields: ProspectFieldDefinition[];
  search: string;
  filters: Record<string, string>;
  followUpRange?: FollowUpRange;
  showTodayFollowUps: boolean;
  todayFollowUpCount: number;
  onTodayFollowUpsToggle: () => void;
  refreshToken: number;
  canDrag: boolean;
  canManageStages: boolean;
  onMoveProspect: (
    prospect: Prospect,
    fromStage: string,
    toStage: string,
  ) => Promise<void>;
  onAddStageClick: () => void;
  onEditStageColor: (stageValue: string, stageLabel: string, color: string) => void;
  onDeleteStage: (stageValue: string, stageLabel: string) => void;
  columnResetKey: string;
  onOpenProspect?: (prospect: Prospect) => void;
}

function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface BoardOptimisticState {
  scopeKey: string;
  moves: OptimisticMove[];
}

interface BoardCountState {
  scopeKey: string;
  adjustments: Record<string, number>;
}

export default function PipelineBoard({
  stages,
  stageCounts,
  fields,
  search,
  filters,
  followUpRange,
  showTodayFollowUps,
  todayFollowUpCount,
  onTodayFollowUpsToggle,
  refreshToken,
  canDrag,
  canManageStages,
  onMoveProspect,
  onAddStageClick,
  onEditStageColor,
  onDeleteStage,
  columnResetKey,
  onOpenProspect,
}: PipelineBoardProps) {
  const [activeProspect, setActiveProspect] = useState<Prospect | null>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [optimisticState, setOptimisticState] = useState<BoardOptimisticState>({
    scopeKey: '',
    moves: [],
  });
  const [countState, setCountState] = useState<BoardCountState>({
    scopeKey: '',
    adjustments: {},
  });
  const prefersReducedMotion = usePrefersReducedMotion();

  const stageCountsKey = useMemo(
    () => stageCounts.map((stage) => `${stage.value}:${stage.count}`).join('|'),
    [stageCounts],
  );

  const boardScopeKey = `${columnResetKey}|${stageCountsKey}`;

  const scopedOptimisticMoves = useMemo(
    () =>
      optimisticState.scopeKey === boardScopeKey ? optimisticState.moves : [],
    [boardScopeKey, optimisticState],
  );

  const scopedCountAdjustments = useMemo(
    () =>
      countState.scopeKey === boardScopeKey ? countState.adjustments : {},
    [boardScopeKey, countState],
  );

  const productField = fields.find((field) => field.key === 'product');

  const stageColorByValue = useMemo(() => {
    const map = new Map<string, string>();
    for (const stage of stages) {
      map.set(
        stage.value,
        normalizeStageColor(stage.color ?? '') ?? DEFAULT_STAGE_COLOR,
      );
    }
    return map;
  }, [stages]);

  const totalProspects = useMemo(() => {
    const baseTotal = stageCounts.reduce((sum, stage) => sum + stage.count, 0);
    const adjustmentTotal = Object.values(scopedCountAdjustments).reduce(
      (sum, delta) => sum + delta,
      0,
    );
    return baseTotal + adjustmentTotal;
  }, [scopedCountAdjustments, stageCounts]);

  const countByStage = useMemo(() => {
    const map = new Map<string, number>();
    for (const stage of stageCounts) {
      map.set(
        stage.value,
        stage.count + (scopedCountAdjustments[stage.value] ?? 0),
      );
    }
    return map;
  }, [scopedCountAdjustments, stageCounts]);

  const incomingByStage = useMemo(() => {
    const map = new Map<string, Prospect[]>();

    for (const move of scopedOptimisticMoves) {
      const current = map.get(move.toStage) ?? [];
      map.set(move.toStage, [move.prospect, ...current]);
    }

    return map;
  }, [scopedOptimisticMoves]);

  const outgoingByStage = useMemo(() => {
    const map = new Map<string, Set<string>>();

    for (const move of scopedOptimisticMoves) {
      const current = map.get(move.fromStage) ?? new Set<string>();
      current.add(move.prospectId);
      map.set(move.fromStage, current);
    }

    return map;
  }, [scopedOptimisticMoves]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  function resolveTargetStage(
    overId: string | number,
    overData: unknown,
  ): string | null {
    const overIdString = String(overId);
    const columnStage = parsePipelineColumnId(overIdString);
    if (columnStage) {
      return columnStage;
    }

    const stageFromData = (overData as { stage?: string } | undefined)?.stage;
    if (stageFromData) {
      return stageFromData;
    }

    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const prospect = event.active.data.current?.prospect as Prospect | undefined;
    const stage = event.active.data.current?.stage as string | undefined;

    if (prospect) {
      setActiveProspect(prospect);
      setActiveStage(stage ?? null);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveProspect(null);
    setActiveStage(null);

    if (!over || !canDrag) {
      return;
    }

    const prospect = active.data.current?.prospect as Prospect | undefined;
    const fromStage = active.data.current?.stage as string | undefined;
    const toStage = resolveTargetStage(over.id, over.data.current);

    if (!prospect || !fromStage || !toStage || fromStage === toStage) {
      return;
    }

    const move: OptimisticMove = {
      prospectId: prospect.id,
      fromStage,
      toStage,
      prospect: {
        ...prospect,
        values: {
          ...prospect.values,
          [PIPELINE_STAGE_FIELD_KEY]: toStage,
        },
      },
    };

    setOptimisticState((current) => ({
      scopeKey: boardScopeKey,
      moves: [
        ...(current.scopeKey === boardScopeKey ? current.moves : []),
        move,
      ],
    }));

    try {
      await onMoveProspect(prospect, fromStage, toStage);
      setCountState((current) => {
        const baseAdjustments =
          current.scopeKey === boardScopeKey ? current.adjustments : {};

        return {
          scopeKey: boardScopeKey,
          adjustments: {
            ...baseAdjustments,
            [fromStage]: (baseAdjustments[fromStage] ?? 0) - 1,
            [toStage]: (baseAdjustments[toStage] ?? 0) + 1,
          },
        };
      });
    } catch {
      setOptimisticState((current) => ({
        scopeKey: boardScopeKey,
        moves: (current.scopeKey === boardScopeKey ? current.moves : []).filter(
          (item) => item.prospectId !== prospect.id,
        ),
      }));
    }
  }

  function handleDragCancel() {
    setActiveProspect(null);
    setActiveStage(null);
  }

  const activeStageColor =
    (activeStage ? stageColorByValue.get(activeStage) : undefined) ??
    DEFAULT_STAGE_COLOR;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={(event) => void handleDragEnd(event)}
      onDragCancel={handleDragCancel}
    >
      <Box className="overflow-hidden rounded-2xl border border-border/60 bg-surface/40">
        <Stack
          direction="row"
          spacing={2}
          className="border-b border-border/50 px-4 py-3"
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Button
            size="small"
            variant={showTodayFollowUps ? 'contained' : 'outlined'}
            startIcon={
              <Badge
                badgeContent={todayFollowUpCount}
                color="warning"
                max={999}
                invisible={todayFollowUpCount === 0}
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    height: 18,
                    minWidth: 18,
                    fontWeight: 700,
                  },
                }}
              >
                <EventAvailableOutlinedIcon fontSize="small" />
              </Badge>
            }
            onClick={onTodayFollowUpsToggle}
            className="rounded-full px-4 normal-case"
            sx={
              showTodayFollowUps
                ? {
                    bgcolor: '#f59e0b',
                    '&:hover': { bgcolor: '#d97706' },
                  }
                : {
                    borderColor: 'divider',
                    color: 'text.secondary',
                  }
            }
          >
            Today&apos;s follow-ups
          </Button>

          <Typography variant="body2" color="text.secondary" className="font-medium">
            {showTodayFollowUps
              ? `${totalProspects.toLocaleString()} due today`
              : `${totalProspects.toLocaleString()} total leads`}
          </Typography>
        </Stack>

        <Box className="overflow-x-auto px-3 py-4">
          <Stack
            direction="row"
            spacing={2.5}
            className="min-h-[calc(100vh-20rem)] min-w-max pb-1"
          >
            {stages.map((stage) => (
              <PipelineColumn
                key={`${stage.value}-${columnResetKey}`}
                stage={stage}
                count={Math.max(0, countByStage.get(stage.value) ?? 0)}
                search={search}
                filters={filters}
                followUpRange={followUpRange}
                refreshToken={refreshToken}
                productField={productField}
                canDrag={canDrag}
                canManageStages={canManageStages}
                optimisticIncoming={incomingByStage.get(stage.value) ?? []}
                optimisticOutgoingIds={
                  outgoingByStage.get(stage.value) ?? new Set<string>()
                }
                onEditStageColor={onEditStageColor}
                onDeleteStage={onDeleteStage}
                onOpenProspect={onOpenProspect}
              />
            ))}

            {canManageStages ? (
              <Box className="flex w-52 shrink-0 items-start pt-1">
                <Button
                  variant="outlined"
                  startIcon={<AddOutlinedIcon />}
                  onClick={onAddStageClick}
                  className="h-11 w-full rounded-xl border-dashed font-medium"
                  sx={{
                    borderColor: 'divider',
                    color: 'text.secondary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  Add stage
                </Button>
              </Box>
            ) : null}
          </Stack>
        </Box>
      </Box>

      <DragOverlay dropAnimation={prefersReducedMotion ? null : undefined}>
        {activeProspect && activeStage ? (
          <Box
            className="w-[18.5rem] rotate-1"
            sx={{
              opacity: 0.96,
              filter: `drop-shadow(0 16px 28px ${activeStageColor}44)`,
            }}
          >
            <PipelineCard
              prospect={activeProspect}
              stageValue={activeStage}
              stageColor={activeStageColor}
              productField={productField}
              draggable={false}
            />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

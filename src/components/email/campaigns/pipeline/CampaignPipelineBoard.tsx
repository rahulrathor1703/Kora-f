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
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import CampaignPipelineCard from '@/components/email/campaigns/pipeline/CampaignPipelineCard';
import CampaignPipelineColumn from '@/components/email/campaigns/pipeline/CampaignPipelineColumn';
import type { ResolvedColumn } from '@/components/data-table/types';
import {
  CAMPAIGN_PIPELINE_COLORS,
  CAMPAIGN_PIPELINE_STATUSES,
  groupCampaignsByStatus,
  parseCampaignColumnId,
} from '@/lib/email/campaigns/pipeline-config';
import { getManualCampaignStatusTransitionError } from '@/lib/email/campaigns/status-transitions';
import type { EmailCampaign, EmailCampaignStatus } from '@/lib/email/campaigns/types';

interface OptimisticMove {
  campaignId: string;
  fromStatus: EmailCampaignStatus;
  toStatus: EmailCampaignStatus;
  campaign: EmailCampaign;
}

interface CampaignPipelineBoardProps {
  campaigns: EmailCampaign[];
  cardColumns: ResolvedColumn<EmailCampaign>[];
  canDrag: boolean;
  hasActiveFilters?: boolean;
  onMoveCampaign: (
    campaign: EmailCampaign,
    fromStatus: EmailCampaignStatus,
    toStatus: EmailCampaignStatus,
  ) => Promise<void>;
  onMoveRejected?: (message: string) => void;
  onOpenCampaign?: (campaign: EmailCampaign) => void;
}

function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function CampaignPipelineBoard({
  campaigns,
  cardColumns,
  canDrag,
  hasActiveFilters = false,
  onMoveCampaign,
  onMoveRejected,
  onOpenCampaign,
}: CampaignPipelineBoardProps) {
  const [activeCampaign, setActiveCampaign] = useState<EmailCampaign | null>(null);
  const [activeStatus, setActiveStatus] = useState<EmailCampaignStatus | null>(
    null,
  );
  const [optimisticMoves, setOptimisticMoves] = useState<OptimisticMove[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const groupedCampaigns = useMemo(
    () => groupCampaignsByStatus(campaigns),
    [campaigns],
  );

  const scopedOptimisticMoves = optimisticMoves;

  const countAdjustments = useMemo(() => {
    const adjustments: Partial<Record<EmailCampaignStatus, number>> = {};

    for (const move of scopedOptimisticMoves) {
      adjustments[move.fromStatus] = (adjustments[move.fromStatus] ?? 0) - 1;
      adjustments[move.toStatus] = (adjustments[move.toStatus] ?? 0) + 1;
    }

    return adjustments;
  }, [scopedOptimisticMoves]);

  const incomingByStatus = useMemo(() => {
    const map = new Map<EmailCampaignStatus, EmailCampaign[]>();

    for (const move of scopedOptimisticMoves) {
      const current = map.get(move.toStatus) ?? [];
      map.set(move.toStatus, [
        { ...move.campaign, status: move.toStatus },
        ...current,
      ]);
    }

    return map;
  }, [scopedOptimisticMoves]);

  const outgoingByStatus = useMemo(() => {
    const map = new Map<EmailCampaignStatus, Set<string>>();

    for (const move of scopedOptimisticMoves) {
      const current = map.get(move.fromStatus) ?? new Set<string>();
      current.add(move.campaignId);
      map.set(move.fromStatus, current);
    }

    return map;
  }, [scopedOptimisticMoves]);

  const totalCampaigns = useMemo(() => {
    const baseTotal = campaigns.length;
    const adjustmentTotal = Object.values(countAdjustments).reduce(
      (sum, delta) => sum + (delta ?? 0),
      0,
    );
    return baseTotal + adjustmentTotal;
  }, [campaigns.length, countAdjustments]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  function resolveTargetStatus(
    overId: string | number,
    overData: unknown,
  ): EmailCampaignStatus | null {
    const columnStatus = parseCampaignColumnId(String(overId));
    if (columnStatus) {
      return columnStatus;
    }

    const statusFromData = (overData as { status?: EmailCampaignStatus } | undefined)
      ?.status;
    return statusFromData ?? null;
  }

  function handleDragStart(event: DragStartEvent) {
    const campaign = event.active.data.current?.campaign as
      | EmailCampaign
      | undefined;
    const status = event.active.data.current?.status as
      | EmailCampaignStatus
      | undefined;

    if (campaign) {
      setActiveCampaign(campaign);
      setActiveStatus(status ?? null);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCampaign(null);
    setActiveStatus(null);

    if (!over || !canDrag) {
      return;
    }

    const campaign = active.data.current?.campaign as EmailCampaign | undefined;
    const fromStatus = active.data.current?.status as
      | EmailCampaignStatus
      | undefined;
    const toStatus = resolveTargetStatus(over.id, over.data.current);

    if (!campaign || !fromStatus || !toStatus || fromStatus === toStatus) {
      return;
    }

    const transitionError = getManualCampaignStatusTransitionError(
      fromStatus,
      toStatus,
    );

    if (transitionError) {
      onMoveRejected?.(transitionError);
      return;
    }

    const move: OptimisticMove = {
      campaignId: campaign.id,
      fromStatus,
      toStatus,
      campaign: { ...campaign, status: toStatus },
    };

    setOptimisticMoves((current) => [...current, move]);

    try {
      await onMoveCampaign(campaign, fromStatus, toStatus);
      setOptimisticMoves((current) =>
        current.filter((item) => item.campaignId !== campaign.id),
      );
    } catch {
      setOptimisticMoves((current) =>
        current.filter((item) => item.campaignId !== campaign.id),
      );
    }
  }

  function handleDragCancel() {
    setActiveCampaign(null);
    setActiveStatus(null);
  }

  const activeStageColor = activeStatus
    ? CAMPAIGN_PIPELINE_COLORS[activeStatus]
    : CAMPAIGN_PIPELINE_COLORS.draft;

  const emptyMessage = hasActiveFilters
    ? 'No campaigns match your search or filters.'
    : 'No campaigns yet. Create your first campaign to get started.';

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
          sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
        >
          <Typography variant="body2" color="text.secondary" className="font-medium">
            {totalCampaigns.toLocaleString()} total campaigns
          </Typography>
        </Stack>

        <Box className="overflow-x-auto px-3 py-4">
          {totalCampaigns === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              className="px-2 py-12 text-center"
            >
              {emptyMessage}
            </Typography>
          ) : (
            <Stack
              direction="row"
              spacing={2.5}
              className="min-h-[calc(100vh-20rem)] min-w-max pb-1"
            >
              {CAMPAIGN_PIPELINE_STATUSES.map((status) => {
                const baseCount = groupedCampaigns[status].length;
                const count = Math.max(
                  0,
                  baseCount + (countAdjustments[status] ?? 0),
                );

                return (
                  <CampaignPipelineColumn
                    key={status}
                    status={status}
                    count={count}
                    campaigns={groupedCampaigns[status]}
                    cardColumns={cardColumns}
                    canDrag={canDrag}
                    optimisticIncoming={incomingByStatus.get(status) ?? []}
                    optimisticOutgoingIds={
                      outgoingByStatus.get(status) ?? new Set<string>()
                    }
                    onOpenCampaign={onOpenCampaign}
                  />
                );
              })}
            </Stack>
          )}
        </Box>
      </Box>

      <DragOverlay dropAnimation={prefersReducedMotion ? null : undefined}>
        {activeCampaign && activeStatus ? (
          <Box
            className="w-[18.5rem] rotate-1"
            sx={{
              opacity: 0.96,
              filter: `drop-shadow(0 16px 28px ${activeStageColor}44)`,
            }}
          >
            <CampaignPipelineCard
              campaign={activeCampaign}
              status={activeStatus}
              cardColumns={cardColumns}
              draggable={false}
            />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

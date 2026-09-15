'use client';

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorOutlinedIcon from '@mui/icons-material/DragIndicatorOutlined';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { useSession } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/api/types/auth.types';
import { dataTableSx } from './dataTableStyles';
import { toStoredColumnPrefs } from './mergeColumnPrefs';
import type { ResolvedColumn, StoredColumnPref } from './types';

interface ColumnSettingsDialogProps<T extends object> {
  open: boolean;
  tableName: string;
  initialColumns: ResolvedColumn<T>[];
  hasUserOverride: boolean;
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSaveUserPreferences: (
    columns: StoredColumnPref[],
  ) => Promise<void>;
  onSaveTeamDefaults: (
    columns: StoredColumnPref[],
  ) => Promise<void>;
  onResetUserPreferences: () => Promise<void>;
}

function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface ColumnSettingsRowProps<T extends object> {
  column: ResolvedColumn<T>;
  onUpdate: (
    field: string,
    patch: Partial<Pick<ResolvedColumn<T>, 'label' | 'visible'>>,
  ) => void;
  dragHandleRef?: (element: HTMLElement | null) => void;
  dragHandleAttributes?: DraggableAttributes;
  dragHandleListeners?: DraggableSyntheticListeners;
  isDragging?: boolean;
  readOnly?: boolean;
}

function ColumnSettingsRow<T extends object>({
  column,
  onUpdate,
  dragHandleRef,
  dragHandleAttributes,
  dragHandleListeners,
  isDragging = false,
  readOnly = false,
}: ColumnSettingsRowProps<T>) {
  return (
    <Stack
      direction="row"
      spacing={1}
      className="min-w-0 items-center"
      sx={{ opacity: isDragging ? 0.75 : 1 }}
    >
      {dragHandleRef ? (
        <IconButton
          ref={dragHandleRef}
          size="small"
          aria-label={`Drag to reorder ${column.field}`}
          className="cursor-grab active:cursor-grabbing"
          sx={{ flexShrink: 0, touchAction: 'none' }}
          disabled={readOnly}
          {...dragHandleAttributes}
          {...dragHandleListeners}
        >
          <DragIndicatorOutlinedIcon fontSize="small" />
        </IconButton>
      ) : null}
      <Switch
        checked={column.visible}
        onChange={(event) =>
          onUpdate(column.field, { visible: event.target.checked })
        }
        size="small"
        sx={{ flexShrink: 0 }}
        disabled={readOnly}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        className="hidden w-28 shrink-0 truncate sm:block"
        title={column.field}
      >
        {column.field}
      </Typography>
      <TextField
        value={column.label}
        onChange={(event) =>
          onUpdate(column.field, { label: event.target.value })
        }
        size="small"
        placeholder="Header label"
        fullWidth
        disabled={readOnly}
        slotProps={{
          input: {
            sx: { py: 0.75 },
          },
        }}
      />
    </Stack>
  );
}

interface SortableColumnSettingsRowProps<T extends object> {
  column: ResolvedColumn<T>;
  onUpdate: (
    field: string,
    patch: Partial<Pick<ResolvedColumn<T>, 'label' | 'visible'>>,
  ) => void;
}

function SortableColumnSettingsRow<T extends object>({
  column,
  onUpdate,
}: SortableColumnSettingsRowProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.field });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      className={`border-b border-border/50 px-1 py-2 last:border-b-0 ${
        isDragging ? 'opacity-45' : ''
      }`}
    >
      <ColumnSettingsRow
        column={column}
        onUpdate={onUpdate}
        dragHandleRef={setActivatorNodeRef}
        dragHandleAttributes={attributes}
        dragHandleListeners={listeners}
        isDragging={isDragging}
      />
    </Box>
  );
}

export default function ColumnSettingsDialog<T extends object>({
  open,
  tableName,
  initialColumns,
  hasUserOverride,
  isSaving,
  saveError,
  onClose,
  onSaveUserPreferences,
  onSaveTeamDefaults,
  onResetUserPreferences,
}: ColumnSettingsDialogProps<T>) {
  const { data: session } = useSession();
  const [draftColumns, setDraftColumns] = useState(initialColumns);
  const [activeColumnField, setActiveColumnField] = useState<string | null>(
    null,
  );
  const prefersReducedMotion = usePrefersReducedMotion();
  const canManageTeamDefaults = hasPermission(session, 'rbac:manage');

  const visibleCount = useMemo(
    () => draftColumns.filter((column) => column.visible).length,
    [draftColumns],
  );

  const activeColumn = useMemo(
    () =>
      activeColumnField
        ? draftColumns.find((column) => column.field === activeColumnField) ??
          null
        : null,
    [activeColumnField, draftColumns],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function updateColumn(
    field: string,
    patch: Partial<Pick<ResolvedColumn<T>, 'label' | 'visible'>>,
  ) {
    setDraftColumns((current) =>
      current.map((column) =>
        column.field === field ? { ...column, ...patch } : column,
      ),
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveColumnField(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveColumnField(null);

    if (!over || active.id === over.id) {
      return;
    }

    setDraftColumns((current) => {
      const oldIndex = current.findIndex((column) => column.field === active.id);
      const newIndex = current.findIndex((column) => column.field === over.id);

      if (oldIndex < 0 || newIndex < 0) {
        return current;
      }

      return arrayMove(current, oldIndex, newIndex);
    });
  }

  function handleDragCancel() {
    setActiveColumnField(null);
  }

  async function handleSaveUserPreferences() {
    await onSaveUserPreferences(toStoredColumnPrefs(draftColumns));
    onClose();
  }

  async function handleSaveTeamDefaults() {
    await onSaveTeamDefaults(toStoredColumnPrefs(draftColumns));
    onClose();
  }

  async function handleResetUserPreferences() {
    await onResetUserPreferences();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { className: 'surface-panel rounded-2xl' } }}
    >
      <DialogTitle className="pb-2">
        <Stack direction="row" spacing={1.5} className="items-center">
          <DashboardCustomizeOutlinedIcon color="primary" fontSize="small" />
          <Box>
            <Typography variant="h6" className="font-bold">
              Customize columns
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {visibleCount} of {draftColumns.length} columns visible in{' '}
              {tableName}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent dividers className="pt-4">
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Drag to reorder, toggle visibility, and edit header labels.
          </Typography>

          {saveError ? <Alert severity="error">{saveError}</Alert> : null}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={draftColumns.map((column) => column.field)}
              strategy={verticalListSortingStrategy}
            >
              <Box className="rounded-xl border border-border/60 px-2">
                {draftColumns.map((column) => (
                  <SortableColumnSettingsRow
                    key={column.field}
                    column={column}
                    onUpdate={updateColumn}
                  />
                ))}
              </Box>
            </SortableContext>

            <DragOverlay dropAnimation={prefersReducedMotion ? null : undefined}>
              {activeColumn ? (
                <Box
                  className="surface-panel rounded-lg border border-border/60 px-2 py-2 shadow-lg"
                  sx={{ opacity: 0.96, width: '100%' }}
                >
                  <ColumnSettingsRow
                    column={activeColumn}
                    onUpdate={() => undefined}
                    readOnly
                  />
                </Box>
              ) : null}
            </DragOverlay>
          </DndContext>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button
          onClick={() => void handleResetUserPreferences()}
          disabled={!hasUserOverride || isSaving}
        >
          Reset my layout
        </Button>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          {canManageTeamDefaults ? (
            <Button
              variant="outlined"
              onClick={() => void handleSaveTeamDefaults()}
              disabled={isSaving}
            >
              Save team default
            </Button>
          ) : null}
          <Button
            variant="contained"
            onClick={() => void handleSaveUserPreferences()}
            disabled={isSaving}
          >
            Save
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

interface ColumnSettingsButtonProps {
  active?: boolean;
  onClick: () => void;
}

export function ColumnSettingsButton({
  active = false,
  onClick,
}: ColumnSettingsButtonProps) {
  return (
    <Tooltip title="Customize columns">
      <IconButton
        aria-label="Customize columns"
        onClick={onClick}
        size="small"
        color={active ? 'primary' : 'default'}
        sx={active ? dataTableSx.iconButtonActive : undefined}
      >
        <DashboardCustomizeOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

export function ColumnSettingsHint({
  hasTeamDefault,
}: {
  hasTeamDefault: boolean;
}) {
  if (!hasTeamDefault) {
    return null;
  }

  return (
    <Typography variant="caption" color="text.secondary">
      Team default applied
    </Typography>
  );
}

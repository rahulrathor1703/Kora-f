'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
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
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DragIndicatorOutlinedIcon from '@mui/icons-material/DragIndicatorOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { areTableColumnsEqual } from '@/lib/forms/schema-compare';
import type {
  FormEditorMode,
  FormTableColumnDefinition,
  FormTableColumnType,
  UpdateFormSchemaInput,
} from '@/lib/forms/types';

const TABLE_COLUMN_TYPES: FormTableColumnType[] = [
  'text',
  'email',
  'phone',
  'number',
  'date',
];

function slugifyLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

function createTableColumn(
  label: string,
  type: FormTableColumnType,
  required: boolean,
  sortOrder: number,
): FormTableColumnDefinition {
  const key = slugifyLabel(label) || `column_${sortOrder + 1}`;
  return {
    id: crypto.randomUUID(),
    key,
    label: label.trim(),
    type,
    required,
    sortOrder,
  };
}

interface FormTableColumnsEditorProps {
  formKey: string;
  fields: UpdateFormSchemaInput['fields'];
  tableColumns: FormTableColumnDefinition[];
  mode: FormEditorMode;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: UpdateFormSchemaInput) => Promise<void>;
  readOnly?: boolean;
  version?: number;
}

interface SortableColumnRowProps {
  column: FormTableColumnDefinition;
  index: number;
  isSelected: boolean;
  readOnly: boolean;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
}

function SortableColumnRow({
  column,
  index,
  isSelected,
  readOnly,
  onSelect,
  onRemove,
}: SortableColumnRowProps) {
  const draggable = !readOnly && !column.system;
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, disabled: !draggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border p-2 ${
        isSelected ? 'border-primary/60 bg-primary/5' : 'border-border/60'
      } ${isDragging ? 'shadow-md' : ''}`}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        {draggable ? (
          <IconButton
            ref={setActivatorNodeRef}
            size="small"
            aria-label="Drag to reorder"
            className="cursor-grab active:cursor-grabbing"
            sx={{ touchAction: 'none' }}
            {...attributes}
            {...listeners}
          >
            <DragIndicatorOutlinedIcon fontSize="small" />
          </IconButton>
        ) : (
          <IconButton size="small" disabled aria-label="System column locked">
            <LockOutlinedIcon fontSize="small" />
          </IconButton>
        )}

        <Button
          variant="text"
          onClick={() => onSelect(index)}
          className="min-w-0 flex-1 justify-start normal-case"
          sx={{ textAlign: 'left' }}
        >
          <Stack spacing={0.25}>
            <Typography variant="body2" className="font-medium">
              {column.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {column.type}
              {column.required ? ' · Required' : ''}
            </Typography>
          </Stack>
        </Button>

        {!readOnly && !column.system ? (
          <IconButton
            size="small"
            aria-label={`Remove ${column.label}`}
            onClick={() => onRemove(index)}
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Stack>
    </Box>
  );
}

export default function FormTableColumnsEditor({
  formKey,
  fields,
  tableColumns,
  mode,
  isSubmitting,
  onCancel,
  onSubmit,
  readOnly = false,
  version,
}: FormTableColumnsEditorProps) {
  const [draftColumns, setDraftColumns] = useState(tableColumns);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    tableColumns.length > 0 ? 0 : null,
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<FormTableColumnType>('text');
  const [newRequired, setNewRequired] = useState(false);

  const hasChanges = useMemo(
    () => !areTableColumnsEqual(draftColumns, tableColumns),
    [draftColumns, tableColumns],
  );

  const selectedColumn =
    selectedIndex !== null ? draftColumns[selectedIndex] ?? null : null;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const isContactImportForm = formKey === 'email.list.contact.import';
  const canAddEmailColumn =
    !isContactImportForm ||
    !draftColumns.some((column) => column.type === 'email');

  function updateColumn(index: number, patch: Partial<FormTableColumnDefinition>) {
    setDraftColumns((current) =>
      current.map((column, columnIndex) =>
        columnIndex === index ? { ...column, ...patch } : column,
      ),
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setDraftColumns((current) => {
      const oldIndex = current.findIndex((column) => column.id === active.id);
      const newIndex = current.findIndex((column) => column.id === over.id);
      if (oldIndex < 0 || newIndex < 0) {
        return current;
      }

      const reordered = arrayMove(current, oldIndex, newIndex).map(
        (column, index) => ({
          ...column,
          sortOrder: index,
        }),
      );

      if (selectedIndex !== null) {
        const selectedId = current[selectedIndex]?.id;
        const nextIndex = reordered.findIndex((column) => column.id === selectedId);
        setSelectedIndex(nextIndex >= 0 ? nextIndex : null);
      }

      return reordered;
    });
  }

  function handleAddColumn() {
    const label = newLabel.trim();
    if (!label) {
      return;
    }

    const nextColumn = createTableColumn(
      label,
      newType,
      newRequired || newType === 'email',
      draftColumns.length,
    );

    setDraftColumns((current) => [...current, nextColumn]);
    setSelectedIndex(draftColumns.length);
    setAddDialogOpen(false);
    setNewLabel('');
    setNewType('text');
    setNewRequired(false);
  }

  function handleRemove(index: number) {
    const column = draftColumns[index];
    if (column?.system) {
      return;
    }

    setDraftColumns((current) =>
      current
        .filter((_item, columnIndex) => columnIndex !== index)
        .map((item, columnIndex) => ({ ...item, sortOrder: columnIndex })),
    );

    if (selectedIndex === index) {
      setSelectedIndex(null);
    } else if (selectedIndex !== null && selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1);
    }
  }

  async function handleSave() {
    await onSubmit({
      fields,
      tableColumns: draftColumns,
      version,
    });
  }

  return (
    <>
      <Stack spacing={2} className="pb-24">
        <Paper className="rounded-2xl border border-border/60 p-3">
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
          >
            <Box>
              <Typography variant="subtitle1" className="font-semibold">
                Table columns
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Columns used when importing files into lists. Required columns must
                be mapped during upload.
              </Typography>
            </Box>
            {!readOnly ? (
              <Button
                size="small"
                startIcon={<AddOutlinedIcon />}
                onClick={() => setAddDialogOpen(true)}
              >
                Column
              </Button>
            ) : null}
          </Stack>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={draftColumns.map((column) => column.id)}
              strategy={verticalListSortingStrategy}
            >
              <Stack spacing={1}>
                {draftColumns.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No table columns defined yet.
                  </Typography>
                ) : (
                  draftColumns.map((column, index) => (
                    <SortableColumnRow
                      key={column.id}
                      column={column}
                      index={index}
                      isSelected={selectedIndex === index}
                      readOnly={readOnly}
                      onSelect={setSelectedIndex}
                      onRemove={handleRemove}
                    />
                  ))
                )}
              </Stack>
            </SortableContext>
          </DndContext>
        </Paper>

        {selectedColumn ? (
          <Paper className="rounded-2xl border border-border/60 p-3">
            <Typography variant="subtitle2" className="mb-3 font-semibold">
              Column properties
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Label"
                value={selectedColumn.label}
                onChange={(event) => {
                  if (selectedIndex !== null && !selectedColumn.system) {
                    updateColumn(selectedIndex, {
                      label: event.target.value,
                    });
                  }
                }}
                disabled={readOnly || selectedColumn.system || mode === 'org'}
                fullWidth
                size="small"
              />
              <TextField
                select
                label="Type"
                value={selectedColumn.type}
                onChange={(event) => {
                  if (selectedIndex !== null && !selectedColumn.system) {
                    const type = event.target.value as FormTableColumnType;
                    updateColumn(selectedIndex, {
                      type,
                      required: type === 'email' ? true : selectedColumn.required,
                    });
                  }
                }}
                disabled={
                  readOnly ||
                  selectedColumn.system ||
                  mode === 'org' ||
                  selectedColumn.type === 'email'
                }
                fullWidth
                size="small"
              >
                {TABLE_COLUMN_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedColumn.required}
                    onChange={(event) => {
                      if (selectedIndex !== null && !selectedColumn.system) {
                        updateColumn(selectedIndex, {
                          required: event.target.checked,
                        });
                      }
                    }}
                    disabled={
                      readOnly ||
                      selectedColumn.system ||
                      selectedColumn.type === 'email'
                    }
                  />
                }
                label="Required for import"
              />
              <Typography variant="caption" color="text.secondary">
                Key: {selectedColumn.key}
                {selectedColumn.source ? ` · ${selectedColumn.source}` : ''}
              </Typography>
            </Stack>
          </Paper>
        ) : null}
      </Stack>

      {!readOnly ? (
        <Paper className="sticky bottom-0 z-10 rounded-2xl border border-border/60 bg-background/95 p-3 backdrop-blur">
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
          >
            <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => void handleSave()}
              disabled={!hasChanges || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </Stack>
        </Paper>
      ) : null}

      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add table column</DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="pt-1">
            <TextField
              label="Label"
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              select
              label="Type"
              value={newType}
              onChange={(event) => {
                const type = event.target.value as FormTableColumnType;
                setNewType(type);
                if (type === 'email') {
                  setNewRequired(true);
                }
              }}
              fullWidth
              disabled={!canAddEmailColumn && newType !== 'email'}
            >
              {TABLE_COLUMN_TYPES.filter(
                (type) => canAddEmailColumn || type !== 'email',
              ).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Checkbox
                  checked={newRequired || newType === 'email'}
                  onChange={(event) => setNewRequired(event.target.checked)}
                  disabled={newType === 'email'}
                />
              }
              label="Required for import"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddColumn}
            disabled={!newLabel.trim()}
          >
            Add column
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

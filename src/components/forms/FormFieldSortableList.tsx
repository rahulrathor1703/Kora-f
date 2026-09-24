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
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DragIndicatorOutlinedIcon from '@mui/icons-material/DragIndicatorOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TitleOutlinedIcon from '@mui/icons-material/TitleOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import {
  formFieldDeleteBlockedReason,
  isFormFieldDeletable,
  isFormFieldDraggable,
} from '@/lib/forms/field-rules';
import type { FormEditorMode, FormFieldDefinition } from '@/lib/forms/types';

interface FormFieldSortableListProps {
  fields: FormFieldDefinition[];
  mode: FormEditorMode;
  fieldKeysInUse?: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onReorder: (fields: FormFieldDefinition[], selectedIndex: number | null) => void;
  onRemove: (index: number) => void;
  readOnly?: boolean;
}

interface SortableFieldRowProps {
  field: FormFieldDefinition;
  fields: FormFieldDefinition[];
  mode: FormEditorMode;
  fieldKeysInUse?: string[];
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
  readOnly?: boolean;
}

function SortableFieldRow({
  field,
  fields,
  mode,
  fieldKeysInUse,
  index,
  isSelected,
  onSelect,
  onRemove,
  readOnly = false,
}: SortableFieldRowProps) {
  const draggable = !readOnly && isFormFieldDraggable(field, mode);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id, disabled: !draggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
  };

  const deleteReason = formFieldDeleteBlockedReason(
    field,
    mode,
    fieldKeysInUse,
    fields,
  );

  return (
    <Box
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border p-2 ${
        isSelected ? 'border-primary/60 bg-primary/5' : 'border-border/60'
      } ${isDragging ? 'shadow-md' : ''} ${field.sectionId ? 'ml-4' : ''} ${
        !draggable ? 'opacity-90' : ''
      }`}
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
          <IconButton size="small" disabled aria-label="Platform field locked">
            <LockOutlinedIcon fontSize="small" />
          </IconButton>
        )}
        {isSectionFieldType(field.type) ? (
          <TitleOutlinedIcon fontSize="small" color="action" />
        ) : null}
        <Button
          size="small"
          variant="text"
          className="min-w-0 flex-1 justify-start normal-case"
          onClick={() => onSelect(index)}
        >
          <Typography
            component="span"
            variant={isSectionFieldType(field.type) ? 'subtitle2' : 'body2'}
            className={isSectionFieldType(field.type) ? 'font-semibold' : undefined}
          >
            {field.label || field.key || 'Untitled field'}
          </Typography>
        </Button>
        <IconButton
          size="small"
          onClick={() => onRemove(index)}
          disabled={
            readOnly ||
            !isFormFieldDeletable(field, mode, fieldKeysInUse, fields)
          }
          aria-label={`Delete ${field.label || field.key || 'field'}`}
          title={deleteReason ?? 'Delete field'}
        >
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}

export default function FormFieldSortableList({
  fields,
  mode,
  fieldKeysInUse,
  selectedIndex,
  onSelect,
  onReorder,
  onRemove,
  readOnly = false,
}: FormFieldSortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeField = fields.find((field) => field.id === active.id);
    const overField = fields.find((field) => field.id === over.id);

    if (
      !activeField ||
      !overField ||
      !isFormFieldDraggable(activeField, mode) ||
      !isFormFieldDraggable(overField, mode)
    ) {
      return;
    }

    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const reordered = arrayMove(fields, oldIndex, newIndex).map(
      (field, sortOrder) => ({
        ...field,
        sortOrder,
      }),
    );

    const selectedFieldId =
      selectedIndex === null ? null : fields[selectedIndex]?.id ?? null;
    let resolvedSelectedIndex: number | null = null;

    if (selectedFieldId !== null) {
      const index = reordered.findIndex((field) => field.id === selectedFieldId);
      resolvedSelectedIndex = index >= 0 ? index : null;
    }

    onReorder(reordered, resolvedSelectedIndex);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((field) => field.id)}
        strategy={verticalListSortingStrategy}
      >
        <Stack spacing={1}>
          {fields.map((field, index) => (
            <SortableFieldRow
              key={field.id}
              field={field}
              fields={fields}
              mode={mode}
              fieldKeysInUse={fieldKeysInUse}
              index={index}
              isSelected={selectedIndex === index}
              onSelect={onSelect}
              onRemove={onRemove}
              readOnly={readOnly}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}

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
import TitleOutlinedIcon from '@mui/icons-material/TitleOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { CompanyFieldDefinition } from '@/lib/crm/companies/types';
import {
  fieldDeleteBlockedReason,
  isCompanyFieldDeletable,
} from '@/lib/crm/fields/field-delete-rules';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';

interface CompanyFieldSortableListProps {
  fields: CompanyFieldDefinition[];
  fieldKeysInUse?: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onReorder: (fields: CompanyFieldDefinition[], selectedIndex: number | null) => void;
  onRemove: (index: number) => void;
}

interface SortableFieldRowProps {
  field: CompanyFieldDefinition;
  fields: CompanyFieldDefinition[];
  fieldKeysInUse?: string[];
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
}

function SortableFieldRow({
  field,
  fields,
  fieldKeysInUse,
  index,
  isSelected,
  onSelect,
  onRemove,
}: SortableFieldRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

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
      } ${isDragging ? 'shadow-md' : ''} ${field.sectionId ? 'ml-4' : ''}`}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
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
          disabled={!isCompanyFieldDeletable(field, fieldKeysInUse, fields)}
          aria-label={`Delete ${field.label || field.key || 'field'}`}
          title={
            fieldDeleteBlockedReason(field, fieldKeysInUse, fields) ??
            'Delete field'
          }
        >
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}

export default function CompanyFieldSortableList({
  fields,
  fieldKeysInUse,
  selectedIndex,
  onSelect,
  onReorder,
  onRemove,
}: CompanyFieldSortableListProps) {
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
      selectedIndex === null ? null : (fields[selectedIndex]?.id ?? null);
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
              fieldKeysInUse={fieldKeysInUse}
              index={index}
              isSelected={selectedIndex === index}
              onSelect={onSelect}
              onRemove={onRemove}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}

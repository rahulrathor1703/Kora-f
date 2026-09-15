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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorOutlinedIcon from '@mui/icons-material/DragIndicatorOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useRef, useState } from 'react';
import { CrmFormSection } from '@/components/crm/fields/DynamicCrmFormLayout';
import DynamicFormFieldRenderer from '@/components/forms/DynamicFormFieldRenderer';
import {
  buildFormFieldGroups,
  formColSpanFromPointerDelta,
  getFormFieldColSpanClassName,
  resolveFormColSpan,
} from '@/lib/crm/fields/form-layout.utils';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import { emptyLocationValue } from '@/lib/crm/location/types';
import {
  isFormFieldDraggable,
  isFormFieldResizable,
} from '@/lib/forms/field-rules';
import {
  reorderFormLayoutGroup,
  updateFieldFormColSpan,
} from '@/lib/forms/form-layout.utils';
import type { FormEditorMode, FormFieldDefinition } from '@/lib/forms/types';

interface FormLayoutBuilderProps {
  fields: FormFieldDefinition[];
  mode: FormEditorMode;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string | null) => void;
  onFieldsChange: (fields: FormFieldDefinition[]) => void;
  readOnly?: boolean;
}

function getPreviewValue(field: FormFieldDefinition): FieldStoredValue {
  if (field.type === 'location') {
    return emptyLocationValue();
  }

  if (field.type === 'multiselect') {
    return [];
  }

  if (field.type === 'checkbox') {
    return 'false';
  }

  return '';
}

interface LayoutPreviewFieldProps {
  field: FormFieldDefinition;
  mode: FormEditorMode;
  isSelected: boolean;
  onSelect: () => void;
  onResize: (fieldId: string, formColSpan: number) => void;
  readOnly?: boolean;
}

function LayoutPreviewField({
  field,
  mode,
  isSelected,
  onSelect,
  onResize,
  readOnly = false,
}: LayoutPreviewFieldProps) {
  const draggable = !readOnly && isFormFieldDraggable(field, mode);
  const resizable = !readOnly && isFormFieldResizable(field, mode);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resizeStateRef = useRef<{ startX: number; startSpan: number } | null>(
    null,
  );
  const [isResizing, setIsResizing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id, disabled: !draggable });

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  function handleResizePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!resizable) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const container = containerRef.current;
    if (!container) {
      return;
    }

    resizeStateRef.current = {
      startX: event.clientX,
      startSpan: resolveFormColSpan(field),
    };
    setIsResizing(true);
    container.setPointerCapture(event.pointerId);

    function handlePointerMove(moveEvent: PointerEvent) {
      const state = resizeStateRef.current;
      const currentContainer = containerRef.current;
      if (!state || !currentContainer) {
        return;
      }

      const columnWidth = currentContainer.parentElement
        ? currentContainer.parentElement.clientWidth / 12
        : currentContainer.clientWidth / resolveFormColSpan(field);
      const nextSpan = formColSpanFromPointerDelta(
        state.startSpan,
        moveEvent.clientX - state.startX,
        columnWidth,
      );
      onResize(field.id, nextSpan);
    }

    function handlePointerUp(upEvent: PointerEvent) {
      container?.releasePointerCapture(upEvent.pointerId);
      resizeStateRef.current = null;
      setIsResizing(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box
      ref={setRefs}
      style={style}
      onClick={onSelect}
      className={`relative min-w-0 rounded-xl border p-3 transition-colors ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border/60 bg-background/80'
      } ${isDragging ? 'z-10 opacity-80 shadow-lg' : ''} ${
        isResizing ? 'ring-2 ring-primary/40' : ''
      } ${!draggable ? 'bg-surface/40' : ''}`}
    >
      <Stack direction="row" spacing={0.5} className="mb-2 items-center">
        {draggable ? (
          <IconButton
            size="small"
            aria-label={`Drag ${field.label}`}
            className="cursor-grab"
            {...attributes}
            {...listeners}
            onClick={(event) => event.stopPropagation()}
          >
            <DragIndicatorOutlinedIcon fontSize="small" />
          </IconButton>
        ) : (
          <IconButton size="small" disabled aria-label="Platform field locked">
            <LockOutlinedIcon fontSize="small" />
          </IconButton>
        )}
        <Typography variant="caption" color="text.secondary" className="flex-1">
          {field.label} · {resolveFormColSpan(field)} / 12
        </Typography>
      </Stack>

      <Box className="pointer-events-none">
        <DynamicFormFieldRenderer
          field={field}
          value={getPreviewValue(field)}
          onChange={() => undefined}
          disabled
        />
      </Box>

      {resizable ? (
        <Box
          role="separator"
          aria-label={`Resize ${field.label}`}
          onPointerDown={handleResizePointerDown}
          className="absolute bottom-2 right-1 top-2 w-2 cursor-ew-resize rounded-full bg-border/80 hover:bg-primary/50"
        />
      ) : null}
    </Box>
  );
}

function LayoutFieldGrid({
  groupKey,
  fields,
  mode,
  selectedFieldId,
  onSelectField,
  onResize,
  onReorder,
  readOnly = false,
}: {
  groupKey: string;
  fields: FormFieldDefinition[];
  mode: FormEditorMode;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string | null) => void;
  onResize: (fieldId: string, formColSpan: number) => void;
  onReorder: (groupKey: string, activeId: string, overId: string) => void;
  readOnly?: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
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

    onReorder(groupKey, String(active.id), String(over.id));
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
        <Box className="grid grid-cols-12 gap-3 sm:gap-x-4 sm:gap-y-3">
          {fields.map((field) => (
            <Box
              key={field.id}
              className={getFormFieldColSpanClassName(field)}
            >
              <LayoutPreviewField
                field={field}
                mode={mode}
                isSelected={selectedFieldId === field.id}
                onSelect={() => onSelectField(field.id)}
                onResize={onResize}
                readOnly={readOnly}
              />
            </Box>
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );
}

export default function FormLayoutBuilder({
  fields,
  mode,
  selectedFieldId,
  onSelectField,
  onFieldsChange,
  readOnly = false,
}: FormLayoutBuilderProps) {
  const formFields = [...fields]
    .filter((field) => field.showInForm !== false && !isSectionFieldType(field.type))
    .sort((left, right) => left.sortOrder - right.sortOrder);

  const groups = buildFormFieldGroups(formFields);
  const hasSections = groups.some((group) => group.kind === 'section');

  function handleReorder(groupKey: string, activeId: string, overId: string) {
    onFieldsChange(
      reorderFormLayoutGroup(
        fields.map((field) => ({
          ...field,
          showInForm: field.showInForm ?? true,
        })),
        groupKey,
        activeId,
        overId,
      ),
    );
  }

  function handleResize(fieldId: string, formColSpan: number) {
    onFieldsChange(
      updateFieldFormColSpan(
        fields.map((field) => ({
          ...field,
          showInForm: field.showInForm ?? true,
        })),
        fieldId,
        formColSpan,
      ),
    );
  }

  if (formFields.length === 0) {
    return (
      <Paper className="rounded-2xl p-6">
        <Typography variant="body2" color="text.secondary">
          No form fields to preview. Enable &quot;Show in form&quot; on at least one field.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper className="rounded-2xl p-4 sm:p-5">
      <Stack spacing={1} className="mb-4">
        <Typography variant="subtitle2">Layout canvas</Typography>
        <Typography variant="caption" color="text.secondary">
          {readOnly
            ? 'Read-only preview of the saved field layout.'
            : 'Drag fields to reorder and drag the right edge to change width. Layout is saved with your field schema.'}
        </Typography>
      </Stack>

      <Stack spacing={hasSections ? 3 : 2.5}>
        {groups.map((group) => {
          if (group.kind === 'section') {
            return (
              <CrmFormSection
                key={group.id}
                id={group.id}
                title={group.title ?? 'Additional details'}
              >
                <LayoutFieldGrid
                  groupKey={group.id}
                  fields={group.fields}
                  mode={mode}
                  selectedFieldId={selectedFieldId}
                  onSelectField={onSelectField}
                  onResize={handleResize}
                  onReorder={handleReorder}
                  readOnly={readOnly}
                />
              </CrmFormSection>
            );
          }

          return (
            <LayoutFieldGrid
              key={group.id}
              groupKey="root"
              fields={group.fields}
              mode={mode}
              selectedFieldId={selectedFieldId}
              onSelectField={onSelectField}
              onResize={handleResize}
              onReorder={handleReorder}
              readOnly={readOnly}
            />
          );
        })}
      </Stack>
    </Paper>
  );
}

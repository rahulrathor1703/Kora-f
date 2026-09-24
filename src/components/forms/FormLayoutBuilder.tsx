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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DragIndicatorOutlinedIcon from '@mui/icons-material/DragIndicatorOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { useCallback, useRef } from 'react';
import { CrmFormSection } from '@/components/crm/fields/DynamicCrmFormLayout';
import DynamicFormFieldRenderer from '@/components/forms/DynamicFormFieldRenderer';
import {
  FormLayoutFieldLabel,
  FormLayoutFieldPreviewInput,
} from '@/components/forms/FormLayoutFieldPreview';
import FormLayoutDropZone from '@/components/forms/FormLayoutDropZone';
import { FormLayoutSectionTreeCard } from '@/components/forms/FormLayoutSectionCard';
import {
  buildFormFieldGroups,
  formColSpanFromPointerDelta,
  getFormFieldColSpanClassName,
  packFormLayoutFieldRows,
  resolveFormColSpan,
} from '@/lib/crm/fields/form-layout.utils';
import { buildFormLayoutSectionTree } from '@/lib/forms/form-layout-section-blocks.utils';
import { filterFieldsForLayoutCanvas } from '@/lib/forms/layout-canvas-fields.utils';
import { FORM_LAYOUT_CANVAS_APPEND_GROUP } from '@/lib/forms/form-layout-dnd';
import {
  getLayoutSectionMoveState,
  isSectionFieldType,
  type LayoutSectionMoveDirection,
} from '@/lib/crm/fields/section-field.utils';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import { emptyLocationValue } from '@/lib/crm/location/types';
import {
  canRemoveFieldFromLayoutCanvas,
  isFormFieldDeletable,
  isFormFieldDraggable,
  isFormFieldLayoutDraggable,
  isFormFieldResizable,
  isFormSectionReorderable,
  isPlatformLockedField,
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
  formKey?: string;
  /** Hides the canvas title and helper copy (module layout editor). */
  compactChrome?: boolean;
  /** When true, drag-and-drop is handled by a parent `DndContext` (module layout editor). */
  sharedDragContext?: boolean;
  fieldKeysInUse?: string[];
  onDeleteSection?: (sectionId: string) => void;
  onDeleteSubSection?: (subSectionId: string) => void;
  onAddSubSection?: (parentSectionId: string) => void;
  onSectionTitleChange?: (sectionId: string, title: string) => void;
  onMoveSection?: (sectionId: string, direction: LayoutSectionMoveDirection) => void;
  onRemoveFieldFromCanvas?: (fieldId: string) => void;
  onOpenFieldSettings?: (fieldId: string) => void;
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
  editorFieldChrome?: boolean;
  fieldKeysInUse?: string[];
  allFields?: FormFieldDefinition[];
  onRemoveFromCanvas?: (fieldId: string) => void;
  onOpenFieldSettings?: (fieldId: string) => void;
}

function LayoutPreviewField({
  field,
  mode,
  isSelected,
  onSelect,
  onResize,
  readOnly = false,
  editorFieldChrome = false,
  fieldKeysInUse = [],
  allFields = [],
  onRemoveFromCanvas,
  onOpenFieldSettings,
}: LayoutPreviewFieldProps) {
  const resizable =
    !readOnly &&
    !editorFieldChrome &&
    isFormFieldResizable(field, mode);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resizeStateRef = useRef<{ startX: number; startSpan: number } | null>(
    null,
  );
  const draggable =
    !readOnly &&
    (editorFieldChrome
      ? isFormFieldLayoutDraggable(field, mode)
      : isFormFieldDraggable(field, mode));
  const removable =
    !readOnly &&
    editorFieldChrome &&
    onRemoveFromCanvas &&
    canRemoveFieldFromLayoutCanvas(field, mode, fieldKeysInUse, allFields);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
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

  const fieldChromeClassName = [
    'relative rounded-lg px-0.5 py-1 transition-[box-shadow,background-color]',
    isSelected ? 'bg-primary/[0.05] ring-2 ring-primary/20' : 'bg-transparent',
    isDragging ? 'z-10 opacity-65' : '',
  ].join(' ');

  const dragHandle = draggable ? (
    <Tooltip title="Drag to reorder" placement="top">
      <IconButton
        ref={setActivatorNodeRef}
        size="small"
        aria-label={`Drag to reorder ${field.label}`}
        className="cursor-grab text-slate-500 active:cursor-grabbing hover:bg-slate-100"
        sx={{ touchAction: 'none' }}
        onClick={(event) => event.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <DragIndicatorOutlinedIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Tooltip>
  ) : (
    <Tooltip
      title={
        isPlatformLockedField(field, mode)
          ? 'Platform default — read-only for organizations'
          : 'Locked — cannot move on layout'
      }
      placement={editorFieldChrome ? 'top' : 'left'}
    >
      <span className="inline-flex">
        <IconButton
          size="small"
          disabled
          tabIndex={-1}
          aria-label="Field locked"
          className="text-slate-400"
        >
          <LockOutlinedIcon sx={{ fontSize: editorFieldChrome ? 20 : 18 }} />
        </IconButton>
      </span>
    </Tooltip>
  );

  const actionColumn = editorFieldChrome ? (
    <Stack
      direction="row"
      spacing={0.25}
      sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
      className="min-w-[5.5rem] shrink-0"
    >
      {dragHandle}
      {draggable ? (
        <Tooltip title="Field settings" placement="top">
          <IconButton
            size="small"
            tabIndex={-1}
            aria-label={`Open settings for ${field.label}`}
            className="text-slate-700 hover:bg-slate-100"
            onClick={(event) => {
              event.stopPropagation();
              onOpenFieldSettings?.(field.id);
            }}
          >
            <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      ) : null}
      {removable ? (
        <Tooltip title="Remove from layout" placement="top">
          <IconButton
            size="small"
            tabIndex={-1}
            aria-label={`Remove ${field.label} from layout`}
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={(event) => {
              event.stopPropagation();
              onRemoveFromCanvas?.(field.id);
            }}
          >
            <DeleteOutlineOutlinedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      ) : null}
    </Stack>
  ) : (
    <Stack spacing={0} sx={{ alignItems: 'center' }} className="shrink-0">
      {dragHandle}
      {removable ? (
        <Tooltip title="Remove from layout" placement="left">
          <IconButton
            size="small"
            tabIndex={-1}
            aria-label={`Remove ${field.label} from layout`}
            className="text-slate-400 hover:text-red-600"
            onClick={(event) => {
              event.stopPropagation();
              onRemoveFromCanvas?.(field.id);
            }}
          >
            <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      ) : null}
    </Stack>
  );

  const resizeHandle = resizable ? (
    <Box
      role="separator"
      aria-label={`Resize ${field.label}`}
      onPointerDown={handleResizePointerDown}
      className={[
        'absolute bottom-2 top-8 w-1.5 cursor-ew-resize rounded-full',
        'bg-transparent hover:bg-primary/35',
        editorFieldChrome ? 'right-1' : 'right-0',
      ].join(' ')}
    />
  ) : null;

  return (
    <Box ref={setRefs} style={style} className="relative min-w-0 outline-none">
      <Box
        onClick={onSelect}
        aria-selected={isSelected}
        className={fieldChromeClassName}
      >
        {editorFieldChrome ? (
          <Stack spacing={0.75} className="min-w-0 pr-1">
            <Box className="flex min-h-[22px] items-end">
              <FormLayoutFieldLabel field={field} />
            </Box>
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ alignItems: 'flex-start' }}
              className="min-w-0"
            >
              <Box className="pointer-events-none min-w-0 flex-1 [&_.MuiFormControl-root]:mt-0">
                <FormLayoutFieldPreviewInput field={field} />
              </Box>
              <Box className="flex h-10 items-center">{actionColumn}</Box>
            </Stack>
          </Stack>
        ) : (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center' }}
            className="min-w-0"
          >
            <Box className="pointer-events-none min-w-0 flex-1">
              <DynamicFormFieldRenderer
                field={field}
                value={getPreviewValue(field)}
                onChange={() => undefined}
                disabled
              />
            </Box>
            {actionColumn}
          </Stack>
        )}
        {resizeHandle}
      </Box>
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
  sharedDragContext = false,
  editorFieldChrome = false,
  dropZoneVariant = 'hint' as 'quiet' | 'hint' | 'rich',
  fieldKeysInUse = [],
  allFields = [],
  onRemoveFromCanvas,
  onOpenFieldSettings,
}: {
  groupKey: string;
  fields: FormFieldDefinition[];
  mode: FormEditorMode;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string | null) => void;
  onResize: (fieldId: string, formColSpan: number) => void;
  onReorder: (groupKey: string, activeId: string, overId: string) => void;
  readOnly?: boolean;
  sharedDragContext?: boolean;
  editorFieldChrome?: boolean;
  dropZoneVariant?: 'quiet' | 'hint' | 'rich';
  fieldKeysInUse?: string[];
  allFields?: FormFieldDefinition[];
  onRemoveFromCanvas?: (fieldId: string) => void;
  onOpenFieldSettings?: (fieldId: string) => void;
}) {
  function fieldIsDraggable(field: FormFieldDefinition): boolean {
    return editorFieldChrome
      ? isFormFieldLayoutDraggable(field, mode)
      : isFormFieldDraggable(field, mode);
  }
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
      !fieldIsDraggable(activeField) ||
      !fieldIsDraggable(overField)
    ) {
      return;
    }

    onReorder(groupKey, String(active.id), String(over.id));
  }

  const layoutRows = packFormLayoutFieldRows(fields);

  const grid = (
    <SortableContext
      items={fields.map((field) => field.id)}
      strategy={rectSortingStrategy}
    >
      <Stack spacing={2.5}>
        {layoutRows.map((row) => (
          <Box
            key={row.map((field) => field.id).join('-')}
            className="grid grid-cols-12 items-start gap-x-4"
          >
            {row.map((field) => (
              <Box key={field.id} className={getFormFieldColSpanClassName(field)}>
                <LayoutPreviewField
                  field={field}
                  mode={mode}
                  isSelected={selectedFieldId === field.id}
                  onSelect={() => onSelectField(field.id)}
                  onResize={onResize}
                  readOnly={readOnly}
                  editorFieldChrome={editorFieldChrome}
                  fieldKeysInUse={fieldKeysInUse}
                  allFields={allFields}
                  onRemoveFromCanvas={onRemoveFromCanvas}
                  onOpenFieldSettings={onOpenFieldSettings}
                />
              </Box>
            ))}
          </Box>
        ))}
      </Stack>
    </SortableContext>
  );

  const dropWrapped = sharedDragContext ? (
    <FormLayoutDropZone
      groupKey={groupKey}
      isEmpty={fields.length === 0}
      variant={dropZoneVariant}
      emptyHint={
        groupKey === 'root'
          ? 'Drop fields here for the main form area'
          : 'Drop fields in this section'
      }
    >
      {grid}
    </FormLayoutDropZone>
  ) : (
    grid
  );

  if (sharedDragContext) {
    return dropWrapped;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {dropWrapped}
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
  compactChrome = false,
  sharedDragContext = false,
  fieldKeysInUse = [],
  onDeleteSection,
  onDeleteSubSection,
  onAddSubSection,
  onSectionTitleChange,
  onMoveSection,
  formKey,
  onRemoveFieldFromCanvas,
  onOpenFieldSettings,
}: FormLayoutBuilderProps) {
  const editorSectionChrome = Boolean(sharedDragContext);
  const editorFieldChrome = editorSectionChrome;
  const canvasFields = filterFieldsForLayoutCanvas(formKey, fields);
  const layoutOrderedFields = [...canvasFields]
    .filter((field) => {
      if (isSectionFieldType(field.type)) {
        return true;
      }

      return field.showInForm !== false;
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);

  function isSectionFieldDeletable(
    sectionField: FormFieldDefinition | undefined,
  ): boolean {
    if (!sectionField) {
      return false;
    }

    return isFormFieldDeletable(sectionField, mode, fieldKeysInUse, fields);
  }

  function getSectionMoveProps(sectionField: FormFieldDefinition) {
    const reorderable = isFormSectionReorderable(sectionField, mode);
    const { canMoveUp, canMoveDown } = getLayoutSectionMoveState(
      fields,
      sectionField.id,
      reorderable,
    );

    return {
      sectionReorderable: reorderable,
      canMoveSectionUp: canMoveUp,
      canMoveSectionDown: canMoveDown,
    };
  }

  const layoutTree = editorSectionChrome
    ? buildFormLayoutSectionTree(canvasFields)
    : null;
  const groups = editorSectionChrome
    ? []
    : buildFormFieldGroups(layoutOrderedFields, {
        includeEmptySections: sharedDragContext,
      });
  const dropZoneVariant = sharedDragContext ? 'quiet' : 'hint';
  const hasCanvasContent = editorSectionChrome
    ? (layoutTree?.sections.length ?? 0) > 0 ||
      (layoutTree?.rootFields.length ?? 0) > 0
    : groups.length > 0;

  function renderFieldGrid(
    groupKey: string,
    gridFields: FormFieldDefinition[],
  ) {
    return (
      <LayoutFieldGrid
        groupKey={groupKey}
        fields={gridFields}
        mode={mode}
        selectedFieldId={selectedFieldId}
        onSelectField={onSelectField}
        onResize={handleResize}
        onReorder={handleReorder}
        readOnly={readOnly}
        sharedDragContext={sharedDragContext}
        editorFieldChrome={editorFieldChrome}
        dropZoneVariant={dropZoneVariant}
        fieldKeysInUse={fieldKeysInUse}
        allFields={fields}
        onRemoveFromCanvas={onRemoveFieldFromCanvas}
        onOpenFieldSettings={onOpenFieldSettings}
      />
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

  function renderCompactCanvas(content: ReactNode) {
    return (
      <Box className="flex min-h-[520px] min-w-0 flex-1 flex-col overflow-auto p-4 sm:p-5 md:p-6">
        {content}
      </Box>
    );
  }

  const emptyCanvas = sharedDragContext ? (
    <FormLayoutDropZone
      groupKey="root"
      isEmpty
      variant="rich"
      emptyHint="Add a Main Section from the palette to start"
    />
  ) : (
    <Typography variant="body2" color="text.secondary">
      No form fields to preview. Enable &quot;Show in form&quot; on at least one field.
    </Typography>
  );

  if (!hasCanvasContent) {
    if (compactChrome) {
      return renderCompactCanvas(emptyCanvas);
    }

    return (
      <Paper className="rounded-2xl p-6">{emptyCanvas}</Paper>
    );
  }

  function renderSectionFieldGrid(
    sectionId: string,
    gridFields: FormFieldDefinition[],
  ) {
    const isEmpty = gridFields.length === 0;

    if (sharedDragContext && isEmpty) {
      return (
        <FormLayoutDropZone
          groupKey={sectionId}
          isEmpty
          variant="rich"
          emptyHint="Drag and drop fields here"
        />
      );
    }

    return renderFieldGrid(sectionId, gridFields);
  }

  const canvasBody = editorSectionChrome && layoutTree ? (
    <Stack spacing={5}>
      {layoutTree.rootFields.length > 0 ? (
        <Box key="layout-root-fields">
          {renderFieldGrid('root', layoutTree.rootFields as FormFieldDefinition[])}
        </Box>
      ) : null}
      {layoutTree.sections.map((node) => {
        const sectionDeletable = isSectionFieldDeletable(
          node.sectionField as FormFieldDefinition,
        );

        return (
          <FormLayoutSectionTreeCard
            key={node.id}
            node={node}
            readOnly={readOnly}
            showDelete={sectionDeletable}
            isSectionDeletable={(sectionField) =>
              isSectionFieldDeletable(sectionField as FormFieldDefinition)
            }
            onDeleteSection={onDeleteSubSection ?? onDeleteSection}
            onAddSubSection={onAddSubSection}
            onSectionTitleChange={onSectionTitleChange}
            getSectionMoveProps={
              sharedDragContext && onMoveSection
                ? (sectionField) =>
                    getSectionMoveProps(sectionField as FormFieldDefinition)
                : undefined
            }
            onMoveSection={sharedDragContext ? onMoveSection : undefined}
            renderFieldGrid={(sectionId, gridFields) =>
              renderSectionFieldGrid(sectionId, gridFields as FormFieldDefinition[])
            }
          />
        );
      })}
      {sharedDragContext ? (
        <FormLayoutDropZone
          groupKey={FORM_LAYOUT_CANVAS_APPEND_GROUP}
          isEmpty
          variant={dropZoneVariant}
        >
          <Box className="h-2" />
        </FormLayoutDropZone>
      ) : null}
    </Stack>
  ) : (
    <Stack spacing={groups.some((group) => group.kind === 'section') ? 3 : 2.5}>
      {groups.map((group) => {
        if (group.kind === 'section') {
          const sectionTitle = group.title ?? 'Additional details';
          const grid = (
            <LayoutFieldGrid
              groupKey={group.id}
              fields={group.fields}
              mode={mode}
              selectedFieldId={selectedFieldId}
              onSelectField={onSelectField}
              onResize={handleResize}
              onReorder={handleReorder}
              readOnly={readOnly}
              sharedDragContext={sharedDragContext}
              editorFieldChrome={editorFieldChrome}
            />
          );

          return (
            <CrmFormSection key={group.id} id={group.id} title={sectionTitle}>
              {grid}
            </CrmFormSection>
          );
        }

        const rootGrid = (
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
            sharedDragContext={sharedDragContext}
            editorFieldChrome={editorFieldChrome}
          />
        );

        return rootGrid;
      })}
    </Stack>
  );

  if (compactChrome) {
    return renderCompactCanvas(canvasBody);
  }

  return (
    <Paper className="rounded-2xl p-4 sm:p-5">
      <Stack spacing={1} className="mb-4">
        <Typography variant="subtitle2">Layout canvas</Typography>
        <Typography variant="caption" color="text.secondary">
          {readOnly
            ? 'Read-only preview of the saved field layout.'
            : sharedDragContext
              ? 'Use the drag handle to reorder fields. Open settings (gear) to change label, required, and width.'
              : 'Use the drag handle to reorder, or drag the right edge to change width. Layout is saved with your field schema.'}
        </Typography>
      </Stack>
      {canvasBody}
    </Paper>
  );
}

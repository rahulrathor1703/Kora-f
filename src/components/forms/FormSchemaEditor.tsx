'use client';

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useMemo, useState } from 'react';
import { useNotify } from '@/hooks/useNotify';
import AddCustomFieldDialog, {
  type CustomFieldEntity,
} from '@/components/crm/fields/AddCustomFieldDialog';
import type { CompanyFieldType } from '@/lib/crm/companies/types';
import type { ProspectFieldType } from '@/lib/crm/prospects/types';
import FormEditorNotesPanel from '@/components/forms/FormEditorNotesPanel';
import FormFieldPalette from '@/components/forms/FormFieldPalette';
import FormEditFieldPropertiesDialog from '@/components/forms/FormEditFieldPropertiesDialog';
import FormFieldPropertiesPanel from '@/components/forms/FormFieldPropertiesPanel';
import { normalizeFormFieldOptions } from '@/lib/forms/form-field-options.utils';
import FormFieldSortableList from '@/components/forms/FormFieldSortableList';
import FormFieldsSummaryTable from '@/components/forms/FormFieldsSummaryTable';
import FormLayoutBuilder from '@/components/forms/FormLayoutBuilder';
import FormUnusedFieldsPanel from '@/components/forms/FormUnusedFieldsPanel';
import {
  type FormEditorState,
  useSyncFormEditorState,
} from '@/components/forms/form-editor-state';
import {
  collectDescendantSectionIds,
  createSectionFieldDefinition,
  findNestedSectionInsertIndex,
  findParentMainSectionId,
  insertFieldInSchema,
  insertSectionFieldInSchema,
  isSectionFieldType,
  moveLayoutSection,
  slugifySectionKey,
  type LayoutSectionMoveDirection,
} from '@/lib/crm/fields/section-field.utils';
import { resolveFormColSpan } from '@/lib/crm/fields/form-layout.utils';
import {
  DEFAULT_LOCATION_COMPONENTS,
  normalizeLocationInputMode,
} from '@/lib/crm/location/types';
import {
  canRemoveFieldFromLayoutCanvas,
  isFormFieldDeletable,
  isFormFieldLayoutDraggable,
  isFormSectionReorderable,
  orgPlatformFieldKeyConflictMessage,
  shouldMoveFieldToUnusedOnRemove,
} from '@/lib/forms/field-rules';
import {
  getFormLayoutGroupKey,
  moveFieldToLayoutGroup,
  reorderFormLayoutGroup,
} from '@/lib/forms/form-layout.utils';
import type { FormPaletteAction } from '@/lib/forms/form-palette.config';
import {
  isCanvasRootDropGroup,
  parseFormLayoutDropId,
  parseFormPaletteDragId,
  parseFormUnusedDragId,
  type FormPaletteDragData,
  type FormUnusedDragData,
} from '@/lib/forms/form-layout-dnd';
import { formKeyToCustomFieldEntity } from '@/lib/forms/org-registry-forms';
import { allocateUniqueFormFieldKey } from '@/lib/forms/form-field-key.utils';
import { resolveParentSectionIdForLayoutDrop } from '@/lib/forms/form-layout-section-blocks.utils';
import { areFormSchemasEqual } from '@/lib/forms/schema-compare';
import type {
  FormEditorMode,
  FormFieldDefinition,
  FormFieldType,
  UpdateFormSchemaInput,
} from '@/lib/forms/types';

function slugifyLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

function isOptionsFieldType(type: FormFieldType): boolean {
  return type === 'select' || type === 'multiselect';
}

const layoutCanvasCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  return closestCenter(args);
};

export type FormSchemaEditorView = 'layout' | 'summary';

interface FormSchemaEditorProps {
  formKey: string;
  fields: FormFieldDefinition[];
  schemaVersion?: number;
  mode: FormEditorMode;
  fieldKeysInUse?: string[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: UpdateFormSchemaInput) => Promise<void>;
  hideSaveBar?: boolean;
  readOnly?: boolean;
  layoutMode?: 'classic' | 'modules';
  view?: FormSchemaEditorView;
  onEditorStateChange?: (state: FormEditorState | null) => void;
}

export default function FormSchemaEditor({
  formKey,
  fields,
  schemaVersion,
  mode,
  fieldKeysInUse = [],
  isSubmitting,
  onCancel,
  onSubmit,
  hideSaveBar: hideSaveBarProp,
  readOnly = false,
  layoutMode = 'classic',
  view = 'layout',
  onEditorStateChange,
}: FormSchemaEditorProps) {
  const { notifyError } = useNotify();
  const hideSaveBar =
    hideSaveBarProp ?? (layoutMode === 'modules' ? true : false);

  const [draftFields, setDraftFields] = useState(fields);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    fields.length > 0 ? 0 : null,
  );
  const [addCustomFieldOpen, setAddCustomFieldOpen] = useState(false);
  const [customFieldSectionId, setCustomFieldSectionId] = useState<string>();
  const [paletteFieldType, setPaletteFieldType] = useState<
    CompanyFieldType | ProspectFieldType
  >('text');
  const [layoutDragLabel, setLayoutDragLabel] = useState<string | null>(null);
  const [layoutDragActiveFieldId, setLayoutDragActiveFieldId] = useState<
    string | null
  >(null);
  const [fieldPropertiesDialogId, setFieldPropertiesDialogId] = useState<
    string | null
  >(null);

  const layoutDragSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const customFieldEntity = formKeyToCustomFieldEntity(formKey);
  const sectionEntity: CustomFieldEntity =
    customFieldEntity ?? 'prospect';

  const selectedFieldId =
    selectedIndex !== null ? draftFields[selectedIndex]?.id ?? null : null;

  const hasChanges = useMemo(
    () => !areFormSchemasEqual(draftFields, fields),
    [draftFields, fields],
  );

  const selectedField =
    selectedIndex !== null ? draftFields[selectedIndex] ?? null : null;

  const layoutDragActiveField = useMemo(() => {
    if (!layoutDragActiveFieldId) {
      return null;
    }

    return (
      draftFields.find((field) => field.id === layoutDragActiveFieldId) ?? null
    );
  }, [draftFields, layoutDragActiveFieldId]);

  function updateField(index: number, patch: Partial<FormFieldDefinition>) {
    setDraftFields((current) =>
      current.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, ...patch } : field,
      ),
    );
  }

  function selectFieldById(
    fieldId: string | null,
    options?: { openProperties?: boolean },
  ) {
    if (!fieldId) {
      setSelectedIndex(null);
      setFieldPropertiesDialogId(null);
      return;
    }

    const index = draftFields.findIndex((field) => field.id === fieldId);
    setSelectedIndex(index >= 0 ? index : null);

    if (options?.openProperties && index >= 0) {
      const field = draftFields[index];
      if (field && !isSectionFieldType(field.type)) {
        setFieldPropertiesDialogId(field.id);
      }
    }
  }

  function moveFieldToUnused(fieldId: string) {
    setDraftFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? { ...field, showInForm: false, sectionId: undefined }
          : field,
      ),
    );
    setSelectedIndex(null);
  }

  function removeField(index: number) {
    const field = draftFields[index];
    if (isSectionFieldType(field.type)) {
      return;
    }

    if (shouldMoveFieldToUnusedOnRemove(field, mode)) {
      moveFieldToUnused(field.id);
      return;
    }

    if (!isFormFieldDeletable(field, mode, fieldKeysInUse, draftFields)) {
      return;
    }

    setDraftFields((current) =>
      current.filter((_, fieldIndex) => fieldIndex !== index),
    );
    setSelectedIndex(null);
  }

  function removeFieldFromLayoutCanvas(fieldId: string) {
    const index = draftFields.findIndex((field) => field.id === fieldId);
    if (index < 0) {
      return;
    }

    const field = draftFields[index];
    if (
      !canRemoveFieldFromLayoutCanvas(field, mode, fieldKeysInUse, draftFields)
    ) {
      return;
    }

    if (shouldMoveFieldToUnusedOnRemove(field, mode)) {
      moveFieldToUnused(field.id);
      return;
    }

    removeField(index);
  }

  function deleteSection(sectionId: string) {
    const sorted = [...draftFields].sort(
      (left, right) => left.sortOrder - right.sortOrder,
    );
    const sectionIndex = sorted.findIndex((field) => field.id === sectionId);
    if (sectionIndex < 0) {
      return;
    }

    const section = sorted[sectionIndex];
    if (!isSectionFieldType(section.type)) {
      return;
    }

    if (!isFormFieldDeletable(section, mode, fieldKeysInUse, draftFields)) {
      return;
    }

    if (section.sectionTier === 'sub') {
      const reparentTarget =
        section.sectionId ?? findParentMainSectionId(sorted, sectionId) ?? undefined;
      setDraftFields((current) =>
        current
          .filter((field) => field.id !== sectionId)
          .map((field) => {
            if (field.sectionId === sectionId) {
              return { ...field, sectionId: reparentTarget };
            }

            return field;
          })
          .map((field, index) => ({ ...field, sortOrder: index })),
      );
      setSelectedIndex(null);
      return;
    }

    const removedSectionIds = collectDescendantSectionIds(sorted, sectionId);

    for (let index = sectionIndex + 1; index < sorted.length; index += 1) {
      const field = sorted[index];
      if (field.type === 'section' && (field.sectionTier ?? 'main') === 'main') {
        break;
      }

      if (field.type === 'section' && field.sectionTier === 'sub' && !field.sectionId) {
        removedSectionIds.add(field.id);
      }
    }

    setDraftFields((current) =>
      current
        .filter((field) => !removedSectionIds.has(field.id))
        .map((field) =>
          field.sectionId && removedSectionIds.has(field.sectionId)
            ? { ...field, sectionId: undefined }
            : field,
        )
        .map((field, index) => ({ ...field, sortOrder: index })),
    );
    setSelectedIndex(null);
  }

  function updateSectionTitle(sectionId: string, title: string) {
    setDraftFields((current) =>
      current.map((field) => {
        if (field.id !== sectionId) {
          return field;
        }

        const trimmed = title.trim();
        return {
          ...field,
          label: title,
          key: trimmed ? slugifySectionKey(trimmed) : field.key,
        };
      }),
    );
  }

  function moveSection(sectionId: string, direction: LayoutSectionMoveDirection) {
    const sorted = [...draftFields].sort(
      (left, right) => left.sortOrder - right.sortOrder,
    );
    const sectionField = sorted.find((field) => field.id === sectionId);
    if (
      !sectionField ||
      !isFormSectionReorderable(sectionField, mode)
    ) {
      return;
    }

    setDraftFields(moveLayoutSection(sorted, sectionId, direction));
  }

  function insertSectionDirectly(
    tier: 'main' | 'sub',
    parentSectionId: string | null,
  ) {
    const newField: FormFieldDefinition = {
      ...createSectionFieldDefinition(
        draftFields.length,
        '',
        sectionEntity === 'company',
      ),
      sectionTier: tier,
      ...(mode === 'org' ? { source: 'org' as const } : {}),
    };

    setDraftFields((current) => {
      let next: FormFieldDefinition[];

      if (tier === 'sub' && parentSectionId) {
        const insertIndex = findNestedSectionInsertIndex(current, parentSectionId);
        next = insertSectionFieldInSchema(
          current,
          {
            ...newField,
            sectionTier: 'sub',
            sectionId: parentSectionId,
          },
          insertIndex,
        );
      } else if (tier === 'sub') {
        next = insertFieldInSchema(current, {
          ...newField,
          sectionTier: 'sub',
        });
      } else {
        next = insertFieldInSchema(current, {
          ...newField,
          sectionTier: 'main',
        });
      }

      setSelectedIndex(next.findIndex((field) => field.id === newField.id));
      return next;
    });
  }

  function openAddSubSection(parentSectionId: string | null) {
    insertSectionDirectly('sub', parentSectionId);
  }

  function appendField(newField: FormFieldDefinition) {
    const usedKeys = new Set(draftFields.map((field) => field.key));
    const fieldToAdd =
      mode === 'platform' && !isSectionFieldType(newField.type)
        ? {
            ...newField,
            key: allocateUniqueFormFieldKey(newField.label, usedKeys),
          }
        : newField;

    const keyConflict = orgPlatformFieldKeyConflictMessage(
      fieldToAdd.key,
      draftFields,
      mode,
    );
    if (keyConflict) {
      notifyError(keyConflict);
      return;
    }

    setDraftFields((current) => {
      const next = insertFieldInSchema(current, fieldToAdd);
      setSelectedIndex(next.findIndex((field) => field.id === fieldToAdd.id));
      return next;
    });
  }

  const handleSave = useCallback(async () => {
    const usedKeys = new Set<string>();
    const normalized = draftFields.map((field, index) => {
      const label = field.label.trim();
      let key: string;

      if (isSectionFieldType(field.type)) {
        key = slugifySectionKey(field.key.trim() || label);
      } else if (mode === 'platform') {
        const trimmedKey = field.key.trim();
        key =
          trimmedKey.length > 0
            ? trimmedKey
            : allocateUniqueFormFieldKey(label, usedKeys);
      } else {
        key = field.key.trim() || slugifyLabel(label);
      }

      usedKeys.add(key);

      return {
      ...field,
      key,
      label,
      sortOrder: index,
      showInTable: isSectionFieldType(field.type)
        ? false
        : (field.showInTable ?? true),
      options: isOptionsFieldType(field.type)
        ? normalizeFormFieldOptions(field.options)
        : undefined,
      displayOptionsAsChips: isOptionsFieldType(field.type)
        ? field.displayOptionsAsChips
        : undefined,
      locationComponents:
        field.type === 'location' ? [...DEFAULT_LOCATION_COMPONENTS] : undefined,
      locationInputMode:
        field.type === 'location'
          ? normalizeLocationInputMode(field.locationInputMode)
          : undefined,
      formColSpan: isSectionFieldType(field.type)
        ? undefined
        : resolveFormColSpan(field),
      minLength:
        field.minLength !== undefined && field.minLength >= 0
          ? field.minLength
          : undefined,
      maxLength:
        field.maxLength !== undefined && field.maxLength >= 0
          ? field.maxLength
          : undefined,
      validationType: field.validationType || undefined,
    };
    });

    await onSubmit({
      fields: normalized,
      ...(schemaVersion !== undefined ? { version: schemaVersion } : {}),
    });
  }, [draftFields, mode, onSubmit, schemaVersion]);

  const discardChanges = useCallback(() => {
    setDraftFields(fields);
    setSelectedIndex(fields.length > 0 ? 0 : null);
  }, [fields]);

  useSyncFormEditorState(
    layoutMode === 'modules',
    hasChanges,
    discardChanges,
    handleSave,
    onEditorStateChange,
  );

  const propertiesPanel = (
    <FormFieldPropertiesPanel
      field={selectedField}
      formKey={formKey}
      mode={mode}
      fieldKeysInUse={fieldKeysInUse}
      readOnly={readOnly}
      onUpdate={(patch) => {
        if (selectedIndex !== null) {
          updateField(selectedIndex, patch);
        }
      }}
    />
  );

  function restoreUnusedField(fieldId: string) {
    const index = draftFields.findIndex((field) => field.id === fieldId);
    if (index >= 0) {
      updateField(index, { showInForm: true });
      setSelectedIndex(index);
    }
  }

  function withFormVisibility(fieldsToNormalize: FormFieldDefinition[]) {
    return fieldsToNormalize.map((field) => ({
      ...field,
      showInForm: field.showInForm ?? true,
    }));
  }

  function handlePaletteAction(action: FormPaletteAction, sectionId?: string) {
    if (action.kind === 'main-section') {
      insertSectionDirectly('main', null);
      return;
    }

    if (action.kind === 'sub-section') {
      const parentSectionId = resolveParentSectionIdForLayoutDrop(
        draftFields,
        sectionId,
      );

      insertSectionDirectly('sub', parentSectionId);
      return;
    }

    if (action.kind === 'field') {
      if (!customFieldEntity) {
        return;
      }

      setCustomFieldSectionId(sectionId);
      setPaletteFieldType(action.fieldType as CompanyFieldType | ProspectFieldType);
      setAddCustomFieldOpen(true);
    }
  }

  function clearLayoutDragOverlayState() {
    setLayoutDragLabel(null);
    setLayoutDragActiveFieldId(null);
  }

  function handleLayoutDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id);
    const data = event.active.data.current as
      | FormPaletteDragData
      | FormUnusedDragData
      | undefined;

    if (data && 'label' in data && typeof data.label === 'string') {
      setLayoutDragLabel(data.label);
      setLayoutDragActiveFieldId(null);
      return;
    }

    if (
      parseFormPaletteDragId(activeId) ||
      parseFormUnusedDragId(activeId)
    ) {
      return;
    }

    const canvasField = draftFields.find((field) => field.id === activeId);
    if (canvasField && !isSectionFieldType(canvasField.type)) {
      setLayoutDragActiveFieldId(activeId);
      setLayoutDragLabel(null);
    }
  }

  function resolvePaletteDropSectionId(
    dropGroupKey: string | null,
    overId: string,
  ): string | undefined {
    if (dropGroupKey && !isCanvasRootDropGroup(dropGroupKey)) {
      return dropGroupKey;
    }

    const overField = draftFields.find((field) => field.id === overId);
    if (!overField || isSectionFieldType(overField.type)) {
      return undefined;
    }

    const groupKey = getFormLayoutGroupKey({
      ...overField,
      showInForm: overField.showInForm ?? true,
    });

    return groupKey === 'root' ? undefined : groupKey;
  }

  function handleLayoutDragEnd(event: DragEndEvent) {
    clearLayoutDragOverlayState();

    if (readOnly) {
      return;
    }

    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const dropGroupKey = parseFormLayoutDropId(overId);

    const paletteItemId = parseFormPaletteDragId(activeId);
    if (paletteItemId) {
      const data = active.data.current as FormPaletteDragData | undefined;
      if (data?.action) {
        handlePaletteAction(
          data.action,
          resolvePaletteDropSectionId(dropGroupKey, overId),
        );
      }
      return;
    }

    if (dropGroupKey) {
      const unusedFieldId = parseFormUnusedDragId(activeId);
      if (unusedFieldId) {
        setDraftFields((current) => {
          const next = moveFieldToLayoutGroup(
            withFormVisibility(current),
            unusedFieldId,
            dropGroupKey,
            null,
          );
          const index = next.findIndex((field) => field.id === unusedFieldId);
          setSelectedIndex(index >= 0 ? index : null);
          return next;
        });
        return;
      }

      const canvasField = draftFields.find((field) => field.id === activeId);
      if (
        canvasField &&
        isFormFieldLayoutDraggable(canvasField, mode) &&
        !isSectionFieldType(canvasField.type)
      ) {
        setDraftFields((current) =>
          moveFieldToLayoutGroup(
            withFormVisibility(current),
            activeId,
            dropGroupKey,
            null,
          ),
        );
      }

      return;
    }

    if (activeId === overId) {
      return;
    }

    const activeField = draftFields.find((field) => field.id === activeId);
    const overField = draftFields.find((field) => field.id === overId);

    if (
      !activeField ||
      !overField ||
      !isFormFieldLayoutDraggable(activeField, mode) ||
      !isFormFieldLayoutDraggable(overField, mode)
    ) {
      return;
    }

    const normalizedActive = {
      ...activeField,
      showInForm: activeField.showInForm ?? true,
    };
    const normalizedOver = {
      ...overField,
      showInForm: overField.showInForm ?? true,
    };
    const activeGroup = getFormLayoutGroupKey(normalizedActive);
    const overGroup = getFormLayoutGroupKey(normalizedOver);

    if (activeGroup === overGroup) {
      setDraftFields((current) =>
        reorderFormLayoutGroup(
          withFormVisibility(current),
          activeGroup,
          activeId,
          overId,
        ),
      );
      return;
    }

    setDraftFields((current) =>
      moveFieldToLayoutGroup(
        withFormVisibility(current),
        activeId,
        overGroup,
        overId,
      ),
    );
  }

  const layoutModulesColumn = (
    <Box className="flex w-full shrink-0 flex-col border-b border-slate-200/90 bg-white xl:h-[calc(100vh-18rem)] xl:max-h-[calc(100vh-18rem)] xl:min-h-0 xl:w-[300px] xl:overflow-x-hidden xl:overflow-y-auto xl:border-b-0 xl:border-r">
      <Stack spacing={2} className="p-4 xl:pr-2">
        <FormFieldPalette
          entity={customFieldEntity}
          readOnly={readOnly}
          onPaletteAction={(action) => handlePaletteAction(action)}
        />
        <FormUnusedFieldsPanel
          fields={draftFields}
          readOnly={readOnly}
          onRestoreField={restoreUnusedField}
        />
        <FormEditorNotesPanel mode={mode} />
      </Stack>
    </Box>
  );

  const classicSidebar = (
    <Paper className="w-full shrink-0 rounded-2xl p-4 xl:w-[280px]">
      <Stack spacing={1} className="mb-3">
        <Typography variant="subtitle2">Fields</Typography>
        <Typography variant="caption" color="text.secondary">
          {draftFields.length} field{draftFields.length === 1 ? '' : 's'}
        </Typography>
      </Stack>
      <FormFieldSortableList
        fields={draftFields}
        mode={mode}
        fieldKeysInUse={fieldKeysInUse}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        onReorder={(nextFields, nextSelectedIndex) => {
          setDraftFields(nextFields);
          setSelectedIndex(nextSelectedIndex);
        }}
        onRemove={removeField}
        readOnly={readOnly}
      />
    </Paper>
  );

  return (
    <Stack spacing={layoutMode === 'modules' ? 0 : 3}>
      {layoutMode === 'classic' ? (
        <Typography variant="body2" color="text.secondary">
          {mode === 'platform'
            ? `Editing platform baseline for ${formKey}. Changes apply as defaults for all organizations.`
            : `Platform defaults are read-only (fixed layout). Add organization-only fields below the platform baseline.`}
        </Typography>
      ) : null}

      {view === 'summary' && layoutMode === 'modules' ? (
        <Stack spacing={3}>
          <FormFieldsSummaryTable
            fields={draftFields}
            selectedFieldId={selectedFieldId}
            onSelectField={selectFieldById}
          />
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            sx={{ alignItems: 'flex-start' }}
          >
            <Box className="min-w-0 flex-1">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                Field order
              </Typography>
              <FormFieldSortableList
                fields={draftFields}
                mode={mode}
                fieldKeysInUse={fieldKeysInUse}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
                onReorder={(nextFields, nextSelectedIndex) => {
                  setDraftFields(nextFields);
                  setSelectedIndex(nextSelectedIndex);
                }}
                onRemove={removeField}
                readOnly={readOnly}
              />
            </Box>
            {selectedField ? (
              <Box className="w-full shrink-0 lg:w-[320px]">{propertiesPanel}</Box>
            ) : null}
          </Stack>
        </Stack>
      ) : (
        <Stack
          direction={{ xs: 'column', xl: 'row' }}
          spacing={layoutMode === 'modules' ? 0 : 2}
          sx={{ alignItems: 'stretch' }}
          className={
            layoutMode === 'modules' ? 'min-h-[480px] w-full min-w-0 flex-1' : undefined
          }
        >
          {layoutMode === 'modules' ? (
            <DndContext
              sensors={layoutDragSensors}
              collisionDetection={layoutCanvasCollisionDetection}
              onDragStart={handleLayoutDragStart}
              onDragEnd={handleLayoutDragEnd}
              onDragCancel={clearLayoutDragOverlayState}
            >
              <Box className="flex min-h-[520px] w-full min-w-0 flex-1 flex-col xl:flex-row xl:items-stretch">
                {layoutModulesColumn}
                <FormLayoutBuilder
                  fields={draftFields}
                  formKey={formKey}
                  mode={mode}
                  selectedFieldId={selectedFieldId}
                  onSelectField={selectFieldById}
                  onOpenFieldSettings={(fieldId) =>
                    selectFieldById(fieldId, { openProperties: true })
                  }
                  onFieldsChange={(nextFields) => {
                    setDraftFields(nextFields);
                    if (selectedFieldId) {
                      const index = nextFields.findIndex(
                        (field) => field.id === selectedFieldId,
                      );
                      setSelectedIndex(index >= 0 ? index : null);
                    }
                  }}
                  readOnly={readOnly}
                  compactChrome
                  sharedDragContext
                  fieldKeysInUse={fieldKeysInUse}
                  onDeleteSection={deleteSection}
                  onDeleteSubSection={deleteSection}
                  onAddSubSection={(parentSectionId) => openAddSubSection(parentSectionId)}
                  onSectionTitleChange={updateSectionTitle}
                  onMoveSection={moveSection}
                  onRemoveFieldFromCanvas={removeFieldFromLayoutCanvas}
                />
              </Box>
              <DragOverlay dropAnimation={null}>
                {layoutDragLabel ? (
                  <Box className="rounded-lg border border-primary/30 bg-background px-3 py-2 shadow-md">
                    <Typography variant="caption" className="font-medium">
                      {layoutDragLabel}
                    </Typography>
                  </Box>
                ) : layoutDragActiveField ? (
                  <Box className="max-w-[240px] rounded-lg border border-primary/30 bg-background px-3 py-2 shadow-md">
                    <Typography variant="caption" className="block font-medium">
                      {layoutDragActiveField.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      className="block text-[11px]"
                    >
                      {layoutDragActiveField.type}
                    </Typography>
                  </Box>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <>
              {classicSidebar}
              <Box className="min-w-0 flex-1">
                <FormLayoutBuilder
                  fields={draftFields}
                  mode={mode}
                  selectedFieldId={selectedFieldId}
                  onSelectField={selectFieldById}
                  onFieldsChange={(nextFields) => {
                    setDraftFields(nextFields);
                    if (selectedFieldId) {
                      const index = nextFields.findIndex(
                        (field) => field.id === selectedFieldId,
                      );
                      setSelectedIndex(index >= 0 ? index : null);
                    }
                  }}
                  readOnly={readOnly}
                />
              </Box>
              <Box className="w-full shrink-0 xl:w-[320px]">{propertiesPanel}</Box>
            </>
          )}
        </Stack>
      )}

      {!hideSaveBar && !readOnly ? (
        <Paper className="sticky bottom-0 z-10 rounded-2xl border border-border/60 bg-background/95 p-3 backdrop-blur">
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="body2" color="text.secondary">
              {hasChanges ? 'Unsaved changes' : 'All changes saved'}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={isSubmitting || !hasChanges}
                onClick={() => void handleSave()}
              >
                Save schema
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      <FormEditFieldPropertiesDialog
        open={fieldPropertiesDialogId !== null}
        field={
          fieldPropertiesDialogId
            ? draftFields.find((field) => field.id === fieldPropertiesDialogId) ??
              null
            : null
        }
        mode={mode}
        defaultDisplayOptionsAsChips={customFieldEntity === 'prospect'}
        onClose={() => setFieldPropertiesDialogId(null)}
        onSave={(patch) => {
          if (!fieldPropertiesDialogId) {
            return;
          }

          const index = draftFields.findIndex(
            (field) => field.id === fieldPropertiesDialogId,
          );
          if (index >= 0) {
            updateField(index, patch);
          }
        }}
      />

      {customFieldEntity ? (
        <AddCustomFieldDialog
          open={addCustomFieldOpen}
          entity={customFieldEntity}
          sortOrder={draftFields.length}
          sectionId={customFieldSectionId}
          initialFieldType={paletteFieldType}
          onClose={() => {
            setAddCustomFieldOpen(false);
            setCustomFieldSectionId(undefined);
          }}
          onConfirm={(field) => {
            appendField({
              ...(field as FormFieldDefinition),
              source: mode === 'org' ? 'org' : undefined,
            });
            setAddCustomFieldOpen(false);
            setCustomFieldSectionId(undefined);
          }}
        />
      ) : null}

    </Stack>
  );
}

export { areFormSchemasEqual };

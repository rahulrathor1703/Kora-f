'use client';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import TitleOutlinedIcon from '@mui/icons-material/TitleOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import AddCustomFieldDialog from '@/components/crm/fields/AddCustomFieldDialog';
import AddSectionDialog from '@/components/crm/fields/AddSectionDialog';
import FormFieldPropertiesPanel from '@/components/forms/FormFieldPropertiesPanel';
import FormFieldSortableList from '@/components/forms/FormFieldSortableList';
import FormLayoutBuilder from '@/components/forms/FormLayoutBuilder';
import {
  insertFieldInSchema,
  isSectionFieldType,
} from '@/lib/crm/fields/section-field.utils';
import { resolveFormColSpan } from '@/lib/crm/fields/form-layout.utils';
import {
  DEFAULT_LOCATION_COMPONENTS,
  normalizeLocationInputMode,
} from '@/lib/crm/location/types';
import { isFormFieldDeletable } from '@/lib/forms/field-rules';
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

interface FormSchemaEditorProps {
  formKey: string;
  fields: FormFieldDefinition[];
  mode: FormEditorMode;
  fieldKeysInUse?: string[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: UpdateFormSchemaInput) => Promise<void>;
  hideSaveBar?: boolean;
  readOnly?: boolean;
}

export default function FormSchemaEditor({
  formKey,
  fields,
  mode,
  fieldKeysInUse = [],
  isSubmitting,
  onCancel,
  onSubmit,
  hideSaveBar = false,
  readOnly = false,
}: FormSchemaEditorProps) {
  const [draftFields, setDraftFields] = useState(fields);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    fields.length > 0 ? 0 : null,
  );
  const [addCustomFieldOpen, setAddCustomFieldOpen] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [customFieldSectionId, setCustomFieldSectionId] = useState<string>();

  const selectedFieldId =
    selectedIndex !== null ? draftFields[selectedIndex]?.id ?? null : null;

  const hasChanges = useMemo(
    () => !areFormSchemasEqual(draftFields, fields),
    [draftFields, fields],
  );

  const selectedField =
    selectedIndex !== null ? draftFields[selectedIndex] ?? null : null;

  function updateField(index: number, patch: Partial<FormFieldDefinition>) {
    setDraftFields((current) =>
      current.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, ...patch } : field,
      ),
    );
  }

  function selectFieldById(fieldId: string | null) {
    if (!fieldId) {
      setSelectedIndex(null);
      return;
    }

    const index = draftFields.findIndex((field) => field.id === fieldId);
    setSelectedIndex(index >= 0 ? index : null);
  }

  function removeField(index: number) {
    const field = draftFields[index];
    if (!isFormFieldDeletable(field, mode, fieldKeysInUse, draftFields)) {
      return;
    }

    setDraftFields((current) =>
      current.filter((_, fieldIndex) => fieldIndex !== index),
    );
    setSelectedIndex(null);
  }

  function appendField(newField: FormFieldDefinition) {
    setDraftFields((current) => {
      const next = insertFieldInSchema(current, newField);
      setSelectedIndex(next.findIndex((field) => field.id === newField.id));
      return next;
    });
  }

  async function handleSave() {
    const normalized = draftFields.map((field, index) => ({
      ...field,
      key: field.key.trim() || slugifyLabel(field.label),
      label: field.label.trim(),
      sortOrder: index,
      options: isOptionsFieldType(field.type)
        ? (field.options ?? []).filter(
            (option) => option.value.trim() && option.label.trim(),
          )
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
    }));

    await onSubmit({ fields: normalized });
  }

  return (
    <Stack spacing={3}>
      <Typography variant="body2" color="text.secondary">
        {mode === 'platform'
          ? `Editing platform baseline for ${formKey}`
          : `Extend ${formKey} with custom fields. Platform fields are read-only.`}
      </Typography>

      <Stack
        direction={{ xs: 'column', xl: 'row' }}
        spacing={2}
        sx={{ alignItems: 'stretch' }}
      >
        <Paper className="w-full shrink-0 rounded-2xl p-4 xl:w-[280px]">
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
            className="mb-3"
          >
            <Box>
              <Typography variant="subtitle2">Fields</Typography>
              <Typography variant="caption" color="text.secondary">
                {draftFields.length} field{draftFields.length === 1 ? '' : 's'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              {!readOnly ? (
                <>
                  <Button
                    size="small"
                    startIcon={<TitleOutlinedIcon />}
                    onClick={() => setAddSectionOpen(true)}
                  >
                    Section
                  </Button>
                  <Button
                    size="small"
                    startIcon={<AddOutlinedIcon />}
                    onClick={() => setAddCustomFieldOpen(true)}
                  >
                    Field
                  </Button>
                </>
              ) : null}
            </Stack>
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

        <Box className="w-full shrink-0 xl:w-[320px]">
          <FormFieldPropertiesPanel
            field={selectedField}
            mode={mode}
            fieldKeysInUse={fieldKeysInUse}
            readOnly={readOnly}
            onUpdate={(patch) => {
              if (selectedIndex !== null) {
                updateField(selectedIndex, patch);
              }
            }}
          />
        </Box>
      </Stack>

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

      <AddCustomFieldDialog
        open={addCustomFieldOpen}
        entity="prospect"
        sortOrder={draftFields.length}
        sectionId={customFieldSectionId}
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

      <AddSectionDialog
        open={addSectionOpen}
        entity="prospect"
        sortOrder={draftFields.length}
        onClose={() => setAddSectionOpen(false)}
        onConfirm={(field) => {
          appendField(field as FormFieldDefinition);
          setAddSectionOpen(false);
        }}
      />
    </Stack>
  );
}

export { areFormSchemasEqual };

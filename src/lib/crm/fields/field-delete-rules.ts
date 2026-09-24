import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';

type FieldLike = {
  id: string;
  key: string;
  label: string;
  type?: string;
  sectionId?: string;
  system?: boolean;
  pipelineStage?: boolean;
};

export function isFieldKeyInUse(
  fieldKey: string,
  fieldKeysInUse: string[] | undefined,
): boolean {
  return (fieldKeysInUse ?? []).includes(fieldKey);
}

function sectionDeleteBlockedReason(
  section: FieldLike,
  allFields: FieldLike[],
  fieldKeysInUse: string[] | undefined,
): string | null {
  if (!isSectionFieldType(section.type ?? '')) {
    return null;
  }

  const children = allFields.filter((field) => field.sectionId === section.id);

  for (const child of children) {
    if (isFieldKeyInUse(child.key, fieldKeysInUse)) {
      return 'Existing records use fields in this section';
    }
  }

  return null;
}

export function isCompanyFieldDeletable(
  field: FieldLike,
  fieldKeysInUse: string[] | undefined,
  allFields?: FieldLike[],
): boolean {
  if (field.system) {
    return false;
  }

  if (isSectionFieldType(field.type ?? '')) {
    return (
      sectionDeleteBlockedReason(field, allFields ?? [], fieldKeysInUse) === null
    );
  }

  return !isFieldKeyInUse(field.key, fieldKeysInUse);
}

export function isProspectFieldDeletable(
  field: FieldLike,
  fieldKeysInUse: string[] | undefined,
  allFields?: FieldLike[],
): boolean {
  if (field.system || field.pipelineStage) {
    return false;
  }

  if (isSectionFieldType(field.type ?? '')) {
    return (
      sectionDeleteBlockedReason(field, allFields ?? [], fieldKeysInUse) === null
    );
  }

  return !isFieldKeyInUse(field.key, fieldKeysInUse);
}

export function fieldDeleteBlockedReason(
  field: FieldLike,
  fieldKeysInUse: string[] | undefined,
  allFields?: FieldLike[],
): string | null {
  if (field.system) {
    return 'Required system field';
  }

  if (field.pipelineStage) {
    return 'Pipeline stage field';
  }

  if (isSectionFieldType(field.type ?? '')) {
    return sectionDeleteBlockedReason(field, allFields ?? [], fieldKeysInUse);
  }

  if (isFieldKeyInUse(field.key, fieldKeysInUse)) {
    return 'Existing records use this field';
  }

  return null;
}

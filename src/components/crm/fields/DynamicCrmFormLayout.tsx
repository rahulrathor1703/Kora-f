'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import {
  getFormFieldColSpanClassName,
  getFormFieldGridClassName,
  packFormLayoutFieldRows,
  type FormLayoutField,
} from '@/lib/crm/fields/form-layout.utils';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import CrmFormLayoutMainSection from '@/components/crm/fields/form-layout/CrmFormLayoutMainSection';
import CrmFormLayoutSubSection from '@/components/crm/fields/form-layout/CrmFormLayoutSubSection';
import {
  buildFormLayoutSectionTree,
  type LayoutSectionNode,
} from '@/lib/forms/form-layout-section-blocks.utils';

interface CrmFormSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

/** @deprecated Use CrmFormLayoutMainSection — kept for existing imports. */
export function CrmFormSection({ id, title, children }: CrmFormSectionProps) {
  return (
    <CrmFormLayoutMainSection sectionId={id} title={title} readOnly>
      {children}
    </CrmFormLayoutMainSection>
  );
}

interface CrmFormFieldGridProps<T extends FormLayoutField> {
  fields: T[];
  renderField: (field: T) => React.ReactNode;
  getFieldClassName?: (field: T) => string;
}

function CrmFormFieldGrid<T extends FormLayoutField>({
  fields,
  renderField,
  getFieldClassName,
}: CrmFormFieldGridProps<T>) {
  if (fields.length === 0) {
    return null;
  }

  const rows = packFormLayoutFieldRows(fields);

  return (
    <Stack spacing={2}>
      {rows.map((row) => (
        <Box
          key={row.map((field) => field.id).join('-')}
          className={getFormFieldGridClassName()}
        >
          {row.map((field) => (
            <Box
              key={field.id}
              className={`min-w-0 ${getFieldClassName?.(field) ?? getFormFieldColSpanClassName(field)}`}
            >
              {renderField(field)}
            </Box>
          ))}
        </Box>
      ))}
    </Stack>
  );
}

interface DynamicCrmFormLayoutProps<T extends FormLayoutField> {
  fields: T[];
  renderField: (field: T) => React.ReactNode;
  getFieldClassName?: (field: T) => string;
}

type SectionBlockInputField = FormLayoutField & {
  sortOrder: number;
  showInForm?: boolean;
  sectionTier?: 'main' | 'sub';
};

function isLiveLayoutField(field: SectionBlockInputField): boolean {
  if (isSectionFieldType(field.type)) {
    return false;
  }

  return field.showInForm !== false;
}

function renderLiveSubSection<T extends SectionBlockInputField>(
  node: LayoutSectionNode,
  renderField: (field: T) => React.ReactNode,
  getFieldClassName?: (field: T) => string,
): React.ReactNode | null {
  const subFields = node.fields.filter(isLiveLayoutField) as T[];
  const nestedChildren = node.children
    .map((child) => renderLiveSubSection(child, renderField, getFieldClassName))
    .filter(Boolean);

  if (subFields.length === 0 && nestedChildren.length === 0) {
    return null;
  }

  return (
    <CrmFormLayoutSubSection
      key={node.id}
      sectionId={node.id}
      title={node.title}
      readOnly
      nestedSubSections={nestedChildren.length > 0 ? nestedChildren : undefined}
    >
      <CrmFormFieldGrid
        fields={subFields}
        renderField={renderField}
        getFieldClassName={getFieldClassName}
      />
    </CrmFormLayoutSubSection>
  );
}

export default function DynamicCrmFormLayout<T extends SectionBlockInputField>({
  fields,
  renderField,
  getFieldClassName,
}: DynamicCrmFormLayoutProps<T>) {
  const tree = buildFormLayoutSectionTree(fields);

  if (tree.sections.length === 0 && tree.rootFields.length === 0) {
    return null;
  }

  const rootFields = tree.rootFields.filter(isLiveLayoutField) as T[];
  const hasSectionCards = tree.sections.length > 0;

  return (
    <Stack spacing={hasSectionCards ? 5 : 2.5}>
      {rootFields.length > 0 ? (
        <CrmFormFieldGrid
          fields={rootFields}
          renderField={renderField}
          getFieldClassName={getFieldClassName}
        />
      ) : null}
      {tree.sections.map((node) => {
        if (node.tier !== 'main') {
          return renderLiveSubSection(node, renderField, getFieldClassName);
        }

        const directFields = node.fields.filter(isLiveLayoutField) as T[];
        const subSections = node.children
          .map((child) => renderLiveSubSection(child, renderField, getFieldClassName))
          .filter(Boolean);

        if (directFields.length === 0 && subSections.length === 0) {
          return null;
        }

        return (
          <CrmFormLayoutMainSection
            key={node.id}
            sectionId={node.id}
            title={node.title}
            readOnly
          >
            <Stack spacing={3}>
              {directFields.length > 0 ? (
                <CrmFormFieldGrid
                  fields={directFields}
                  renderField={renderField}
                  getFieldClassName={getFieldClassName}
                />
              ) : null}
              {subSections}
            </Stack>
          </CrmFormLayoutMainSection>
        );
      })}
    </Stack>
  );
}

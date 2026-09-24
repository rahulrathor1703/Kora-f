'use client';

import CrmFormLayoutMainSection from '@/components/crm/fields/form-layout/CrmFormLayoutMainSection';
import CrmFormLayoutSubSection from '@/components/crm/fields/form-layout/CrmFormLayoutSubSection';
import type { LayoutSectionNode } from '@/lib/forms/form-layout-section-blocks.utils';
import type { LayoutSectionMoveDirection } from '@/lib/crm/fields/section-field.utils';
import type { ReactNode } from 'react';

export interface FormLayoutSectionMoveProps {
  sectionReorderable: boolean;
  canMoveSectionUp: boolean;
  canMoveSectionDown: boolean;
}

export interface FormLayoutSubSectionSlot {
  id: string;
  title: string;
  content: ReactNode;
  showDelete?: boolean;
  emphasizeDelete?: boolean;
  isTitleEditable?: boolean;
  nestedSubSections?: ReactNode;
}

interface FormLayoutSectionCardProps {
  mainTitle: string;
  mainSectionId: string;
  subSections: FormLayoutSubSectionSlot[];
  directContent?: ReactNode;
  readOnly?: boolean;
  showDelete?: boolean;
  onDeleteSection?: (sectionId: string) => void;
  onDeleteSubSection?: (subSectionId: string) => void;
  onAddSubSection?: (parentSectionId: string) => void;
  onSectionTitleChange?: (sectionId: string, title: string) => void;
}

interface FormLayoutSectionTreeCardProps {
  node: LayoutSectionNode;
  readOnly?: boolean;
  showDelete?: boolean;
  renderFieldGrid: (sectionId: string, fields: LayoutSectionNode['fields']) => ReactNode;
  isSectionDeletable?: (sectionField: LayoutSectionNode['sectionField']) => boolean;
  onDeleteSection?: (sectionId: string) => void;
  onAddSubSection?: (parentSectionId: string) => void;
  onSectionTitleChange?: (sectionId: string, title: string) => void;
  getSectionMoveProps?: (
    sectionField: LayoutSectionNode['sectionField'],
  ) => FormLayoutSectionMoveProps;
  onMoveSection?: (sectionId: string, direction: LayoutSectionMoveDirection) => void;
}

function renderSubSectionTree({
  node,
  readOnly,
  renderFieldGrid,
  isSectionDeletable,
  onDeleteSection,
  onAddSubSection,
  onSectionTitleChange,
  getSectionMoveProps,
  onMoveSection,
}: FormLayoutSectionTreeCardProps): ReactNode {
  const deletable = isSectionDeletable?.(node.sectionField) ?? false;
  const moveProps = getSectionMoveProps?.(node.sectionField) ?? {
    sectionReorderable: false,
    canMoveSectionUp: false,
    canMoveSectionDown: false,
  };
  const isEmpty =
    node.fields.length === 0 && node.children.every((child) => child.fields.length === 0);
  const nested = node.children.map((child) =>
    renderSubSectionTree({
      node: child,
      readOnly,
      renderFieldGrid,
      isSectionDeletable,
      onDeleteSection,
      onAddSubSection,
      onSectionTitleChange,
      getSectionMoveProps,
      onMoveSection,
    }),
  );

  return (
    <CrmFormLayoutSubSection
      key={node.id}
      sectionId={node.id}
      title={node.title}
      readOnly={readOnly}
      showDelete={deletable}
      emphasizeDelete={deletable && isEmpty}
      isTitleEditable={!readOnly && deletable}
      sectionReorderable={moveProps.sectionReorderable}
      canMoveSectionUp={moveProps.canMoveSectionUp}
      canMoveSectionDown={moveProps.canMoveSectionDown}
      onMoveSection={onMoveSection}
      onTitleChange={onSectionTitleChange}
      onDelete={onDeleteSection}
      onAddSubSection={readOnly ? undefined : onAddSubSection}
      nestedSubSections={nested.length > 0 ? nested : undefined}
    >
      {renderFieldGrid(node.id, node.fields)}
    </CrmFormLayoutSubSection>
  );
}

export function FormLayoutSectionTreeCard(props: FormLayoutSectionTreeCardProps) {
  const {
    node,
    readOnly,
    showDelete,
    renderFieldGrid,
    onDeleteSection,
    onSectionTitleChange,
    getSectionMoveProps,
    onMoveSection,
  } = props;

  if (node.tier !== 'main') {
    return renderSubSectionTree(props);
  }

  const moveProps = getSectionMoveProps?.(node.sectionField) ?? {
    sectionReorderable: false,
    canMoveSectionUp: false,
    canMoveSectionDown: false,
  };

  return (
    <CrmFormLayoutMainSection
      sectionId={node.id}
      title={node.title}
      readOnly={readOnly}
      showDelete={showDelete}
      isTitleEditable={!readOnly}
      sectionReorderable={moveProps.sectionReorderable}
      canMoveSectionUp={moveProps.canMoveSectionUp}
      canMoveSectionDown={moveProps.canMoveSectionDown}
      onMoveSection={onMoveSection}
      onTitleChange={onSectionTitleChange}
      onDelete={onDeleteSection}
    >
      {node.fields.length > 0 ? renderFieldGrid(node.id, node.fields) : null}
      {node.children.map((child) => renderSubSectionTree({ ...props, node: child }))}
    </CrmFormLayoutMainSection>
  );
}

/** @deprecated Prefer FormLayoutSectionTreeCard for nested layouts. */
export default function FormLayoutSectionCard({
  mainTitle,
  mainSectionId,
  subSections,
  directContent,
  readOnly = false,
  showDelete = false,
  onDeleteSection,
  onDeleteSubSection,
  onAddSubSection,
  onSectionTitleChange,
}: FormLayoutSectionCardProps) {
  return (
    <CrmFormLayoutMainSection
      sectionId={mainSectionId}
      title={mainTitle}
      readOnly={readOnly}
      showDelete={showDelete}
      isTitleEditable={!readOnly}
      onTitleChange={onSectionTitleChange}
      onDelete={onDeleteSection}
    >
      {directContent ? directContent : null}
      {subSections.map((sub) => (
        <CrmFormLayoutSubSection
          key={sub.id}
          sectionId={sub.id}
          title={sub.title}
          readOnly={readOnly}
          showDelete={sub.showDelete}
          emphasizeDelete={sub.emphasizeDelete}
          isTitleEditable={sub.isTitleEditable}
          onTitleChange={onSectionTitleChange}
          onDelete={onDeleteSubSection}
          onAddSubSection={readOnly ? undefined : onAddSubSection}
          nestedSubSections={sub.nestedSubSections}
        >
          {sub.content}
        </CrmFormLayoutSubSection>
      ))}
    </CrmFormLayoutMainSection>
  );
}

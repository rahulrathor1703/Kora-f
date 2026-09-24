import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import type { FormLayoutField } from '@/lib/crm/fields/form-layout.utils';

/** Legacy id for root drop targets; not shown as a section title. */
export const FORM_LAYOUT_ROOT_MAIN_ID = 'root';

export type SectionLayoutField = FormLayoutField & {
  sortOrder: number;
  showInForm?: boolean;
  sectionTier?: 'main' | 'sub';
};

export type LayoutSubSection = {
  id: string;
  title: string;
  fields: SectionLayoutField[];
  sectionField?: SectionLayoutField;
};

export type RootFieldsLayoutBlock = {
  kind: 'rootFields';
  fields: SectionLayoutField[];
};

export type MainLayoutBlock = {
  kind: 'main';
  mainId: string;
  mainTitle: string;
  mainField: SectionLayoutField;
  directFields: SectionLayoutField[];
  subSections: LayoutSubSection[];
};

export type StandaloneSectionLayoutBlock = {
  kind: 'standaloneSection';
  sectionId: string;
  title: string;
  sectionField: SectionLayoutField;
  fields: SectionLayoutField[];
};

export type FormLayoutBlock =
  | RootFieldsLayoutBlock
  | MainLayoutBlock
  | StandaloneSectionLayoutBlock;

/** Recursive section node for editor and live CRM layouts. */
export type LayoutSectionNode = {
  id: string;
  title: string;
  tier: 'main' | 'sub';
  sectionField: SectionLayoutField;
  fields: SectionLayoutField[];
  children: LayoutSectionNode[];
};

export type FormLayoutSectionTree = {
  rootFields: SectionLayoutField[];
  sections: LayoutSectionNode[];
};

/** @deprecated Use FormLayoutBlock kinds; kept for callers migrating off mainId checks. */
export type LayoutMainBlock = MainLayoutBlock;

function resolveSectionTier(field: SectionLayoutField): 'main' | 'sub' {
  if (field.type !== 'section') {
    return 'main';
  }

  return field.sectionTier === 'sub' ? 'sub' : 'main';
}

function isLayoutField(field: SectionLayoutField): boolean {
  if (isSectionFieldType(field.type)) {
    return true;
  }

  return field.showInForm !== false;
}

function findSubSection(
  block: MainLayoutBlock,
  sectionId: string,
): LayoutSubSection | undefined {
  return block.subSections.find((sub) => sub.id === sectionId);
}

function findSectionNodeById(
  nodes: LayoutSectionNode[],
  sectionId: string,
): LayoutSectionNode | undefined {
  for (const node of nodes) {
    if (node.id === sectionId) {
      return node;
    }

    const nested = findSectionNodeById(node.children, sectionId);
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function appendFieldToSectionTree(
  sections: LayoutSectionNode[],
  field: SectionLayoutField,
): boolean {
  const sectionId = field.sectionId;
  if (!sectionId) {
    return false;
  }

  const node = findSectionNodeById(sections, sectionId);
  if (!node) {
    return false;
  }

  node.fields.push(field);
  return true;
}

function appendFieldToBlocks(
  blocks: FormLayoutBlock[],
  field: SectionLayoutField,
): boolean {
  const sectionId = field.sectionId;
  if (!sectionId) {
    return false;
  }

  for (const block of blocks) {
    if (block.kind === 'standaloneSection') {
      if (block.sectionId === sectionId) {
        block.fields.push(field);
        return true;
      }
      continue;
    }

    if (block.kind === 'rootFields') {
      continue;
    }

    const directSub = findSubSection(block, sectionId);
    if (directSub) {
      directSub.fields.push(field);
      return true;
    }

    if (block.mainId === sectionId) {
      block.directFields.push(field);
      return true;
    }
  }

  return false;
}

export function isCollapsedDefaultSub(
  block: MainLayoutBlock,
  sub: LayoutSubSection,
): boolean {
  return sub.id === block.mainId && !sub.sectionField;
}

/** Sub sections that should render as nested blocks (excludes auto-default mirror). */
export function visibleSubSections(block: MainLayoutBlock): LayoutSubSection[] {
  return block.subSections.filter((sub) => !isCollapsedDefaultSub(block, sub));
}

export function layoutBlocksForRender(
  fields: SectionLayoutField[],
): FormLayoutBlock[] {
  return buildFormLayoutSectionBlocks(fields);
}

export function buildFormLayoutSectionBlocks(
  fields: SectionLayoutField[],
): FormLayoutBlock[] {
  const sorted = [...fields]
    .filter(isLayoutField)
    .sort((left, right) => left.sortOrder - right.sortOrder);

  const blocks: FormLayoutBlock[] = [];
  let currentMain: MainLayoutBlock | null = null;
  const rootFields: SectionLayoutField[] = [];

  function flushRootFields() {
    if (rootFields.length === 0) {
      return;
    }

    blocks.push({ kind: 'rootFields', fields: [...rootFields] });
    rootFields.length = 0;
  }

  for (const field of sorted) {
    if (isSectionFieldType(field.type)) {
      const tier = resolveSectionTier(field);

      if (tier === 'sub') {
        if (!currentMain) {
          flushRootFields();
          blocks.push({
            kind: 'standaloneSection',
            sectionId: field.id,
            title: field.label,
            sectionField: field,
            fields: [],
          });
          continue;
        }

        currentMain.subSections.push({
          id: field.id,
          title: field.label,
          sectionField: field,
          fields: [],
        });
        continue;
      }

      flushRootFields();
      currentMain = {
        kind: 'main',
        mainId: field.id,
        mainTitle: field.label,
        mainField: field,
        directFields: [],
        subSections: [],
      };
      blocks.push(currentMain);
      continue;
    }

    if (currentMain) {
      if (field.sectionId) {
        if (!appendFieldToBlocks(blocks, field)) {
          currentMain.directFields.push(field);
        }
      } else {
        rootFields.push(field);
      }
      continue;
    }

    if (field.sectionId) {
      if (!appendFieldToBlocks(blocks, field)) {
        rootFields.push(field);
      }
    } else {
      rootFields.push(field);
    }
  }

  flushRootFields();

  return blocks;
}

function resolveLegacySubParentMainId(
  sorted: SectionLayoutField[],
  subIndex: number,
): string | null {
  for (let index = subIndex - 1; index >= 0; index -= 1) {
    const field = sorted[index];
    if (isSectionFieldType(field.type) && resolveSectionTier(field) === 'main') {
      return field.id;
    }
  }

  return null;
}

export function buildFormLayoutSectionTree(
  fields: SectionLayoutField[],
): FormLayoutSectionTree {
  const sorted = [...fields]
    .filter(isLayoutField)
    .sort((left, right) => left.sortOrder - right.sortOrder);

  const rootFields: SectionLayoutField[] = [];
  const sections: LayoutSectionNode[] = [];
  const nodeById = new Map<string, LayoutSectionNode>();
  let legacyMainId: string | null = null;

  for (const field of sorted) {
    if (!isSectionFieldType(field.type)) {
      continue;
    }

    const tier = resolveSectionTier(field);
    const node: LayoutSectionNode = {
      id: field.id,
      title: field.label,
      tier,
      sectionField: field,
      fields: [],
      children: [],
    };
    nodeById.set(field.id, node);

    if (tier === 'main') {
      legacyMainId = field.id;
      sections.push(node);
      continue;
    }

    const parentId =
      field.sectionId ??
      (legacyMainId && !field.sectionId
        ? legacyMainId
        : resolveLegacySubParentMainId(sorted, sorted.indexOf(field)));

    if (parentId && nodeById.has(parentId)) {
      nodeById.get(parentId)?.children.push(node);
      continue;
    }

    if (parentId) {
      const parentNode = findSectionNodeById(sections, parentId);
      if (parentNode) {
        parentNode.children.push(node);
        continue;
      }
    }

    sections.push(node);
  }

  for (const field of sorted) {
    if (isSectionFieldType(field.type)) {
      continue;
    }

    if (field.sectionId) {
      if (!appendFieldToSectionTree(sections, field)) {
        rootFields.push(field);
      }
      continue;
    }

    rootFields.push(field);
  }

  return { rootFields, sections };
}

/** Drop target section id (main or sub) for palette actions. */
export function resolveParentSectionIdForLayoutDrop(
  fields: SectionLayoutField[],
  dropGroupKey: string | undefined,
): string | null {
  if (!dropGroupKey || dropGroupKey === FORM_LAYOUT_ROOT_MAIN_ID) {
    return null;
  }

  const tree = buildFormLayoutSectionTree(fields);
  if (findSectionNodeById(tree.sections, dropGroupKey)) {
    return dropGroupKey;
  }

  return resolveMainSectionIdForLayoutDrop(fields, dropGroupKey);
}

export function resolveMainSectionIdForLayoutDrop(
  fields: SectionLayoutField[],
  dropGroupKey: string | undefined,
): string | null {
  if (!dropGroupKey || dropGroupKey === FORM_LAYOUT_ROOT_MAIN_ID) {
    return null;
  }

  const blocks = buildFormLayoutSectionBlocks(fields);

  for (const block of blocks) {
    if (block.kind === 'standaloneSection') {
      continue;
    }

    if (block.kind === 'rootFields') {
      continue;
    }

    if (block.mainId === dropGroupKey) {
      return block.mainId;
    }

    const nestedSub = block.subSections.some((sub) => sub.id === dropGroupKey);
    if (nestedSub) {
      return block.mainId;
    }
  }

  return null;
}

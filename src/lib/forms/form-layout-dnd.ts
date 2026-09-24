import type { FormPaletteAction } from '@/lib/forms/form-palette.config';

export const FORM_LAYOUT_DROP_PREFIX = 'form-layout-drop:';
export const FORM_PALETTE_DRAG_PREFIX = 'form-palette:';
export const FORM_UNUSED_DRAG_PREFIX = 'form-unused:';
/** Drop target below all main sections (new main section / append fields). */
export const FORM_LAYOUT_CANVAS_APPEND_GROUP = 'canvas-append';

export function isCanvasRootDropGroup(groupKey: string): boolean {
  return groupKey === 'root' || groupKey === FORM_LAYOUT_CANVAS_APPEND_GROUP;
}

export function formLayoutDropId(groupKey: string): string {
  return `${FORM_LAYOUT_DROP_PREFIX}${groupKey}`;
}

export function parseFormLayoutDropId(id: string): string | null {
  if (!id.startsWith(FORM_LAYOUT_DROP_PREFIX)) {
    return null;
  }

  const groupKey = id.slice(FORM_LAYOUT_DROP_PREFIX.length);
  return groupKey.length > 0 ? groupKey : null;
}

export function formPaletteDragId(paletteItemId: string): string {
  return `${FORM_PALETTE_DRAG_PREFIX}${paletteItemId}`;
}

export function parseFormPaletteDragId(id: string): string | null {
  if (!id.startsWith(FORM_PALETTE_DRAG_PREFIX)) {
    return null;
  }

  return id.slice(FORM_PALETTE_DRAG_PREFIX.length) || null;
}

export function formUnusedDragId(fieldId: string): string {
  return `${FORM_UNUSED_DRAG_PREFIX}${fieldId}`;
}

export function parseFormUnusedDragId(id: string): string | null {
  if (!id.startsWith(FORM_UNUSED_DRAG_PREFIX)) {
    return null;
  }

  return id.slice(FORM_UNUSED_DRAG_PREFIX.length) || null;
}

export interface FormPaletteDragData {
  kind: 'palette';
  action: FormPaletteAction;
  label: string;
}

export interface FormUnusedDragData {
  kind: 'unused';
  fieldId: string;
  label: string;
}

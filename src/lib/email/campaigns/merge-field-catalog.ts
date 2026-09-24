export interface MergeFieldVariant {
  token: string;
  label: string;
  listCount: number;
}

export interface MergeFieldItem {
  label: string;
  variants: MergeFieldVariant[];
}

export interface MergeFieldGroup {
  id: string;
  label: string;
  items: MergeFieldItem[];
}

export interface MergeFieldCatalog {
  groups: MergeFieldGroup[];
}

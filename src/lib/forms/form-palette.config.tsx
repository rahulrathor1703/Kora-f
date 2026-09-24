import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined';
import DragIndicatorOutlinedIcon from '@mui/icons-material/DragIndicatorOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import RadioButtonCheckedOutlinedIcon from '@mui/icons-material/RadioButtonCheckedOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SubjectOutlinedIcon from '@mui/icons-material/SubjectOutlined';
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import ViewHeadlineOutlinedIcon from '@mui/icons-material/ViewHeadlineOutlined';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import type { ReactNode } from 'react';
import type { CompanyFieldType } from '@/lib/crm/companies/types';
import type { ProspectFieldType } from '@/lib/crm/prospects/types';
import type { CustomFieldEntity } from '@/lib/forms/org-registry-forms';
import type { FormFieldType } from '@/lib/forms/types';

const COMPANY_PALETTE_FIELD_TYPES: CompanyFieldType[] = [
  'text',
  'email',
  'phone',
  'textarea',
  'select',
  'number',
  'date',
  'location',
];

const PROSPECT_PALETTE_FIELD_TYPES: ProspectFieldType[] = [
  'text',
  'email',
  'phone',
  'textarea',
  'select',
  'multiselect',
  'number',
  'date',
  'location',
];

function paletteFieldTypeSupported(
  entity: CustomFieldEntity,
  fieldType: string,
): boolean {
  const allowed =
    entity === 'company'
      ? COMPANY_PALETTE_FIELD_TYPES
      : PROSPECT_PALETTE_FIELD_TYPES;
  return allowed.includes(fieldType as CompanyFieldType & ProspectFieldType);
}

export type FormPaletteAction =
  | { kind: 'main-section' }
  | { kind: 'sub-section' }
  | { kind: 'field'; fieldType: string };

export interface FormPaletteItemConfig {
  id: string;
  label: string;
  icon: ReactNode;
  action: FormPaletteAction;
  entities?: CustomFieldEntity[];
}

const ALL_ENTITIES: CustomFieldEntity[] = ['prospect', 'company'];

export const FORM_PALETTE_ITEMS: FormPaletteItemConfig[] = [
  {
    id: 'input',
    label: 'Input Field',
    icon: <ViewHeadlineOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'text' },
    entities: ALL_ENTITIES,
  },
  {
    id: 'number',
    label: 'Number',
    icon: <NumbersOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'number' },
    entities: ALL_ENTITIES,
  },
  {
    id: 'currency',
    label: 'Currency',
    icon: <CurrencyExchangeOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'number' },
    entities: ALL_ENTITIES,
  },
  {
    id: 'select',
    label: 'Select Option',
    icon: <ViewAgendaOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'select' },
    entities: ALL_ENTITIES,
  },
  {
    id: 'search-select',
    label: 'Search Select',
    icon: <SearchOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'select' },
    entities: ALL_ENTITIES,
  },
  {
    id: 'multiselect',
    label: 'Multi Select',
    icon: <ViewWeekOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'multiselect' },
    entities: ALL_ENTITIES,
  },
  {
    id: 'date',
    label: 'Date Picker',
    icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'date' },
    entities: ALL_ENTITIES,
  },
  {
    id: 'checkbox',
    label: 'Checkbox',
    icon: <CheckBoxOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'checkbox' },
    entities: ALL_ENTITIES,
  },
  {
    id: 'switch',
    label: 'Switch',
    icon: <ToggleOnOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'checkbox' },
    entities: ALL_ENTITIES,
  },
  {
    id: 'radio',
    label: 'Radio Button',
    icon: <RadioButtonCheckedOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'select' },
    entities: ALL_ENTITIES,
  },
  {
    id: 'radio-text',
    label: 'Radio Text',
    icon: <SubjectOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'textarea' },
    entities: ALL_ENTITIES,
  },
  {
    id: 'toggle',
    label: 'Toggle',
    icon: <ToggleOffOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'checkbox' },
    entities: ALL_ENTITIES,
  },
  {
    id: 'phone',
    label: 'Phone',
    icon: <PhoneOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'phone' },
    entities: ALL_ENTITIES,
  },
  {
    id: 'attachment',
    label: 'Attachment',
    icon: <AttachFileOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'textarea' },
    entities: ALL_ENTITIES,
  },
  {
    id: 'address',
    label: 'Address',
    icon: <LocationOnOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'location' },
    entities: ALL_ENTITIES,
  },
  {
    id: 'contact-list',
    label: 'Contact List',
    icon: <ContactsOutlinedIcon sx={{ fontSize: 14 }} />,
    action: { kind: 'field', fieldType: 'text' },
    entities: ALL_ENTITIES,
  },
];

const FIELD_TYPE_LABELS: Partial<Record<FormFieldType, string>> = {
  text: 'Input Field',
  email: 'Input Field',
  phone: 'Phone',
  textarea: 'Radio Text',
  select: 'Select Option',
  multiselect: 'Multi Select',
  number: 'Number',
  date: 'Date Picker',
  location: 'Address',
  checkbox: 'Checkbox',
};

const FIELD_TYPE_ICONS: Partial<Record<FormFieldType, ReactNode>> = {
  text: <ViewHeadlineOutlinedIcon sx={{ fontSize: 14 }} />,
  email: <ViewHeadlineOutlinedIcon sx={{ fontSize: 14 }} />,
  phone: <PhoneOutlinedIcon sx={{ fontSize: 14 }} />,
  textarea: <SubjectOutlinedIcon sx={{ fontSize: 16 }} />,
  select: <ViewAgendaOutlinedIcon sx={{ fontSize: 14 }} />,
  multiselect: <ViewWeekOutlinedIcon sx={{ fontSize: 14 }} />,
  number: <NumbersOutlinedIcon sx={{ fontSize: 14 }} />,
  date: <CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />,
  location: <LocationOnOutlinedIcon sx={{ fontSize: 14 }} />,
  checkbox: <CheckBoxOutlinedIcon sx={{ fontSize: 14 }} />,
};

export function getFieldPalettePresentation(field: {
  type: FormFieldType;
  label: string;
}): { label: string; icon: ReactNode } {
  return {
    label: FIELD_TYPE_LABELS[field.type] ?? field.label,
    icon: FIELD_TYPE_ICONS[field.type] ?? (
      <DragIndicatorOutlinedIcon sx={{ fontSize: 14 }} />
    ),
  };
}

export type FormPaletteItem = FormPaletteItemConfig & { supported: boolean };

export function paletteItemsForEntity(
  entity: CustomFieldEntity | null,
): FormPaletteItem[] {
  if (!entity) {
    return [];
  }

  return FORM_PALETTE_ITEMS.filter(
    (item) => item.entities?.includes(entity) ?? true,
  ).map((item) => ({
    ...item,
    supported:
      item.action.kind !== 'field' ||
      paletteFieldTypeSupported(entity, item.action.fieldType),
  }));
}

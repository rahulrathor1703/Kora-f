export type FormFieldValidationType =
  | 'number'
  | 'alphanumeric'
  | 'uppercase-alphanumeric'
  | 'alphabet'
  | 'email'
  | 'url';

export const FORM_FIELD_VALIDATION_TYPE_OPTIONS: {
  value: FormFieldValidationType;
  label: string;
}[] = [
  { value: 'number', label: 'Number' },
  { value: 'alphanumeric', label: 'Alphanumeric' },
  { value: 'uppercase-alphanumeric', label: 'Uppercase & numbers only' },
  { value: 'alphabet', label: 'Alphabet only' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
];

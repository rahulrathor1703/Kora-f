import type { FormFieldValidationType } from '@/lib/forms/form-field-validation.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^(https?:\/\/)[^\s/$.?#][^\s]*$/i;

const VALIDATION_TYPE_PATTERNS: Record<
  Exclude<FormFieldValidationType, 'email' | 'url'>,
  RegExp
> = {
  number: /^\d+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  'uppercase-alphanumeric': /^[A-Z0-9]+$/,
  alphabet: /^[a-zA-Z]+$/,
};

export interface FieldStringValidationRules {
  label: string;
  minLength?: number;
  maxLength?: number;
  validationType?: FormFieldValidationType;
}

export function fieldSupportsFormStringValidation(type: string): boolean {
  return type === 'text' || type === 'textarea' || type === 'phone';
}

export function getFieldStringValidationError(
  rules: FieldStringValidationRules,
  rawValue: string,
): string | null {
  const value = rawValue.trim();
  const { label, minLength, maxLength, validationType } = rules;

  if (minLength !== undefined && value.length < minLength) {
    return `${label} must be at least ${minLength} characters`;
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return `${label} must be at most ${maxLength} characters`;
  }

  if (!validationType || value.length === 0) {
    return null;
  }

  switch (validationType) {
    case 'email':
      return EMAIL_PATTERN.test(value) ? null : `${label} must be a valid email`;
    case 'url':
      return URL_PATTERN.test(value) ? null : `${label} must be a valid URL`;
    default:
      return VALIDATION_TYPE_PATTERNS[validationType].test(value)
        ? null
        : `${label} does not match the required format`;
  }
}

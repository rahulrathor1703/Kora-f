'use client';

import { useMemo, useState } from 'react';
import { useNotify } from '@/hooks/useNotify';
import {
  draftValuesToCreateInput,
  getCompanyLiveCreateFormFields,
  validateCompanyFormValues,
  type CompanyDraftValues,
} from '@/lib/crm/companies/field-config';
import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import {
  BROKER_NAME_FIELD_KEY,
  type CompanyConfigOption,
  type CompanyFieldDefinition,
  type CreateCompanyInput,
} from '@/lib/crm/companies/types';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import { emptyLocationValue } from '@/lib/crm/location/types';

export function createEmptyCompanyDraft(
  formFields: CompanyFieldDefinition[],
  initialBrokerName = '',
): CompanyDraftValues {
  const values: Record<string, FieldStoredValue> = {};
  const brokerName = initialBrokerName;

  for (const field of formFields) {
    if (isSectionFieldType(field.type)) {
      continue;
    }

    if (field.key === BROKER_NAME_FIELD_KEY) {
      continue;
    }

    values[field.key] = field.type === 'location' ? emptyLocationValue() : '';
  }

  return { brokerName, values };
}

interface UseNewCompanyFormOptions {
  fields: CompanyFieldDefinition[];
  categories: CompanyConfigOption[];
  locations: CompanyConfigOption[];
  initialBrokerName?: string;
  onSubmit: (input: CreateCompanyInput) => Promise<void>;
}

export function useNewCompanyForm({
  fields,
  categories,
  locations,
  initialBrokerName = '',
  onSubmit,
}: UseNewCompanyFormOptions) {
  const { notifyError } = useNotify();
  const formFields = useMemo(
    () => getCompanyLiveCreateFormFields(fields),
    [fields],
  );
  const [draft, setDraft] = useState<CompanyDraftValues>(() =>
    createEmptyCompanyDraft(formFields, initialBrokerName),
  );

  function resetForm() {
    setDraft(createEmptyCompanyDraft(formFields));
  }

  async function submitForm() {
    const validationError = validateCompanyFormValues(fields, draft, {
      mode: 'liveCreate',
      categories,
      locations,
    });
    if (validationError) {
      notifyError(validationError);
      return;
    }

    await onSubmit(draftValuesToCreateInput(draft, formFields));
    resetForm();
  }

  function updateValue(key: string, value: FieldStoredValue) {
    if (key === BROKER_NAME_FIELD_KEY) {
      setDraft((current) => ({
        ...current,
        brokerName: String(value),
      }));
      return;
    }

    setDraft((current) => ({
      ...current,
      values: {
        ...current.values,
        [key]: value,
      },
    }));
  }

  return {
    formFields,
    draft,
    updateValue,
    submitForm,
    resetForm,
  };
}

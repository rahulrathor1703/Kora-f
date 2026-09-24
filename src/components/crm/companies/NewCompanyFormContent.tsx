'use client';

import CompanyFieldRenderer from '@/components/crm/companies/CompanyFieldRenderer';
import DynamicCrmFormLayout from '@/components/crm/fields/DynamicCrmFormLayout';
import type { CompanyContactProspectOptions } from '@/lib/crm/companies/company-contact-prospect.types';
import type { CompanyConfigOption, CompanyFieldDefinition } from '@/lib/crm/companies/types';
import { BROKER_NAME_FIELD_KEY } from '@/lib/crm/companies/types';
import type { CompanyDraftValues } from '@/lib/crm/companies/field-config';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import { emptyLocationValue } from '@/lib/crm/location/types';

interface NewCompanyFormContentProps {
  formFields: CompanyFieldDefinition[];
  draft: CompanyDraftValues;
  isSubmitting: boolean;
  categories: CompanyConfigOption[];
  locations: CompanyConfigOption[];
  onUpdateValue: (key: string, value: FieldStoredValue) => void;
  contactProspect?: CompanyContactProspectOptions;
}

export default function NewCompanyFormContent({
  formFields,
  draft,
  isSubmitting,
  categories,
  locations,
  onUpdateValue,
  contactProspect,
}: NewCompanyFormContentProps) {
  if (formFields.length === 0) {
    return null;
  }

  return (
    <DynamicCrmFormLayout
      fields={formFields}
      renderField={(field) => (
        <CompanyFieldRenderer
          field={field}
          value={
            field.key === BROKER_NAME_FIELD_KEY
              ? draft.brokerName
              : (draft.values[field.key] ??
                (field.type === 'location' ? emptyLocationValue() : ''))
          }
          onChange={(value) => onUpdateValue(field.key, value)}
          disabled={isSubmitting}
          categories={categories}
          locations={locations}
          uppercaseLabel
          canAccessProspectList={contactProspect?.canAccessProspectList}
          canCreateContactProspect={contactProspect?.canCreateContactProspect}
          isCreatingContactProspectStub={
            contactProspect?.isCreatingContactProspectStub
          }
          onCreateContactProspectStub={
            contactProspect?.onCreateContactProspectStub
          }
        />
      )}
    />
  );
}

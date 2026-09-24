'use client';

import NewCompanyFormContent from '@/components/crm/companies/NewCompanyFormContent';
import { useNewCompanyForm } from '@/components/crm/companies/useNewCompanyForm';
import CrmCreateDialogShell from '@/components/crm/fields/CrmCreateDialogShell';
import type { CompanyContactProspectOptions } from '@/lib/crm/companies/company-contact-prospect.types';
import type {
  CompanyConfigOption,
  CompanyFieldDefinition,
  CreateCompanyInput,
} from '@/lib/crm/companies/types';

interface NewCompanyDialogProps {
  open: boolean;
  fields: CompanyFieldDefinition[];
  categories: CompanyConfigOption[];
  locations: CompanyConfigOption[];
  isSubmitting: boolean;
  contactProspect?: CompanyContactProspectOptions;
  onClose: () => void;
  onSubmit: (input: CreateCompanyInput) => Promise<void>;
}

interface NewCompanyDialogFormProps {
  fields: CompanyFieldDefinition[];
  categories: CompanyConfigOption[];
  locations: CompanyConfigOption[];
  isSubmitting: boolean;
  contactProspect?: CompanyContactProspectOptions;
  onClose: () => void;
  onSubmit: (input: CreateCompanyInput) => Promise<void>;
}

function NewCompanyDialogForm({
  fields,
  categories,
  locations,
  isSubmitting,
  contactProspect,
  onClose,
  onSubmit,
}: NewCompanyDialogFormProps) {
  const { formFields, draft, updateValue, submitForm, resetForm } = useNewCompanyForm({
    fields,
    categories,
    locations,
    onSubmit,
  });

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <CrmCreateDialogShell
      open
      title="New Company"
      description="Add a new broker / company record"
      isSubmitting={isSubmitting}
      submitLabel="Create Company"
      onClose={handleClose}
      onSubmit={() => void submitForm()}
    >
      <NewCompanyFormContent
        formFields={formFields}
        draft={draft}
        isSubmitting={isSubmitting}
        categories={categories}
        locations={locations}
        onUpdateValue={updateValue}
        contactProspect={contactProspect}
      />
    </CrmCreateDialogShell>
  );
}

export default function NewCompanyDialog({
  open,
  fields,
  categories,
  locations,
  isSubmitting,
  contactProspect,
  onClose,
  onSubmit,
}: NewCompanyDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <NewCompanyDialogForm
      key="new-company-dialog"
      fields={fields}
      categories={categories}
      locations={locations}
      isSubmitting={isSubmitting}
      contactProspect={contactProspect}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

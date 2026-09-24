'use client';

import { useCallback, useRef, useState } from 'react';
import CompanySearchAutocomplete from '@/components/crm/companies/CompanySearchAutocomplete';
import NewCompanyDrawer from '@/components/crm/companies/NewCompanyDrawer';
import DynamicFormRenderer, {
  type DynamicFormRenderFieldContext,
  type DynamicFormSubmitPayload,
} from '@/components/forms/DynamicFormRenderer';
import { useHasAnyPermission, useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { getApiErrorMessage } from '@/lib/api';
import type { CompanyContactProspectOptions } from '@/lib/crm/companies/company-contact-prospect.types';
import type {
  Company,
  CompanyConfigOption,
  CompanyFieldDefinition,
  CreateCompanyInput,
} from '@/lib/crm/companies/types';
import {
  buildEmptyProspectCompanySectionValues,
  buildProspectPrefillFromCompany,
} from '@/lib/crm/prospects/prospect-company-prefill.util';
import {
  filterProspectFieldsForLeadType,
  isProspectCompanyLeadTypeSelected,
} from '@/lib/crm/prospects/prospect-lead-type-fields.util';
import type { CreateProspectInput, ProspectFieldDefinition } from '@/lib/crm/prospects/types';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import type { FormFieldDefinition } from '@/lib/forms/types';

interface NewProspectFormProps {
  fields: ProspectFieldDefinition[];
  isSubmitting: boolean;
  companyFields: CompanyFieldDefinition[];
  companyCategories: CompanyConfigOption[];
  companyLocations: CompanyConfigOption[];
  isCreatingCompany: boolean;
  onCreateCompany: (input: CreateCompanyInput) => Promise<Company>;
  companyContactProspect?: CompanyContactProspectOptions;
  onCancel: () => void;
  onSubmit: (input: CreateProspectInput) => Promise<void>;
}

export default function NewProspectForm({
  fields,
  isSubmitting,
  companyFields,
  companyCategories,
  companyLocations,
  isCreatingCompany,
  onCreateCompany,
  companyContactProspect,
  onCancel,
  onSubmit,
}: NewProspectFormProps) {
  const { notifyError, notifySuccess } = useNotify();
  const canAccessCompanyList = useHasAnyPermission([
    'companies:read',
    'prospects:create',
  ]);
  const canCreateCompany = useHasPermission('companies:create');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [pendingBrokerName, setPendingBrokerName] = useState('');
  const applyValuesPatchRef = useRef<
    ((patch: Record<string, FieldStoredValue>) => void) | null
  >(null);

  async function handleSubmit(payload: DynamicFormSubmitPayload) {
    await onSubmit({ values: payload.values });
  }

  const selectCompany = useCallback(
    (company: Company | null) => {
      setSelectedCompany(company);
      const applyPatch = applyValuesPatchRef.current;
      if (!applyPatch) {
        return;
      }

      if (company) {
        applyPatch(buildProspectPrefillFromCompany(company, fields));
        return;
      }

      applyPatch(buildEmptyProspectCompanySectionValues(fields));
    },
    [fields],
  );

  async function handleCreateCompanySubmit(input: CreateCompanyInput) {
    try {
      const created = await onCreateCompany(input);
      notifySuccess('Company created');
      selectCompany(created);
      setCreateDrawerOpen(false);
      setPendingBrokerName('');
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to create company'));
      throw error;
    }
  }

  const filterVisibleFields = useCallback(
    (
      formFields: FormFieldDefinition[],
      values: Record<string, FieldStoredValue>,
    ) =>
      filterProspectFieldsForLeadType(
        formFields as ProspectFieldDefinition[],
        values,
        fields,
      ),
    [fields],
  );

  const validateExtra = useCallback(
    (values: Record<string, FieldStoredValue>) => {
      if (!isProspectCompanyLeadTypeSelected(values)) {
        return null;
      }

      if (!selectedCompany) {
        return 'Select a company from CRM';
      }

      return null;
    },
    [selectedCompany],
  );

  const renderField = useCallback(
    (ctx: DynamicFormRenderFieldContext) => {
      applyValuesPatchRef.current = ctx.applyValuesPatch;

      if (
        ctx.field.key !== 'company' ||
        !isProspectCompanyLeadTypeSelected(ctx.values)
      ) {
        return ctx.defaultNode;
      }

      return (
        <CompanySearchAutocomplete
          key={selectedCompany?.id ?? 'company-unselected'}
          label={ctx.field.label}
          required={ctx.field.required}
          value={selectedCompany}
          canAccessCompanyList={canAccessCompanyList}
          canCreateCompany={canCreateCompany}
          disabled={ctx.disabled}
          helperText={ctx.field.helpText}
          onChange={selectCompany}
          suppressDropdown={createDrawerOpen}
          onRequestCreate={(brokerName) => {
            setPendingBrokerName(brokerName);
            setCreateDrawerOpen(true);
          }}
        />
      );
    },
    [
      canAccessCompanyList,
      canCreateCompany,
      createDrawerOpen,
      selectCompany,
      selectedCompany,
    ],
  );

  return (
    <>
      <DynamicFormRenderer
        fields={fields}
        isSubmitting={isSubmitting}
        submitLabel="Create Prospect"
        filterVisibleFields={filterVisibleFields}
        applyProspectLeadTypeValidation
        renderField={renderField}
        validateExtra={validateExtra}
        onCancel={onCancel}
        onSubmit={handleSubmit}
      />

      {canCreateCompany && companyFields.length > 0 ? (
        <NewCompanyDrawer
          open={createDrawerOpen}
          fields={companyFields}
          categories={companyCategories}
          locations={companyLocations}
          isSubmitting={isCreatingCompany}
          initialBrokerName={pendingBrokerName}
          contactProspect={companyContactProspect}
          onClose={() => {
            setCreateDrawerOpen(false);
            setPendingBrokerName('');
          }}
          onSubmit={handleCreateCompanySubmit}
        />
      ) : null}
    </>
  );
}

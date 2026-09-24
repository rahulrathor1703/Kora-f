'use client';

import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getCompanyConfigCategoryMeta } from '@/lib/crm/settings-navigation';
import CompanyContactProspectField from '@/components/crm/companies/CompanyContactProspectField';
import LocationFieldGroup from '@/components/crm/location/LocationFieldGroup';
import { COMPANY_CONTACT_FIELD_KEY } from '@/lib/crm/companies/company-contact-field.util';
import type { ProspectSearchResult } from '@/lib/crm/prospects/types';
import type {
  CompanyConfigOption,
  CompanyFieldDefinition,
} from '@/lib/crm/companies/types';
import {
  getFieldLocationValue,
  getFieldStringValue,
} from '@/lib/crm/companies/field-config';
import type { FieldStoredValue } from '@/lib/crm/location/types';
import { normalizeLocationComponents, normalizeLocationInputMode } from '@/lib/crm/location/types';

interface CompanyFieldRendererProps {
  field: CompanyFieldDefinition;
  value: FieldStoredValue;
  onChange: (value: FieldStoredValue) => void;
  disabled?: boolean;
  categories?: CompanyConfigOption[];
  locations?: CompanyConfigOption[];
  uppercaseLabel?: boolean;
  canAccessProspectList?: boolean;
  canCreateContactProspect?: boolean;
  isCreatingContactProspectStub?: boolean;
  onCreateContactProspectStub?: (
    displayName: string,
  ) => Promise<ProspectSearchResult>;
}

function FieldLabel({
  field,
  uppercaseLabel,
}: {
  field: CompanyFieldDefinition;
  uppercaseLabel?: boolean;
}) {
  const label = field.required ? `${field.label} *` : field.label;

  if (uppercaseLabel) {
    return (
      <Typography
        variant="caption"
        color="text.secondary"
        className="mb-1 block font-semibold uppercase tracking-wide"
      >
        {label}
      </Typography>
    );
  }

  return null;
}

export default function CompanyFieldRenderer({
  field,
  value,
  onChange,
  disabled = false,
  categories = [],
  locations = [],
  uppercaseLabel = false,
  canAccessProspectList = false,
  canCreateContactProspect = false,
  isCreatingContactProspectStub = false,
  onCreateContactProspectStub,
}: CompanyFieldRendererProps) {
  const toOrgPath = useOrgPath();
  const label = field.required ? `${field.label} *` : field.label;
  const stringValue = getFieldStringValue({ [field.key]: value }, field.key);

  if (field.key === COMPANY_CONTACT_FIELD_KEY && canAccessProspectList) {
    return (
      <CompanyContactProspectField
        label={field.label}
        required={field.required}
        contactName={stringValue}
        disabled={disabled}
        uppercaseLabel={uppercaseLabel}
        canAccessProspectList={canAccessProspectList}
        canCreateProspect={canCreateContactProspect}
        isCreatingStub={isCreatingContactProspectStub}
        onContactNameChange={(name) => onChange(name)}
        onCreateProspectStub={onCreateContactProspectStub}
      />
    );
  }

  if (field.type === 'location') {
    const locationValue = getFieldLocationValue({ [field.key]: value }, field.key);

    return (
      <LocationFieldGroup
        label={field.label}
        required={field.required}
        components={normalizeLocationComponents(field.locationComponents)}
        inputMode={normalizeLocationInputMode(field.locationInputMode)}
        value={locationValue}
        onChange={onChange}
        disabled={disabled}
        uppercaseLabel={uppercaseLabel}
      />
    );
  }

  if (field.type === 'company-category') {
    const activeOptions = categories.filter((option) => option.isActive);

    return (
      <div>
        {uppercaseLabel ? <FieldLabel field={field} uppercaseLabel /> : null}
        {activeOptions.length === 0 ? (
          <Alert severity="warning" className="rounded-2xl">
            No categories configured.{' '}
            <Link
              component={NextLink}
              href={toOrgPath(getCompanyConfigCategoryMeta('category').href)}
              variant="caption"
            >
              Manage in CRM Configuration
            </Link>
          </Alert>
        ) : (
          <TextField
            select
            label={uppercaseLabel ? undefined : label}
            value={stringValue}
            onChange={(event) => onChange(event.target.value)}
            fullWidth
            disabled={disabled}
          >
            <MenuItem value="">None</MenuItem>
            {activeOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      </div>
    );
  }

  if (field.type === 'company-location') {
    const activeOptions = locations.filter((option) => option.isActive);

    return (
      <div>
        {uppercaseLabel ? <FieldLabel field={field} uppercaseLabel /> : null}
        {activeOptions.length === 0 ? (
          <Alert severity="warning" className="rounded-2xl">
            No locations configured.{' '}
            <Link
              component={NextLink}
              href={toOrgPath(getCompanyConfigCategoryMeta('location').href)}
              variant="caption"
            >
              Manage in CRM Configuration
            </Link>
          </Alert>
        ) : (
          <TextField
            select
            label={uppercaseLabel ? undefined : label}
            value={stringValue}
            onChange={(event) => onChange(event.target.value)}
            fullWidth
            disabled={disabled}
          >
            <MenuItem value="">None</MenuItem>
            {activeOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div>
        {uppercaseLabel ? <FieldLabel field={field} uppercaseLabel /> : null}
        <TextField
          select
          label={uppercaseLabel ? undefined : label}
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          fullWidth
          disabled={disabled}
        >
          <MenuItem value="">
            <em>Select…</em>
          </MenuItem>
          {field.options?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div>
        {uppercaseLabel ? <FieldLabel field={field} uppercaseLabel /> : null}
        <TextField
          label={uppercaseLabel ? undefined : label}
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          fullWidth
          multiline
          minRows={3}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div>
      {uppercaseLabel ? <FieldLabel field={field} uppercaseLabel /> : null}
      <TextField
        label={uppercaseLabel ? undefined : label}
        value={stringValue}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
        disabled={disabled}
      />
    </div>
  );
}

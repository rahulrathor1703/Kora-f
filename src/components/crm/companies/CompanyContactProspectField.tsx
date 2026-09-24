'use client';

import Typography from '@mui/material/Typography';
import { useCallback, useMemo, useState } from 'react';
import ProspectSearchAutocomplete from '@/components/crm/prospects/ProspectSearchAutocomplete';
import { useNotify } from '@/hooks/useNotify';
import { getApiErrorMessage } from '@/lib/api';
import type { ProspectSearchResult } from '@/lib/crm/prospects/types';

interface CompanyContactProspectFieldProps {
  label: string;
  required?: boolean;
  contactName: string;
  disabled?: boolean;
  uppercaseLabel?: boolean;
  canAccessProspectList: boolean;
  canCreateProspect: boolean;
  isCreatingStub?: boolean;
  onContactNameChange: (name: string) => void;
  onCreateProspectStub?: (displayName: string) => Promise<ProspectSearchResult>;
}

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  const text = required ? `${label} *` : label;

  return (
    <Typography
      variant="caption"
      color="text.secondary"
      className="mb-1 block font-semibold uppercase tracking-wide"
    >
      {text}
    </Typography>
  );
}

function resolveContactProspectValue(
  contactName: string,
  selectedProspect: ProspectSearchResult | null,
): ProspectSearchResult | null {
  const trimmed = contactName.trim();
  if (!trimmed) {
    return null;
  }

  if (selectedProspect?.fullName.trim() === trimmed) {
    return selectedProspect;
  }

  return { id: `contact-label:${trimmed}`, fullName: trimmed, email: '' };
}

export default function CompanyContactProspectField({
  label,
  required = false,
  contactName,
  disabled = false,
  uppercaseLabel = false,
  canAccessProspectList,
  canCreateProspect,
  isCreatingStub = false,
  onContactNameChange,
  onCreateProspectStub,
}: CompanyContactProspectFieldProps) {
  const { notifyError, notifySuccess } = useNotify();
  const [selectedProspect, setSelectedProspect] =
    useState<ProspectSearchResult | null>(null);

  const autocompleteValue = useMemo(
    () => resolveContactProspectValue(contactName, selectedProspect),
    [contactName, selectedProspect],
  );

  const handleChange = useCallback(
    (prospect: ProspectSearchResult | null) => {
      setSelectedProspect(prospect);
      onContactNameChange(prospect?.fullName.trim() ?? '');
    },
    [onContactNameChange],
  );

  async function handleRequestCreate(displayName: string) {
    if (!onCreateProspectStub) {
      return;
    }

    try {
      const created = await onCreateProspectStub(displayName);
      setSelectedProspect(created);
      onContactNameChange(created.fullName);
      notifySuccess('Contact added to CRM');
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to add contact'));
    }
  }

  return (
    <div>
      {uppercaseLabel ? <FieldLabel label={label} required={required} /> : null}
      <ProspectSearchAutocomplete
        key={autocompleteValue?.id ?? 'contact-unselected'}
        label={label}
        required={required}
        value={autocompleteValue}
        canAccessProspectList={canAccessProspectList}
        canCreateProspect={canCreateProspect}
        disabled={disabled || isCreatingStub}
        uppercaseLabel={uppercaseLabel}
        onChange={handleChange}
        onRequestCreate={(name) => void handleRequestCreate(name)}
      />
    </div>
  );
}

'use client';

import FormsRegistryList from '@/components/forms/FormsRegistryList';
import { useFormRegistry } from '@/hooks/useForms';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOrgPath } from '@/hooks/useOrgPath';

export default function OrgFormsSettingsContent() {
  const toOrgPath = useOrgPath();
  const canUpdate = useHasPermission('forms:update');
  const { data, isLoading, error } = useFormRegistry();

  return (
    <FormsRegistryList
      forms={data?.forms ?? []}
      mode="org"
      isLoading={isLoading}
      errorMessage={error ? 'Unable to load forms.' : null}
      buildEditHref={(formKey) =>
        toOrgPath(`/settings/forms/${encodeURIComponent(formKey)}`)
      }
      heroTitle="Manage Forms"
      heroDescription="View and extend workspace form and table field schemas. Users with update permission can add custom fields."
      heroOverline="Workspace"
      editActionLabel={canUpdate ? 'Extend' : 'View'}
      filterExtendableOnly
      canEdit={canUpdate}
    />
  );
}

'use client';

import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NewCompanyFormContent from '@/components/crm/companies/NewCompanyFormContent';
import { useNewCompanyForm } from '@/components/crm/companies/useNewCompanyForm';
import type { CompanyContactProspectOptions } from '@/lib/crm/companies/company-contact-prospect.types';
import type {
  CompanyConfigOption,
  CompanyFieldDefinition,
  CreateCompanyInput,
} from '@/lib/crm/companies/types';

interface NewCompanyDrawerProps {
  open: boolean;
  fields: CompanyFieldDefinition[];
  categories: CompanyConfigOption[];
  locations: CompanyConfigOption[];
  isSubmitting: boolean;
  initialBrokerName?: string;
  contactProspect?: CompanyContactProspectOptions;
  onClose: () => void;
  onSubmit: (input: CreateCompanyInput) => Promise<void>;
}

interface NewCompanyDrawerFormProps {
  fields: CompanyFieldDefinition[];
  categories: CompanyConfigOption[];
  locations: CompanyConfigOption[];
  isSubmitting: boolean;
  initialBrokerName: string;
  contactProspect?: CompanyContactProspectOptions;
  onClose: () => void;
  onSubmit: (input: CreateCompanyInput) => Promise<void>;
}

function NewCompanyDrawerForm({
  fields,
  categories,
  locations,
  isSubmitting,
  initialBrokerName,
  contactProspect,
  onClose,
  onSubmit,
}: NewCompanyDrawerFormProps) {
  const { formFields, draft, updateValue, submitForm, resetForm } = useNewCompanyForm({
    fields,
    categories,
    locations,
    initialBrokerName,
    onSubmit,
  });

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <Box className="flex h-full w-full max-w-md flex-col p-6">
      <Stack
        direction="row"
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}
      >
        <Box>
          <Typography variant="h6" className="font-bold">
            New Company
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            Add a new broker / company record
          </Typography>
        </Box>
        <IconButton aria-label="Close new company form" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Stack>

      <Box className="flex-1 overflow-y-auto">
        <NewCompanyFormContent
          formFields={formFields}
          draft={draft}
          isSubmitting={isSubmitting}
          categories={categories}
          locations={locations}
          onUpdateValue={updateValue}
          contactProspect={contactProspect}
        />
      </Box>

      <Stack direction="row" spacing={1.5} className="mt-6 justify-end">
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={isSubmitting}
          className="rounded-xl normal-case"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void submitForm()}
          disabled={isSubmitting}
          className="rounded-xl normal-case shadow-none"
        >
          {isSubmitting ? 'Creating…' : 'Create Company'}
        </Button>
      </Stack>
    </Box>
  );
}

export default function NewCompanyDrawer({
  open,
  fields,
  categories,
  locations,
  isSubmitting,
  initialBrokerName = '',
  contactProspect,
  onClose,
  onSubmit,
}: NewCompanyDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      {open ? (
        <NewCompanyDrawerForm
          key={initialBrokerName}
          fields={fields}
          categories={categories}
          locations={locations}
          isSubmitting={isSubmitting}
          initialBrokerName={initialBrokerName}
          contactProspect={contactProspect}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Drawer>
  );
}

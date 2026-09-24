'use client';

import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Link from 'next/link';
import EmailHubShell from '@/components/email/EmailHubShell';
import EmailTemplateListContent from '@/components/email/settings/EmailTemplateListContent';
import { useOrgPath } from '@/hooks/useOrgPath';
import { emailTemplateMeta } from '@/lib/email/navigation';

export default function EmailTemplatesPage() {
  const toOrgPath = useOrgPath();

  return (
    <EmailHubShell
      actions={
        <Button
          component={Link}
          href={toOrgPath(`${emailTemplateMeta.href}/new`)}
          variant="contained"
          startIcon={<AddIcon />}
          className="shrink-0 rounded-2xl px-5 py-2.5 shadow-primary-soft"
        >
          Create template
        </Button>
      }
    >
      <EmailTemplateListContent />
    </EmailHubShell>
  );
}

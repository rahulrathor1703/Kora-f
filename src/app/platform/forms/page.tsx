import { redirect } from 'next/navigation';
import { CRM_PROSPECT_CREATE_FORM_KEY } from '@/lib/forms/crm-form-keys';

export default function PlatformFormsPage() {
  redirect(
    `/platform/forms/${encodeURIComponent(CRM_PROSPECT_CREATE_FORM_KEY)}`,
  );
}

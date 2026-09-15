import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export default async function WorkspaceRedirectPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'superadmin') {
    redirect('/platform/tenants');
  }

  if (session.organization?.slug) {
    redirect(`/${session.organization.slug}`);
  }

  redirect('/login?error=no-organization');
}

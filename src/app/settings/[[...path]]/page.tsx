import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { resolveWorkspaceOrgSlug } from '@/lib/auth/resolve-workspace-org-slug';
import { getSession } from '@/lib/auth/session';
import { orgPath } from '@/lib/org-path';

interface SettingsRedirectPageProps {
  params: Promise<{ path?: string[] }>;
}

export default async function SettingsRedirectPage({
  params,
}: SettingsRedirectPageProps) {
  const { path = [] } = await params;
  const session = await getSession();
  const cookieStore = await cookies();
  const orgSlug = resolveWorkspaceOrgSlug(session, cookieStore);

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'superadmin' && !orgSlug) {
    redirect('/platform/tenants');
  }

  if (!orgSlug) {
    redirect('/login?error=no-organization');
  }

  const suffix = path.length > 0 ? `/${path.join('/')}` : '';
  redirect(orgPath(orgSlug, `/settings${suffix}`));
}

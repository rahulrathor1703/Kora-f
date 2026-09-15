import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ImpersonationProvider } from '@/contexts/impersonation';
import { OrgSlugProvider } from '@/contexts/org-slug';
import { getSession } from '@/lib/auth/session';
import { orgPath, stripOrgPrefix } from '@/lib/org-path';
import {
  parseViewOrgCookie,
  VIEW_ORG_COOKIE_NAME,
} from '@/lib/platform/impersonation-cookie';

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

function renderOrgWorkspace(orgSlug: string, children: React.ReactNode) {
  return (
    <OrgSlugProvider orgSlug={orgSlug}>
      <ImpersonationProvider organization={null}>
        <DashboardLayout>{children}</DashboardLayout>
      </ImpersonationProvider>
    </OrgSlugProvider>
  );
}

function redirectToWorkspaceOrgSlug(orgSlug: string, pathname: string) {
  const relativePath = stripOrgPrefix(pathname, orgSlug);
  redirect(orgPath(orgSlug, relativePath === '/' ? '' : relativePath));
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { orgSlug } = await params;
  const session = await getSession();
  const pathname = (await headers()).get('x-pathname') ?? '';

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'admin') {
    if (!session.organization) {
      redirect('/login?error=no-organization');
    }

    if (session.organization.status === 'suspended') {
      redirect('/login?error=organization-suspended');
    }

    if (session.organization.slug !== orgSlug) {
      redirectToWorkspaceOrgSlug(session.organization.slug, pathname);
    }

    return renderOrgWorkspace(orgSlug, children);
  }

  if (session.role === 'superadmin') {
    const cookieStore = await cookies();
    const viewOrg = parseViewOrgCookie(
      cookieStore.get(VIEW_ORG_COOKIE_NAME)?.value,
    );

    if (!viewOrg) {
      redirect('/platform/tenants');
    }

    if (viewOrg.slug !== orgSlug) {
      redirectToWorkspaceOrgSlug(viewOrg.slug, pathname);
    }

    if (viewOrg.status === 'suspended') {
      redirect('/platform/tenants?error=organization-suspended');
    }

    return (
      <OrgSlugProvider orgSlug={orgSlug}>
        <ImpersonationProvider organization={viewOrg}>
          <DashboardLayout>{children}</DashboardLayout>
        </ImpersonationProvider>
      </OrgSlugProvider>
    );
  }

  redirect('/login?error=unauthorized');
}

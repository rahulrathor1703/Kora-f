import type { AuthUser } from '@/lib/api/auth';
import { orgPath } from '@/lib/org-path';
import { resolveWorkspaceHomePath } from '@/lib/workspace-navigation';
import { isPlatformOwner } from '@/lib/api/types/auth.types';

export function redirectAfterAuth(user: AuthUser, router: { push: (href: string) => void }): void {
  if (user.role === 'superadmin') {
    router.push('/platform/tenants');
    return;
  }

  if (user.role === 'admin') {
    const slug = user.organization?.slug;
    if (!slug) {
      router.push('/workspace');
      return;
    }

    router.push(
      orgPath(
        slug,
        resolveWorkspaceHomePath(
          user.organization?.enabledModules,
          user.permissions,
          isPlatformOwner(user),
        ),
      ),
    );
    return;
  }

  throw new Error('Your workspace is not available yet. Contact platform support.');
}

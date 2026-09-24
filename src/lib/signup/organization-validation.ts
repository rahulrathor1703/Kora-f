import { slugifyOrganizationName } from '@/lib/api/auth';
import { RESERVED_ORGANIZATION_SLUGS } from '@/lib/org-path';

export function getOrganizationNameError(name: string): string | null {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.length < 2) {
    return 'Organization name must be at least 2 characters';
  }

  if (trimmed.length > 120) {
    return 'Organization name is too long';
  }

  return null;
}

export function getOrganizationSlugError(slug: string): string | null {
  if (slug.length === 0) {
    return null;
  }

  if (slug.length < 3) {
    return 'Organization name must produce a workspace URL of at least 3 characters';
  }

  if (RESERVED_ORGANIZATION_SLUGS.has(slug)) {
    return 'This organization name is reserved — choose a different name';
  }

  return null;
}

export function getOrganizationValidationError(
  name: string,
  slug?: string,
): string | null {
  const nameError = getOrganizationNameError(name);

  if (nameError) {
    return nameError;
  }

  const resolvedSlug = slug ?? slugifyOrganizationName(name);
  return getOrganizationSlugError(resolvedSlug);
}

export function isOrganizationSignupValid(name: string): boolean {
  const trimmed = name.trim();

  if (trimmed.length < 2 || trimmed.length > 120) {
    return false;
  }

  const slug = slugifyOrganizationName(name);

  return slug.length >= 3 && !RESERVED_ORGANIZATION_SLUGS.has(slug);
}

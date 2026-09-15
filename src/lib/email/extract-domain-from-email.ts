const DOMAIN_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

export function extractDomainFromEmail(email: string): string | null {
  const trimmed = email.trim();
  const atIndex = trimmed.lastIndexOf('@');

  if (atIndex <= 0 || atIndex >= trimmed.length - 1) {
    return null;
  }

  const domain = trimmed.slice(atIndex + 1).toLowerCase().replace(/\.$/, '');

  if (!DOMAIN_PATTERN.test(domain)) {
    return null;
  }

  return domain;
}

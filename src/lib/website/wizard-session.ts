export const WEBSITE_WIZARD_SESSION_KEY = 'markos.websiteWizardDraft';

export interface WebsiteWizardDraft {
  mode: 'add' | 'edit';
  activeStep: number;
  selectedOAuthAppId: string | null;
  selectedConnectionId: string | null;
  propertyId: string | null;
  name: string;
  domain: string;
  sitemapUrl: string;
  maxPages: number;
  isActive: boolean;
  ga4Enabled: boolean;
  ga4PropertyId: string;
  ga4PropertyName: string;
  gscEnabled: boolean;
  gscSiteUrl: string;
  psiEnabled: boolean;
}

export function readWebsiteWizardDraft(): WebsiteWizardDraft | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = sessionStorage.getItem(WEBSITE_WIZARD_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as WebsiteWizardDraft;
  } catch {
    return null;
  }
}

export function writeWebsiteWizardDraft(draft: WebsiteWizardDraft): void {
  sessionStorage.setItem(WEBSITE_WIZARD_SESSION_KEY, JSON.stringify(draft));
}

export function clearWebsiteWizardDraft(): void {
  sessionStorage.removeItem(WEBSITE_WIZARD_SESSION_KEY);
}

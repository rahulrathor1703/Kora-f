import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export interface GoogleConnection {
  id: string;
  oauthAppId: string;
  email: string;
  connectedAt: string;
  connectedByUserId: string | null;
}

export interface OrganizationGoogleConnection {
  id: string;
  oauthAppId: string;
  email: string;
  connectedAt: string;
  connectedByUserId: string | null;
  propertyCount: number;
}

export interface GoogleOAuthApp {
  id: string;
  label: string;
  clientId: string;
  redirectBaseUrl: string;
  redirectUri: string;
  connectionCount: number;
  createdAt: string;
}

export interface CreateGoogleOAuthAppInput {
  label?: string;
  clientId: string;
  clientSecret: string;
  redirectBaseUrl: string;
}

export interface UpdateGoogleOAuthAppInput {
  label?: string;
  clientId?: string;
  clientSecret?: string;
  redirectBaseUrl?: string;
}

export interface GoogleConnectionAvailability {
  google: boolean;
}

export interface Ga4PropertyCandidate {
  propertyId: string;
  propertyName: string;
  accountName: string;
}

export interface GscSiteCandidate {
  siteUrl: string;
  permissionLevel: string;
}

export interface GooglePropertySuggestions {
  ga4: {
    suggested: Ga4PropertyCandidate | null;
    candidates: Ga4PropertyCandidate[];
  };
  gsc: {
    suggested: GscSiteCandidate | null;
    candidates: GscSiteCandidate[];
  };
}

export interface PsiSettings {
  hasApiKey: boolean;
  hasGoogleConnection: boolean;
}

export interface GoogleOAuthAppSettings {
  configured: boolean;
  clientId: string | null;
  redirectUri: string;
  redirectBaseUrl: string | null;
  defaultRedirectBaseUrl: string;
}

export interface UpdateGoogleOAuthAppSettingsInput {
  clientId: string;
  clientSecret: string;
  redirectBaseUrl: string;
}

export interface UpdatePsiSettingsInput {
  apiKey: string;
}

export interface TestPsiSettingsInput {
  apiKey?: string;
  testUrl?: string;
}

export const websiteService = {
  listOrganizationGoogleConnections(oauthAppId?: string) {
    const params = oauthAppId
      ? `?oauthAppId=${encodeURIComponent(oauthAppId)}`
      : '';
    return apiClient.get<OrganizationGoogleConnection[]>(
      `${ENDPOINTS.website.googleConnection.list}${params}`,
    );
  },

  deleteOrganizationGoogleConnection(connectionId: string) {
    return apiClient.delete<void>(
      ENDPOINTS.website.googleConnection.byId(connectionId),
    );
  },

  assignPropertyGoogleConnection(propertyId: string, connectionId: string) {
    return apiClient.put<GoogleConnection>(
      ENDPOINTS.website.googleConnection.property(propertyId),
      { connectionId },
    );
  },

  getPropertyGoogleConnection(propertyId: string) {
    return apiClient.get<GoogleConnection | null>(
      ENDPOINTS.website.googleConnection.property(propertyId),
    );
  },

  getGoogleConnectionAvailability() {
    return apiClient.get<GoogleConnectionAvailability>(
      ENDPOINTS.website.googleConnection.availability,
    );
  },

  disconnectPropertyGoogle(propertyId: string) {
    return apiClient.delete<void>(
      ENDPOINTS.website.googleConnection.property(propertyId),
    );
  },

  getGooglePropertySuggestions(
    url: string,
    options: { propertyId?: string; connectionId?: string },
  ) {
    const params = new URLSearchParams({ url });
    if (options.propertyId) {
      params.set('propertyId', options.propertyId);
    }
    if (options.connectionId) {
      params.set('connectionId', options.connectionId);
    }

    return apiClient.get<GooglePropertySuggestions>(
      `${ENDPOINTS.website.googleProperties.suggestions}?${params.toString()}`,
    );
  },

  getPsiSettings() {
    return apiClient.get<PsiSettings>(ENDPOINTS.website.settings.psi);
  },

  updatePsiSettings(input: UpdatePsiSettingsInput) {
    return apiClient.put<PsiSettings>(ENDPOINTS.website.settings.psi, input);
  },

  testPsiSettings(input: TestPsiSettingsInput = {}) {
    return apiClient.post<{ ok: true }>(
      ENDPOINTS.website.settings.psiTest,
      input,
    );
  },

  getGoogleOAuthAppSettings() {
    return apiClient.get<GoogleOAuthAppSettings>(
      ENDPOINTS.website.settings.googleOAuth,
    );
  },

  updateGoogleOAuthAppSettings(input: UpdateGoogleOAuthAppSettingsInput) {
    return apiClient.put<GoogleOAuthAppSettings>(
      ENDPOINTS.website.settings.googleOAuth,
      input,
    );
  },

  listGoogleOAuthApps() {
    return apiClient.get<GoogleOAuthApp[]>(ENDPOINTS.website.googleOAuthApps.list);
  },

  createGoogleOAuthApp(input: CreateGoogleOAuthAppInput) {
    return apiClient.post<GoogleOAuthApp>(
      ENDPOINTS.website.googleOAuthApps.list,
      input,
    );
  },

  updateGoogleOAuthApp(id: string, input: UpdateGoogleOAuthAppInput) {
    return apiClient.put<GoogleOAuthApp>(
      ENDPOINTS.website.googleOAuthApps.byId(id),
      input,
    );
  },

  deleteGoogleOAuthApp(id: string) {
    return apiClient.delete<void>(ENDPOINTS.website.googleOAuthApps.byId(id));
  },
};

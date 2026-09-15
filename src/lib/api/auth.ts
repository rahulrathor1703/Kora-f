import type { OrgLimitKey, OrgModule } from '@/lib/org-entitlements/types';

export type UserRole = 'superadmin' | 'admin';

export interface AuthUserOrganization {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  enabledModules?: OrgModule[];
  limits?: Partial<
    Record<
      OrgLimitKey,
      {
        effective: number | null;
        used: number;
      }
    >
  >;
}

export interface AuthUserRole {
  id: string;
  name: string;
  slug: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  username: string | null;
  hierarchyLevel: number;
  status: 'active' | 'disabled';
  onboardingStep: number;
  permissions: string[];
  roles: AuthUserRole[];
  organizationId: string | null;
  organization?: AuthUserOrganization;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
}

export interface SignupStartResponse {
  signupToken: string;
}

export interface SignupCompanyResponse {
  message: string;
  email: string;
}

export interface SignupCompleteResponse {
  message: string;
  user: AuthUser;
  organization: AuthUserOrganization;
}

export interface SlugAvailabilityResponse {
  available: boolean;
}

export interface AuthOAuthProviderConfig {
  enabled: boolean;
  clientId: string | null;
}

export interface AuthOAuthPublicConfig {
  google: AuthOAuthProviderConfig;
  apple: AuthOAuthProviderConfig;
}

export interface OAuthLoginResponse {
  message: string;
  user: AuthUser;
}

export interface OAuthNeedsSignupResponse {
  needsSignup: true;
  oauthSignupToken: string;
  email: string;
}

export type OAuthAuthResponse = OAuthLoginResponse | OAuthNeedsSignupResponse;

export interface PlatformAuthOAuthProvider {
  provider: 'google' | 'apple';
  enabled: boolean;
  clientId: string | null;
  updatedAt: string;
}

async function authFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const body = (await response.json()) as { message?: string | string[] };

      if (typeof body.message === 'string') {
        message = body.message;
      } else if (Array.isArray(body.message)) {
        message = body.message.join(', ');
      }
    } catch {
      // keep default message
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return authFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<{ message: string }> {
  return authFetch<{ message: string }>('/api/auth/logout', {
    method: 'POST',
  });
}

export async function getMe(): Promise<AuthUser> {
  return authFetch<AuthUser>('/api/auth/me');
}

export async function checkSignupSlug(slug: string): Promise<SlugAvailabilityResponse> {
  return authFetch<SlugAvailabilityResponse>('/api/auth/signup/check-slug', {
    method: 'POST',
    body: JSON.stringify({ slug }),
  });
}

export async function signupStart(email: string): Promise<SignupStartResponse> {
  return authFetch<SignupStartResponse>('/api/auth/signup/start', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function signupCompany(
  signupToken: string,
  companyName: string,
): Promise<SignupCompanyResponse> {
  return authFetch<SignupCompanyResponse>('/api/auth/signup/company', {
    method: 'POST',
    body: JSON.stringify({ signupToken, companyName }),
  });
}

export async function verifySignupOtp(
  signupToken: string,
  code: string,
): Promise<{ message: string }> {
  return authFetch<{ message: string }>('/api/auth/signup/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ signupToken, code }),
  });
}

export async function resendSignupOtp(
  signupToken: string,
): Promise<SignupCompanyResponse> {
  return authFetch<SignupCompanyResponse>('/api/auth/signup/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ signupToken }),
  });
}

export async function signupComplete(
  signupToken: string,
  password: string,
  confirmPassword: string,
): Promise<SignupCompleteResponse> {
  return authFetch<SignupCompleteResponse>('/api/auth/signup/complete', {
    method: 'POST',
    body: JSON.stringify({ signupToken, password, confirmPassword }),
  });
}

export async function getAuthOAuthConfig(): Promise<AuthOAuthPublicConfig> {
  return authFetch<AuthOAuthPublicConfig>('/api/auth/oauth/config');
}

export async function oauthLoginGoogle(
  idToken: string,
): Promise<OAuthAuthResponse> {
  return authFetch<OAuthAuthResponse>('/api/auth/oauth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export async function oauthLoginApple(
  idToken: string,
): Promise<OAuthAuthResponse> {
  return authFetch<OAuthAuthResponse>('/api/auth/oauth/apple', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export async function signupOAuthComplete(
  oauthSignupToken: string,
  companyName: string,
): Promise<SignupCompleteResponse> {
  return authFetch<SignupCompleteResponse>('/api/auth/signup/oauth/complete', {
    method: 'POST',
    body: JSON.stringify({ oauthSignupToken, companyName }),
  });
}

export function slugifyOrganizationName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { AuthUser } from '../types/auth.types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
}

export interface LogoutResponse {
  message: string;
}

export interface SlugAvailabilityResponse {
  available: boolean;
}

export const authService = {
  login(input: LoginInput) {
    return apiClient.post<LoginResponse>(ENDPOINTS.auth.login, input);
  },

  checkSlug(slug: string) {
    return apiClient.post<SlugAvailabilityResponse>(ENDPOINTS.auth.checkSlug, { slug });
  },

  logout() {
    return apiClient.post<LogoutResponse>(ENDPOINTS.auth.logout);
  },

  getSession() {
    return apiClient.get<AuthUser>(ENDPOINTS.auth.me);
  },
};

import { API_BASE_URL } from './config';
import { getOrganizationContextHeaders } from '@/lib/platform/impersonation-cookie';
import {
  getOrgLimitErrorMessage,
} from '@/lib/org-entitlements/limit-error-messages';
import {
  isOrgLimitReachedBody,
  type OrgLimitReachedErrorBody,
} from '@/lib/org-entitlements/types';

interface ApiErrorBody {
  message?: string | string[] | OrgLimitReachedErrorBody;
  code?: string;
  limitKey?: string;
  effectiveLimit?: number;
}

export class ApiError extends Error {
  readonly limitKey?: string;
  readonly effectiveLimit?: number;
  readonly currentUsage?: number;

  constructor(
    message: string,
    readonly status: number,
    details?: {
      limitKey?: string;
      effectiveLimit?: number;
      currentUsage?: number;
    },
  ) {
    super(message);
    this.name = 'ApiError';
    this.limitKey = details?.limitKey;
    this.effectiveLimit = details?.effectiveLimit;
    this.currentUsage = details?.currentUsage;
  }
}

function resolveErrorMessage(body: ApiErrorBody): {
  message: string;
  limitKey?: string;
  effectiveLimit?: number;
  currentUsage?: number;
} {
  if (typeof body.message === 'string') {
    return { message: body.message };
  }

  if (Array.isArray(body.message)) {
    return { message: body.message.join(', ') };
  }

  if (isOrgLimitReachedBody(body.message)) {
    return {
      message: getOrgLimitErrorMessage(
        body.message.limitKey,
        body.message.effectiveLimit,
        body.message.message,
      ),
      limitKey: body.message.limitKey,
      effectiveLimit: body.message.effectiveLimit,
      currentUsage: body.message.currentUsage,
    };
  }

  if (body.code === 'ORG_LIMIT_REACHED' && body.limitKey && body.effectiveLimit != null) {
    return {
      message: getOrgLimitErrorMessage(
        body.limitKey as OrgLimitReachedErrorBody['limitKey'],
        body.effectiveLimit,
      ),
      limitKey: body.limitKey,
      effectiveLimit: body.effectiveLimit,
    };
  }

  return { message: 'Request failed' };
}

async function parseErrorMessage(response: Response): Promise<{
  message: string;
  limitKey?: string;
  effectiveLimit?: number;
  currentUsage?: number;
}> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return resolveErrorMessage(body);
  } catch {
    // ignore JSON parse errors
  }

  return { message: `API error: ${response.status}` };
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getOrganizationContextHeaders(),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    const parsed = await parseErrorMessage(response);
    throw new ApiError(parsed.message, response.status, {
      limitKey: parsed.limitKey,
      effectiveLimit: parsed.effectiveLimit,
      currentUsage: parsed.currentUsage,
    });
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text.trim()) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

async function requestFormData<T>(
  path: string,
  formData: FormData,
  init: Omit<RequestInit, 'body'> = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method: 'POST',
    credentials: 'include',
    body: formData,
    cache: 'no-store',
    headers: {
      ...getOrganizationContextHeaders(),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const parsed = await parseErrorMessage(response);
    throw new ApiError(parsed.message, response.status, {
      limitKey: parsed.limitKey,
      effectiveLimit: parsed.effectiveLimit,
      currentUsage: parsed.currentUsage,
    });
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get<T>(path: string, init?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...init, method: 'GET' });
  },

  post<T>(path: string, body?: unknown, init?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...init, method: 'POST', body });
  },

  patch<T>(path: string, body?: unknown, init?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...init, method: 'PATCH', body });
  },

  put<T>(path: string, body?: unknown, init?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...init, method: 'PUT', body });
  },

  delete<T>(
    path: string,
    body?: unknown,
    init?: Omit<RequestOptions, 'method' | 'body'>,
  ) {
    return request<T>(path, { ...init, method: 'DELETE', body });
  },

  postFormData<T>(path: string, formData: FormData, init?: Omit<RequestInit, 'body' | 'method'>) {
    return requestFormData<T>(path, formData, init);
  },
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return fallback;
}

export function isApiError(error: unknown, status?: number): error is ApiError {
  if (!(error instanceof ApiError)) {
    return false;
  }

  if (status !== undefined) {
    return error.status === status;
  }

  return true;
}

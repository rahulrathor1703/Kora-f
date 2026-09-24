import { apiClient } from '@/lib/api/client';
import type {
  FormRegistryListResponse,
  ResolvedFormSchema,
  UpdateFormSchemaInput,
} from '@/lib/forms/types';

export async function listFormRegistry(): Promise<FormRegistryListResponse> {
  return apiClient.get<FormRegistryListResponse>('/forms/registry');
}

export async function getFormSchema(formKey: string): Promise<ResolvedFormSchema> {
  return apiClient.get<ResolvedFormSchema>(`/forms/${encodeURIComponent(formKey)}/schema`);
}

export async function updateOrgFormSchema(
  formKey: string,
  input: UpdateFormSchemaInput,
): Promise<ResolvedFormSchema> {
  return apiClient.put<ResolvedFormSchema>(
    `/forms/${encodeURIComponent(formKey)}/schema`,
    input,
  );
}

export async function listPlatformForms(): Promise<FormRegistryListResponse> {
  return apiClient.get<FormRegistryListResponse>('/platform/forms');
}

export async function getPlatformFormSchema(
  formKey: string,
): Promise<ResolvedFormSchema> {
  return apiClient.get<ResolvedFormSchema>(
    `/platform/forms/${encodeURIComponent(formKey)}/schema`,
  );
}

export async function updatePlatformFormSchema(
  formKey: string,
  input: UpdateFormSchemaInput,
): Promise<ResolvedFormSchema> {
  return apiClient.put<ResolvedFormSchema>(
    `/platform/forms/${encodeURIComponent(formKey)}/schema`,
    input,
  );
}

export async function publishPlatformFormSchema(
  formKey: string,
): Promise<ResolvedFormSchema> {
  return apiClient.post<ResolvedFormSchema>(
    `/platform/forms/${encodeURIComponent(formKey)}/publish`,
  );
}

export async function resetPlatformFormSchema(
  formKey: string,
): Promise<ResolvedFormSchema> {
  return apiClient.post<ResolvedFormSchema>(
    `/platform/forms/${encodeURIComponent(formKey)}/reset`,
  );
}

'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import {
  tablePreferencesService,
  type EffectiveTablePreferences,
  type StoredColumnPref,
} from '@/lib/api';

interface SaveUserPreferencesInput {
  tableName: string;
  columns: StoredColumnPref[];
}

interface SaveTeamDefaultsInput {
  tableName: string;
  columns: StoredColumnPref[];
}

export type { StoredColumnPref, EffectiveTablePreferences };

export function useTablePreferences(tableName: string, enabled = true) {
  const queryKey = `table-preferences.${tableName}.effective`;

  const { data, error, isLoading, refetch } =
    useApiQuery<EffectiveTablePreferences>(
      queryKey,
      () => tablePreferencesService.getEffective(tableName),
      { enabled: enabled && Boolean(tableName) },
    );

  const saveUserMutation = useApiMutation(
    ({ tableName: name, columns }: SaveUserPreferencesInput) =>
      tablePreferencesService.saveUserPreferences(name, { columns }),
  );

  const saveTeamDefaultsMutation = useApiMutation(
    ({ tableName: name, columns }: SaveTeamDefaultsInput) =>
      tablePreferencesService.saveTeamDefaults(name, { columns }),
  );

  const resetUserMutation = useApiMutation((name: string) =>
    tablePreferencesService.resetUserPreferences(name),
  );

  const saveUserPreferences = useCallback(
    async (columns: StoredColumnPref[]) => {
      if (!enabled) {
        return columns;
      }

      const result = await saveUserMutation.mutate({ tableName, columns });
      await refetch();
      return result;
    },
    [enabled, refetch, saveUserMutation, tableName],
  );

  const saveTeamDefaults = useCallback(
    async (columns: StoredColumnPref[]) => {
      if (!enabled) {
        return columns;
      }

      const result = await saveTeamDefaultsMutation.mutate({
        tableName,
        columns,
      });
      await refetch();
      return result;
    },
    [enabled, refetch, saveTeamDefaultsMutation, tableName],
  );

  const resetUserPreferences = useCallback(async () => {
    if (!enabled) {
      return null;
    }

    const result = await resetUserMutation.mutate(tableName);
    await refetch();
    return result;
  }, [enabled, refetch, resetUserMutation, tableName]);

  return {
    preferences: data,
    savedColumns: data?.columns ?? [],
    hasUserOverride: data?.hasUserOverride ?? false,
    hasTeamDefault: data?.hasTeamDefault ?? false,
    isLoading: enabled ? isLoading : false,
    error,
    refetch,
    saveUserPreferences,
    saveTeamDefaults,
    resetUserPreferences,
    isSaving:
      saveUserMutation.isLoading ||
      saveTeamDefaultsMutation.isLoading ||
      resetUserMutation.isLoading,
    saveError:
      saveUserMutation.error ??
      saveTeamDefaultsMutation.error ??
      resetUserMutation.error,
  };
}

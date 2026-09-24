import type { PermissionGroup } from '@/lib/api';

export interface PermissionPreset {
  id: string;
  label: string;
  description: string;
  keys: string[] | 'all';
}

export const PERMISSION_PRESETS: PermissionPreset[] = [
  {
    id: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to campaigns and settings',
    keys: ['campaigns:read', 'settings:read'],
  },
  {
    id: 'editor',
    label: 'Editor',
    description: 'Manage campaigns and view settings',
    keys: [
      'campaigns:read',
      'campaigns:create',
      'campaigns:update',
      'campaigns:delete',
      'settings:read',
    ],
  },
  {
    id: 'full',
    label: 'Full access',
    description: 'All permissions across the workspace',
    keys: 'all',
  },
];

export function resolvePresetPermissionIds(
  preset: PermissionPreset,
  groups: PermissionGroup[],
): string[] {
  const allPermissions = groups.flatMap((group) => group.permissions);

  if (preset.keys === 'all') {
    return allPermissions.map((permission) => permission.id);
  }

  const keyToId = new Map(allPermissions.map((p) => [p.key, p.id]));
  return preset.keys
    .map((key) => keyToId.get(key))
    .filter((id): id is string => id !== undefined);
}

export function getMatchingPresetId(
  selectedIds: string[],
  groups: PermissionGroup[],
): string | null {
  const selectedSet = new Set(selectedIds);

  for (const preset of PERMISSION_PRESETS) {
    const presetIds = resolvePresetPermissionIds(preset, groups);
    if (
      presetIds.length === selectedIds.length &&
      presetIds.every((id) => selectedSet.has(id))
    ) {
      return preset.id;
    }
  }

  return null;
}

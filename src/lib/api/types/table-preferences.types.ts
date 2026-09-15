export interface StoredColumnPref {
  field: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface EffectiveTablePreferences {
  tableName: string;
  columns: StoredColumnPref[];
  hasUserOverride: boolean;
  hasTeamDefault: boolean;
}

export interface UpsertTablePreferencesInput {
  columns: StoredColumnPref[];
}

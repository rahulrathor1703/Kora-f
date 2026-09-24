export interface BantCriterionOption {
  id: string;
  label: string;
  value: string;
  points: number;
  sortOrder: number;
  isActive: boolean;
}

export interface BantCriterion {
  id: string;
  key: string;
  label: string;
  description?: string;
  weight: number;
  sortOrder: number;
  isActive: boolean;
  options: BantCriterionOption[];
}

export interface BantTierThreshold {
  id: string;
  value: string;
  label: string;
  minScore: number;
  maxScore: number;
  color?: string;
  sortOrder: number;
}

export interface BantSettingsConfig {
  criteria: BantCriterion[];
  tiers: BantTierThreshold[];
}

export type BantResponses = Record<string, string>;

export interface BantSettingsResponse {
  config: BantSettingsConfig;
  updatedAt: string | null;
}

export interface ProspectBantResponse {
  config: BantSettingsConfig;
  responses: BantResponses;
  computedScore: number | null;
  computedTier: string | null;
}

export interface UpdateBantSettingsInput {
  criteria: BantCriterion[];
  tiers: BantTierThreshold[];
}

export interface UpdateProspectBantInput {
  responses: BantResponses;
}

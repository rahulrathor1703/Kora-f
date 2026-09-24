export interface CampaignIdFormatResponse {
  format: string | null;
  configured: boolean;
  locked: boolean;
  updatedAt: string | null;
}

export interface SetCampaignIdFormatInput {
  format: string;
}

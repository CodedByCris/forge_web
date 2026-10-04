export interface CmsAppConfig {
  exercisesCacheKey: string
  minVersion: string
  manualWorkImageUrl: string | null
  templateWorkImageUrl: string | null
  duelWorkImageUrl: string | null
  challengeWorkImageUrl: string | null
}

export type DashboardTileKey = 'manual' | 'template' | 'duel' | 'challenge'

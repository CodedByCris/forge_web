export type CmsShopItemRewardType = 'theme' | 'celebration' | 'xpBoost' | 'soundEffect'
export type CmsShopItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'

export interface CmsShopItem {
  id: string
  displayName: string
  price: number
  rewardType: CmsShopItemRewardType
  rarity: CmsShopItemRarity
  minRankLevel: number
  isActive: boolean
  themeId: string | null
  celebrationLottieUrl: string | null
  boostMultiplier: number | null
  boostDurationHours: number | null
  boostWorkoutsLeft: number | null
  soundEffect: string | null
  soundUrl: string | null
}

export const REWARD_TYPE_LABELS: Record<CmsShopItemRewardType, string> = {
  xpBoost: 'Impulso de XP',
  soundEffect: 'Efecto de sonido',
  theme: 'Tema',
  celebration: 'Celebración',
}

export const RARITY_OPTIONS: CmsShopItemRarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic']

export const RARITY_LABELS: Record<CmsShopItemRarity, string> = {
  common: 'Común',
  rare: 'Rara',
  epic: 'Épica',
  legendary: 'Legendaria',
  mythic: 'Mítica',
}

// Mismos colores que ShopItemRarity.color en forge/lib/features/shop/domain/entities/shop_item_rarity.dart
export const RARITY_COLORS: Record<CmsShopItemRarity, string> = {
  common: '#9CA3AF',
  rare: '#22C55E',
  epic: '#A855F7',
  legendary: '#FACC15',
  mythic: '#00E5FF',
}

// Mismo orden que las secciones de la tienda en la app (shop_screen.dart).
export const REWARD_TYPE_ORDER: CmsShopItemRewardType[] = ['xpBoost', 'celebration', 'theme', 'soundEffect']

// Mismos valores que el enum AppThemeId en forge/lib/core/theme/app_theme_id.dart —
// no se pueden inventar temas nuevos aquí, solo elegir entre los ya implementados.
export const THEME_OPTIONS = [
  'dark', 'neo', 'emerald', 'ember', 'arctic', 'midnight', 'neonrush',
  'shadow', 'volcanic', 'golden', 'phantom', 'bloodpact', 'titan', 'lightning',
] as const

// Mismos valores que el enum SoundEffect (sin 'none') — cada uno tiene un
// trigger fijo en el código (set/descanso/entreno completado).
export const SOUND_EFFECT_OPTIONS: { id: string; label: string }[] = [
  { id: 'sound_metal_clink', label: 'Metal Clink (fin de serie)' },
  { id: 'sound_gym_bell', label: 'Gym Bell (fin de descanso)' },
  { id: 'sound_air_horn', label: 'Air Horn (fin de entreno)' },
  { id: 'sound_crowd_cheer', label: 'Crowd Cheer (fin de entreno)' },
]

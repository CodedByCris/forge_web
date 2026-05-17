export const TEMPLATE_COLORS = [
  0xFFFF6200, // naranja (brand)
  0xFF2196F3, // azul
  0xFF4CAF50, // verde
  0xFFE91E63, // rosa
  0xFF9C27B0, // morado
  0xFFFF9800, // ámbar
  0xFF00BCD4, // cyan
  0xFF607D8B, // gris azulado
] as const

export type TemplateColor = (typeof TEMPLATE_COLORS)[number]

/** ARGB int (Flutter/Android) → CSS hex string */
export function argbToHex(argb: number): string {
  return `#${(argb & 0xFFFFFF).toString(16).padStart(6, '0')}`
}

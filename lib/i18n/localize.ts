// Helper para campos bilingües en lore JSONs
// Soporta tanto string plano (legacy) como {es: "...", en: "..."}

type LocalizedField = string | { es: string; en: string }

export function getLocalized(field: LocalizedField | undefined, locale: 'es' | 'en'): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[locale] || field.es || ''
}

// Para arrays de strings bilingües (inventario, etc.)
export function getLocalizedArray(arr: (string | { es: string; en: string })[] | undefined, locale: 'es' | 'en'): string[] {
  if (!arr) return []
  return arr.map(item => getLocalized(item, locale))
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { Package, Sword, Shield, FlaskConical, Scroll, Coins, Backpack } from 'lucide-react'
import { translateInventoryItem } from '@/lib/i18n/inventory-translate'

// Categorizar items por keywords en el nombre
function categorizeItem(name: string): string {
  const lower = name.toLowerCase()
  if (/espada|hacha|arco|daga|flecha|maza|lanza|sword|axe|bow|dagger|arrow|mace|spear|weapon/i.test(lower)) return 'weapon'
  if (/armadura|escudo|casco|cota|shield|armor|helmet|chainmail/i.test(lower)) return 'armor'
  if (/poción|pocion|hierba|athelas|ungüento|potion|herb|salve|medicine/i.test(lower)) return 'consumable'
  if (/pergamino|libro|mapa|carta|scroll|book|map|letter|tome/i.test(lower)) return 'document'
  if (/moneda|oro|plata|coin|gold|silver|currency/i.test(lower)) return 'currency'
  return 'misc'
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  weapon: <Sword className="w-3 h-3 text-blood" />,
  armor: <Shield className="w-3 h-3 text-stone" />,
  consumable: <FlaskConical className="w-3 h-3 text-emerald" />,
  document: <Scroll className="w-3 h-3 text-gold" />,
  currency: <Coins className="w-3 h-3 text-gold-bright" />,
  misc: <Backpack className="w-3 h-3 text-parchment/60" />,
}

// Agrupar items repetidos
function groupItems(items: string[]): { name: string; count: number; category: string }[] {
  const counts: Record<string, number> = {}
  for (const item of items) {
    counts[item] = (counts[item] || 0) + 1
  }
  return Object.entries(counts).map(([name, count]) => ({
    name,
    count,
    category: categorizeItem(name),
  }))
}

interface InventoryPanelProps {
  inventory: string[]
  characterName?: string
  locale?: 'es' | 'en'
  className?: string
}

export function InventoryPanel({ inventory, characterName, locale = 'es', className = '' }: InventoryPanelProps) {
  const [newItems, setNewItems] = useState<Set<string>>(new Set())
  const prevInventoryRef = useRef<string[]>([])

  // Defensivo: algunos personajes guest viejos pueden tener inventory como
  // LocalizedString[] (objetos {es,en}) en DB en vez de strings planos.
  const flatInventory: string[] = inventory.map((item: any) => {
    if (typeof item === 'string') return item
    if (item && typeof item === 'object') return item[locale] || item.es || item.en || ''
    return String(item ?? '')
  }).filter(Boolean)

  // Traducción al vuelo ES⇄EN para personajes pre-existentes cuyo inventory
  // en DB está en el idioma "equivocado" respecto al locale actual. Items no
  // encontrados en el lookup (loot del DM) pasan sin cambios.
  const normalizedInventory: string[] = flatInventory.map(i => translateInventoryItem(i, locale))

  // Detectar items nuevos para highlight.
  // normalizedInventory es un array NUEVO en cada render (se recrea con .map),
  // así que el efecto depende de la key serializada — solo corre cuando cambia
  // el contenido real del inventario.
  const inventoryKey = normalizedInventory.join('\u0000')
  useEffect(() => {
    const prev = new Set(prevInventoryRef.current)
    const added = normalizedInventory.filter(item => !prev.has(item))
    // Actualizar la ref SIEMPRE, antes del early return. Antes solo se
    // actualizaba cuando no había items nuevos → los mismos items se
    // re-detectaban en cada render y setNewItems entraba en loop infinito
    // (Maximum update depth exceeded).
    prevInventoryRef.current = [...normalizedInventory]
    if (added.length > 0) {
      setNewItems(new Set(added))
      const timer = setTimeout(() => setNewItems(new Set()), 3000)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryKey])

  const grouped = groupItems(normalizedInventory)

  if (grouped.length === 0) {
    return (
      <div className={`px-3 py-6 text-center ${className}`}>
        <Package className="w-8 h-8 text-parchment/30 mx-auto mb-2" />
        <p className="font-body text-sm text-parchment/50">
          {locale === 'en' ? 'Empty inventory' : 'Inventario vacío'}
        </p>
        <p className="font-ui text-xs text-parchment/30 mt-1">
          {locale === 'en' ? 'Complete actions or find treasure to get items' : 'Completá acciones o encontrá tesoros para obtener items'}
        </p>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gold-dim/20">
        <Backpack className="w-4 h-4 text-gold" />
        <span className="font-heading text-sm text-gold">
          {locale === 'en' ? 'Inventory' : 'Inventario'}
        </span>
        <span className="text-[10px] text-parchment/50">({normalizedInventory.length})</span>
      </div>

      <div className="px-2 py-1.5 max-h-64 lg:max-h-96 overflow-y-auto space-y-0.5">
        {grouped.map((item, i) => (
          <div
            key={`${item.name}-${i}`}
            className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors duration-300 ${
              newItems.has(item.name)
                ? 'bg-emerald/20 border border-emerald/40'
                : 'hover:bg-shadow/40'
            }`}
          >
            {CATEGORY_ICONS[item.category]}
            <span className="font-body text-parchment/80 flex-1 min-w-0 truncate">
              {item.name}
            </span>
            {item.count > 1 && (
              <span className="text-[10px] text-gold-dim font-mono">x{item.count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

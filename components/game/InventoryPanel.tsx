'use client'

import { useState, useEffect, useRef } from 'react'
import { Package, Sword, Shield, FlaskConical, Scroll, Coins, Backpack } from 'lucide-react'

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

  // Detectar items nuevos para highlight
  useEffect(() => {
    const prev = new Set(prevInventoryRef.current)
    const added = inventory.filter(item => !prev.has(item))
    if (added.length > 0) {
      setNewItems(new Set(added))
      const timer = setTimeout(() => setNewItems(new Set()), 3000)
      return () => clearTimeout(timer)
    }
    prevInventoryRef.current = [...inventory]
  }, [inventory])

  const grouped = groupItems(inventory)

  if (grouped.length === 0) {
    return (
      <div className={`px-3 py-4 text-center ${className}`}>
        <Package className="w-6 h-6 text-parchment/30 mx-auto mb-1" />
        <p className="font-body text-xs text-parchment/40">
          {locale === 'en' ? 'Empty inventory' : 'Inventario vacío'}
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
        <span className="text-[10px] text-parchment/50">({inventory.length})</span>
      </div>

      <div className="px-2 py-1.5 max-h-48 overflow-y-auto space-y-0.5">
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

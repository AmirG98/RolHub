'use client'

import React from 'react'
import { ChevronRight, Map, Compass } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Lore, getMapConfig } from '@/lib/maps/map-config'
import { type MapLocationWithStatus } from '@/lib/types/map-state'

// Iconos por tipo de ubicación
const LOCATION_ICONS: Record<string, string> = {
  city: '🏰',
  safe: '🏠',
  danger: '⚔️',
  dungeon: '🗝️',
  wilderness: '🌲',
  mystery: '✨',
  landmark: '🗿',
}

// Descripciones cortas por tipo
const SHORT_AMBIANCE: Record<string, Record<Lore, string>> = {
  city: {
    LOTR: 'Voces y comercio llenan el aire',
    ZOMBIES: 'Silencio inquietante entre edificios',
    ISEKAI: 'Bullicio del mercado mágico',
    VIKINGOS: 'Humo y olor a mar',
    STAR_WARS: 'Zumbido de naves y droides',
    CYBERPUNK: 'Neones y lluvia ácida',
    LOVECRAFT_HORROR: 'Arquitectura imposible',
    CUSTOM: 'Actividad y posibilidades',
  },
  safe: {
    LOTR: 'Paz y protección antigua',
    ZOMBIES: 'Barricadas en su lugar',
    ISEKAI: 'Zona de descanso segura',
    VIKINGOS: 'Fuego e hidromiel',
    STAR_WARS: 'Sector seguro',
    CYBERPUNK: 'Fuera de jurisdicción',
    LOVECRAFT_HORROR: 'Normalidad reconfortante',
    CUSTOM: 'Refugio seguro',
  },
  danger: {
    LOTR: 'El mal acecha',
    ZOMBIES: 'Gruñidos cercanos',
    ISEKAI: 'Nivel de peligro alto',
    VIKINGOS: 'Territorio hostil',
    STAR_WARS: 'Presencia Imperial',
    CYBERPUNK: 'Territorio de pandillas',
    LOVECRAFT_HORROR: 'La cordura se desvanece',
    CUSTOM: 'Peligro acechante',
  },
  dungeon: {
    LOTR: 'Oscuridad palpable',
    ZOMBIES: 'Pasillos estrechos',
    ISEKAI: 'Tesoros y monstruos',
    VIKINGOS: 'Tumbas antiguas',
    STAR_WARS: 'Sensores inactivos',
    CYBERPUNK: 'Red aislada',
    LOVECRAFT_HORROR: 'Ángulos imposibles',
    CUSTOM: 'Secretos subterráneos',
  },
  wilderness: {
    LOTR: 'Naturaleza salvaje',
    ZOMBIES: 'Campo abierto',
    ISEKAI: 'Zona de farmeo',
    VIKINGOS: 'Espíritus susurrantes',
    STAR_WARS: 'Vida salvaje',
    CYBERPUNK: 'Sin conexión ni ley',
    LOVECRAFT_HORROR: 'Vegetación incorrecta',
    CUSTOM: 'Tierras salvajes',
  },
  mystery: {
    LOTR: 'Magia antigua',
    ZOMBIES: 'Algo no cuadra',
    ISEKAI: 'Evento secreto',
    VIKINGOS: 'Los dioses observan',
    STAR_WARS: 'La Fuerza es fuerte',
    CYBERPUNK: 'Datos encriptados',
    LOVECRAFT_HORROR: 'Velo entre mundos',
    CUSTOM: 'Misterio por resolver',
  },
  landmark: {
    LOTR: 'Lugar legendario',
    ZOMBIES: 'Punto de referencia',
    ISEKAI: 'Punto de guardado',
    VIKINGOS: 'Marca ancestral',
    STAR_WARS: 'Coordenadas clave',
    CYBERPUNK: 'Punto de interés',
    LOVECRAFT_HORROR: 'Arquitectura imposible',
    CUSTOM: 'Lugar notable',
  },
}

interface SceneViewProps {
  location: MapLocationWithStatus | null
  lore: Lore
  connectedLocations: MapLocationWithStatus[]
  onTravel: (locationId: string) => void
  onExploreInterior?: () => void
  onShowWorldMap: () => void
  canExploreInterior?: boolean
  isNavigationLocked?: boolean
  lockReason?: string
  className?: string
}

export function SceneView({
  location,
  lore,
  connectedLocations,
  onTravel,
  onExploreInterior,
  onShowWorldMap,
  canExploreInterior = false,
  isNavigationLocked = false,
  lockReason = '',
  className = '',
}: SceneViewProps) {
  const config = getMapConfig(lore)

  if (!location) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <p className="text-parchment/50 font-body text-sm">Ubicación desconocida...</p>
      </div>
    )
  }

  const locationType = location.type || 'landmark'
  const icon = LOCATION_ICONS[locationType] || '📍'
  const ambiance = SHORT_AMBIANCE[locationType]?.[lore] || location.description

  // Nivel de peligro
  const dangerLevel = location.dangerLevel || 1
  const dangerColor = dangerLevel >= 4 ? 'text-blood' : dangerLevel >= 2 ? 'text-gold-dim' : 'text-emerald'

  return (
    <div
      className={cn(
        'flex flex-col h-full overflow-hidden',
        'bg-gradient-to-b from-shadow to-shadow-mid',
        'border border-gold-dim/30 rounded-lg',
        className
      )}
    >
      {/* Header compacto */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gold-dim/20 bg-shadow/50">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xl flex-shrink-0">{icon}</span>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-base text-gold-bright truncate">
              {location.name}
            </h2>
            <p className="text-xs text-parchment/60 truncate italic">{ambiance}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <span className={cn('text-xs', dangerColor)}>
            {'⚔️'.repeat(Math.min(dangerLevel, 3))}
          </span>
          {location.visited && <span className="text-emerald text-xs">✓</span>}
        </div>
      </div>

      {/* Destinos - la parte principal */}
      <div className="flex-1 overflow-auto px-3 py-2">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-3.5 h-3.5 text-gold" />
          <span className="text-xs font-heading text-gold uppercase tracking-wide">Viajar a</span>
          {isNavigationLocked && (
            <span className="text-xs text-blood ml-auto">🔒 {lockReason}</span>
          )}
        </div>

        {connectedLocations.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-parchment/50 italic mb-2">No hay caminos directos desde aquí</p>
            <button
              onClick={onShowWorldMap}
              className="text-xs text-gold hover:text-gold-bright underline"
            >
              Abrir mapa para explorar
            </button>
          </div>
        ) : (
          <div className="grid gap-1.5">
            {connectedLocations.map((dest) => {
              const destIcon = LOCATION_ICONS[dest.type || 'landmark'] || '📍'
              const destDanger = dest.dangerLevel || 1
              const canTravel = !isNavigationLocked && dest.discovered

              return (
                <button
                  key={dest.id}
                  onClick={() => canTravel && onTravel(dest.id)}
                  disabled={!canTravel}
                  className={cn(
                    'flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all',
                    'border',
                    canTravel
                      ? 'border-gold-dim/30 hover:border-gold bg-shadow/30 hover:bg-shadow-mid cursor-pointer'
                      : 'border-gold-dim/10 bg-shadow/10 cursor-not-allowed opacity-50'
                  )}
                >
                  <span className="text-base flex-shrink-0">{destIcon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm text-parchment truncate">{dest.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={cn(
                      'text-xs',
                      destDanger >= 4 ? 'text-blood' : destDanger >= 2 ? 'text-gold-dim' : 'text-emerald'
                    )}>
                      {'⚔️'.repeat(Math.min(destDanger, 2))}
                    </span>
                    {canTravel && <ChevronRight className="w-3.5 h-3.5 text-gold-dim" />}
                    {!dest.discovered && <span className="text-xs text-parchment/30">???</span>}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer compacto */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-gold-dim/20 bg-shadow">
        {canExploreInterior && (
          <button
            onClick={onExploreInterior}
            disabled={isNavigationLocked}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded font-heading text-xs transition-all',
              isNavigationLocked
                ? 'bg-shadow-mid text-parchment/40 cursor-not-allowed'
                : 'bg-emerald/80 hover:bg-emerald text-parchment hover:text-white'
            )}
          >
            <span>Explorar</span>
          </button>
        )}

        <button
          onClick={onShowWorldMap}
          className={cn(
            'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded font-heading text-xs transition-all',
            'bg-shadow-mid hover:bg-shadow border border-gold-dim/30 hover:border-gold text-parchment',
            canExploreInterior ? '' : 'flex-1'
          )}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Mapa</span>
        </button>
      </div>
    </div>
  )
}

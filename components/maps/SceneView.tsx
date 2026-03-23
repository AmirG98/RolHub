'use client'

import React from 'react'
import { ChevronRight, Map, Compass, Lock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Lore, getMapConfig } from '@/lib/maps/map-config'
import { type MapLocationWithStatus } from '@/lib/types/map-state'
import { AnimatePresence, motion } from 'framer-motion'

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

// Descripciones cortas por tipo y lore
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
  // Imagen de escena
  sceneImageUrl?: string | null
  isSceneImageLoading?: boolean
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
  sceneImageUrl,
  isSceneImageLoading = false,
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

  const dangerLevel = location.dangerLevel || 1
  const dangerColor = dangerLevel >= 4 ? 'text-red-400' : dangerLevel >= 2 ? 'text-gold' : 'text-emerald'

  const hasImage = !!sceneImageUrl

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden',
        hasImage ? 'min-h-[280px] md:min-h-[320px]' : 'h-full',
        'border border-gold-dim/30 rounded-lg',
        className
      )}
    >
      {/* Imagen de escena como fondo */}
      <AnimatePresence mode="wait">
        {hasImage && (
          <motion.div
            key={sceneImageUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0"
          >
            <img
              src={sceneImageUrl!}
              alt={location.name}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeleton cuando se genera imagen */}
      {isSceneImageLoading && !hasImage && (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-shadow to-shadow-mid">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-gold/5 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 text-gold/50">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-ui text-xs">Visualizando escena...</span>
            </div>
          </div>
        </div>
      )}

      {/* Fondo oscuro cuando no hay imagen */}
      {!hasImage && !isSceneImageLoading && (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-shadow to-shadow-mid" />
      )}

      {/* Contenido superpuesto sobre la imagen */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header con nombre de ubicación */}
        <div className={cn(
          'flex items-center justify-between px-3 py-2',
          hasImage ? 'bg-black/30 backdrop-blur-sm' : 'border-b border-gold-dim/20 bg-shadow/50'
        )}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xl flex-shrink-0">{icon}</span>
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-base text-gold-bright truncate drop-shadow-lg">
                {location.name}
              </h2>
              <p className="text-xs text-parchment/70 truncate italic drop-shadow-md">{ambiance}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <span className={cn('text-xs drop-shadow-md', dangerColor)}>
              {'⚔️'.repeat(Math.min(dangerLevel, 3))}
            </span>
            {location.visited && <span className="text-emerald text-xs drop-shadow-md">✓</span>}
          </div>
        </div>

        {/* Spacer cuando hay imagen — empuja navegación al fondo */}
        {hasImage && <div className="flex-1" />}

        {/* Destinos de viaje */}
        <div className={cn(
          'px-3 py-2',
          hasImage ? 'bg-black/50 backdrop-blur-sm' : 'flex-1 overflow-auto'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-3.5 h-3.5 text-gold drop-shadow-md" />
            <span className="text-xs font-heading text-gold uppercase tracking-wide drop-shadow-md">Viajar a</span>
            {isNavigationLocked && (
              <span className="text-xs text-red-400 ml-auto flex items-center gap-1">
                <Lock className="w-3 h-3" /> {lockReason}
              </span>
            )}
          </div>

          {connectedLocations.length === 0 ? (
            <div className="text-center py-2">
              <p className="text-xs text-parchment/50 italic mb-1">No hay caminos directos</p>
              <button
                onClick={onShowWorldMap}
                className="text-xs text-gold hover:text-gold-bright underline"
              >
                Abrir mapa
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
                      'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all',
                      'border',
                      canTravel
                        ? hasImage
                          ? 'border-parchment/20 hover:border-gold bg-black/30 hover:bg-black/50 backdrop-blur-sm cursor-pointer'
                          : 'border-gold-dim/30 hover:border-gold bg-shadow/30 hover:bg-shadow-mid cursor-pointer'
                        : 'border-gold-dim/10 bg-shadow/10 cursor-not-allowed opacity-50'
                    )}
                  >
                    <span className="text-base flex-shrink-0">{destIcon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm text-parchment truncate drop-shadow-md">{dest.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={cn(
                        'text-xs',
                        destDanger >= 4 ? 'text-red-400' : destDanger >= 2 ? 'text-gold' : 'text-emerald'
                      )}>
                        {'⚔️'.repeat(Math.min(destDanger, 2))}
                      </span>
                      {canTravel && <ChevronRight className="w-3.5 h-3.5 text-gold drop-shadow-md" />}
                      {!dest.discovered && <span className="text-xs text-parchment/30">???</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer con botones de acción */}
        <div className={cn(
          'flex items-center gap-2 px-3 py-2',
          hasImage ? 'bg-black/50 backdrop-blur-sm' : 'border-t border-gold-dim/20 bg-shadow'
        )}>
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
              hasImage
                ? 'bg-black/40 hover:bg-black/60 border border-parchment/20 hover:border-gold text-parchment backdrop-blur-sm'
                : 'bg-shadow-mid hover:bg-shadow border border-gold-dim/30 hover:border-gold text-parchment',
              canExploreInterior ? '' : 'flex-1'
            )}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Mapa</span>
          </button>
        </div>
      </div>
    </div>
  )
}

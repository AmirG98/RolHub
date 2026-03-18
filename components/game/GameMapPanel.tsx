'use client'

import React, { useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Lock, Unlock, MapIcon, Compass, Eye, EyeOff, Maximize2, Minimize2, ChevronRight, Scroll } from 'lucide-react'
import { type Lore, getMapConfig } from '@/lib/maps/map-config'
import { type MapLocationWithStatus, type NavigationLockReason } from '@/lib/types/map-state'
import { type Quest, type QuestMarker as QuestMarkerType } from '@/lib/types/quest'
import { getQuestMarkers, getActiveQuests, getMainQuest } from '@/lib/quests/quest-manager'
import { useMapSync } from '@/hooks/useMapSync'
import { cn } from '@/lib/utils'
import { QuestPanelCompact, CurrentQuestWidget } from './QuestPanel'

// Importar MapContainer dinámicamente para evitar SSR issues con Konva
const MapContainer = dynamic(
  () => import('@/components/maps/MapContainer').then(mod => mod.MapContainer),
  { ssr: false, loading: () => <MapLoading /> }
)

// Importar SubmapRouter dinámicamente
const DynamicSubmapRouter = dynamic(
  () => import('@/components/maps/submap/SubmapRouter').then(mod => ({ default: mod.SubmapRouter })),
  { ssr: false, loading: () => <SubmapLoading /> }
)

// Mensajes de bloqueo de navegación
const LOCK_MESSAGES: Record<NavigationLockReason, string> = {
  combat: 'En combate',
  dialogue: 'En conversación',
  cutscene: 'Escena en progreso',
  important_choice: 'Decisión pendiente',
  ritual: 'Ritual en progreso',
  trap: 'Atrapado',
  none: '',
}

interface GameMapPanelProps {
  lore: Lore
  worldState: any
  onTravelRequest: (action: string, toLocationId: string) => void
  onError?: (message: string) => void
  locale?: 'es' | 'en'
  className?: string
  compact?: boolean
  // Sistema de quests
  quests?: Quest[]
  onQuestClick?: (quest: Quest) => void
  onViewQuestOnMap?: (locationId: string) => void
}

export function GameMapPanel({
  lore,
  worldState,
  onTravelRequest,
  onError,
  locale = 'es',
  className = '',
  compact = false,
  quests = [],
  onQuestClick,
  onViewQuestOnMap,
}: GameMapPanelProps) {
  const [showFog, setShowFog] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [submapLocation, setSubmapLocation] = useState<MapLocationWithStatus | null>(null)
  const [showQuests, setShowQuests] = useState(false)

  const config = getMapConfig(lore)

  // Computar quest markers para el mapa
  const questState = useMemo(() => ({
    quests,
    locationKnowledge: worldState.map_state?.locationKnowledge || {},
    revealedSecrets: worldState.map_state?.revealedSecrets || {},
  }), [quests, worldState.map_state])

  const activeQuests = useMemo(() => getActiveQuests(questState), [questState])
  const mainQuest = useMemo(() => getMainQuest(questState), [questState])

  // Usar hook de sincronización de mapa
  const {
    locations,
    currentLocation,
    canNavigate,
    lockMessage,
    stats,
    handleLocationClick,
    hasSubmapAvailable,
    getSubmapType,
  } = useMapSync(worldState, lore, {
    locale,
    onTravelRequest,
    onTravelFailed: onError,
    onExploreInterior: (locationId, submapType) => {
      const location = locations.find(l => l.id === locationId)
      if (location) {
        setSubmapLocation(location)
      }
    },
  })

  // Handler para cerrar submapa
  const handleCloseSubmap = useCallback(() => {
    setSubmapLocation(null)
  }, [])

  // Handler para movimiento del jugador en submapa
  const handlePlayerMove = useCallback((nodeId: string) => {
    // Por ahora solo loggeamos, después se integrará con el DM
    console.log('Player moved to node:', nodeId)
  }, [])

  // Handler para explorar interior
  const handleExploreInterior = useCallback(() => {
    if (currentLocation && hasSubmapAvailable(currentLocation)) {
      setSubmapLocation(currentLocation)
    }
  }, [currentLocation, hasSubmapAvailable])

  const mapState = worldState.map_state
  const isLocked = mapState?.navigationLocked || false
  const lockReason: NavigationLockReason = mapState?.lockReason || 'none'

  // Calcular altura según modo
  const containerHeight = isExpanded
    ? 'h-[500px]'
    : compact
      ? 'h-48'
      : 'h-64'

  return (
    <div
      className={cn(
        'relative rounded-lg border border-gold-dim overflow-hidden',
        'bg-gradient-to-b from-shadow to-shadow-mid',
        className
      )}
    >
      {/* Header del mapa */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gold-dim bg-shadow">
        {/* Ubicación actual */}
        <div className="flex items-center gap-2 min-w-0">
          <Compass className="w-4 h-4 text-gold flex-shrink-0" />
          <span
            className="text-sm text-parchment font-heading truncate"
            title={currentLocation?.name}
          >
            {currentLocation?.name || (locale === 'es' ? 'Ubicación desconocida' : 'Unknown location')}
          </span>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-1">
          {/* Indicador de lock */}
          {isLocked && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-blood/80 text-parchment text-xs"
              title={LOCK_MESSAGES[lockReason]}
            >
              <Lock className="w-3 h-3" />
              <span className="hidden sm:inline">{LOCK_MESSAGES[lockReason]}</span>
            </div>
          )}

          {/* Toggle Quests (solo si hay quests) */}
          {activeQuests.length > 0 && (
            <button
              onClick={() => setShowQuests(!showQuests)}
              className={cn(
                'p-1.5 rounded transition-colors',
                showQuests
                  ? 'bg-gold/20 text-gold'
                  : 'hover:bg-shadow-mid text-parchment/70 hover:text-parchment'
              )}
              title={showQuests ? 'Ocultar misiones' : 'Mostrar misiones'}
            >
              <Scroll className="w-4 h-4" />
              {activeQuests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[10px] bg-gold text-shadow rounded-full">
                  {activeQuests.length}
                </span>
              )}
            </button>
          )}

          {/* Toggle Fog */}
          <button
            onClick={() => setShowFog(!showFog)}
            className="p-1.5 rounded hover:bg-shadow-mid text-parchment/70 hover:text-parchment transition-colors"
            title={showFog ? 'Ocultar niebla' : 'Mostrar niebla'}
          >
            {showFog ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded hover:bg-shadow-mid text-parchment/70 hover:text-parchment transition-colors"
            title={isExpanded ? 'Reducir' : 'Expandir'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div className={cn(containerHeight, 'transition-all duration-300 relative')}>
        <MapContainer
          lore={lore}
          locations={locations}
          currentLocationId={currentLocation?.id}
          onLocationClick={(location) => {
            // Encontrar la versión extendida con status
            const fullLocation = locations.find(l => l.id === location.id)
            if (fullLocation) {
              handleLocationClick(fullLocation)
            }
          }}
          showFog={showFog}
          className="w-full h-full"
          questMarkers={getQuestMarkers(questState, locations, currentLocation?.id)}
        />

        {/* Panel de quests overlay (expandido) */}
        {showQuests && isExpanded && (
          <div className="absolute top-2 right-2 w-64 z-10">
            <QuestPanelCompact
              quests={quests}
              onQuestClick={onQuestClick}
              className="bg-shadow/95 border border-gold/30 rounded-lg p-2"
            />
          </div>
        )}

        {/* Widget de quest actual (no expandido, si hay main quest) */}
        {!isExpanded && mainQuest && (
          <div className="absolute bottom-2 left-2 right-2 z-10">
            <CurrentQuestWidget
              quest={mainQuest}
              onViewOnMap={onViewQuestOnMap}
            />
          </div>
        )}
      </div>

      {/* Footer con stats y botón de explorar */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-gold-dim bg-shadow">
        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-parchment/70">
          <span>
            {stats.visitedLocations}/{stats.totalLocations} visitadas
          </span>
          <span className="text-gold">{stats.completionPercent}%</span>
        </div>

        {/* Botón explorar interior */}
        {currentLocation && hasSubmapAvailable(currentLocation) && (
          <button
            onClick={handleExploreInterior}
            disabled={isLocked}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs font-ui transition-all',
              isLocked
                ? 'bg-shadow-mid text-parchment/40 cursor-not-allowed'
                : 'bg-emerald/80 hover:bg-emerald text-parchment hover:text-white'
            )}
          >
            <MapIcon className="w-3 h-3" />
            <span>{locale === 'es' ? 'Explorar interior' : 'Explore interior'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Indicador de navegación libre */}
      {!isLocked && canNavigate && (
        <div className="absolute bottom-12 left-3 flex items-center gap-1 px-2 py-0.5 rounded bg-emerald/80 text-parchment text-xs">
          <Unlock className="w-3 h-3" />
          <span>{locale === 'es' ? 'Navegación libre' : 'Free navigation'}</span>
        </div>
      )}

      {/* Submapa modal */}
      {submapLocation && (
        <DynamicSubmapRouter
          location={submapLocation}
          lore={lore}
          isOpen={true}
          onClose={handleCloseSubmap}
          onPlayerMove={handlePlayerMove}
        />
      )}
    </div>
  )
}

// Loading skeleton para mapa
function MapLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-shadow">
      <div className="text-center text-gold animate-pulse">
        <div className="text-3xl mb-2">🗺️</div>
        <p className="text-xs">Cargando mapa...</p>
      </div>
    </div>
  )
}

// Loading skeleton para submapa
function SubmapLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="text-center text-gold animate-pulse">
        <div className="text-4xl mb-3">🏰</div>
        <p className="text-sm font-heading">Explorando ubicación...</p>
      </div>
    </div>
  )
}

// Versión compacta para sidebar colapsado
export function GameMapMini({
  lore,
  worldState,
  onClick,
  className = '',
}: {
  lore: Lore
  worldState: any
  onClick: () => void
  className?: string
}) {
  const { currentLocation, stats, canNavigate } = useMapSync(worldState, lore)
  const mapState = worldState.map_state
  const isLocked = mapState?.navigationLocked || false

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg w-full',
        'bg-shadow-mid hover:bg-shadow border border-gold-dim',
        'transition-all group',
        className
      )}
    >
      <MapIcon className="w-5 h-5 text-gold group-hover:text-gold-bright" />
      <div className="flex-1 text-left min-w-0">
        <p className="text-xs text-parchment truncate">{currentLocation?.name || 'Mapa'}</p>
        <p className="text-xs text-parchment/50">{stats.completionPercent}% explorado</p>
      </div>
      {isLocked ? (
        <Lock className="w-4 h-4 text-blood" />
      ) : (
        <ChevronRight className="w-4 h-4 text-parchment/50 group-hover:text-parchment" />
      )}
    </button>
  )
}

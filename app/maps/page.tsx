'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { type Lore, type MapLocation } from '@/lib/maps/map-config'
import { getExampleMapData } from '@/lib/maps/lore-map-data'
import { type LocationKnowledgeLevel } from '@/components/maps-3d/LocationMarker3D'
import { Box, Layers } from 'lucide-react'

// Convertir flags discovered/visited a knowledgeLevel
function getKnowledgeLevel(loc: MapLocation): LocationKnowledgeLevel {
  if (loc.visited) return 'visited'
  if (loc.discovered) return 'discovered'
  return 'unknown'
}

// Loading component
function MapLoading() {
  return (
    <div className="w-full h-[500px] flex items-center justify-center bg-shadow-mid rounded-lg border-2 border-gold">
      <div className="text-center animate-pulse">
        <div className="text-5xl mb-3">🗺️</div>
        <p className="text-gold-bright font-heading text-lg">Cargando mapa...</p>
        <p className="text-parchment/70 text-sm mt-1">Preparando el mundo</p>
      </div>
    </div>
  )
}

function Map3DLoading() {
  return (
    <div className="w-full h-[500px] flex items-center justify-center bg-shadow-mid rounded-lg border-2 border-gold">
      <div className="text-center animate-pulse">
        <div className="text-5xl mb-3">🌍</div>
        <p className="text-gold-bright font-heading text-lg">Cargando mapa 3D...</p>
        <p className="text-parchment/70 text-sm mt-1">Generando terreno</p>
      </div>
    </div>
  )
}

// Importar MapPanel dinámicamente
const DynamicMapPanel = dynamic(
  () => import('@/components/maps/MapPanel').then(mod => ({ default: mod.MapPanel })),
  {
    ssr: false,
    loading: () => <MapLoading />
  }
)

// Importar ThreeMapViewer dinámicamente
const DynamicThreeMapViewer = dynamic(
  () => import('@/components/maps-3d/ThreeMapViewer').then(mod => mod.ThreeMapViewer),
  {
    ssr: false,
    loading: () => <Map3DLoading />
  }
)

const LORES: { id: Lore; name: string; emoji: string }[] = [
  { id: 'LOTR', name: 'Tierra Media', emoji: '🧙‍♂️' },
  { id: 'ZOMBIES', name: 'Apocalipsis Zombie', emoji: '🧟' },
  { id: 'ISEKAI', name: 'Mundo Isekai', emoji: '⚔️' },
  { id: 'VIKINGOS', name: 'Saga Vikinga', emoji: '🪓' },
  { id: 'STAR_WARS', name: 'Star Wars', emoji: '🚀' },
  { id: 'CYBERPUNK', name: 'Cyberpunk', emoji: '🤖' },
  { id: 'LOVECRAFT_HORROR', name: 'Horror Cósmico', emoji: '👁️' },
]

export default function MapsPage() {
  const [selectedLore, setSelectedLore] = useState<Lore>('LOTR')
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [mounted, setMounted] = useState(false)
  const [view3D, setView3D] = useState(true) // Default a 3D

  useEffect(() => {
    setMounted(true)
  }, [])

  const locations = getExampleMapData(selectedLore)
  const currentLocation = locations.find(l => l.visited) || locations[0]

  return (
    <div className="min-h-screen bg-shadow p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-title text-gold-bright mb-6 text-center">
          🗺️ Sistema de Mapas Interactivos
        </h1>

        {/* Selector de Lore */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-heading text-parchment">Selecciona un mundo:</h2>

            {/* Toggle 2D/3D */}
            <div className="flex items-center gap-2 bg-shadow-mid rounded-lg p-1 border border-gold-dim">
              <button
                onClick={() => setView3D(false)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all ${
                  !view3D
                    ? 'bg-gold text-shadow font-semibold'
                    : 'text-parchment hover:bg-shadow'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="text-sm">2D</span>
              </button>
              <button
                onClick={() => setView3D(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all ${
                  view3D
                    ? 'bg-emerald text-white font-semibold'
                    : 'text-parchment hover:bg-shadow'
                }`}
              >
                <Box className="w-4 h-4" />
                <span className="text-sm">3D</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {LORES.map(lore => (
              <button
                key={lore.id}
                onClick={() => {
                  setSelectedLore(lore.id)
                  setSelectedLocation(null)
                }}
                className={`px-4 py-2 rounded-lg border-2 transition-all font-heading ${
                  selectedLore === lore.id
                    ? 'bg-gold text-shadow font-semibold border-gold-bright shadow-lg'
                    : 'bg-shadow-mid text-parchment border-gold-dim hover:border-gold hover:bg-shadow'
                }`}
              >
                <span className="mr-2">{lore.emoji}</span>
                {lore.name}
              </button>
            ))}
          </div>
        </div>

        {/* Mapa */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {mounted ? (
              view3D ? (
                <DynamicThreeMapViewer
                  lore={selectedLore}
                  locations={locations.map(loc => ({
                    id: loc.id,
                    name: loc.name,
                    x: loc.coordinates.x / 8, // Escalar coordenadas para el mapa 3D
                    y: loc.coordinates.y / 8,
                    type: loc.type as 'city' | 'dungeon' | 'wilderness' | 'poi' | 'quest' | undefined,
                    knowledgeLevel: getKnowledgeLevel(loc),
                  }))}
                  currentLocation={currentLocation?.id || null}
                  onLocationClick={(locationId) => {
                    const location = locations.find(l => l.id === locationId)
                    if (location) {
                      setSelectedLocation(location)
                    }
                  }}
                  className="h-[500px]"
                />
              ) : (
                <DynamicMapPanel
                  lore={selectedLore}
                  locations={locations}
                  currentLocationId={currentLocation?.id}
                  onLocationClick={setSelectedLocation}
                  className="h-[500px]"
                  defaultCollapsed={false}
                />
              )
            ) : (
              view3D ? <Map3DLoading /> : <MapLoading />
            )}
          </div>

          {/* Panel de información */}
          <div className="bg-shadow-mid rounded-lg border-2 border-gold p-4">
            <h3 className="font-heading text-gold-bright text-lg mb-4">
              Información del Mapa
            </h3>

            {selectedLocation ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-heading text-parchment text-xl">
                    {selectedLocation.name}
                  </h4>
                  <p className="text-parchment/90 text-sm mt-1">
                    {selectedLocation.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-shadow rounded p-2 border border-gold-dim/50">
                    <span className="text-gold">Tipo:</span>
                    <span className="text-parchment ml-2 capitalize">
                      {selectedLocation.type}
                    </span>
                  </div>
                  <div className="bg-shadow rounded p-2 border border-gold-dim/50">
                    <span className="text-gold">Peligro:</span>
                    <span className="text-parchment ml-2">
                      {'⚔️'.repeat(selectedLocation.dangerLevel)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-parchment/80 text-sm">
                Haz clic en una locación del mapa para ver sus detalles.
              </p>
            )}

            {/* Estadísticas */}
            <div className="mt-6 pt-4 border-t border-gold/50">
              <h4 className="font-heading text-gold text-sm mb-2">Estadísticas</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-parchment/80">
                  Total: <span className="text-parchment font-semibold">{locations.length}</span>
                </div>
                <div className="text-parchment/80">
                  Descubiertas: <span className="text-parchment font-semibold">{locations.filter(l => l.discovered).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-6 bg-shadow-mid rounded-lg border border-gold p-4">
          <h3 className="font-heading text-gold-bright mb-3">Controles</h3>
          {view3D ? (
            <ul className="text-parchment text-sm space-y-2">
              <li className="flex items-center gap-2">
                <span>🖱️</span>
                <span><strong className="text-gold">Click + Arrastrar:</strong> Rota la cámara</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🔍</span>
                <span><strong className="text-gold">Rueda del mouse:</strong> Zoom in/out</span>
              </li>
              <li className="flex items-center gap-2">
                <span>👆</span>
                <span><strong className="text-gold">Click en marcador:</strong> Selecciona ubicación</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✋</span>
                <span><strong className="text-gold">Click derecho + Arrastrar:</strong> Pan (mover cámara)</span>
              </li>
            </ul>
          ) : (
            <ul className="text-parchment text-sm space-y-2">
              <li className="flex items-center gap-2">
                <span>🖱️</span>
                <span><strong className="text-gold">Arrastrar:</strong> Mueve el mapa</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🔍</span>
                <span><strong className="text-gold">Rueda del mouse:</strong> Zoom in/out</span>
              </li>
              <li className="flex items-center gap-2">
                <span>👆</span>
                <span><strong className="text-gold">Click en ubicación:</strong> Abre el submapa detallado</span>
              </li>
            </ul>
          )}
          <div className="mt-4 pt-3 border-t border-gold/30">
            <h4 className="font-heading text-gold text-sm mb-2">
              {view3D ? 'Mapa 3D con Three.js' : 'Sistema de Submapas'}
            </h4>
            <p className="text-parchment/80 text-xs">
              {view3D ? (
                'El mapa 3D genera un terreno procedural único para cada mundo. El ambiente (cielo, niebla, iluminación) cambia según el lore seleccionado. Los marcadores flotan sobre el terreno y muestran el nombre de cada ubicación.'
              ) : (
                'Cada ubicación genera un submapa único según su tipo: ciudades con calles y plazas, dungeons con habitaciones conectadas, áreas salvajes con puntos de interés, y fortalezas con murallas y torres. Los submapas son consistentes - la misma ubicación siempre genera el mismo mapa.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

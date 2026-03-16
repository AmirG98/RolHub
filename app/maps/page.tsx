'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { type Lore, type MapLocation } from '@/lib/maps/map-config'
import { getExampleMapData } from '@/lib/maps/lore-map-data'

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

// Importar MapPanel dinámicamente
const DynamicMapPanel = dynamic(
  () => import('@/components/maps/MapPanel').then(mod => ({ default: mod.MapPanel })),
  {
    ssr: false,
    loading: () => <MapLoading />
  }
)

const LORES: { id: Lore; name: string; emoji: string }[] = [
  { id: 'LOTR', name: 'Tierra Media', emoji: '🧙‍♂️' },
  { id: 'ZOMBIES', name: 'Apocalipsis Zombie', emoji: '🧟' },
  { id: 'ISEKAI', name: 'Mundo Isekai', emoji: '⚔️' },
  { id: 'VIKINGOS', name: 'Saga Vikinga', emoji: '🪓' },
  { id: 'STAR_WARS', name: 'Star Wars', emoji: '🚀' },
  { id: 'CYBERPUNK', name: 'Cyberpunk', emoji: '🤖' },
  { id: 'LOVECRAFT', name: 'Horror Cósmico', emoji: '👁️' },
]

export default function MapsPage() {
  const [selectedLore, setSelectedLore] = useState<Lore>('LOTR')
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [mounted, setMounted] = useState(false)

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
          <h2 className="text-lg font-heading text-parchment mb-3">Selecciona un mundo:</h2>
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
              <DynamicMapPanel
                lore={selectedLore}
                locations={locations}
                currentLocationId={currentLocation?.id}
                onLocationClick={setSelectedLocation}
                className="h-[500px]"
                defaultCollapsed={false}
              />
            ) : (
              <MapLoading />
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
              <span><strong className="text-gold">Click:</strong> Seleccionar locación</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

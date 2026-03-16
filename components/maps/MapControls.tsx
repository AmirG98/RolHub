'use client'

import React from 'react'
import { type Lore, getMapConfig } from '@/lib/maps/map-config'

interface MapControlsProps {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  lore: Lore
}

export function MapControls({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
  lore,
}: MapControlsProps) {
  const config = getMapConfig(lore)

  const buttonStyle: React.CSSProperties = {
    backgroundColor: config.secondaryColor,
    color: config.textColor,
    border: `1px solid ${config.primaryColor}`,
    fontFamily: config.fontFamily,
  }

  const buttonHoverClass = 'hover:brightness-125 transition-all'

  return (
    <div className="absolute top-2 right-2 z-50 flex flex-col gap-1">
      {/* Zoom in */}
      <button
        onClick={onZoomIn}
        className={`w-8 h-8 rounded flex items-center justify-center text-lg ${buttonHoverClass}`}
        style={buttonStyle}
        title="Acercar"
      >
        +
      </button>

      {/* Indicador de zoom */}
      <div
        className="w-8 h-6 rounded flex items-center justify-center text-xs"
        style={{
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          border: `1px solid ${config.primaryColor}`,
          fontFamily: config.fontFamily,
        }}
      >
        {Math.round(scale * 100)}%
      </div>

      {/* Zoom out */}
      <button
        onClick={onZoomOut}
        className={`w-8 h-8 rounded flex items-center justify-center text-lg ${buttonHoverClass}`}
        style={buttonStyle}
        title="Alejar"
      >
        −
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        className={`w-8 h-8 rounded flex items-center justify-center text-sm mt-2 ${buttonHoverClass}`}
        style={buttonStyle}
        title="Resetear vista"
      >
        ⌂
      </button>
    </div>
  )
}

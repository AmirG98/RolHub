'use client'

import React, { useRef, useEffect } from 'react'
import { Group, Circle, Text, Rect, Star, RegularPolygon } from 'react-konva'
import Konva from 'konva'
import { type Lore, type MapLocation, getMapConfig, DIFFICULTY_COLORS, dangerToRank } from '@/lib/maps/map-config'
import { type QuestMarker as QuestMarkerType, getQuestMarkerIcon, getQuestMarkerColor } from '@/lib/types/quest'
import { type LocationKnowledgeLevel } from '@/lib/types/map-state'
import { getKnowledgeLevelStyle } from '@/lib/maps/location-knowledge'

interface MapMarkerProps {
  location: MapLocation
  lore: Lore
  isCurrentLocation: boolean
  isHovered: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  showFog: boolean
  // Nuevos props para sistema de quests y knowledge
  questMarker?: QuestMarkerType
  knowledgeLevel?: LocationKnowledgeLevel
}

export function MapMarker({
  location,
  lore,
  isCurrentLocation,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  showFog,
  questMarker,
  knowledgeLevel = 'discovered',
}: MapMarkerProps) {
  const groupRef = useRef<Konva.Group>(null)
  const config = getMapConfig(lore)
  const { x, y } = location.coordinates

  // Obtener estilo según nivel de conocimiento
  const knowledgeStyle = getKnowledgeLevelStyle(knowledgeLevel)

  // Si está en niebla y no descubierto, o unknown, no mostrar
  if ((showFog && !location.discovered) || knowledgeLevel === 'unknown') {
    return null
  }

  // Calcular opacidad basada en knowledge level
  const markerOpacity = knowledgeStyle.opacity

  // Animación de hover y locación actual
  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    if (isHovered || isCurrentLocation) {
      group.to({
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 0.15,
      })
    } else {
      group.to({
        scaleX: 1,
        scaleY: 1,
        duration: 0.15,
      })
    }
  }, [isHovered, isCurrentLocation])

  // Renderizar marcador según el estilo del lore
  const renderMarker = () => {
    switch (config.markerStyle) {
      case 'medieval':
        return <MedievalMarker location={location} config={config} isCurrentLocation={isCurrentLocation} />
      case 'modern':
        return <ModernMarker location={location} config={config} isCurrentLocation={isCurrentLocation} />
      case 'anime':
        return <AnimeMarker location={location} config={config} isCurrentLocation={isCurrentLocation} />
      case 'scifi':
        return <ScifiMarker location={location} config={config} isCurrentLocation={isCurrentLocation} />
      case 'gothic':
        return <GothicMarker location={location} config={config} isCurrentLocation={isCurrentLocation} />
      case 'neon':
        return <NeonMarker location={location} config={config} isCurrentLocation={isCurrentLocation} />
      case 'norse':
        return <NorseMarker location={location} config={config} isCurrentLocation={isCurrentLocation} />
      default:
        return <DefaultMarker location={location} config={config} isCurrentLocation={isCurrentLocation} />
    }
  }

  // Determinar texto a mostrar según knowledge level
  const displayName = knowledgeStyle.showQuestionMark ? `${location.name}?` : location.name

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      onClick={onClick}
      onTap={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
      opacity={markerOpacity}
    >
      {renderMarker()}

      {/* Quest Marker Overlay */}
      {questMarker && (
        <QuestMarkerOverlay
          marker={questMarker}
          markerSize={config.markerSize}
        />
      )}

      {/* Indicador de rumor (?) */}
      {knowledgeStyle.showQuestionMark && (
        <Text
          text="?"
          x={config.markerSize / 2 - 5}
          y={-config.markerSize / 2 - 5}
          fontSize={14}
          fontStyle="bold"
          fill={config.accentColor}
          shadowColor={config.accentColor}
          shadowBlur={5}
        />
      )}

      {/* Glow dorado para locaciones "mastered" */}
      {knowledgeLevel === 'mastered' && (
        <Circle
          radius={config.markerSize / 2 + 8}
          fill="transparent"
          stroke="#FFD700"
          strokeWidth={2}
          opacity={0.6}
          shadowColor="#FFD700"
          shadowBlur={15}
          shadowOpacity={0.5}
        />
      )}

      {/* Nombre de la locación */}
      <Text
        text={knowledgeStyle.showName ? displayName : '???'}
        x={-50}
        y={config.markerSize / 2 + 5}
        width={100}
        align="center"
        fontSize={11}
        fontFamily={config.fontFamily}
        fill={config.textColor}
        opacity={location.visited ? 1 : 0.7}
      />
    </Group>
  )
}

// Componente para overlay de quest marker en Konva
interface QuestMarkerOverlayProps {
  marker: QuestMarkerType
  markerSize: number
}

function QuestMarkerOverlay({ marker, markerSize }: QuestMarkerOverlayProps) {
  const icon = getQuestMarkerIcon(marker.type)
  const color = getQuestMarkerColor(marker.type)
  const textColor = marker.type === 'main' || marker.type === 'completable' ? '#1C1208' : '#FFFFFF'

  const size = 16
  const offsetX = markerSize / 2 - 2
  const offsetY = -markerSize / 2 - 2

  return (
    <Group x={offsetX} y={offsetY}>
      {/* Círculo de fondo */}
      <Circle
        radius={size / 2}
        fill={color}
        shadowColor={color}
        shadowBlur={marker.pulse ? 10 : 5}
        shadowOpacity={0.8}
      />
      {/* Icono */}
      <Text
        text={icon}
        x={-size / 4}
        y={-size / 4}
        fontSize={size * 0.7}
        fontStyle="bold"
        fill={textColor}
        align="center"
      />
    </Group>
  )
}

// Marcador medieval (LOTR)
function MedievalMarker({ location, config, isCurrentLocation }: MarkerStyleProps) {
  const icon = config.icons[location.type]
  const baseColor = isCurrentLocation ? config.accentColor : config.primaryColor

  return (
    <Group>
      {/* Círculo base con borde dorado */}
      <Circle
        radius={config.markerSize / 2}
        fill={config.backgroundColor}
        stroke={baseColor}
        strokeWidth={2}
        shadowColor={config.glowColor}
        shadowBlur={isCurrentLocation ? 15 : 0}
        shadowOpacity={0.5}
      />
      {/* Icono */}
      <Text
        text={icon}
        fontSize={config.markerSize * 0.6}
        x={-config.markerSize * 0.3}
        y={-config.markerSize * 0.3}
      />
      {/* Indicador de visitado */}
      {location.visited && (
        <Circle
          radius={5}
          x={config.markerSize / 2 - 5}
          y={-config.markerSize / 2 + 5}
          fill={config.safeColor}
        />
      )}
    </Group>
  )
}

// Marcador moderno/militar (Zombies)
function ModernMarker({ location, config, isCurrentLocation }: MarkerStyleProps) {
  const icon = config.icons[location.type]
  const isDanger = location.type === 'danger' || location.dangerLevel >= 4
  const baseColor = isDanger ? config.dangerColor : isCurrentLocation ? config.safeColor : config.primaryColor

  return (
    <Group>
      {/* Pin de mapa estilo moderno */}
      <RegularPolygon
        sides={3}
        radius={config.markerSize / 2}
        rotation={180}
        fill={baseColor}
        stroke={config.textColor}
        strokeWidth={1}
        y={config.markerSize / 3}
      />
      <Circle
        radius={config.markerSize / 2}
        fill={baseColor}
        stroke={config.textColor}
        strokeWidth={1}
        y={-config.markerSize / 4}
      />
      {/* Icono */}
      <Text
        text={icon}
        fontSize={config.markerSize * 0.5}
        x={-config.markerSize * 0.25}
        y={-config.markerSize * 0.5}
      />
      {/* Indicador de peligro */}
      {isDanger && (
        <Circle
          radius={6}
          fill={config.dangerColor}
          stroke="#ffffff"
          strokeWidth={1}
          x={config.markerSize / 2}
          y={-config.markerSize / 2}
        />
      )}
    </Group>
  )
}

// Marcador anime/JRPG (Isekai)
function AnimeMarker({ location, config, isCurrentLocation }: MarkerStyleProps) {
  const icon = config.icons[location.type]
  const rank = dangerToRank(location.dangerLevel)
  const rankColor = DIFFICULTY_COLORS[rank]

  return (
    <Group>
      {/* Círculo con borde de rango */}
      <Circle
        radius={config.markerSize / 2 + 3}
        fill="transparent"
        stroke={rankColor}
        strokeWidth={3}
        dash={[5, 3]}
      />
      <Circle
        radius={config.markerSize / 2}
        fill={config.backgroundColor}
        stroke={config.primaryColor}
        strokeWidth={2}
        shadowColor={isCurrentLocation ? config.accentColor : 'transparent'}
        shadowBlur={20}
        shadowOpacity={0.8}
      />
      {/* Icono */}
      <Text
        text={icon}
        fontSize={config.markerSize * 0.5}
        x={-config.markerSize * 0.25}
        y={-config.markerSize * 0.25}
      />
      {/* Rango de dificultad */}
      <Rect
        x={config.markerSize / 2 - 8}
        y={-config.markerSize / 2 - 8}
        width={16}
        height={16}
        fill={rankColor}
        cornerRadius={3}
      />
      <Text
        text={rank}
        fontSize={10}
        fontStyle="bold"
        fill="#ffffff"
        x={config.markerSize / 2 - 5}
        y={-config.markerSize / 2 - 5}
      />
      {/* Brillo anime */}
      {isCurrentLocation && (
        <Star
          numPoints={4}
          innerRadius={3}
          outerRadius={8}
          fill={config.accentColor}
          x={-config.markerSize / 2}
          y={-config.markerSize / 2}
          rotation={45}
        />
      )}
    </Group>
  )
}

// Marcador sci-fi (Star Wars)
function ScifiMarker({ location, config, isCurrentLocation }: MarkerStyleProps) {
  const icon = config.icons[location.type]
  const isPlanet = location.type === 'city' || location.type === 'landmark'

  return (
    <Group>
      {/* Planeta o estación */}
      {isPlanet ? (
        <>
          <Circle
            radius={config.markerSize / 2}
            fill={config.secondaryColor}
            stroke={config.primaryColor}
            strokeWidth={2}
            shadowColor={config.glowColor}
            shadowBlur={isCurrentLocation ? 25 : 10}
            shadowOpacity={0.6}
          />
          {/* Anillo planetario */}
          <Circle
            radius={config.markerSize / 2 + 8}
            fill="transparent"
            stroke={config.primaryColor}
            strokeWidth={1}
            opacity={0.5}
          />
        </>
      ) : (
        <RegularPolygon
          sides={6}
          radius={config.markerSize / 2}
          fill={config.secondaryColor}
          stroke={config.primaryColor}
          strokeWidth={2}
          shadowColor={config.glowColor}
          shadowBlur={isCurrentLocation ? 20 : 5}
          shadowOpacity={0.5}
        />
      )}
      {/* Icono */}
      <Text
        text={icon}
        fontSize={config.markerSize * 0.5}
        x={-config.markerSize * 0.25}
        y={-config.markerSize * 0.25}
      />
      {/* Indicador de hyperruta */}
      {isCurrentLocation && (
        <Circle
          radius={config.markerSize / 2 + 15}
          fill="transparent"
          stroke={config.accentColor}
          strokeWidth={2}
          dash={[10, 5]}
          opacity={0.6}
        />
      )}
    </Group>
  )
}

// Marcador gótico (Lovecraft)
function GothicMarker({ location, config, isCurrentLocation }: MarkerStyleProps) {
  const icon = config.icons[location.type]
  const isMystery = location.type === 'mystery' || !location.visited

  return (
    <Group>
      {/* Marco gótico */}
      <RegularPolygon
        sides={8}
        radius={config.markerSize / 2 + 2}
        fill="transparent"
        stroke={config.primaryColor}
        strokeWidth={1}
        opacity={0.6}
      />
      <Circle
        radius={config.markerSize / 2}
        fill={config.backgroundColor}
        stroke={isMystery ? config.accentColor : config.primaryColor}
        strokeWidth={2}
        shadowColor={config.accentColor}
        shadowBlur={isMystery || isCurrentLocation ? 20 : 0}
        shadowOpacity={0.5}
      />
      {/* Icono o signo de interrogación */}
      <Text
        text={isMystery ? '?' : icon}
        fontSize={config.markerSize * 0.5}
        fontStyle={isMystery ? 'bold' : 'normal'}
        fill={isMystery ? config.accentColor : undefined}
        x={-config.markerSize * 0.25}
        y={-config.markerSize * 0.25}
      />
      {/* Ojo vigilante para lugares de peligro */}
      {location.dangerLevel >= 4 && (
        <Text
          text="👁"
          fontSize={12}
          x={config.markerSize / 2 - 6}
          y={-config.markerSize / 2 - 6}
          opacity={0.8}
        />
      )}
    </Group>
  )
}

// Marcador neon (Cyberpunk)
function NeonMarker({ location, config, isCurrentLocation }: MarkerStyleProps) {
  const icon = config.icons[location.type]
  const glowColor = location.type === 'danger' ? config.dangerColor : config.primaryColor

  return (
    <Group>
      {/* Glow externo */}
      <Circle
        radius={config.markerSize / 2 + 5}
        fill="transparent"
        stroke={glowColor}
        strokeWidth={3}
        opacity={0.3}
        shadowColor={glowColor}
        shadowBlur={30}
        shadowOpacity={1}
      />
      {/* Marco hexagonal */}
      <RegularPolygon
        sides={6}
        radius={config.markerSize / 2}
        fill={config.backgroundColor}
        stroke={glowColor}
        strokeWidth={2}
        shadowColor={glowColor}
        shadowBlur={isCurrentLocation ? 25 : 15}
        shadowOpacity={0.8}
      />
      {/* Icono */}
      <Text
        text={icon}
        fontSize={config.markerSize * 0.45}
        x={-config.markerSize * 0.22}
        y={-config.markerSize * 0.22}
      />
      {/* Líneas de datos */}
      {isCurrentLocation && (
        <>
          <Rect
            x={config.markerSize / 2 + 5}
            y={-2}
            width={15}
            height={4}
            fill={config.accentColor}
            opacity={0.8}
          />
          <Rect
            x={config.markerSize / 2 + 5}
            y={5}
            width={10}
            height={3}
            fill={config.primaryColor}
            opacity={0.6}
          />
        </>
      )}
    </Group>
  )
}

// Marcador nórdico (Vikingos)
function NorseMarker({ location, config, isCurrentLocation }: MarkerStyleProps) {
  const icon = config.icons[location.type]
  const isCoastal = location.type === 'city' || location.type === 'landmark'

  return (
    <Group>
      {/* Escudo vikingo */}
      <Circle
        radius={config.markerSize / 2}
        fill={config.secondaryColor}
        stroke={config.primaryColor}
        strokeWidth={3}
        shadowColor={config.glowColor}
        shadowBlur={isCurrentLocation ? 15 : 0}
        shadowOpacity={0.5}
      />
      {/* Cruz nórdica */}
      <Rect
        x={-config.markerSize / 2}
        y={-2}
        width={config.markerSize}
        height={4}
        fill={config.accentColor}
        opacity={0.5}
      />
      <Rect
        x={-2}
        y={-config.markerSize / 2}
        width={4}
        height={config.markerSize}
        fill={config.accentColor}
        opacity={0.5}
      />
      {/* Icono */}
      <Text
        text={icon}
        fontSize={config.markerSize * 0.45}
        x={-config.markerSize * 0.22}
        y={-config.markerSize * 0.22}
      />
      {/* Indicador de puerto */}
      {isCoastal && isCurrentLocation && (
        <Text
          text="⚓"
          fontSize={14}
          x={config.markerSize / 2 - 7}
          y={config.markerSize / 2 - 14}
        />
      )}
    </Group>
  )
}

// Marcador por defecto
function DefaultMarker({ location, config, isCurrentLocation }: MarkerStyleProps) {
  const icon = config.icons[location.type]

  return (
    <Group>
      <Circle
        radius={config.markerSize / 2}
        fill={config.backgroundColor}
        stroke={isCurrentLocation ? config.accentColor : config.primaryColor}
        strokeWidth={2}
      />
      <Text
        text={icon}
        fontSize={config.markerSize * 0.5}
        x={-config.markerSize * 0.25}
        y={-config.markerSize * 0.25}
      />
    </Group>
  )
}

// Tipo para props de estilos de marcador
interface MarkerStyleProps {
  location: MapLocation
  config: ReturnType<typeof getMapConfig>
  isCurrentLocation: boolean
}

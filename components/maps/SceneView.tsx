'use client'

import React from 'react'
import { MapPin, Navigation, Eye, Shield, Footprints, ChevronRight, Map, Sparkles } from 'lucide-react'
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

// Descripciones ambientales por tipo
const AMBIENT_DESCRIPTIONS: Record<string, Record<Lore, string>> = {
  city: {
    LOTR: 'El murmullo de voces y el aroma de pan recién horneado llenan el aire.',
    ZOMBIES: 'El silencio es inquietante. Solo el viento entre edificios vacíos.',
    ISEKAI: '¡El bullicio del mercado! Comerciantes pregonan sus mercancías mágicas.',
    VIKINGOS: 'El humo de las fogatas se mezcla con el olor del mar.',
    STAR_WARS: 'El zumbido de naves y droides llena la atmósfera metálica.',
    CYBERPUNK: 'Neones parpadean. La lluvia ácida cae sobre el asfalto agrietado.',
    LOVECRAFT_HORROR: 'Las calles parecen observarte. La arquitectura desafía la geometría.',
    CUSTOM: 'Un lugar lleno de actividad y posibilidades.',
  },
  safe: {
    LOTR: 'La paz reina aquí. Te sientes protegido por fuerzas antiguas.',
    ZOMBIES: 'Las barricadas están en su lugar. Por ahora, estás a salvo.',
    ISEKAI: 'Puedes descansar y recuperar tu salud aquí sin preocupaciones.',
    VIKINGOS: 'El fuego crepita y el hidromiel fluye entre compañeros.',
    STAR_WARS: 'Este sector parece seguro... por ahora.',
    CYBERPUNK: 'El NetWatch no tiene jurisdicción aquí. Puedes bajar la guardia.',
    LOVECRAFT_HORROR: 'La normalidad te reconforta, aunque sientes que algo observa.',
    CUSTOM: 'Un refugio seguro donde recuperar fuerzas.',
  },
  danger: {
    LOTR: 'El mal acecha. Puedes sentir ojos hostiles observándote.',
    ZOMBIES: 'Gruñidos en la distancia. No estés aquí cuando oscurezca.',
    ISEKAI: '¡ALERTA! Nivel de peligro alto. Prepárate para combate.',
    VIKINGOS: 'Territorios hostiles. Desenvaina tu hacha.',
    STAR_WARS: 'Presencia Imperial detectada. Extrema precaución.',
    CYBERPUNK: 'Territorio de pandillas. Las cámaras están desactivadas aquí.',
    LOVECRAFT_HORROR: 'La cordura se desvanece. No confíes en tus sentidos.',
    CUSTOM: 'El peligro acecha en cada sombra.',
  },
  dungeon: {
    LOTR: 'La oscuridad es palpable. Antorchas revelan muros antiguos.',
    ZOMBIES: 'Pasillos estrechos. Un ruido y serás rodeado.',
    ISEKAI: '¡Dungeon detectado! Hay tesoros... y monstruos.',
    VIKINGOS: 'Las tumbas de los antiguos no perdonan a los intrusos.',
    STAR_WARS: 'Los sensores no funcionan aquí. Confía en la Fuerza.',
    CYBERPUNK: 'Red local aislada. Tu ciberware apenas responde.',
    LOVECRAFT_HORROR: 'Los ángulos están mal. El espacio se curva.',
    CUSTOM: 'Un lugar subterráneo lleno de secretos.',
  },
  wilderness: {
    LOTR: 'La naturaleza salvaje se extiende ante ti. El camino es incierto.',
    ZOMBIES: 'Campo abierto. Buena visibilidad, poca cobertura.',
    ISEKAI: 'Zona de farmeo. Perfecta para subir de nivel.',
    VIKINGOS: 'Los espíritus de la naturaleza susurran entre los árboles.',
    STAR_WARS: 'El planeta tiene vida propia. Mantén los ojos abiertos.',
    CYBERPUNK: 'Fuera de la ciudad. Sin conexión, sin ley.',
    LOVECRAFT_HORROR: 'La vegetación parece... incorrecta. Las sombras se mueven.',
    CUSTOM: 'Tierras salvajes llenas de descubrimientos.',
  },
  mystery: {
    LOTR: 'La magia antigua permea este lugar. Las respuestas esperan.',
    ZOMBIES: 'Algo no cuadra aquí. Investiga con cuidado.',
    ISEKAI: '¿Un evento secreto? ¡Podría haber un item legendario!',
    VIKINGOS: 'Los dioses te observan. Este es un lugar de destino.',
    STAR_WARS: 'La Fuerza es fuerte aquí. Algo importante te espera.',
    CYBERPUNK: 'Datos encriptados. Alguien quiere ocultar algo.',
    LOVECRAFT_HORROR: 'El velo entre mundos es delgado. Cuidado con lo que despiertas.',
    CUSTOM: 'Un misterio espera ser resuelto.',
  },
  landmark: {
    LOTR: 'Un lugar de importancia histórica. Las leyendas hablan de él.',
    ZOMBIES: 'Un punto de referencia. Útil para orientarte.',
    ISEKAI: 'Punto de guardado detectado. Puedes regresar aquí.',
    VIKINGOS: 'Los ancestros dejaron su marca aquí.',
    STAR_WARS: 'Coordenadas guardadas en el navicomputador.',
    CYBERPUNK: 'Punto de interés marcado en tu HUD.',
    LOVECRAFT_HORROR: 'La arquitectura es... imposible, pero real.',
    CUSTOM: 'Un lugar notable digno de recordar.',
  },
}

// Puntos de interés genéricos por tipo
const GENERIC_POI: Record<string, Record<Lore, string[]>> = {
  city: {
    LOTR: ['Plaza central', 'Taberna local', 'Mercado', 'Herrería'],
    ZOMBIES: ['Tiendas saqueadas', 'Barricadas', 'Zona de suministros'],
    ISEKAI: ['Tienda de items', 'Posada', 'Tablón de misiones'],
    VIKINGOS: ['Gran salón', 'Forja', 'Muelle', 'Altar'],
    STAR_WARS: ['Bahía de aterrizaje', 'Cantina', 'Terminal de datos'],
    CYBERPUNK: ['Bar local', 'Ripperdoc', 'Vendedor ambulante'],
    LOVECRAFT_HORROR: ['Taberna oscura', 'Tienda de antigüedades', 'Callejón sospechoso'],
    CUSTOM: ['Plaza central', 'Comercios', 'Taberna'],
  },
  safe: {
    LOTR: ['Lugar de descanso', 'Suministros', 'Sanador'],
    ZOMBIES: ['Punto de suministros', 'Área médica', 'Guardia'],
    ISEKAI: ['Cama para guardar', 'Cofre de items', 'NPC amigable'],
    VIKINGOS: ['Fogata', 'Barriles de hidromiel', 'Chamán'],
    STAR_WARS: ['Terminal médico', 'Cargador de armas', 'Droide de reparación'],
    CYBERPUNK: ['Punto de respawn', 'Máquina expendedora', 'Área segura'],
    LOVECRAFT_HORROR: ['Refugio', 'Libros de investigación', 'Contacto de confianza'],
    CUSTOM: ['Área de descanso', 'Suministros', 'Aliado'],
  },
  danger: {
    LOTR: ['Campamento enemigo', 'Ruinas oscuras', 'Paso peligroso'],
    ZOMBIES: ['Nido de infectados', 'Zona contaminada', 'Emboscada'],
    ISEKAI: ['Spawn de mobs', 'Boss area', 'Trampa'],
    VIKINGOS: ['Guarida enemiga', 'Campo de batalla', 'Maldición'],
    STAR_WARS: ['Puesto Imperial', 'Droides de combate', 'Trampa'],
    CYBERPUNK: ['Territorio hostil', 'Drones de vigilancia', 'Emboscada'],
    LOVECRAFT_HORROR: ['Ritual activo', 'Criatura acechante', 'Zona de locura'],
    CUSTOM: ['Enemigos', 'Trampas', 'Peligro'],
  },
  dungeon: {
    LOTR: ['Entrada oscura', 'Cámaras interiores', 'Tesoro oculto'],
    ZOMBIES: ['Pasillo principal', 'Habitaciones cerradas', 'Zona de escape'],
    ISEKAI: ['Primer piso', 'Boss room', 'Cofre del tesoro'],
    VIKINGOS: ['Tumba principal', 'Sala de ofrendas', 'Cámara del rey'],
    STAR_WARS: ['Sala de control', 'Celdas', 'Sala de servidores'],
    CYBERPUNK: ['Acceso principal', 'Sala de datos', 'Núcleo'],
    LOVECRAFT_HORROR: ['Antecámara', 'Sala ritual', 'Lo que duerme debajo'],
    CUSTOM: ['Entrada', 'Habitaciones', 'Tesoro'],
  },
  wilderness: {
    LOTR: ['Sendero principal', 'Arroyo', 'Claro en el bosque'],
    ZOMBIES: ['Campo abierto', 'Carretera', 'Punto elevado'],
    ISEKAI: ['Zona de spawn', 'Recurso recolectable', 'Punto de farmeo'],
    VIKINGOS: ['Bosque profundo', 'Río', 'Piedra rúnica'],
    STAR_WARS: ['Zona de fauna', 'Recursos naturales', 'Formación rocosa'],
    CYBERPUNK: ['Vertedero', 'Zona sin ley', 'Campamento nómada'],
    LOVECRAFT_HORROR: ['Bosque retorcido', 'Claro antinatural', 'Ruinas antiguas'],
    CUSTOM: ['Naturaleza', 'Recursos', 'Exploración'],
  },
  mystery: {
    LOTR: ['Símbolo antiguo', 'Presencia mágica', 'Secreto por descubrir'],
    ZOMBIES: ['Pista', 'Evidencia', 'Mensaje cifrado'],
    ISEKAI: ['Evento oculto', 'NPC secreto', 'Item raro'],
    VIKINGOS: ['Visión divina', 'Oráculo', 'Destino'],
    STAR_WARS: ['Perturbación en la Fuerza', 'Holocrón', 'Visión'],
    CYBERPUNK: ['Datos encriptados', 'Conspiración', 'AI rogue'],
    LOVECRAFT_HORROR: ['Grimorio', 'Portal', 'Entidad'],
    CUSTOM: ['Misterio', 'Pista', 'Secreto'],
  },
  landmark: {
    LOTR: ['Monumento', 'Vista panorámica', 'Historia'],
    ZOMBIES: ['Punto de referencia', 'Señal visible', 'Hito'],
    ISEKAI: ['Punto de viaje rápido', 'Estatua', 'NPC de lore'],
    VIKINGOS: ['Piedra memorial', 'Saga grabada', 'Ofrenda'],
    STAR_WARS: ['Coordenadas clave', 'Beacon', 'Histórico'],
    CYBERPUNK: ['Punto de datos', 'Arte urbano', 'Historia de NC'],
    LOVECRAFT_HORROR: ['Monolito', 'Inscripción', 'Anomalía'],
    CUSTOM: ['Monumento', 'Historia', 'Punto de interés'],
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
      <div className={cn('flex items-center justify-center p-8', className)}>
        <p className="text-parchment/50 font-body">Ubicación desconocida...</p>
      </div>
    )
  }

  const locationType = location.type || 'landmark'
  const icon = LOCATION_ICONS[locationType] || '📍'
  const ambiance = AMBIENT_DESCRIPTIONS[locationType]?.[lore] || 'Un lugar interesante para explorar.'
  const pointsOfInterest = GENERIC_POI[locationType]?.[lore] || ['Área por explorar']

  // Calcular nivel de peligro visual
  const dangerStars = '⚔️'.repeat(Math.min(location.dangerLevel || 1, 5))
  const dangerColor = (location.dangerLevel || 1) >= 4 ? 'text-blood' : (location.dangerLevel || 1) >= 2 ? 'text-gold' : 'text-emerald'

  return (
    <div
      className={cn(
        'flex flex-col h-full overflow-hidden',
        'bg-gradient-to-b from-shadow to-shadow-mid',
        'border border-gold-dim/30 rounded-lg',
        className
      )}
    >
      {/* Header: Nombre de ubicación + toggle mapa */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-gold-dim/20"
        style={{ backgroundColor: config.secondaryColor + '20' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <h2
              className="font-heading text-lg text-gold-bright truncate"
              style={{ fontFamily: config.titleFontFamily }}
            >
              {location.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-parchment/60">
              <span className={dangerColor}>{dangerStars}</span>
              {location.visited && <span className="text-emerald">✓ Visitado</span>}
            </div>
          </div>
        </div>

        <button
          onClick={onShowWorldMap}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-shadow-mid hover:bg-shadow border border-gold-dim/30 hover:border-gold transition-colors"
          title="Ver mapa del mundo"
        >
          <Map className="w-4 h-4 text-gold" />
          <span className="text-xs text-parchment hidden sm:inline">Mapa</span>
        </button>
      </div>

      {/* Descripción atmosférica */}
      <div className="px-4 py-3 border-b border-gold-dim/10">
        <p className="font-body text-sm text-parchment/80 italic leading-relaxed">
          "{ambiance}"
        </p>
        <p className="font-body text-sm text-parchment/70 mt-2">
          {location.description}
        </p>
      </div>

      {/* Puntos de interés */}
      <div className="px-4 py-3 border-b border-gold-dim/10 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-gold" />
          <span className="text-xs font-heading text-gold uppercase tracking-wide">Puntos de Interés</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {pointsOfInterest.map((poi, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-2 py-1 rounded bg-shadow/50 text-xs text-parchment/70"
            >
              <Sparkles className="w-3 h-3 text-gold-dim" />
              <span className="truncate">{poi}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Destinos cercanos */}
      <div className="flex-1 overflow-auto px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Footprints className="w-4 h-4 text-gold" />
          <span className="text-xs font-heading text-gold uppercase tracking-wide">Viajar a</span>
          {isNavigationLocked && (
            <span className="text-xs text-blood ml-auto">🔒 {lockReason}</span>
          )}
        </div>

        {connectedLocations.length === 0 ? (
          <p className="text-xs text-parchment/50 italic">No hay caminos desde aquí...</p>
        ) : (
          <div className="grid gap-2">
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
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all',
                    'border',
                    canTravel
                      ? 'border-gold-dim/30 hover:border-gold bg-shadow/30 hover:bg-shadow-mid cursor-pointer'
                      : 'border-gold-dim/10 bg-shadow/10 cursor-not-allowed opacity-50'
                  )}
                >
                  <span className="text-lg flex-shrink-0">{destIcon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm text-parchment truncate">{dest.name}</p>
                    <p className="text-xs text-parchment/50 truncate">{dest.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn(
                      'text-xs',
                      destDanger >= 4 ? 'text-blood' : destDanger >= 2 ? 'text-gold-dim' : 'text-emerald'
                    )}>
                      {'⚔️'.repeat(Math.min(destDanger, 3))}
                    </span>
                    {canTravel && <ChevronRight className="w-4 h-4 text-gold-dim" />}
                    {!dest.discovered && <span className="text-xs text-parchment/30">???</span>}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer: Acciones */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gold-dim/20 bg-shadow">
        {canExploreInterior && (
          <button
            onClick={onExploreInterior}
            disabled={isNavigationLocked}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-heading text-sm transition-all',
              isNavigationLocked
                ? 'bg-shadow-mid text-parchment/40 cursor-not-allowed'
                : 'bg-emerald/80 hover:bg-emerald text-parchment hover:text-white'
            )}
          >
            <Navigation className="w-4 h-4" />
            <span>Explorar Interior</span>
          </button>
        )}

        <button
          onClick={onShowWorldMap}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-heading text-sm transition-all',
            'bg-shadow-mid hover:bg-shadow border border-gold-dim/30 hover:border-gold text-parchment',
            canExploreInterior ? '' : 'flex-1'
          )}
        >
          <Map className="w-4 h-4" />
          <span>Ver Mapa Completo</span>
        </button>
      </div>
    </div>
  )
}

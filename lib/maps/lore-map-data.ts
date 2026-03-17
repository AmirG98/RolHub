// Datos de mapa con coordenadas para cada lore
// Las coordenadas están diseñadas para crear mapas atractivos y temáticos

import { type Lore, type MapLocation } from './map-config'

// Tipo para locaciones del JSON de lore
interface LoreLocation {
  name: string
  description: string
  type: string
  danger_level: number
  detailed_description?: string
}

// Coordenadas predefinidas para LOTR (estilo mapa de Tolkien)
const LOTR_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'La Comarca': { x: 150, y: 200, connections: ['Bree', 'Rivendel'] },
  'Rivendel': { x: 350, y: 180, connections: ['La Comarca', 'Las Montañas Nubladas', 'Lothlórien'] },
  'Lothlórien': { x: 450, y: 280, connections: ['Rivendel', 'Fangorn', 'Moria'] },
  'Moria': { x: 380, y: 260, connections: ['Lothlórien', 'Las Montañas Nubladas'] },
  'Las Montañas Nubladas': { x: 400, y: 200, connections: ['Rivendel', 'Moria', 'Fangorn'] },
  'Fangorn': { x: 500, y: 320, connections: ['Lothlórien', 'Isengard', 'Rohan'] },
  'Rohan': { x: 520, y: 400, connections: ['Fangorn', 'Gondor', 'Isengard'] },
  'Gondor': { x: 600, y: 450, connections: ['Rohan', 'Mordor'] },
  'Mordor': { x: 700, y: 380, connections: ['Gondor'] },
  'Isengard': { x: 450, y: 360, connections: ['Fangorn', 'Rohan'] },
  'Bree': { x: 220, y: 200, connections: ['La Comarca', 'Rivendel'] },
}

// Coordenadas para ZOMBIES (ciudad post-apocalíptica)
const ZOMBIES_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Centro Comercial Abandonado': { x: 400, y: 200, connections: ['Campamento Base', 'Hospital General'] },
  'Campamento Base': { x: 200, y: 300, connections: ['Centro Comercial Abandonado', 'Estación de Policía'] },
  'Hospital General': { x: 550, y: 180, connections: ['Centro Comercial Abandonado', 'Zona Residencial'] },
  'Estación de Policía': { x: 150, y: 400, connections: ['Campamento Base', 'Almacén Industrial'] },
  'Zona Residencial': { x: 600, y: 300, connections: ['Hospital General', 'La Horda'] },
  'Almacén Industrial': { x: 300, y: 480, connections: ['Estación de Policía', 'Puerto'] },
  'Puerto': { x: 500, y: 500, connections: ['Almacén Industrial', 'Zona Segura'] },
  'Zona Segura': { x: 100, y: 150, connections: ['Campamento Base'] },
  'La Horda': { x: 700, y: 350, connections: ['Zona Residencial'] },
}

// Coordenadas para ISEKAI (mundo fantasy JRPG)
const ISEKAI_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Ciudad Capital': { x: 400, y: 300, connections: ['Bosque Inicial', 'Gremio de Aventureros', 'Torre del Mago'] },
  'Bosque Inicial': { x: 200, y: 200, connections: ['Ciudad Capital', 'Cueva de Slimes'] },
  'Cueva de Slimes': { x: 100, y: 300, connections: ['Bosque Inicial'] },
  'Gremio de Aventureros': { x: 450, y: 350, connections: ['Ciudad Capital', 'Dungeon del Dragón'] },
  'Torre del Mago': { x: 550, y: 200, connections: ['Ciudad Capital', 'Biblioteca Arcana'] },
  'Biblioteca Arcana': { x: 650, y: 150, connections: ['Torre del Mago'] },
  'Dungeon del Dragón': { x: 600, y: 450, connections: ['Gremio de Aventureros', 'Montaña del Rey Demonio'] },
  'Montaña del Rey Demonio': { x: 700, y: 350, connections: ['Dungeon del Dragón'] },
  'Aldea de Inicio': { x: 150, y: 400, connections: ['Bosque Inicial', 'Ciudad Capital'] },
}

// Coordenadas para VIKINGOS (mapa marítimo)
const VIKINGOS_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Aldea de Inicio': { x: 400, y: 300, connections: ['Puerto Principal', 'Bosque Sagrado'] },
  'Puerto Principal': { x: 300, y: 200, connections: ['Aldea de Inicio', 'Islas del Este', 'Costa Sajona'] },
  'Islas del Este': { x: 550, y: 150, connections: ['Puerto Principal', 'Tierra de los Gigantes'] },
  'Costa Sajona': { x: 200, y: 350, connections: ['Puerto Principal', 'Monasterio'] },
  'Monasterio': { x: 100, y: 450, connections: ['Costa Sajona'] },
  'Bosque Sagrado': { x: 500, y: 350, connections: ['Aldea de Inicio', 'Templo de Odín'] },
  'Templo de Odín': { x: 600, y: 400, connections: ['Bosque Sagrado', 'Yggdrasil'] },
  'Yggdrasil': { x: 700, y: 300, connections: ['Templo de Odín'] },
  'Tierra de los Gigantes': { x: 650, y: 100, connections: ['Islas del Este'] },
}

// Coordenadas para STAR_WARS (mapa galáctico)
const STAR_WARS_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Coruscant': { x: 400, y: 300, connections: ['Naboo', 'Alderaan', 'Ruta Comercial Corelliana'] },
  'Tatooine': { x: 150, y: 200, connections: ['Mos Eisley', 'Ruta Comercial Corelliana'] },
  'Mos Eisley': { x: 100, y: 250, connections: ['Tatooine'] },
  'Naboo': { x: 350, y: 450, connections: ['Coruscant', 'Kashyyyk'] },
  'Alderaan': { x: 500, y: 200, connections: ['Coruscant', 'Yavin IV'] },
  'Yavin IV': { x: 650, y: 150, connections: ['Alderaan', 'Endor'] },
  'Endor': { x: 700, y: 300, connections: ['Yavin IV', 'Estrella de la Muerte'] },
  'Estrella de la Muerte': { x: 600, y: 400, connections: ['Endor', 'Sistema Imperial'] },
  'Sistema Imperial': { x: 550, y: 350, connections: ['Coruscant', 'Estrella de la Muerte'] },
  'Kashyyyk': { x: 250, y: 500, connections: ['Naboo'] },
  'Ruta Comercial Corelliana': { x: 300, y: 250, connections: ['Coruscant', 'Tatooine'] },
}

// Coordenadas para CYBERPUNK (ciudad vertical)
const CYBERPUNK_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Downtown': { x: 400, y: 300, connections: ['Distrito Corpo', 'Mercado Negro', 'Suburbios'] },
  'Distrito Corpo': { x: 500, y: 150, connections: ['Downtown', 'Torre Arasaka'] },
  'Torre Arasaka': { x: 600, y: 100, connections: ['Distrito Corpo'] },
  'Mercado Negro': { x: 250, y: 350, connections: ['Downtown', 'Submundo'] },
  'Submundo': { x: 150, y: 450, connections: ['Mercado Negro', 'Alcantarillas'] },
  'Alcantarillas': { x: 200, y: 550, connections: ['Submundo'] },
  'Suburbios': { x: 550, y: 400, connections: ['Downtown', 'Zona Industrial'] },
  'Zona Industrial': { x: 650, y: 350, connections: ['Suburbios', 'Vertedero'] },
  'Vertedero': { x: 700, y: 450, connections: ['Zona Industrial'] },
  'Ripperdoc': { x: 350, y: 400, connections: ['Downtown', 'Mercado Negro'] },
  'Club Afterlife': { x: 300, y: 250, connections: ['Downtown'] },
}

// Coordenadas para LOVECRAFT_HORROR (mapa de investigación)
const LOVECRAFT_HORROR_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Arkham': { x: 400, y: 300, connections: ['Universidad Miskatonic', 'Barrio Mercante', 'Cementerio'] },
  'Universidad Miskatonic': { x: 450, y: 200, connections: ['Arkham', 'Biblioteca Orne'] },
  'Biblioteca Orne': { x: 550, y: 150, connections: ['Universidad Miskatonic'] },
  'Barrio Mercante': { x: 300, y: 350, connections: ['Arkham', 'Puerto'] },
  'Puerto': { x: 200, y: 450, connections: ['Barrio Mercante', 'Innsmouth'] },
  'Innsmouth': { x: 100, y: 400, connections: ['Puerto'] },
  'Cementerio': { x: 500, y: 350, connections: ['Arkham', 'Cripta Antigua'] },
  'Cripta Antigua': { x: 600, y: 400, connections: ['Cementerio', 'Templo Sumergido'] },
  'Templo Sumergido': { x: 700, y: 350, connections: ['Cripta Antigua'] },
  'Manicomio': { x: 350, y: 450, connections: ['Arkham'] },
}

// Coordenadas para CUSTOM (genérico)
const CUSTOM_COORDINATES: Record<string, { x: number; y: number; connections: string[] }> = {
  'Ciudad Principal': { x: 400, y: 300, connections: ['Bosque', 'Montaña', 'Puerto'] },
  'Bosque': { x: 250, y: 200, connections: ['Ciudad Principal', 'Ruinas'] },
  'Montaña': { x: 550, y: 150, connections: ['Ciudad Principal', 'Cueva'] },
  'Puerto': { x: 300, y: 450, connections: ['Ciudad Principal'] },
  'Ruinas': { x: 150, y: 100, connections: ['Bosque'] },
  'Cueva': { x: 650, y: 250, connections: ['Montaña'] },
}

// Mapa de coordenadas por lore
const LORE_COORDINATES: Record<Lore, Record<string, { x: number; y: number; connections: string[] }>> = {
  LOTR: LOTR_COORDINATES,
  ZOMBIES: ZOMBIES_COORDINATES,
  ISEKAI: ISEKAI_COORDINATES,
  VIKINGOS: VIKINGOS_COORDINATES,
  STAR_WARS: STAR_WARS_COORDINATES,
  CYBERPUNK: CYBERPUNK_COORDINATES,
  LOVECRAFT_HORROR: LOVECRAFT_HORROR_COORDINATES,
  CUSTOM: CUSTOM_COORDINATES,
}

// Mapear tipo de locación a tipo de MapLocation
function mapLocationType(type: string): MapLocation['type'] {
  const typeMap: Record<string, MapLocation['type']> = {
    'asentamiento': 'city',
    'ciudad': 'city',
    'refugio': 'safe',
    'mina': 'dungeon',
    'bosque': 'wilderness',
    'montaña': 'wilderness',
    'fortaleza': 'danger',
    'torre': 'landmark',
    'ruinas': 'dungeon',
    'planeta': 'city',
    'estación': 'landmark',
    'nave': 'landmark',
    'distrito': 'city',
    'mercado': 'safe',
    'club': 'safe',
    'mazmorra': 'dungeon',
    'biblioteca': 'landmark',
    'templo': 'mystery',
    'cementerio': 'danger',
    'manicomio': 'danger',
    'puerto': 'city',
    // Fallbacks
    'default': 'landmark',
  }

  const normalizedType = type.toLowerCase()
  return typeMap[normalizedType] || typeMap['default']
}

// Función para generar MapLocations a partir de datos del lore
export function generateMapLocations(
  lore: Lore,
  loreLocations: LoreLocation[],
  discoveredIds: string[] = [],
  visitedIds: string[] = []
): MapLocation[] {
  const coordinates = LORE_COORDINATES[lore] || {}

  return loreLocations.map((loc, index) => {
    const coordData = coordinates[loc.name] || generateFallbackCoordinates(index, loreLocations.length)

    // Generar ID desde el nombre
    const id = loc.name.toLowerCase().replace(/\s+/g, '-').replace(/[áéíóú]/g, c => {
      const map: Record<string, string> = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' }
      return map[c] || c
    })

    return {
      id,
      name: loc.name,
      description: loc.description,
      type: mapLocationType(loc.type),
      dangerLevel: loc.danger_level,
      coordinates: { x: coordData.x, y: coordData.y },
      connections: coordData.connections.map(name =>
        name.toLowerCase().replace(/\s+/g, '-').replace(/[áéíóú]/g, c => {
          const map: Record<string, string> = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' }
          return map[c] || c
        })
      ),
      icon: '',
      discovered: discoveredIds.length === 0 || discoveredIds.includes(id),
      visited: visitedIds.includes(id),
    }
  })
}

// Coordenadas de fallback en espiral
function generateFallbackCoordinates(index: number, total: number): { x: number; y: number; connections: string[] } {
  const angle = (index / total) * Math.PI * 2
  const radius = 150 + (index % 3) * 80
  return {
    x: 400 + Math.cos(angle) * radius,
    y: 300 + Math.sin(angle) * radius,
    connections: [],
  }
}

// Datos de mapa de ejemplo para cada lore (para usar cuando no hay datos de campaña)
export function getExampleMapData(lore: Lore): MapLocation[] {
  const exampleData: Record<Lore, MapLocation[]> = {
    LOTR: [
      { id: 'comarca', name: 'La Comarca', description: 'Tierra pacífica de los hobbits', type: 'safe', dangerLevel: 1, coordinates: { x: 150, y: 200 }, connections: ['bree', 'rivendel'], icon: '', discovered: true, visited: true },
      { id: 'bree', name: 'Bree', description: 'Cruce de caminos con la Posada del Pony Pisador', type: 'city', dangerLevel: 2, coordinates: { x: 220, y: 200 }, connections: ['comarca', 'rivendel'], icon: '', discovered: true, visited: false },
      { id: 'rivendel', name: 'Rivendel', description: 'Refugio élfico de Elrond', type: 'safe', dangerLevel: 1, coordinates: { x: 350, y: 180 }, connections: ['comarca', 'moria', 'lothlorien'], icon: '', discovered: true, visited: false },
      { id: 'moria', name: 'Moria', description: 'Antiguo reino enano bajo las montañas', type: 'dungeon', dangerLevel: 5, coordinates: { x: 380, y: 260 }, connections: ['rivendel', 'lothlorien'], icon: '', discovered: false, visited: false },
      { id: 'lothlorien', name: 'Lothlórien', description: 'Bosque dorado de los elfos de Galadriel', type: 'safe', dangerLevel: 1, coordinates: { x: 450, y: 280 }, connections: ['rivendel', 'moria', 'rohan'], icon: '', discovered: false, visited: false },
      { id: 'rohan', name: 'Rohan', description: 'Tierra de los señores de los caballos', type: 'city', dangerLevel: 3, coordinates: { x: 520, y: 400 }, connections: ['lothlorien', 'gondor', 'isengard'], icon: '', discovered: false, visited: false },
      { id: 'gondor', name: 'Gondor', description: 'El reino de los hombres', type: 'city', dangerLevel: 4, coordinates: { x: 600, y: 450 }, connections: ['rohan', 'mordor'], icon: '', discovered: false, visited: false },
      { id: 'mordor', name: 'Mordor', description: 'Tierra negra del enemigo', type: 'danger', dangerLevel: 5, coordinates: { x: 700, y: 380 }, connections: ['gondor'], icon: '', discovered: false, visited: false },
      { id: 'isengard', name: 'Isengard', description: 'Torre de Saruman', type: 'danger', dangerLevel: 4, coordinates: { x: 450, y: 360 }, connections: ['rohan'], icon: '', discovered: false, visited: false },
    ],
    ZOMBIES: [
      { id: 'campamento-base', name: 'Campamento Base', description: 'Tu refugio seguro... por ahora', type: 'safe', dangerLevel: 1, coordinates: { x: 200, y: 300 }, connections: ['centro-comercial', 'estacion-policia'], icon: '', discovered: true, visited: true },
      { id: 'centro-comercial', name: 'Centro Comercial', description: 'Infestado pero lleno de suministros', type: 'dungeon', dangerLevel: 4, coordinates: { x: 400, y: 200 }, connections: ['campamento-base', 'hospital'], icon: '', discovered: true, visited: false },
      { id: 'hospital', name: 'Hospital General', description: 'Medicinas... y horrores', type: 'danger', dangerLevel: 5, coordinates: { x: 550, y: 180 }, connections: ['centro-comercial', 'zona-residencial'], icon: '', discovered: false, visited: false },
      { id: 'estacion-policia', name: 'Estación de Policía', description: 'Armas y munición esperan dentro', type: 'dungeon', dangerLevel: 3, coordinates: { x: 150, y: 400 }, connections: ['campamento-base', 'almacen'], icon: '', discovered: true, visited: false },
      { id: 'zona-residencial', name: 'Zona Residencial', description: 'Casas vacías... o no tan vacías', type: 'wilderness', dangerLevel: 3, coordinates: { x: 600, y: 300 }, connections: ['hospital', 'la-horda'], icon: '', discovered: false, visited: false },
      { id: 'la-horda', name: 'La Horda', description: 'Concentración masiva de infectados', type: 'danger', dangerLevel: 5, coordinates: { x: 700, y: 350 }, connections: ['zona-residencial'], icon: '', discovered: false, visited: false },
      { id: 'almacen', name: 'Almacén Industrial', description: 'Suministros escondidos', type: 'landmark', dangerLevel: 2, coordinates: { x: 300, y: 480 }, connections: ['estacion-policia', 'puerto'], icon: '', discovered: false, visited: false },
      { id: 'puerto', name: 'Puerto', description: 'Posible ruta de escape', type: 'mystery', dangerLevel: 3, coordinates: { x: 500, y: 500 }, connections: ['almacen'], icon: '', discovered: false, visited: false },
    ],
    ISEKAI: [
      { id: 'aldea-inicio', name: 'Aldea de Inicio', description: 'Donde comenzó tu aventura', type: 'safe', dangerLevel: 1, coordinates: { x: 150, y: 400 }, connections: ['bosque-inicial', 'ciudad-capital'], icon: '', discovered: true, visited: true },
      { id: 'bosque-inicial', name: 'Bosque Inicial', description: 'Nivel F - Perfecto para principiantes', type: 'wilderness', dangerLevel: 1, coordinates: { x: 200, y: 200 }, connections: ['aldea-inicio', 'cueva-slimes'], icon: '', discovered: true, visited: true },
      { id: 'cueva-slimes', name: 'Cueva de Slimes', description: 'Nivel F - Tu primer dungeon', type: 'dungeon', dangerLevel: 1, coordinates: { x: 100, y: 300 }, connections: ['bosque-inicial'], icon: '', discovered: true, visited: false },
      { id: 'ciudad-capital', name: 'Ciudad Capital', description: 'Centro del reino con el Gremio', type: 'city', dangerLevel: 1, coordinates: { x: 400, y: 300 }, connections: ['aldea-inicio', 'gremio', 'torre-mago'], icon: '', discovered: true, visited: false },
      { id: 'gremio', name: 'Gremio de Aventureros', description: 'Misiones y recompensas te esperan', type: 'safe', dangerLevel: 1, coordinates: { x: 450, y: 350 }, connections: ['ciudad-capital', 'dungeon-dragon'], icon: '', discovered: true, visited: false },
      { id: 'torre-mago', name: 'Torre del Mago', description: 'Nivel B - Magia y misterios', type: 'landmark', dangerLevel: 3, coordinates: { x: 550, y: 200 }, connections: ['ciudad-capital', 'biblioteca'], icon: '', discovered: false, visited: false },
      { id: 'biblioteca', name: 'Biblioteca Arcana', description: 'Nivel A - Conocimiento prohibido', type: 'mystery', dangerLevel: 4, coordinates: { x: 650, y: 150 }, connections: ['torre-mago'], icon: '', discovered: false, visited: false },
      { id: 'dungeon-dragon', name: 'Dungeon del Dragón', description: 'Nivel S - Solo los más fuertes', type: 'dungeon', dangerLevel: 5, coordinates: { x: 600, y: 450 }, connections: ['gremio', 'rey-demonio'], icon: '', discovered: false, visited: false },
      { id: 'rey-demonio', name: 'Castillo del Rey Demonio', description: 'Nivel SSS - El jefe final', type: 'danger', dangerLevel: 5, coordinates: { x: 700, y: 350 }, connections: ['dungeon-dragon'], icon: '', discovered: false, visited: false },
    ],
    VIKINGOS: [
      { id: 'aldea', name: 'Tu Aldea', description: 'Hogar de tu clan vikingo', type: 'safe', dangerLevel: 1, coordinates: { x: 400, y: 300 }, connections: ['puerto', 'bosque-sagrado'], icon: '', discovered: true, visited: true },
      { id: 'puerto', name: 'Puerto del Norte', description: 'Donde esperan los drakkars', type: 'city', dangerLevel: 1, coordinates: { x: 300, y: 200 }, connections: ['aldea', 'islas-este', 'costa-sajona'], icon: '', discovered: true, visited: true },
      { id: 'islas-este', name: 'Islas del Este', description: 'Territorios por conquistar', type: 'wilderness', dangerLevel: 3, coordinates: { x: 550, y: 150 }, connections: ['puerto', 'jotunheim'], icon: '', discovered: true, visited: false },
      { id: 'costa-sajona', name: 'Costa Sajona', description: 'Tierras ricas para saquear', type: 'danger', dangerLevel: 3, coordinates: { x: 200, y: 350 }, connections: ['puerto', 'monasterio'], icon: '', discovered: true, visited: false },
      { id: 'monasterio', name: 'Monasterio de Lindisfarne', description: 'Oro y reliquias esperan', type: 'dungeon', dangerLevel: 4, coordinates: { x: 100, y: 450 }, connections: ['costa-sajona'], icon: '', discovered: false, visited: false },
      { id: 'bosque-sagrado', name: 'Bosque Sagrado', description: 'Lugar de los rituales antiguos', type: 'mystery', dangerLevel: 2, coordinates: { x: 500, y: 350 }, connections: ['aldea', 'templo-odin'], icon: '', discovered: true, visited: false },
      { id: 'templo-odin', name: 'Templo de Odín', description: 'El Padre de Todos te observa', type: 'landmark', dangerLevel: 3, coordinates: { x: 600, y: 400 }, connections: ['bosque-sagrado', 'yggdrasil'], icon: '', discovered: false, visited: false },
      { id: 'yggdrasil', name: 'Yggdrasil', description: 'El Árbol del Mundo', type: 'mystery', dangerLevel: 5, coordinates: { x: 700, y: 300 }, connections: ['templo-odin'], icon: '', discovered: false, visited: false },
      { id: 'jotunheim', name: 'Jötunheim', description: 'Tierra de los gigantes de hielo', type: 'danger', dangerLevel: 5, coordinates: { x: 650, y: 100 }, connections: ['islas-este'], icon: '', discovered: false, visited: false },
    ],
    STAR_WARS: [
      { id: 'tatooine', name: 'Tatooine', description: 'Planeta desértico del Borde Exterior', type: 'city', dangerLevel: 2, coordinates: { x: 150, y: 200 }, connections: ['mos-eisley', 'coruscant'], icon: '', discovered: true, visited: true },
      { id: 'mos-eisley', name: 'Mos Eisley', description: 'Nido de escoria y villanía', type: 'safe', dangerLevel: 2, coordinates: { x: 100, y: 250 }, connections: ['tatooine'], icon: '', discovered: true, visited: true },
      { id: 'coruscant', name: 'Coruscant', description: 'Capital de la Galaxia', type: 'city', dangerLevel: 3, coordinates: { x: 400, y: 300 }, connections: ['tatooine', 'naboo', 'alderaan'], icon: '', discovered: true, visited: false },
      { id: 'naboo', name: 'Naboo', description: 'Mundo pacífico de praderas y ciudades', type: 'safe', dangerLevel: 1, coordinates: { x: 350, y: 450 }, connections: ['coruscant', 'kashyyyk'], icon: '', discovered: false, visited: false },
      { id: 'alderaan', name: 'Alderaan', description: 'Mundo pacífico... por ahora', type: 'safe', dangerLevel: 1, coordinates: { x: 500, y: 200 }, connections: ['coruscant', 'yavin'], icon: '', discovered: false, visited: false },
      { id: 'yavin', name: 'Yavin IV', description: 'Luna selvática, base rebelde secreta', type: 'mystery', dangerLevel: 3, coordinates: { x: 650, y: 150 }, connections: ['alderaan', 'endor'], icon: '', discovered: false, visited: false },
      { id: 'endor', name: 'Endor', description: 'Luna boscosa de los Ewoks', type: 'wilderness', dangerLevel: 2, coordinates: { x: 700, y: 300 }, connections: ['yavin', 'death-star'], icon: '', discovered: false, visited: false },
      { id: 'death-star', name: 'Estrella de la Muerte', description: 'Estación de batalla Imperial', type: 'danger', dangerLevel: 5, coordinates: { x: 600, y: 400 }, connections: ['endor'], icon: '', discovered: false, visited: false },
      { id: 'kashyyyk', name: 'Kashyyyk', description: 'Mundo natal de los Wookiees', type: 'wilderness', dangerLevel: 2, coordinates: { x: 250, y: 500 }, connections: ['naboo'], icon: '', discovered: false, visited: false },
    ],
    CYBERPUNK: [
      { id: 'tu-apartamento', name: 'Tu Apartamento', description: 'Un cubículo de 20m² que llamas hogar', type: 'safe', dangerLevel: 1, coordinates: { x: 350, y: 350 }, connections: ['downtown', 'afterlife'], icon: '', discovered: true, visited: true },
      { id: 'downtown', name: 'Downtown', description: 'El corazón de Night City', type: 'city', dangerLevel: 3, coordinates: { x: 400, y: 300 }, connections: ['tu-apartamento', 'distrito-corpo', 'mercado-negro'], icon: '', discovered: true, visited: true },
      { id: 'afterlife', name: 'Club Afterlife', description: 'Donde los mejores mercenarios hacen tratos', type: 'safe', dangerLevel: 2, coordinates: { x: 300, y: 250 }, connections: ['tu-apartamento', 'downtown'], icon: '', discovered: true, visited: false },
      { id: 'distrito-corpo', name: 'Distrito Corporativo', description: 'Torres de cristal y poder absoluto', type: 'city', dangerLevel: 4, coordinates: { x: 500, y: 150 }, connections: ['downtown', 'arasaka'], icon: '', discovered: true, visited: false },
      { id: 'arasaka', name: 'Torre Arasaka', description: 'El corazón del poder corporativo', type: 'danger', dangerLevel: 5, coordinates: { x: 600, y: 100 }, connections: ['distrito-corpo'], icon: '', discovered: false, visited: false },
      { id: 'mercado-negro', name: 'Mercado Negro', description: 'Todo tiene un precio aquí', type: 'landmark', dangerLevel: 3, coordinates: { x: 250, y: 350 }, connections: ['downtown', 'submundo'], icon: '', discovered: true, visited: false },
      { id: 'submundo', name: 'Submundo', description: 'Donde vive la escoria de Night City', type: 'danger', dangerLevel: 4, coordinates: { x: 150, y: 450 }, connections: ['mercado-negro', 'alcantarillas'], icon: '', discovered: false, visited: false },
      { id: 'alcantarillas', name: 'Alcantarillas', description: 'Hogar de cyberpsicópatas y peor', type: 'dungeon', dangerLevel: 5, coordinates: { x: 200, y: 550 }, connections: ['submundo'], icon: '', discovered: false, visited: false },
      { id: 'ripperdoc', name: 'Clínica del Ripperdoc', description: 'Mejoras cromadas, sin preguntas', type: 'safe', dangerLevel: 2, coordinates: { x: 350, y: 400 }, connections: ['downtown'], icon: '', discovered: true, visited: false },
      { id: 'vertedero', name: 'El Vertedero', description: 'Chatarra tech y secretos enterrados', type: 'mystery', dangerLevel: 3, coordinates: { x: 700, y: 450 }, connections: ['zona-industrial'], icon: '', discovered: false, visited: false },
      { id: 'zona-industrial', name: 'Zona Industrial', description: 'Fábricas abandonadas y pandillas', type: 'wilderness', dangerLevel: 3, coordinates: { x: 650, y: 350 }, connections: ['downtown', 'vertedero'], icon: '', discovered: false, visited: false },
    ],
    LOVECRAFT_HORROR: [
      { id: 'tu-oficina', name: 'Tu Oficina', description: 'Investigador privado en tiempos oscuros', type: 'safe', dangerLevel: 1, coordinates: { x: 350, y: 350 }, connections: ['arkham', 'biblioteca'], icon: '', discovered: true, visited: true },
      { id: 'arkham', name: 'Arkham', description: 'Una ciudad con demasiados secretos', type: 'city', dangerLevel: 2, coordinates: { x: 400, y: 300 }, connections: ['tu-oficina', 'universidad', 'cementerio'], icon: '', discovered: true, visited: true },
      { id: 'universidad', name: 'Universidad Miskatonic', description: 'Conocimiento que mejor no saber', type: 'landmark', dangerLevel: 2, coordinates: { x: 450, y: 200 }, connections: ['arkham', 'biblioteca'], icon: '', discovered: true, visited: false },
      { id: 'biblioteca', name: 'Biblioteca Orne', description: 'El Necronomicón espera...', type: 'mystery', dangerLevel: 4, coordinates: { x: 550, y: 150 }, connections: ['universidad', 'tu-oficina'], icon: '', discovered: true, visited: false },
      { id: 'cementerio', name: 'Cementerio de Arkham', description: 'Los muertos no siempre descansan', type: 'danger', dangerLevel: 3, coordinates: { x: 500, y: 350 }, connections: ['arkham', 'cripta'], icon: '', discovered: true, visited: false },
      { id: 'cripta', name: 'Cripta Antigua', description: 'Símbolos que no deberían existir', type: 'dungeon', dangerLevel: 4, coordinates: { x: 600, y: 400 }, connections: ['cementerio', 'templo'], icon: '', discovered: false, visited: false },
      { id: 'puerto', name: 'Puerto de Arkham', description: 'Llegadas de tierras extrañas', type: 'city', dangerLevel: 2, coordinates: { x: 200, y: 450 }, connections: ['arkham', 'innsmouth'], icon: '', discovered: true, visited: false },
      { id: 'innsmouth', name: 'Innsmouth', description: 'La gente aquí... no parece normal', type: 'danger', dangerLevel: 4, coordinates: { x: 100, y: 400 }, connections: ['puerto'], icon: '', discovered: false, visited: false },
      { id: 'manicomio', name: 'Manicomio de Arkham', description: '¿Están locos... o han visto demasiado?', type: 'mystery', dangerLevel: 3, coordinates: { x: 350, y: 450 }, connections: ['arkham'], icon: '', discovered: true, visited: false },
      { id: 'templo', name: 'Templo Sumergido', description: 'Ph\'nglui mglw\'nafh...', type: 'danger', dangerLevel: 5, coordinates: { x: 700, y: 350 }, connections: ['cripta'], icon: '', discovered: false, visited: false },
    ],
    CUSTOM: [
      { id: 'ciudad-principal', name: 'Ciudad Principal', description: 'El centro de la civilización', type: 'city', dangerLevel: 1, coordinates: { x: 400, y: 300 }, connections: ['bosque', 'montana'], icon: '', discovered: true, visited: true },
      { id: 'bosque', name: 'Bosque Oscuro', description: 'Un lugar de misterios', type: 'wilderness', dangerLevel: 2, coordinates: { x: 250, y: 200 }, connections: ['ciudad-principal', 'ruinas'], icon: '', discovered: true, visited: false },
      { id: 'montana', name: 'Montaña Sagrada', description: 'Picos que tocan el cielo', type: 'landmark', dangerLevel: 2, coordinates: { x: 550, y: 150 }, connections: ['ciudad-principal', 'cueva'], icon: '', discovered: true, visited: false },
      { id: 'ruinas', name: 'Ruinas Antiguas', description: 'Restos de una era olvidada', type: 'dungeon', dangerLevel: 3, coordinates: { x: 150, y: 100 }, connections: ['bosque'], icon: '', discovered: false, visited: false },
      { id: 'cueva', name: 'Cueva del Dragón', description: 'Un lugar de peligro y tesoros', type: 'danger', dangerLevel: 4, coordinates: { x: 650, y: 250 }, connections: ['montana'], icon: '', discovered: false, visited: false },
      { id: 'puerto', name: 'Puerto Comercial', description: 'Mercancías de tierras lejanas', type: 'safe', dangerLevel: 1, coordinates: { x: 300, y: 450 }, connections: ['ciudad-principal'], icon: '', discovered: true, visited: false },
    ],
  }

  return exampleData[lore] || []
}

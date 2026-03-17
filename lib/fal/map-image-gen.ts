// Generación de imágenes de mapas con Fal.ai
// Estilos ilustrados por lore (pergamino, neon, holográfico, etc.)

import { type Lore } from '@/lib/maps/map-config'

// Estilos de arte para mapas por lore
const LORE_MAP_STYLES: Record<Lore, string> = {
  LOTR: 'hand-drawn fantasy parchment map, Tolkien illustrated style, sepia ink, medieval cartography, mountains drawn in profile, forests as clusters of trees, rivers in blue ink, aged paper texture, compass rose, ornate borders, no text or labels',

  ZOMBIES: 'tactical urban survival map, satellite view aerial photography, marked danger zones in red, evacuation routes, post-apocalyptic city grid, desaturated colors, emergency grid overlay, military style markings, no text',

  ISEKAI: 'colorful JRPG world map illustration, anime art style, chibi location markers, vibrant pastel colors, quest indicators, pixel art influence, cute fantasy aesthetic, kawaii style landmarks, no text',

  VIKINGOS: 'norse navigation chart on weathered leather, sea routes with dotted lines, fjords and coastal mountains, runic decorative elements, mythological sea creatures in waters, viking ship markers, aged parchment texture, compass with norse runes, no text',

  STAR_WARS: 'holographic star chart display, blue and cyan glowing elements, planet icons with orbital rings, hyperspace route lines, imperial/rebel territory shading, sci-fi UI elements, Death Star style aesthetic, no text',

  CYBERPUNK: 'neon city grid map on dark background, circuit board aesthetic, glowing district boundaries, corporate territory colors in cyan and magenta, isometric city view, data stream effects, cybernetic decorations, no text',

  LOVECRAFT_HORROR: 'antique investigation map with sepia tones, newspaper clipping aesthetic, red string connections between points, vintage photographs scattered, handwritten notes style, occult symbols, unsettling non-euclidean geometry hints, no text',

  CUSTOM: 'hand-drawn fantasy parchment map, medieval cartography style, sepia ink, mountains and forests, aged paper texture, compass rose, no text or labels',
}

// Estilos de arte para imágenes de llegada a ubicación
const LORE_SCENE_STYLES: Record<Lore, string> = {
  LOTR: 'fantasy oil painting, Tolkien illustrated style, dramatic lighting, epic landscape, detailed environment, atmospheric perspective, golden hour lighting',

  ZOMBIES: 'dark photography style, desaturated cinematic, gritty realism, urban decay, post-apocalyptic atmosphere, dramatic shadows, survival horror mood',

  ISEKAI: 'anime illustration, vibrant colors, Studio Ghibli inspired, detailed fantasy environment, magical atmosphere, soft lighting, adventurous mood',

  VIKINGOS: 'norse mythology art style, muted earth tones, epic scale, painterly brushstrokes, dramatic skies, rugged landscapes, viking age atmosphere',

  STAR_WARS: 'sci-fi concept art, cinematic space opera, dramatic lighting, detailed spacecraft and planets, vast scale, adventure atmosphere',

  CYBERPUNK: 'cyberpunk concept art, neon noir aesthetic, rain-slicked streets, towering megastructures, holographic advertisements, night city atmosphere',

  LOVECRAFT_HORROR: 'cosmic horror illustration, unsettling atmosphere, muted colors with purple accents, eldritch elements, fog and shadows, psychological horror mood',

  CUSTOM: 'fantasy oil painting, dramatic lighting, epic landscape, detailed environment, atmospheric perspective, cinematic mood',
}

export interface MapImageOptions {
  lore: Lore
  width?: number
  height?: number
  additionalPrompt?: string
}

export interface LocationImageOptions {
  lore: Lore
  locationName: string
  locationType: string
  description?: string
  width?: number
  height?: number
}

/**
 * Genera el prompt para una imagen de mapa mundial
 */
export function generateMapPrompt(options: MapImageOptions): string {
  const style = LORE_MAP_STYLES[options.lore] || LORE_MAP_STYLES.LOTR
  const additionalContext = options.additionalPrompt ? `, ${options.additionalPrompt}` : ''

  return `${style}${additionalContext}, centered composition, high detail, game map style, top-down view`
}

/**
 * Genera el prompt para una imagen de llegada a ubicación
 */
export function generateLocationPrompt(options: LocationImageOptions): string {
  const style = LORE_SCENE_STYLES[options.lore] || LORE_SCENE_STYLES.LOTR
  const description = options.description || options.locationType

  return `${style}, ${options.locationName}: ${description}, establishing shot, cinematic composition, detailed environment`
}

/**
 * Genera imagen de mapa con Fal.ai
 * Usa el modelo FLUX Pro para mayor calidad
 */
export async function generateMapImage(options: MapImageOptions): Promise<string> {
  const FAL_KEY = process.env.FAL_KEY

  if (!FAL_KEY) {
    throw new Error('FAL_KEY environment variable not configured')
  }

  const prompt = generateMapPrompt(options)

  const response = await fetch('https://fal.run/fal-ai/flux-pro', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: {
        width: options.width || 1024,
        height: options.height || 768,
      },
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Fal.ai error: ${error}`)
  }

  const result = await response.json()
  return result.images?.[0]?.url || result.image?.url
}

/**
 * Genera imagen de llegada a ubicación con Fal.ai
 */
export async function generateLocationImage(options: LocationImageOptions): Promise<string> {
  const FAL_KEY = process.env.FAL_KEY

  if (!FAL_KEY) {
    throw new Error('FAL_KEY environment variable not configured')
  }

  const prompt = generateLocationPrompt(options)

  const response = await fetch('https://fal.run/fal-ai/flux-pro', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: {
        width: options.width || 1024,
        height: options.height || 576, // 16:9 para escenas
      },
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Fal.ai error: ${error}`)
  }

  const result = await response.json()
  return result.images?.[0]?.url || result.image?.url
}

// Imágenes de fallback por si falla la generación
export const FALLBACK_MAP_IMAGES: Partial<Record<Lore, string>> = {
  // Se pueden agregar URLs de imágenes estáticas por defecto
}

// Circuit breaker para manejar fallos
let failureCount = 0
const MAX_FAILURES = 3
const RESET_AFTER_MS = 120_000
let lastFailure: number | null = null

/**
 * Genera imagen con fallback y circuit breaker
 */
export async function generateMapImageWithFallback(
  options: MapImageOptions
): Promise<{ url: string; isGenerated: boolean }> {
  // Reset circuit breaker if enough time has passed
  if (lastFailure && Date.now() - lastFailure > RESET_AFTER_MS) {
    failureCount = 0
    lastFailure = null
  }

  // If circuit is open, return fallback immediately
  if (failureCount >= MAX_FAILURES) {
    const fallback = FALLBACK_MAP_IMAGES[options.lore]
    if (fallback) {
      return { url: fallback, isGenerated: false }
    }
    throw new Error('Image generation disabled due to repeated failures')
  }

  try {
    const url = await generateMapImage(options)
    failureCount = 0 // Reset on success
    return { url, isGenerated: true }
  } catch (error) {
    failureCount++
    lastFailure = Date.now()

    // Try fallback
    const fallback = FALLBACK_MAP_IMAGES[options.lore]
    if (fallback) {
      return { url: fallback, isGenerated: false }
    }

    throw error
  }
}

/**
 * Genera imagen de ubicación con fallback
 */
export async function generateLocationImageWithFallback(
  options: LocationImageOptions
): Promise<{ url: string; isGenerated: boolean }> {
  // Reset circuit breaker if enough time has passed
  if (lastFailure && Date.now() - lastFailure > RESET_AFTER_MS) {
    failureCount = 0
    lastFailure = null
  }

  // If circuit is open, skip generation
  if (failureCount >= MAX_FAILURES) {
    return { url: '', isGenerated: false }
  }

  try {
    const url = await generateLocationImage(options)
    failureCount = 0
    return { url, isGenerated: true }
  } catch (error) {
    failureCount++
    lastFailure = Date.now()
    return { url: '', isGenerated: false }
  }
}

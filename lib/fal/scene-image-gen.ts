/**
 * Scene Image Generation for RPG Sessions
 *
 * Genera imágenes de escena durante el gameplay basado en:
 * - Prompts del DM (image_prompt en la respuesta)
 * - Contexto del lore y ubicación actual
 * - Estado de la escena (combate, diálogo, exploración)
 */

import { type Lore } from '@/lib/maps/map-config'
import { type UIMood } from '@/lib/game/ui-mood'

// Estilos de arte por lore (para escenas de juego)
const LORE_SCENE_STYLES: Record<Lore, string> = {
  LOTR: 'fantasy oil painting, Tolkien illustrated style, dramatic lighting, epic atmosphere, detailed medieval fantasy, golden hour or moonlit',

  ZOMBIES: 'dark cinematic photography, desaturated horror film aesthetic, gritty realism, urban decay, survival horror lighting, dramatic shadows',

  ISEKAI: 'anime key visual illustration, vibrant colors, Studio Ghibli inspired, detailed fantasy backgrounds, magical lighting effects, adventurous mood',

  VIKINGOS: 'norse saga illustration, painterly brushstrokes, muted earth tones with dramatic skies, epic scale, rugged landscapes, torch-lit interiors',

  STAR_WARS: 'cinematic sci-fi concept art, dramatic space opera lighting, detailed spacecraft and alien worlds, vast scale, dynamic composition',

  CYBERPUNK: 'cyberpunk illustration, neon noir aesthetic, rain-slicked surfaces, holographic elements, night city atmosphere, high contrast',

  LOVECRAFT_HORROR: 'cosmic horror painting, unsettling atmosphere, muted palette with eldritch greens and purples, fog and shadows, psychological dread',

  CUSTOM: 'fantasy concept art illustration, dramatic lighting, cinematic composition, detailed environment, atmospheric mood',
}

// Modificadores de estilo por mood
const MOOD_MODIFIERS: Record<UIMood, string> = {
  exploration: 'serene atmosphere, wide establishing shot, environmental focus, sense of wonder',
  combat: 'intense action, dynamic motion blur, dramatic angles, clash of steel, danger',
  dialogue: 'intimate framing, warm lighting, character focus, detailed expressions, conversation',
  dramatic: 'epic cinematic moment, dramatic lighting, emotional intensity, pivotal scene, tension',
}

// Prefijos negativos para evitar problemas comunes
const NEGATIVE_PROMPT = 'text, watermark, signature, ugly, deformed, disfigured, poor quality, bad anatomy, extra limbs, blurry, low resolution, duplicate, morbid, mutilated, out of frame, poorly drawn face, mutation'

export interface SceneImageOptions {
  /** Prompt generado por el DM */
  prompt: string
  /** Lore actual */
  lore: Lore
  /** Mood de la UI (afecta estilo) */
  mood?: UIMood
  /** Nombre de la ubicación actual */
  locationName?: string
  /** Tipo de ubicación */
  locationType?: string
  /** Ancho de imagen */
  width?: number
  /** Alto de imagen */
  height?: number
  /** Calidad (afecta inference steps) */
  quality?: 'draft' | 'standard' | 'high'
}

export interface SceneImageResult {
  url: string
  prompt: string          // Prompt completo usado
  isGenerated: boolean    // true si se generó, false si es fallback
  generationTime?: number // ms que tardó
}

/**
 * Construye el prompt completo para la generación de imagen
 */
export function buildScenePrompt(options: SceneImageOptions): string {
  const style = LORE_SCENE_STYLES[options.lore] || LORE_SCENE_STYLES.CUSTOM
  const moodModifier = options.mood ? MOOD_MODIFIERS[options.mood] : ''

  const parts: string[] = [
    style,
    options.prompt,
  ]

  if (moodModifier) {
    parts.push(moodModifier)
  }

  if (options.locationName) {
    parts.push(`setting: ${options.locationName}`)
  }

  // Añadir indicaciones de calidad
  parts.push('masterpiece, high detail, professional illustration, cinematic composition')

  return parts.join(', ')
}

/**
 * Genera una imagen de escena con Fal.ai
 */
export async function generateSceneImage(
  options: SceneImageOptions
): Promise<SceneImageResult> {
  const FAL_KEY = process.env.FAL_KEY
  const ENABLE_IMAGES = process.env.NEXT_PUBLIC_ENABLE_IMAGES === 'true'

  // Si las imágenes están deshabilitadas, retornar vacío
  if (!ENABLE_IMAGES) {
    return {
      url: '',
      prompt: options.prompt,
      isGenerated: false,
    }
  }

  if (!FAL_KEY) {
    console.warn('FAL_KEY not configured - image generation disabled')
    return {
      url: '',
      prompt: options.prompt,
      isGenerated: false,
    }
  }

  const startTime = Date.now()
  const fullPrompt = buildScenePrompt(options)

  // Configuración según calidad
  const qualityConfig = {
    draft: { steps: 15, guidance: 3.0 },
    standard: { steps: 25, guidance: 3.5 },
    high: { steps: 35, guidance: 4.0 },
  }

  const config = qualityConfig[options.quality || 'standard']

  try {
    // FLUX Schnell: ~$0.003/imagen vs FLUX Pro ~$0.05/imagen
    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      // FLUX Schnell: solo acepta prompt, image_size, num_inference_steps
      body: JSON.stringify({
        prompt: fullPrompt,
        image_size: {
          width: options.width || 1024,
          height: options.height || 576, // 16:9 para escenas
        },
        num_inference_steps: 4, // Schnell usa 1-4 steps
        enable_safety_checker: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Fal.ai API error: ${errorText}`)
    }

    const result = await response.json()
    const imageUrl = result.images?.[0]?.url || result.image?.url

    if (!imageUrl) {
      throw new Error('No image URL in response')
    }

    return {
      url: imageUrl,
      prompt: fullPrompt,
      isGenerated: true,
      generationTime: Date.now() - startTime,
    }
  } catch (error) {
    console.error('Scene image generation failed:', error)
    return {
      url: '',
      prompt: fullPrompt,
      isGenerated: false,
    }
  }
}

// Circuit breaker state
let sceneFailureCount = 0
const SCENE_MAX_FAILURES = 3
const SCENE_RESET_AFTER_MS = 120_000
let sceneLastFailure: number | null = null

/**
 * Genera imagen de escena con circuit breaker
 * Se desactiva automáticamente después de varios fallos
 */
export async function generateSceneImageSafe(
  options: SceneImageOptions
): Promise<SceneImageResult> {
  // Reset circuit breaker si pasó suficiente tiempo
  if (sceneLastFailure && Date.now() - sceneLastFailure > SCENE_RESET_AFTER_MS) {
    sceneFailureCount = 0
    sceneLastFailure = null
  }

  // Si el circuito está abierto, no intentar
  if (sceneFailureCount >= SCENE_MAX_FAILURES) {
    return {
      url: '',
      prompt: options.prompt,
      isGenerated: false,
    }
  }

  const result = await generateSceneImage(options)

  if (!result.isGenerated) {
    sceneFailureCount++
    sceneLastFailure = Date.now()
  } else {
    // Reset en éxito
    sceneFailureCount = 0
    sceneLastFailure = null
  }

  return result
}

/**
 * Estado del circuit breaker
 */
export function getSceneImageCircuitStatus(): {
  isOpen: boolean
  failureCount: number
  willResetAt: Date | null
} {
  return {
    isOpen: sceneFailureCount >= SCENE_MAX_FAILURES,
    failureCount: sceneFailureCount,
    willResetAt: sceneLastFailure
      ? new Date(sceneLastFailure + SCENE_RESET_AFTER_MS)
      : null,
  }
}

/**
 * Reset manual del circuit breaker
 */
export function resetSceneImageCircuit(): void {
  sceneFailureCount = 0
  sceneLastFailure = null
}

// =============================================================================
// API Route Handler Helper
// =============================================================================

/**
 * Handler para generar imagen desde API route
 * Usa en: /api/session/image/route.ts
 */
export async function handleSceneImageRequest(
  body: {
    prompt: string
    lore: string
    mood?: string
    locationName?: string
    quality?: string
  }
): Promise<{
  success: boolean
  url?: string
  error?: string
  prompt?: string
  generationTime?: number
}> {
  try {
    const result = await generateSceneImageSafe({
      prompt: body.prompt,
      lore: body.lore as Lore,
      mood: body.mood as UIMood | undefined,
      locationName: body.locationName,
      quality: (body.quality as 'draft' | 'standard' | 'high') || 'standard',
    })

    if (!result.isGenerated || !result.url) {
      return {
        success: false,
        error: 'Image generation failed or disabled',
        prompt: result.prompt,
      }
    }

    return {
      success: true,
      url: result.url,
      prompt: result.prompt,
      generationTime: result.generationTime,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// =============================================================================
// Batch Image Generation (para pre-generar)
// =============================================================================

export interface BatchImageRequest {
  id: string
  options: SceneImageOptions
}

export interface BatchImageResult {
  id: string
  result: SceneImageResult
}

/**
 * Genera múltiples imágenes en paralelo
 * Útil para pre-generar imágenes de ubicaciones al inicio de sesión
 */
export async function generateSceneImagesBatch(
  requests: BatchImageRequest[],
  maxConcurrent: number = 3
): Promise<BatchImageResult[]> {
  const results: BatchImageResult[] = []

  // Procesar en batches para no sobrecargar la API
  for (let i = 0; i < requests.length; i += maxConcurrent) {
    const batch = requests.slice(i, i + maxConcurrent)

    const batchResults = await Promise.all(
      batch.map(async (request) => ({
        id: request.id,
        result: await generateSceneImageSafe(request.options),
      }))
    )

    results.push(...batchResults)
  }

  return results
}
